import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

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
  conversationId: z.string().min(1).max(64).optional(),
})

/**
 * Keyword-matched scripted answers for EC, the chat persona. No AI model: the
 * responses are deterministic, instant to compose, and the widget holds a
 * deliberate "thinking" pause on its side so the exchange still feels
 * conversational.
 *
 * Match order matters: first hit wins. `any` is the fallback.
 */
type Reply = { keywords: string[]; answer: string }

const REPLIES: Reply[] = [
  {
    keywords: ['ec-share', 'ecshare', '什么是 ec-share', 'what is ec-share', '是什麼', '是什么', 'what is'],
    answer:
      'EC-Share is our Windows desktop app that mirrors multiple Android devices to your computer over USB in real time. You get a live grid of up to 15 screens, keyboard-and-mouse control of one focused device, and view-only links to share with teammates — all without a cloud relay on local networks.',
  },
  {
    keywords: ['price', 'pricing', 'cost', '多少钱', '價格', '费用', '費用', 'plan', '订阅', '訂閱', 'trial'],
    answer:
      'EC-Share has a 14-day free trial. Pro is US$19/month (or $190/yr) for personal mirroring; Business is US$49/month (or $490/yr) and adds desktop-to-desktop sharing, seats, and audit history. Enterprise is custom-quoted — tell us what you need and we will scope it.',
  },
  {
    keywords: ['device', 'support', 'android', 'windows', '支援', '支持', '裝置', '设备', '设备支', '兼容'],
    answer:
      'Desktop side: Windows 10 and 11. Device side: Android with USB debugging enabled — no root needed. Connection is over USB (ADB), which is why latency stays low and no cloud account is required for local use.',
  },
  {
    keywords: ['service', 'services', 'offer', '服务', '服務', '开发', '開發', 'design', '设计', '設計', 'advertising', 'consult'],
    answer:
      'EaseCity offers five services: system development (real-time and low-latency), web platforms (full-stack with auth, billing, and docs), UI/UX design, advertising, and consulting. Each engagement starts with a 1–3 day discovery, then weekly demo cycles.',
  },
  {
    keywords: ['how long', 'timeline', 'duration', '多久', '时长', '時長', '交付', 'delivery', '工期'],
    answer:
      'Discovery takes 1–3 days, then you get a working demo every week. A focused web platform usually ships an MVP in 4–8 weeks; larger systems are scoped after discovery. Either way you always see demonstrable progress weekly.',
  },
  {
    keywords: ['team', 'who', 'company', '公司', '团队', '團隊', '关于', '關於', 'about', 'who are you'],
    answer:
      'EaseCity Technologies Limited is a Hong Kong-based company building tools and services for connected teams. EC-Share is our first product; the same engineering team takes on client system development, web platforms, and design work.',
  },
  {
    keywords: ['contact', 'email', 'human', '人', '客服', '聯絡', '联络', 'email us', 'phone'],
    answer:
      'You can reach a human two ways: tap "Talk to a human" at the top of this chat to leave a question (our team gets notified instantly and replies here), or email admin@easecity.hk. Either way you will hear back within one business day.',
  },
  {
    keywords: ['hello', 'hi', 'hey', '你好', '您好', '嗨'],
    answer:
      'Hi! Pick one of the common questions below, or type anything about EaseCity or EC-Share — and if you would rather talk to a person, the "Talk to a human" button is right at the top.',
  },
  {
    keywords: ['thank', 'thanks', '谢谢', '多谢', '感謝', '感谢'],
    answer:
      'You are welcome! If anything else comes up — product questions, project scoping, or a live demo — just ask here or leave your contact via the human-support button.',
  },
]

const FALLBACK: Record<string, string> = {
  en: "I can help with EaseCity and EC-Share — features, pricing, supported devices, services, or project timelines. Try one of the common questions below, or use the \"Talk to a human\" button at the top and our team will reply here directly.",
  zh: '我可以解答 EaseCity 與 EC-Share 的問題——功能、定價、支援裝置、服務範圍或專案時程。點選下方常見問題，或用頂部的「聯絡線上客服」按鈕，團隊會直接在此回覆你。',
  'zh-CN': '我可以解答 EaseCity 与 EC-Share 的问题——功能、定价、支持设备、服务范围或项目时程。点选下方常见问题，或用顶部的「联系在线客服」按钮，团队会直接在此回复你。',
}

function pickReply(userText: string): string {
  const q = userText.toLowerCase()
  for (const r of REPLIES) {
    if (r.keywords.some(k => q.includes(k))) return r.answer
  }
  // Language of the last user message decides the fallback's language.
  const cjk = /[\u4e00-\u9fff]/.test(userText)
  const simplifiedOnly = /[\u4e00-\u9fff]/.test(userText) && !/[這個們說對開關時後裡為與進經過還類質訂單帳費價賣訊體點選輸請隊網線連區標覽讓證驗檢觸發廣項約規導碼鍵盤螢測儲變數錯檔縮簽偵畫專設傳發匯應該聲響樂環境處雙壓總現獲際願離聽顧問飯誌運隨頁寫讀買轉換鐘頭]/.test(userText)
  return FALLBACK[cjk ? (simplifiedOnly ? 'zh-CN' : 'zh') : 'en']
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
  const { messages } = parsed.data
  const lastUser = [...messages].reverse().find(m => m.role === 'user')
  const question = lastUser?.content?.trim() || ''

  // Compose is instant; the widget adds the human-feeling pause.
  return NextResponse.json({
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: pickReply(question),
  })
}
