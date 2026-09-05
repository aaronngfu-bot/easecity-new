import { Resend } from 'resend'
import type { Language } from '@/i18n/translations'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

interface SendContactEmailParams {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
  /** The site language the visitor submitted in — both emails follow it. */
  language?: Language
}

interface SendOtpEmailParams {
  email: string
  otp: string
  expiresInMinutes: number
}

/* ────────────────────────────────────────────────────────────────────────────
   Shared brand shell. Emails render on all kinds of clients, so the design
   sticks to table layout, inline styles and a light background that doesn't
   depend on dark-mode support. EaseCity teal (#57bcb2 / deep #00796f) on
   paper (#f4f7f6), with the E+C wordmark as plain type.
   ──────────────────────────────────────────────────────────────────────────── */

const BRAND = {
  teal: '#57bcb2',
  tealDeep: '#00796f',
  ink: '#152726',
  paper: '#f4f7f6',
  card: '#ffffff',
  muted: '#5f7370',
  line: '#dfe9e7',
} as const

function shell(inner: string, footerNote: string): string {
  return `<!DOCTYPE html>
<html lang="utf-8">
<body style="margin:0; padding:0; background:${BRAND.paper};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.paper}; padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <tr>
            <td style="padding:0 8px 20px; font-family:Georgia, 'Times New Roman', serif;">
              <span style="font-size:20px; font-weight:700; color:${BRAND.tealDeep}; letter-spacing:0.5px;">Ease<span style="color:${BRAND.teal};">City</span></span>
              <span style="font-size:11px; color:${BRAND.muted}; letter-spacing:2.5px; margin-left:10px; vertical-align:2px;">TECHNOLOGIES</span>
            </td>
          </tr>
          <tr>
            <td style="background:${BRAND.card}; border:1px solid ${BRAND.line}; border-radius:12px; padding:32px; font-family:-apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'PingFang TC', 'Microsoft JhengHei', sans-serif;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 0; font-family:-apple-system, 'Segoe UI', Roboto, Arial, sans-serif; font-size:12px; color:${BRAND.muted}; line-height:1.6;">
              ${footerNote}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function row(label: string, value: string, odd: boolean): string {
  return `
  <tr>
    <td style="padding:10px 12px; ${odd ? `background:${BRAND.paper};` : ''} border-bottom:1px solid ${BRAND.line}; font-size:12px; color:${BRAND.muted}; width:110px; vertical-align:top;">${label}</td>
    <td style="padding:10px 12px; ${odd ? `background:${BRAND.paper};` : ''} border-bottom:1px solid ${BRAND.line}; font-size:14px; color:${BRAND.ink}; word-break:break-word;">${value}</td>
  </tr>`
}

function detailsTable(rows: string): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BRAND.line}; border-radius:8px; border-collapse:separate; overflow:hidden;">
    ${rows}
  </table>`
}

/* ────────────────────────────────────────────────────────────────────────────
   Copy per language
   ──────────────────────────────────────────────────────────────────────────── */

interface EmailCopy {
  internalTitle: string
  internalIntro: string
  confirmTitle: string
  confirmBody: (name: string) => string
  yourMessage: string
  fLabel: string
  fEmail: string
  fCompany: string
  fPhone: string
  fSubject: string
  fMessage: string
  footerInternal: string
  footerConfirm: string
  signature: string
}

