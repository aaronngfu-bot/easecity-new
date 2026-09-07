import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import type { Language } from '@/i18n/translations'

export const maxDuration = 30

const chatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(12_000),
      })
    )
    .min(1)
    .max(40),
  language: z.enum(['en', 'zh', 'zh-CN']).optional(),
  conversationId: z.string().min(1).max(64).optional(),
})

/**
 * Scripted answers for EC, the chat persona. No AI model: responses are
 * deterministic and instant to compose; the widget adds the conversational
 * "thinking" pause on its side.
 *
 * EVERY topic carries all three languages, and the reply language follows the
 * visitor's site language (cookie-resolved, passed up by the widget) — a
 * Traditional-Chinese reader asking "how much?" gets 繁中, not English.
 *
 * Match order matters: first hit wins.
 */
type AnswerSet = { en: string; zh: string; 'zh-CN': string }
type Reply = { keywords: string[]; answer: AnswerSet }

const REPLIES: Reply[] = [
  {
    keywords: ['ec-share', 'ecshare', '什么是 ec-share', 'what is ec-share', '是什麼', '是什么', 'what is'],
    answer: {
      en: 'EC-Share is our Windows desktop app that mirrors multiple Android devices to your computer over USB in real time. You get a live grid of up to 15 screens, keyboard-and-mouse control of one focused device, and view-only links to share with teammates — all without a cloud relay on local networks.',
      zh: 'EC-Share 是我們的 Windows 桌面應用，透過 USB 把多部 Android 裝置即時鏡像到電腦。你可同時看到最多 15 個畫面的即時網格，用鍵盤滑鼠聚焦操作其中一部，並可發出唯讀連結分享給團隊——本地網絡使用無需雲端中繼。',
      'zh-CN': 'EC-Share 是我们的 Windows 桌面应用，通过 USB 把多部 Android 设备实时镜像到电脑。你可同时看到最多 15 个画面的实时网格，用键盘鼠标聚焦操作其中一部，并可发出唯读链接分享给团队——本地网络使用无需云端中继。',
    },
  },
  {
    keywords: ['price', 'pricing', 'cost', '多少钱', '價格', '费用', '費用', 'plan', '订阅', '訂閱', 'trial'],
    answer: {
      en: 'EC-Share has a 14-day free trial. Pro is US$19/month (or $190/yr) for personal mirroring; Business is US$49/month (or $490/yr) and adds desktop-to-desktop sharing, seats, and audit history. Enterprise is custom-quoted — tell us what you need and we will scope it.',
      zh: 'EC-Share 提供 14 天免費試用。Pro 為 US$19／月（或 $190／年），適合個人鏡像；Business 為 US$49／月（或 $490／年），加入桌對桌分享、座位與審計紀錄；企業版按需求報價——告訴我們你的需要，我們會為你評估。',
      'zh-CN': 'EC-Share 提供 14 天免费试用。Pro 为 US$19／月（或 $190／年），适合个人镜像；Business 为 US$49／月（或 $490／年），加入桌对桌分享、座位与审计记录；企业版按需求报价——告诉我们你的需要，我们会为你评估。',
    },
  },
  {
    keywords: ['device', 'support', 'android', 'windows', '支援', '支持', '裝置', '设备', '兼容'],
    answer: {
      en: 'Desktop side: Windows 10 and 11. Device side: Android with USB debugging enabled — no root needed. Connection is over USB (ADB), which is why latency stays low and no cloud account is required for local use.',
      zh: '桌面端支援 Windows 10 及 11；裝置端支援已開啟 USB 偵錯的 Android——無需 root。連線經 USB（ADB），所以延遲低，本地使用亦不需要雲端帳戶。',
      'zh-CN': '桌面端支持 Windows 10 及 11；设备端支持已开启 USB 调试的 Android——无需 root。连接经 USB（ADB），所以延迟低，本地使用亦不需要云端账户。',
    },
  },
  {
    keywords: ['service', 'services', 'offer', '服务', '服務', '开发', '開發', 'design', '设计', '設計', 'advertising', 'consult'],
    answer: {
      en: 'EaseCity offers five services: system development (real-time and low-latency), web platforms (full-stack with auth, billing, and docs), UI/UX design, advertising, and consulting. Each engagement starts with a 1–3 day discovery, then weekly demo cycles.',
      zh: 'EaseCity 提供五項服務：系統開發（即時／低延遲）、網頁平台（全端，含驗證、帳單、文檔）、UI/UX 設計、廣告投放與技術諮詢。每個合作都由 1–3 天的需求探索開始，之後每週演示迭代。',
      'zh-CN': 'EaseCity 提供五项服务：系统开发（实时／低延迟）、网页平台（全栈，含验证、账单、文档）、UI/UX 设计、广告投放与技术咨询。每个合作都由 1–3 天的需求探索开始，之后每周演示迭代。',
    },
  },
  {
    keywords: ['how long', 'timeline', 'duration', '多久', '时长', '時長', '交付', 'delivery', '工期'],
    answer: {
      en: 'Discovery takes 1–3 days, then you get a working demo every week. A focused web platform usually ships an MVP in 4–8 weeks; larger systems are scoped after discovery. Either way you always see demonstrable progress weekly.',
      zh: '需求探索需 1–3 天，之後每週你都會看到可演示的進度。聚焦的網頁平台通常 4–8 週交付 MVP；更大的系統會在探索後給出時程。',
      'zh-CN': '需求探索需 1–3 天，之后每周你都会看到可演示的进度。聚焦的网页平台通常 4–8 周交付 MVP；更大的系统会在探索后给出时程。',
    },
  },
  {
    keywords: ['team', 'who', 'company', '公司', '团队', '團隊', '关于', '關於', 'about', 'who are you'],
    answer: {
      en: "EaseCity Technologies Limited is a Hong Kong-based company building tools and services for connected teams. EC-Share is our first product; the same engineering team takes on client system development, web platforms, and design work.",
      zh: 'EaseCity Technologies Limited 是一家香港公司，為連接的團隊打造工具與服務。EC-Share 是我們的首個產品；同一支工程團隊亦承接客戶的系統開發、網頁平台與設計項目。',
      'zh-CN': 'EaseCity Technologies Limited 是一家香港公司，为连接的团队打造工具与服务。EC-Share 是我们的首个产品；同一支工程团队亦承接客户的系统开发、网页平台与设计项目。',
    },
  },
  {
    keywords: ['contact', 'email', 'human', '人', '客服', '聯絡', '联络', 'email us', 'phone'],
    answer: {
      en: 'You can reach a human two ways: tap "Talk to a human" at the top of this chat to leave a question (our team gets notified instantly and replies here), or email admin@easecity.hk. Either way you will hear back within one business day.',
      zh: '聯絡真人有兩個方法：點此對話頂部的「聯絡線上客服」留下問題（我們的團隊會即時收到通知並在此回覆你），或電郵 admin@easecity.hk。無論哪種方式，都會在一個工作天內回覆。',
      'zh-CN': '联系真人有两个方法：点此对话顶部的「联系在线客服」留下问题（我们的团队会即时收到通知并在此回复你），或电邮 admin@easecity.hk。无论哪种方式，都会在一个工作天内回复。',
    },
  },
  {
    keywords: ['hello', 'hi', 'hey', '你好', '您好', '嗨'],
    answer: {
      en: 'Hi! Pick one of the common questions below, or type anything about EaseCity or EC-Share — and if you would rather talk to a person, the "Talk to a human" button is right at the top.',
      zh: '你好！點選下方常見問題，或輸入任何關於 EaseCity 或 EC-Share 的問題——想與真人交談的話，「聯絡線上客服」按鈕就在頂部。',
      'zh-CN': '你好！点选下方常见问题，或输入任何关于 EaseCity 或 EC-Share 的问题——想与真人交谈的话，「联系在线客服」按钮就在顶部。',
    },
  },
  {
    keywords: ['thank', 'thanks', '谢谢', '多谢', '感謝', '感谢'],
    answer: {
      en: 'You are welcome! If anything else comes up — product questions, project scoping, or a live demo — just ask here or leave your contact via the human-support button.',
      zh: '不客氣！如果還有其他問題——產品查詢、項目評估或示範——隨時在此提問，或用真人客服按鈕留下聯絡方式。',
      'zh-CN': '不客气！如果还有其他问题——产品查询、项目评估或演示——随时在此提问，或用真人客服按钮留下联系方式。',
    },
  },
]

