import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { Language } from '@/i18n/translations'

/**
 * Live-support plumbing for the chat widget escalation flow.
 *
 * The agent has NO login: when a visitor escalates, an email with a signed
 * magic link goes out; opening it grants the console for that session (and any
 * other waiting session). Links are HMAC-signed with an expiry so leaked URLs
 * stop working.
 */

export const SUPPORT_LINK_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

function secret(): string {
  return (
    process.env.SUPPORT_MAGIC_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'easecity-support-dev-secret'
  )
}

export function newVisitorToken(): string {
  return randomBytes(24).toString('base64url')
}

/** token = expiry-hex.signature-hex */
export function signAgentToken(sessionId: string, at: number = Date.now()): string {
  const exp = (at + SUPPORT_LINK_TTL_MS).toString(16)
  const sig = createHmac('sha256', secret()).update(`${sessionId}.${exp}`).digest('hex')
  return `${exp}.${sig}`
}

export function verifyAgentToken(sessionId: string, token: string): boolean {
  const [expHex, sig] = token.split('.')
  if (!expHex || !sig) return false
  const exp = parseInt(expHex, 16)
  if (!Number.isFinite(exp) || Date.now() > exp) return false
  const expected = createHmac('sha256', secret()).update(`${sessionId}.${expHex}`).digest('hex')
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  return a.length === b.length && timingSafeEqual(a, b)
}

export function agentConsoleUrl(sessionId: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://easecity.hk'
  return `${base}/support/console?session=${sessionId}&token=${signAgentToken(sessionId)}`
}

/* ─── Canned reply templates for the agent console (trilingual) ─────────── */

export interface CannedTemplate {
  id: string
  label: Record<Language, string>
  body: Record<Language, string>
}

export const CANNED_TEMPLATES: CannedTemplate[] = [
  {
    id: 'greet',
    label: { en: 'Greeting', zh: '問候', 'zh-CN': '问候' },
    body: {
      en: 'Hi! This is a human from EaseCity — I have your chat open now. How can I help?',
      zh: '你好！我是 EaseCity 的客服人員，已看到你的對話。有什麼可以幫你？',
      'zh-CN': '你好！我是 EaseCity 的客服人员，已看到你的对话。有什么可以帮你？',
    },
  },
  {
    id: 'pricing',
    label: { en: 'Pricing', zh: '定價', 'zh-CN': '定价' },
    body: {
      en: 'EC-Share has a 14-day free trial. Pro is US$19/month (or $190/yr) for personal mirroring; Business is US$49/month (or $490/yr) and adds desktop-to-desktop sharing, seats and audit history. Enterprise is custom — happy to scope it with you.',
      zh: 'EC-Share 提供 14 天免費試用。Pro 為 US$19／月（或 $190／年），適合個人鏡像；Business 為 US$49／月（或 $490／年），加入桌對桌分享、座位與審計紀錄。企業版按需求報價，我們可以一起評估。',
      'zh-CN': 'EC-Share 提供 14 天免费试用。Pro 为 US$19／月（或 $190／年），适合个人镜像；Business 为 US$49／月（或 $490／年），加入桌对桌分享、座位与审计记录。企业版按需求报价，我们可以一起评估。',
    },
  },
  {
    id: 'services',
    label: { en: 'Services overview', zh: '服務簡介', 'zh-CN': '服务简介' },
    body: {
      en: 'Our services: system development (real-time/low-latency), web platforms (full-stack with auth, billing, docs), UI/UX design, advertising, and consulting. Which one is closest to what you need?',
      zh: '我們的服務：系統開發（即時／低延遲）、網頁平台（全端，含驗證、帳單、文檔）、UI/UX 設計、廣告投放與技術諮詢。哪一項最接近你的需求？',
      'zh-CN': '我们的服务：系统开发（实时／低延迟）、网页平台（全端，含验证、账单、文档）、UI/UX 设计、广告投放与技术咨询。哪一项最接近你的需求？',
    },
  },
  {
    id: 'ecshare-how',
    label: { en: 'How EC-Share works', zh: 'EC-Share 運作', 'zh-CN': 'EC-Share 运作' },
    body: {
      en: 'EC-Share mirrors Android devices to a Windows desktop over USB (ADB). You see a live grid of up to 15 devices, control one focused device with keyboard and mouse, and can share a view-only link with teammates. No cloud relay for local use — lowest latency.',
      zh: 'EC-Share 透過 USB（ADB）把 Android 裝置鏡像到 Windows 桌面。可同時看到最多 15 台的即時網格，用鍵盤滑鼠聚焦操作其中一台，並可分享唯讀連結給同事。本地使用不經雲端中繼，延遲最低。',
      'zh-CN': 'EC-Share 通过 USB（ADB）把 Android 设备镜像到 Windows 桌面。可同时看到最多 15 台的实时网格，用键盘鼠标聚焦操作其中一台，并可分享唯读链接给同事。本地使用不经云端中继，延迟最低。',
    },
  },
  {
    id: 'require-quote',
    label: { en: 'Ask for requirements', zh: '詢問需求', 'zh-CN': '询问需求' },
    body: {
      en: 'Could you share a bit more? Roughly: what the system should do, which platforms, and your timeline. A sentence or two is enough — we will come back with a scoped quote within two business days.',
      zh: '可以多講一點嗎？大致上：系統要做什麼、目標平台、期望時間。一兩句即可，我們會在兩個工作天內回覆有範疇的報價。',
      'zh-CN': '可以多讲一点吗？大致上：系统要做什么、目标平台、期望时间。一两句即可，我们会在两个工作日内回复有范畴的报价。',
    },
  },
  {
    id: 'timeline',
    label: { en: 'Typical timeline', zh: '一般時程', 'zh-CN': '一般时程' },
    body: {
      en: 'Typical engagements: discovery 1–3 days, then weekly demo cycles. A focused web platform usually ships an MVP in 4–8 weeks; larger systems are scoped after discovery. You see a demo every week either way.',
      zh: '一般流程：需求探索 1–3 天，之後每週演示迭代。聚焦的網頁平台通常 4–8 週出 MVP；較大的系統會在探索後給時程。無論如何你每週都會看到可演示的進度。',
      'zh-CN': '一般流程：需求探索 1–3 天，之后每周演示迭代。聚焦的网页平台通常 4–8 周出 MVP；较大的系统会在探索后给时程。无论如何你每周都会看到可演示的进度。',
    },
  },
  {
    id: 'contact-offline',
    label: { en: 'We will follow up', zh: '稍後跟進', 'zh-CN': '稍后跟进' },
    body: {
      en: 'I need to check one thing internally — I will follow up by email within one business day. Thank you for your patience!',
      zh: '這一點我需要內部確認一下，會在一個工作天內以電郵跟進。謝謝你的耐心！',
      'zh-CN': '这一点我需要内部确认一下，会在一个工作日内以电邮跟进。谢谢你的耐心！',
    },
  },
  {
    id: 'closing',
    label: { en: 'Wrap up', zh: '結束對話', 'zh-CN': '结束对话' },
    body: {
      en: 'Glad I could help! You can reopen this chat any time, or email admin@easecity.hk. Have a great day.',
      zh: '很高興幫到你！隨時可以重新打開此對話，或電郵 admin@easecity.hk。祝你有愉快的一天。',
      'zh-CN': '很高兴帮到你！随时可以重新打开此对话，或电邮 admin@easecity.hk。祝你有愉快的一天。',
    },
  },
]