const COPY: Record<Language, EmailCopy> = {
  en: {
    internalTitle: 'New enquiry',
    internalIntro: 'A visitor submitted the contact form on easecity.hk.',
    confirmTitle: 'We received your enquiry',
    confirmBody: (name: string) =>
      `Hi ${escapeHtml(name)}, thank you for reaching out. We have your message and a member of the team will reply within one business day.`,
    yourMessage: 'What you sent us',
    fLabel: 'Name', fEmail: 'Email', fCompany: 'Company', fPhone: 'Phone / WhatsApp',
    fSubject: 'Subject', fMessage: 'Message',
    footerInternal: 'You are receiving this because a visitor used the easecity.hk contact form. Reply directly to this email to answer them.',
    footerConfirm: 'You received this email because you submitted the contact form on <a href="https://easecity.hk" style="color:' + BRAND.tealDeep + '; text-decoration:none;">easecity.hk</a>. Didn\'t submit it? Just ignore this email — nothing else will be sent.',
    signature: 'EaseCity Technologies Limited · Hong Kong',
  },
  zh: {
    internalTitle: '新查詢',
    internalIntro: '有訪客在 easecity.hk 提交了聯絡表單。',
    confirmTitle: '我們已收到你的查詢',
    confirmBody: (name: string) =>
      `${escapeHtml(name)} 你好，感謝聯絡我們。已收到你的訊息，團隊會於一個工作天內回覆。`,
    yourMessage: '你提交的內容',
    fLabel: '姓名', fEmail: '電郵', fCompany: '公司', fPhone: '電話 / WhatsApp',
    fSubject: '主題', fMessage: '內容',
    footerInternal: '此電郵由 easecity.hk 聯絡表單發出。直接回覆此電郵即可聯絡對方。',
    footerConfirm: '此電郵因你在 <a href="https://easecity.hk" style="color:' + BRAND.tealDeep + '; text-decoration:none;">easecity.hk</a> 提交聯絡表單而發出。如非你本人提交，請忽略此電郵，我們不會再發送任何郵件。',
    signature: '逸城科技有限公司 · 香港',
  },
  'zh-CN': {
    internalTitle: '新查询',
    internalIntro: '有访客在 easecity.hk 提交了联系表单。',
    confirmTitle: '我们已收到你的查询',
    confirmBody: (name: string) =>
      `${escapeHtml(name)} 你好，感谢联系我们。已收到你的消息，团队会于一个工作日内回复。`,
    yourMessage: '你提交的内容',
    fLabel: '姓名', fEmail: '邮箱', fCompany: '公司', fPhone: '电话 / WhatsApp',
    fSubject: '主题', fMessage: '内容',
    footerInternal: '此邮件由 easecity.hk 联系表单发出。直接回复此邮件即可联系对方。',
    footerConfirm: '此邮件因你在 <a href="https://easecity.hk" style="color:' + BRAND.tealDeep + '; text-decoration:none;">easecity.hk</a> 提交联系表单而发出。如非你本人提交，请忽略此邮件，我们不会再发送任何邮件。',
    signature: '逸城科技有限公司 · 香港',
  },
}

/* ────────────────────────────────────────────────────────────────────────────
   Internal notification — full submission, reply-to the visitor
   ──────────────────────────────────────────────────────────────────────────── */

function internalEmailHtml(p: SendContactEmailParams, c: EmailCopy): string {
  const rowsFixed = [
    row(c.fLabel, escapeHtml(p.name), false),
    row(c.fEmail, `<a href="mailto:${escapeHtml(p.email)}" style="color:${BRAND.tealDeep}; text-decoration:none;">${escapeHtml(p.email)}</a>`, true),
    p.company ? row(c.fCompany, escapeHtml(p.company), false) : null,
    p.phone ? row(c.fPhone, escapeHtml(p.phone), true) : null,
    row(c.fSubject, escapeHtml(p.subject), false),
  ].filter(Boolean).join('')

  const inner = `
  <p style="margin:0 0 6px; font-size:11px; letter-spacing:2px; color:${BRAND.teal}; font-weight:700;">EASECITY.HK</p>
  <h1 style="margin:0 0 8px; font-size:22px; color:${BRAND.ink};">${c.internalTitle}</h1>
  <p style="margin:0 0 20px; font-size:14px; color:${BRAND.muted}; line-height:1.6;">${c.internalIntro}</p>
  ${detailsTable(rowsFixed)}
  <div style="margin-top:20px; background:${BRAND.paper}; border:1px solid ${BRAND.line}; border-radius:8px; padding:16px;">
    <p style="margin:0 0 8px; font-size:12px; color:${BRAND.muted};">${c.fMessage}</p>
    <p style="margin:0; font-size:14px; color:${BRAND.ink}; line-height:1.7; white-space:pre-wrap;">${escapeHtml(p.message)}</p>
  </div>`

  return shell(inner, c.footerInternal)
}