const FALLBACK: Record<Language, string> = {
  en: "I can help with EaseCity and EC-Share — features, pricing, supported devices, services, or project timelines. Try one of the common questions below, or use the \"Talk to a human\" button at the top and our team will reply here directly.",
  zh: '我可以解答 EaseCity 與 EC-Share 的問題——功能、定價、支援裝置、服務範圍或專案時程。點選下方常見問題，或用頂部的「聯絡線上客服」按鈕，團隊會直接在此回覆你。',
  'zh-CN': '我可以解答 EaseCity 与 EC-Share 的问题——功能、定价、支持设备、服务范围或项目时程。点选下方常见问题，或用顶部的「联系在线客服」按钮，团队会直接在此回复你。',
}

function pickReply(userText: string, language: Language): string {
  const q = userText.toLowerCase()
  for (const r of REPLIES) {
    if (r.keywords.some(k => q.includes(k))) return r.answer[language]
  }
  return FALLBACK[language]
}

export async function POST(req: Request) {
  const ip = getClientIp(req)
  const { allowed } = await rateLimit(`chat:${ip}`, 20, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = chatBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  const { messages, language } = parsed.data
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  const question = lastUser?.content?.trim() || ''

  // Compose is instant; the widget adds the human-feeling pause.
  return NextResponse.json({
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: pickReply(question, language || 'en'),
  })
}