/* ─── Escalation email (to the team) ─────────────────────────────────────── */

export function escalationEmailHtml(opts: {
  sessionId: string
  visitorName?: string | null
  visitorEmail?: string | null
  language: Language
  question: string
}): { subject: string; html: string } {
  const { sessionId, visitorName, visitorEmail, language, question } = opts
  const url = agentConsoleUrl(sessionId)
  const link = `<a href="${url}" style="display:inline-block; background:#00796f; color:#ffffff; padding:12px 22px; border-radius:8px; text-decoration:none; font-size:14px; font-weight:600;">Open support console</a>`

  const zh = language !== 'en'
  const cn = language === 'zh-CN'
  const subject = zh ? `需要人工協助 — 對話升級` : 'Human support requested — chat escalated'
  const heading = zh ? (cn ? '访客请求人工客服' : '訪客請求人工客服') : 'A visitor asked for human support'
  const meta = [
    visitorName && (zh ? `姓名：${escapeHtml(visitorName)}` : `Name: ${escapeHtml(visitorName)}`),
    visitorEmail && (zh ? `電郵：${escapeHtml(visitorEmail)}` : `Email: ${escapeHtml(visitorEmail)}`),
  ].filter(Boolean).join('<br/>')

  const html = `<!DOCTYPE html>
<html><body style="margin:0; padding:0; background:#f4f7f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6; padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
  <tr><td style="padding:0 8px 20px;">
    <img src="https://easecity.hk/images/easecity-logo-light-128.png" width="30" height="30" alt="EaseCity" style="display:block; border:0; margin-bottom:8px;" />
    <span style="font-family:Georgia, serif; font-size:20px; font-weight:700; color:#00796f;">Ease<span style="color:#57bcb2;">City</span></span>
  </td></tr>
  <tr><td style="background:#ffffff; border:1px solid #dfe9e7; border-radius:12px; padding:32px; font-family:-apple-system,'Segoe UI',Roboto,Arial,'PingFang TC','Microsoft JhengHei',sans-serif;">
    <h1 style="margin:0 0 10px; font-size:22px; color:#152726;">${heading}</h1>
    ${meta ? `<p style="margin:0 0 12px; font-size:14px; color:#5f7370;">${meta}</p>` : ''}
    <div style="margin:0 0 20px; background:#f4f7f6; border:1px solid #dfe9e7; border-radius:8px; padding:14px;">
      <p style="margin:0; font-size:14px; color:#152726; line-height:1.7; white-space:pre-wrap;">${escapeHtml(question)}</p>
    </div>
    <p style="margin:0 0 16px; font-size:14px; color:#5f7370; line-height:1.6;">${zh
      ? (cn ? '点击下方链接打开客服控制台，直接回复访客（回复会实时出现在其聊天框）。链接 7 天内有效。' : '點擊下方連結開啟客服控制台，直接回覆訪客（回覆會即時出現在其聊天框）。連結 7 天內有效。')
      : 'Open the support console below to reply directly — your answer appears in the visitor\'s chat in real time. The link is valid for 7 days.'}</p>
    ${link}
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  return { subject, html }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }
  return text.replace(/[&<>"']/g, (ch) => map[ch])
}