/* ────────────────────────────────────────────────────────────────────────────
   Visitor confirmation — friendly receipt of exactly what they sent
   ──────────────────────────────────────────────────────────────────────────── */

function confirmationEmailHtml(p: SendContactEmailParams, c: EmailCopy): string {
  const rowsFixed = [
    row(c.fSubject, escapeHtml(p.subject), false),
    row(c.fMessage, truncate(escapeHtml(p.message), 600), true),
  ].join('')

  const inner = `
  <div style="width:44px; height:44px; border-radius:50%; background:${BRAND.teal}; color:#ffffff; font-size:22px; text-align:center; line-height:44px; margin-bottom:16px;">✓</div>
  <h1 style="margin:0 0 10px; font-size:22px; color:${BRAND.ink};">${c.confirmTitle}</h1>
  <p style="margin:0 0 20px; font-size:14px; color:${BRAND.muted}; line-height:1.7;">${c.confirmBody(p.name)}</p>
  <p style="margin:0 0 8px; font-size:12px; letter-spacing:1.5px; color:${BRAND.muted}; font-weight:700;">${c.yourMessage.toUpperCase()}</p>
  ${detailsTable(rowsFixed)}
  <p style="margin:20px 0 0; font-size:13px; color:${BRAND.muted}; line-height:1.6;">${c.signature}</p>`

  return shell(inner, c.footerConfirm)
}

function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + '…' : text
}

/* ────────────────────────────────────────────────────────────────────────────
   Sender
   ──────────────────────────────────────────────────────────────────────────── */

export async function sendContactEmail(params: SendContactEmailParams) {
  const resend = getResend()
  const { name, email, subject, language } = params
  const toEmail = process.env.CONTACT_EMAIL_TO || 'admin@easecity.hk'
  const fromEmail = process.env.AUTH_EMAIL_FROM || 'EaseCity <onboarding@resend.dev>'
  const lang: Language = language === 'zh' || language === 'zh-CN' ? language : 'en'
  const c = COPY[lang]

  // 1. Internal notification — the team sees the full enquiry, replying goes
  //    straight to the visitor.
  const internal = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: email,
    subject: `[${c.internalTitle}] ${subject} — ${name}`,
    html: internalEmailHtml(params, c),
  })
  if (internal.error) {
    throw new Error(`Failed to send internal email: ${internal.error.message}`)
  }

  // 2. Visitor confirmation — a branded receipt of what they sent. Non-blocking:
  //    the team notification is the one that must arrive.
  const confirmation = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: subject,
    html: confirmationEmailHtml(params, c),
  })
  if (confirmation.error) {
    console.error('[Email] confirmation copy failed:', confirmation.error.message)
  }

  return internal.data
}

export async function sendOtpEmail(params: SendOtpEmailParams) {
  const resend = getResend()
  const fromEmail = process.env.AUTH_EMAIL_FROM || 'EaseCity <onboarding@resend.dev>'

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: [params.email],
    subject: 'Your EC-Share login code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #111827;">Your EC-Share login code</h2>
        <p style="color: #374151; line-height: 1.6;">
          Enter this code in EC-Share to finish signing in:
        </p>
        <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #111827; padding: 16px 0;">
          ${escapeHtml(params.otp)}
        </div>
        <p style="color: #6b7280; line-height: 1.6;">
          This code expires in ${params.expiresInMinutes} minutes. If you did not request it, you can ignore this email.
        </p>
      </div>
    `,
    text: `Your EC-Share login code is ${params.otp}. It expires in ${params.expiresInMinutes} minutes.`,
  })

  if (error) {
    throw new Error(`Failed to send OTP email: ${error.message}`)
  }

  return data
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (char) => map[char])
}
