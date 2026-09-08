import type { Language } from '@/i18n/translations'

/**
 * Quote + Receipt customer-facing email templates (trilingual), same brand
 * table layout as the escalation email. Money values are pre-formatted by
 * the caller.
 */

export interface QuoteEmailItem {
  description: string
  qty: number
  lineTotal: string
}

export function quoteEmailHtml(opts: {
  quoteUrl: string
  /** True when the PDF is attached to the email (copy mentions it). */
  hasAttachment?: boolean
  language: Language
  number: string
  clientName: string
  items: QuoteEmailItem[]
  total: string
  currency: string
  validUntil?: string | null
  notes?: string | null
}): { subject: string; html: string } {
  const { quoteUrl, hasAttachment, language, number, clientName, items, total, currency, validUntil, notes } = opts
  const zh = language !== 'en'
  const cn = language === 'zh-CN'
  const subject = zh ? `報價單 ${number} — EaseCity` : `Quotation ${number} — EaseCity`
  const heading = cn ? '您的报价单' : zh ? '你的報價單' : 'Your quotation'
  const attachNote = hasAttachment
    ? (cn
      ? '<p style="margin:0 0 14px; font-size:13px; color:#5f7370;">附上 PDF 版本，可列印簽名後掃描回傳至 admin@easecity.hk — 或點下方按鈕線上簽署。</p>'
      : zh
        ? '<p style="margin:0 0 14px; font-size:13px; color:#5f7370;">附上 PDF 版本，可列印簽名後掃描回傳至 admin@easecity.hk — 或點下方按鈕線上簽署。</p>'
        : '<p style="margin:0 0 14px; font-size:13px; color:#5f7370;">A PDF copy is attached — print, sign and return it to admin@easecity.hk, or confirm online with the button below.</p>')
    : ''
  const rows = items
    .map(
      (it) => `<tr>
        <td style="padding:8px 0; font-size:14px; color:#152726;">${escapeHtml(it.description)}</td>
        <td style="padding:8px 0; font-size:14px; color:#5f7370; text-align:right;">${it.qty}</td>
        <td style="padding:8px 0; font-size:14px; color:#152726; text-align:right;">${it.lineTotal}</td>
      </tr>`
    )
    .join('')
  const validLine = validUntil
    ? cn
      ? `<p style="margin:0 0 12px; font-size:13px; color:#5f7370;">有效期至 ${escapeHtml(validUntil)}</p>`
      : zh
        ? `<p style="margin:0 0 12px; font-size:13px; color:#5f7370;">有效期至 ${escapeHtml(validUntil)}</p>`
        : `<p style="margin:0 0 12px; font-size:13px; color:#5f7370;">Valid until ${escapeHtml(validUntil)}</p>`
    : ''
  const body = zh
    ? (cn
      ? `${escapeHtml(clientName)} 您好，<br/><br/>请查阅以下报价明细。点击下方按钮可查看完整报价并确认。`
      : `${escapeHtml(clientName)} 你好，<br/><br/>請查閱以下報價明細。點擊下方按鈕可查看完整報價並確認。`)
    : `Hi ${escapeHtml(clientName)},<br/><br/>Please find the quotation details below. Click the button to review and confirm.`

  const html = `<!DOCTYPE html>
<html><body style="margin:0; padding:0; background:#f4f7f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6; padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
  <tr><td style="padding:0 8px 20px;">
    <img src="https://easecity.hk/images/easecity-logo-light-128.png" width="30" height="30" alt="EaseCity" style="display:block; border:0; margin-bottom:8px;" />
    <span style="font-family:Georgia, serif; font-size:20px; font-weight:700; color:#00796f;">Ease<span style="color:#57bcb2;">City</span></span>
  </td></tr>
  <tr><td style="background:#ffffff; border:1px solid #dfe9e7; border-radius:12px; padding:32px; font-family:-apple-system,'Segoe UI',Roboto,Arial,'PingFang TC','Microsoft JhengHei',sans-serif;">
    <h1 style="margin:0 0 6px; font-size:22px; color:#152726;">${heading}</h1>
    <p style="margin:0 0 16px; font-size:13px; color:#5f7370; font-family:monospace;">${escapeHtml(number)}</p>
    ${body}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0; border-collapse:collapse;">
      <tr style="border-bottom:1px solid #dfe9e7;">
        <th align="left" style="padding:6px 0; font-size:12px; color:#5f7370; text-transform:uppercase;">${cn ? '项目' : zh ? '項目' : 'Item'}</th>
        <th align="right" style="padding:6px 0; font-size:12px; color:#5f7370; text-transform:uppercase;">${cn ? '数量' : zh ? '數量' : 'Qty'}</th>
        <th align="right" style="padding:6px 0; font-size:12px; color:#5f7370; text-transform:uppercase;">${cn ? '小计' : zh ? '小計' : 'Amount'}</th>
      </tr>
      ${rows}
      <tr>
        <td style="padding:10px 0 0; font-size:15px; font-weight:700; color:#152726;">${cn ? '合计' : zh ? '合計' : 'Total'}</td>
        <td></td>
        <td style="padding:10px 0 0; font-size:15px; font-weight:700; color:#00796f; text-align:right;">${total} ${escapeHtml(currency.toUpperCase())}</td>
      </tr>
    </table>
    ${attachNote}
    ${validLine}
    ${notes ? `<div style="margin:0 0 18px; background:#f4f7f6; border:1px solid #dfe9e7; border-radius:8px; padding:12px;"><p style="margin:0; font-size:13px; color:#152726; line-height:1.7; white-space:pre-wrap;">${escapeHtml(notes)}</p></div>` : ''}
    <a href="${quoteUrl}" style="display:inline-block; background:#00796f; color:#ffffff; padding:12px 22px; border-radius:8px; text-decoration:none; font-size:14px; font-weight:600;">${cn ? '查看并确认报价' : zh ? '查看並確認報價' : 'Review & confirm quote'}</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  return { subject, html }
}

export function receiptEmailHtml(opts: {
  receiptUrl: string
  language: Language
  number: string
  clientName: string
  total: string
  currency: string
  issuedAt: string
}): { subject: string; html: string } {
  const { receiptUrl, language, number, clientName, total, currency, issuedAt } = opts
  const zh = language !== 'en'
  const cn = language === 'zh-CN'
  const subject = zh ? `收據 ${number} — EaseCity` : `Receipt ${number} — EaseCity`
  const heading = cn ? '收据' : zh ? '收據' : 'Receipt'
  const body = zh
    ? (cn
      ? `${escapeHtml(clientName)} 您好，<br/><br/>感谢您的付款。这是您的收据，可点击下方按钮查看或打印。`
      : `${escapeHtml(clientName)} 你好，<br/><br/>多謝你的付款。這是你的收據，可點擊下方按鈕查看或列印。`)
    : `Hi ${escapeHtml(clientName)},<br/><br/>Thank you for your payment. This is your receipt — click below to view or print it.`

  const html = `<!DOCTYPE html>
<html><body style="margin:0; padding:0; background:#f4f7f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6; padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
  <tr><td style="padding:0 8px 20px;">
    <img src="https://easecity.hk/images/easecity-logo-light-128.png" width="30" height="30" alt="EaseCity" style="display:block; border:0; margin-bottom:8px;" />
    <span style="font-family:Georgia, serif; font-size:20px; font-weight:700; color:#00796f;">Ease<span style="color:#57bcb2;">City</span></span>
  </td></tr>
  <tr><td style="background:#ffffff; border:1px solid #dfe9e7; border-radius:12px; padding:32px; font-family:-apple-system,'Segoe UI',Roboto,Arial,'PingFang TC','Microsoft JhengHei',sans-serif;">
    <h1 style="margin:0 0 6px; font-size:22px; color:#152726;">${heading}</h1>
    <p style="margin:0 0 16px; font-size:13px; color:#5f7370; font-family:monospace;">${escapeHtml(number)}</p>
    ${body}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0; background:#f4f7f6; border:1px solid #dfe9e7; border-radius:8px;">
      <tr>
        <td style="padding:14px; font-size:14px; color:#152726;">${cn ? '金额' : zh ? '金額' : 'Amount'}</td>
        <td style="padding:14px; font-size:16px; font-weight:700; color:#00796f; text-align:right;">${total} ${escapeHtml(currency.toUpperCase())}</td>
      </tr>
      <tr>
        <td style="padding:0 14px 14px; font-size:13px; color:#5f7370;">${cn ? '日期' : zh ? '日期' : 'Date'}</td>
        <td style="padding:0 14px 14px; font-size:13px; color:#5f7370; text-align:right;">${escapeHtml(issuedAt)}</td>
      </tr>
    </table>
    <a href="${receiptUrl}" style="display:inline-block; background:#00796f; color:#ffffff; padding:12px 22px; border-radius:8px; text-decoration:none; font-size:14px; font-weight:600;">${cn ? '查看收据' : zh ? '查看收據' : 'View receipt'}</a>
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
