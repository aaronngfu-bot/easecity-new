import fs from 'node:fs'
import path from 'node:path'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { getCompanyPayDetails, type CompanyPayDetails } from '@/lib/company-details'

/**
 * Server-side PDF generation for quotes and receipts.
 *
 * Design: formal business document. White background, near-black ink, hairline
 * rules — no colored banner blocks, so a mono (black & white) print looks
 * exactly like the screen version. Brand shows only as the logo mark and a
 * single thin rule; all accents are structural (weight + position), the way
 * traditional invoices and bank letters are laid out.
 *
 * Trilingual copy: every label is EN + TC + SC on the same line ("Prepared for
 * 客戶 客戶"), so one document serves EN / 繁中 / 简体 readers without
 * generating three variants. CJK text uses the embedded Noto Sans TC font
 * (subset on embed, output stays small).
 */

const FONT_PATH = path.join(process.cwd(), 'src/assets/fonts/NotoSansTC-Regular.otf')
let fontCache: Uint8Array | null = null
function cjkFontBytes(): Uint8Array {
  if (!fontCache) fontCache = new Uint8Array(fs.readFileSync(FONT_PATH))
  return fontCache
}

const LOGO_PATH = path.join(process.cwd(), 'public/images/easecity-logo-light-256.png')
let logoCache: Buffer | null = null
function logoBytes(): Buffer {
  if (!logoCache) logoCache = fs.readFileSync(LOGO_PATH)
  return logoCache
}

export interface PdfLineItem {
  description: string
  qty: number
  unitPrice: number // smallest currency unit
}

interface BaseDoc {
  number: string
  clientName: string
  clientEmail?: string | null
  currency: string
  items: PdfLineItem[]
  notes?: string | null
  issuedAt: Date
  validUntil?: Date | null
}

// Mono-print palette: everything near-black/grey on white. No color fills.
const INK = rgb(0.06, 0.07, 0.07)
const MUTED = rgb(0.42, 0.44, 0.44)
const HAIR = rgb(0.72, 0.74, 0.74)
const HAIR_DARK = rgb(0.15, 0.16, 0.16)

function money(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** Document-context fonts shared by quote and receipt builders. */
interface Ctx {
  doc: PDFDocument
  cjk: import('pdf-lib').PDFFont
  helv: import('pdf-lib').PDFFont
  helvBold: import('pdf-lib').PDFFont
  /** Trilingual label row: "EN 繁中/简体" — EN in Helvetica, CJK in Noto. */
  label: (page: import('pdf-lib').PDFPage, en: string, cjkText: string, x: number, y: number, size?: number, color?: ReturnType<typeof rgb>) => void
  /** Right-aligned variant: whole run ends at xRight. */
  labelRight: (page: import('pdf-lib').PDFPage, en: string, cjkText: string, xRight: number, y: number, size?: number, color?: ReturnType<typeof rgb>) => void
  draw: (page: import('pdf-lib').PDFPage, text: string, x: number, y: number, size: number, opts?: { bold?: boolean; color?: ReturnType<typeof rgb>; alignRight?: number }) => void
  wrap: (page: import('pdf-lib').PDFPage, text: string, x: number, y: number, maxWidth: number, size: number, opts?: { color?: ReturnType<typeof rgb>; lineHeight?: number }) => number
  hasCJK: (text: string) => boolean
}

async function makeCtx(doc: PDFDocument): Promise<Ctx> {
  doc.registerFontkit(fontkit)
  // subset: false — the subsetter's glyph map renders blank in some viewers
  // (Chrome PDF viewer); full embed is ~5MB but streams fine and prints right.
  const cjk = await doc.embedFont(cjkFontBytes(), { subset: false })
  const helv = await doc.embedFont(StandardFonts.Helvetica)
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const hasCJK = (text: string) => /[\u3000-\u9fff\uff00-\uffef\u2018\u2019\u201c\u201d]/.test(text)
  const pick = (text: string, bold = false) =>
    hasCJK(text) ? cjk : bold ? helvBold : helv

  const draw: Ctx['draw'] = (page, text, x, y, size, opts = {}) => {
    const f = pick(text, opts.bold)
    const xx = opts.alignRight ? x - f.widthOfTextAtSize(text, size) : x
    page.drawText(text, { x: xx, y, size, font: f, color: opts.color ?? INK })
  }

  const label: Ctx['label'] = (page, en, cjkText, x, y, size = 8.5, color = MUTED) => {
    // Mixed script: EN part Helvetica, CJK part Noto — draw in two runs.
    // If cjkText is empty, draw EN only.
    if (!cjkText) {
      page.drawText(en, { x, y, size, font: helv, color })
      return
    }
    page.drawText(en + '  ', { x, y, size, font: helv, color })
    const enW = helv.widthOfTextAtSize(en + '  ', size)
    page.drawText(cjkText, { x: x + enW, y, size, font: cjk, color })
  }

  /** Right-aligned trilingual label: the whole EN+CJK run ends at x. */
  const labelRight: Ctx['labelRight'] = (page, en, cjkText, xRight, y, size = 8.5, color = MUTED) => {
    const enW = helv.widthOfTextAtSize(en + (cjkText ? '  ' : ''), size)
    const cjkW = cjkText ? cjk.widthOfTextAtSize(cjkText, size) : 0
    const x = xRight - enW - cjkW
    page.drawText(en + (cjkText ? '  ' : ''), { x, y, size, font: helv, color })
    if (cjkText) page.drawText(cjkText, { x: x + enW, y, size, font: cjk, color })
  }

  const wrap: Ctx['wrap'] = (page, text, x, y, maxWidth, size, opts = {}) => {
    let line = ''
    let cursorY = y
    const font = pick(text)
    const push = () => {
      page.drawText(line, { x, y: cursorY, size, font, color: opts.color ?? INK })
      cursorY -= opts.lineHeight ?? size * 1.55
      line = ''
    }
    for (const ch of text) {
      if (ch === '\n') { push(); continue }
      const candidate = line + ch
      if (font.widthOfTextAtSize(candidate, size) > maxWidth) {
        push()
        line = ch
      } else {
        line = candidate
      }
    }
    if (line) push()
    return cursorY
  }

  return { doc, cjk, helv, helvBold, label, labelRight, draw, wrap, hasCJK }
}

/** Formal letterhead: logo mark top-left, company block (registered name +
 *  BR No. + address), doc title top-right, double rule. */
async function drawLetterhead(doc: PDFDocument, page: import('pdf-lib').PDFPage, ctx: Ctx, titleEn: string, titleCjk: string, company: CompanyPayDetails) {
  const M = 54
  try {
    const img = await doc.embedPng(logoBytes())
    const h = 34
    const w = (img.width / img.height) * h
    page.drawImage(img, { x: M, y: 786, width: w, height: h })
  } catch {
    ctx.draw(page, 'EaseCity', M, 792, 16, { bold: true })
  }
  // Company block under logo: registered name + BR number + address
  ctx.draw(page, company.companyName, M, 772, 8.5, { color: MUTED })
  let ly = 761
  if (company.companyBrNo) {
    ctx.draw(page, `BR No. / 商業登記號: ${company.companyBrNo}`, M, ly, 8.5, { color: MUTED })
    ly -= 11
  }
  if (company.companyAddress) {
    // Registered address may wrap — keep to two lines
    ly = ctx.wrap(page, company.companyAddress, M, ly, 260, 8.5, { color: MUTED, lineHeight: 11 })
  }
  // Web/email line always last
  ctx.draw(page, 'easecity.hk · admin@easecity.hk', M, ly - 11, 8.5, { color: MUTED })

  // Doc title top-right: EN big, CJK under
  ctx.draw(page, titleEn, 595 - M, 800, 20, { bold: true, alignRight: 595 - M })
  {
    const f = ctx.cjk
    const w = f.widthOfTextAtSize(titleCjk, 10)
    page.drawText(titleCjk, { x: 595 - M - w, y: 786, size: 10, font: f, color: MUTED })
  }

  // Double rule: 1.6pt dark + hairline — formal document staple, prints crisply in mono
  page.drawLine({ start: { x: M, y: 738 }, end: { x: 595 - M, y: 738 }, thickness: 1.6, color: HAIR_DARK })
  page.drawLine({ start: { x: M, y: 734 }, end: { x: 595 - M, y: 734 }, thickness: 0.5, color: HAIR })
}

/** Formal footer: two lines, each drawn as EN run + CJK run from a shared
 *  centre anchor so the pair reads as one centred block. */
function drawFooter(ctx: Ctx, page: import('pdf-lib').PDFPage, noteEn: string, noteCjk: string) {
  const M = 54
  const centre = 595 / 2
  page.drawLine({ start: { x: M, y: 84 }, end: { x: 595 - M, y: 84 }, thickness: 0.5, color: HAIR })
  // Line 1: company — pure Latin, measure and centre
  {
    const s = 'EaseCity Technologies Limited · Hong Kong · easecity.hk · admin@easecity.hk'
    const w = ctx.helv.widthOfTextAtSize(s, 8)
    page.drawText(s, { x: centre - w / 2, y: 68, size: 8, font: ctx.helv, color: MUTED })
  }
  // Line 2: EN + CJK two runs, centred as a group
  {
    const enW = ctx.helv.widthOfTextAtSize(noteEn + ' ', 7.5)
    const cjkW = ctx.cjk.widthOfTextAtSize(noteCjk, 7.5)
    const startX = centre - (enW + cjkW) / 2
    page.drawText(noteEn + ' ', { x: startX, y: 56, size: 7.5, font: ctx.helv, color: MUTED })
    page.drawText(noteCjk, { x: startX + enW, y: 56, size: 7.5, font: ctx.cjk, color: MUTED })
  }
}

function partyBlock(ctx: Ctx, page: import('pdf-lib').PDFPage, y: number, labelEn: string, labelCjk: string, name: string, email: string | null) {
  const M = 54
  ctx.label(page, labelEn, labelCjk, M, y)
  ctx.draw(page, name, M, y - 16, 12.5, { bold: true })
  let bottom = y - 30
  if (email) {
    ctx.draw(page, email, M, y - 30, 9.5, { color: MUTED })
    bottom = y - 44
  }
  return bottom
}

export async function buildQuotePdf(opts: BaseDoc & {
  signature?: { pngDataUri: string; signerName: string; signedAt: Date } | null
}): Promise<Uint8Array> {
  const { number, clientName, clientEmail, currency, items, notes, issuedAt, validUntil, signature } = opts
  const company = await getCompanyPayDetails()

  const doc = await PDFDocument.create()
  const ctx = await makeCtx(doc)
  const page = doc.addPage([595, 842]) // A4
  const M = 54

  await drawLetterhead(doc, page, ctx, 'QUOTATION', '報價單', company)

  // Number + issue date (left column, formal doc references) — values in a
  // second column at x 190 so the trilingual labels never collide with them.
  ctx.label(page, 'Quotation No.', '報價單編號', M, 704, 8.5)
  ctx.draw(page, number, 190, 704, 10, { bold: true })
  ctx.label(page, 'Date of Issue', '發出日期', M, 684, 8.5)
  ctx.draw(page, fmtDate(issuedAt), 190, 684, 9.5)
  if (validUntil) {
    ctx.label(page, 'Valid Until', '有效期至', M, 664, 8.5)
    ctx.draw(page, fmtDate(validUntil), 190, 664, 9.5)
  }

  // Client party (left, below references) + thin rule under
  const partyBottom = partyBlock(ctx, page, 636, 'Prepared for', '客戶', clientName, clientEmail ?? null)
  {
    const y = partyBottom - 8
    page.drawLine({ start: { x: M, y }, end: { x: 595 - M, y }, thickness: 0.5, color: HAIR })
  }

  // Items table — header: no top rule above the header (it follows the party
  // rule), dark rule under the header, hairline row rules, dark rule closing.
  // Row text vertically centred between rules.
  let y = 576
  ctx.label(page, 'Description', '項目說明', M + 2, y, 8.5)
  ctx.labelRight(page, 'Qty', '數量', 330, y, 8.5)
  ctx.labelRight(page, 'Unit Price', '單價', 460, y, 8.5)
  ctx.labelRight(page, 'Amount', '金額', 541, y, 8.5)
  y -= 6
  page.drawLine({ start: { x: M, y }, end: { x: 595 - M, y }, thickness: 0.9, color: HAIR_DARK })
  y -= 14

  const cur = currency.toUpperCase() + ' '
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const afterDesc = ctx.wrap(page, it.description, M + 2, y, 240, 10)
    ctx.draw(page, String(it.qty), 330, y, 10, { alignRight: 330 })
    ctx.draw(page, cur + money(it.unitPrice), 460, y, 10, { alignRight: 460 })
    ctx.draw(page, cur + money(it.qty * it.unitPrice), 541, y, 10, { alignRight: 541 })
    // Row rule: keep uniform gap below the tallest cell in the row
    y = Math.min(afterDesc, y - 14) - 13
    // Last row's rule is drawn dark (table closing line)
    const last = i === items.length - 1
    page.drawLine({ start: { x: M, y: y + 10 }, end: { x: 595 - M, y: y + 10 }, thickness: last ? 0.9 : 0.4, color: last ? HAIR_DARK : HAIR })
  }

  // Subtotal / Total block — right aligned column, dark rule above total.
  // Labels right-align at 400 (clear of the value column), values at 541.
  const totalCents = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  y -= 6
  ctx.labelRight(page, 'Subtotal', '小計', 400, y, 9)
  ctx.draw(page, cur + money(totalCents), 541, y, 10, { alignRight: 541 })
  y -= 16
  page.drawLine({ start: { x: 310, y }, end: { x: 541, y }, thickness: 1.4, color: HAIR_DARK })
  ctx.labelRight(page, 'Total Due', '應付總額', 400, y - 12, 9)
  {
    const s = `${cur}${money(totalCents)}`
    const f = ctx.helvBold
    const w = f.widthOfTextAtSize(s, 13)
    // Total sits just below the dark rule, right-aligned to the column edge
    page.drawText(s, { x: 541 - w, y: y - 14, size: 13, font: f, color: INK })
  }
  y -= 46

  // Notes
  if (notes) {
    ctx.label(page, 'Notes', '備註', M, y, 8.5)
    y -= 16
    y = ctx.wrap(page, notes, M, y, 595 - M * 2, 9.5) - 12
  }

  // ── Payment terms & bank account ────────────────────────────────────────
  // Client essentials: where to pay, account name matching the BR, terms.
  // Compact two-column form: left = label, right = value on the same line.
  {
    const py = Math.min(y, 360) - 6
    page.drawLine({ start: { x: M, y: py }, end: { x: 595 - M, y: py }, thickness: 0.5, color: HAIR })
    let by = py - 20
    const row = (en: string, cjk: string, value: string) => {
      ctx.label(page, en, cjk, M, by, 8.5)
      ctx.draw(page, value, 190, by, 9.5)
      by -= 17
    }
    row('Payment Terms', '付款條款', company.paymentTerms)
    if (company.bankName) row('Bank', '銀行', company.bankName)
    if (company.accountName) row('Account Name', '帳戶名稱', company.accountName)
    if (company.accountNumber) row('Account Number', '帳戶號碼', company.accountNumber)
    y = by - 8
  }

  // (Terms & Conditions are printed at the very bottom, after the signature
  // block — see tcBlock call below drawFooter's position.)

  // ── Approval & signature block ──────────────────────────────────────────
  // Formal two-column acceptance. The block is ~185pt tall; its bottom is
  // pinned just above the footer (footer rule y=84), but the TOP slides down
  // if the payment block above ends low — never overlapping it.
  // Left column (client) x = M..270, right column (company) x = 340..541.
  // Company seal/chop position: bottom-right of the block (傳統蓋章位).
  // sigTop geometry: PDF y grows upward, so "below" = smaller y. Payment
  // block just set y to its last row's baseline. The sig block's top rule
  // goes 14pt below that, everything else hangs from it. Clamp so the block
  // never climbs into the table (348) or hits the footer (240).
  // Block top flows from content; clamp at 348 (table) — the T&C block is
  // pinned at 240 lower down, so keep the sig block bottom above it.
  const sigTop = 84 + 22 + 190 // footer-anchored: block never slides into the footer
  {
    let sy = sigTop
    page.drawLine({ start: { x: M, y: sy }, end: { x: 595 - M, y: sy }, thickness: 0.5, color: HAIR })
    sy -= 22
    // Section labels — one per column, same baseline
    ctx.label(page, 'Accepted & Approved', '客戶確認及批准', M, sy, 9)
    ctx.label(page, 'For and on behalf of', '公司授權代表', 340, sy, 9)

    // Signing space: fixed height so blank and signed copies align identically
    const spaceTop = sy - 16
    const ruleY = spaceTop - 52
    if (signature) {
      try {
        const b64 = signature.pngDataUri.replace(/^data:image\/png;base64,/, '')
        const png = await doc.embedPng(Buffer.from(b64, 'base64'))
        const maxW = 190
        const maxH = 46
        const scale = Math.min(maxW / png.width, maxH / png.height)
        // Signature sits ON the rule: bottom edge touches ruleY + 2
        page.drawImage(png, { x: M, y: ruleY + 2, width: png.width * scale, height: png.height * scale })
      } catch {
        ctx.draw(page, '[signature]', M, ruleY - 24, 11, { color: MUTED })
      }
    }

    // Both rules on the same baseline
    page.drawLine({ start: { x: M, y: ruleY }, end: { x: M + 216, y: ruleY }, thickness: 0.9, color: HAIR_DARK })
    page.drawLine({ start: { x: 340, y: ruleY }, end: { x: 541, y: ruleY }, thickness: 0.9, color: HAIR_DARK })
    // Rule captions on one baseline
    ctx.label(page, 'Signature', '簽署', M, ruleY - 13, 7.5)
    ctx.label(page, 'Authorised Signature', '授權簽署', 340, ruleY - 13, 7.5)

    // Name + date rows — client column only; company column keeps pre-printed
    // details on the same two baselines. Mixed-script lines are drawn as
    // separate EN/CJK runs (Noto's Latin glyphs look wrong in body text).
    const nameY = ruleY - 32
    if (signature) {
      ctx.draw(page, signature.signerName, M, nameY, 10.5, { bold: true })
      // "Date / 日期: <en date>" → EN run + CJK run + value run
      ctx.label(page, 'Date /', '日期:', M, nameY - 15, 8.5)
      const labelW = ctx.helv.widthOfTextAtSize('Date /  ', 8.5) + ctx.cjk.widthOfTextAtSize('日期: ', 8.5)
      ctx.draw(page, fmtDate(signature.signedAt), M + labelW + 4, nameY - 15, 8.5, { color: MUTED })
      ctx.label(page, 'Electronically signed via', '經網上簽署', M, nameY - 30, 7.5)
      ctx.draw(page, `Doc ${number}`, M, nameY - 42, 7.5, { color: MUTED })
    } else {
      // Blank copy: label + rule lines to fill in by hand
      ctx.draw(page, 'Name / 姓名:', M, nameY, 8.5, { color: MUTED })
      page.drawLine({ start: { x: M + 62, y: nameY + 2 }, end: { x: M + 216, y: nameY + 2 }, thickness: 0.6, color: HAIR })
      ctx.label(page, 'Date /', '日期:', M, nameY - 15, 8.5)
      page.drawLine({ start: { x: M + 62, y: nameY - 13 }, end: { x: M + 160, y: nameY - 13 }, thickness: 0.6, color: HAIR })
    }
    // Company pre-printed block, same baselines as client name/date rows
    ctx.draw(page, 'EaseCity Technologies Limited', 340, nameY, 9, { bold: true })
    ctx.draw(page, 'Authorised Representative / 授權代表', 340, nameY - 15, 8.5, { color: MUTED })

    // Company seal/chop guide — BOTTOM-RIGHT corner of the block (traditional
    // chop placement, overlapping the signature rule corner), light dotted
    // circle so it prints as a faint guide. Not centred: sits at the corner.
    const chopX = 528
    const chopY = ruleY - 4
    page.drawCircle({ x: chopX, y: chopY, size: 22, borderColor: HAIR, borderWidth: 0.6, opacity: 0, borderOpacity: 0.45 })
    {
      const t = '公司蓋章'
      const w = ctx.cjk.widthOfTextAtSize(t, 6.5)
      page.drawText(t, { x: chopX - w / 2, y: chopY - 3, size: 6.5, font: ctx.cjk, color: HAIR })
    }
  }

  drawFooter(ctx, page,
    signature
      ? 'Electronically signed copy — valid without physical signature.'
      : 'Please sign and return a scanned copy to admin@easecity.hk, or confirm online via your quote link.',
    signature
      ? '電子簽署版本，與紙本簽署同樣有效。'
      : '請簽署後回傳掃描本，或經網上連結確認。')

  // ── Page 2: Terms & Conditions (when configured) ────────────────────────
  if (company.termsAndConditions) {
    const p2 = doc.addPage([595, 842])
    ctx.label(p2, 'Terms & Conditions', '條款及細則', M, 780, 12)
    p2.drawLine({ start: { x: M, y: 766 }, end: { x: 595 - M, y: 766 }, thickness: 1.2, color: HAIR_DARK })
    ctx.wrap(p2, company.termsAndConditions, M, 740, 595 - M * 2, 10, { lineHeight: 16 })
    p2.drawText(number, { x: M, y: 60, size: 8, font: ctx.helv, color: MUTED })
  }

  return doc.save()
}

export type ReceiptPaymentMethod = 'stripe' | 'bank' | 'fps' | 'alipayhk' | 'wechatpay' | 'cash' | 'cheque'

const METHOD_LABELS: Record<ReceiptPaymentMethod, [string, string]> = {
  stripe: ['Online payment (Stripe)', '網上付款（Stripe）'],
  bank: ['Bank transfer / offline payment', '銀行轉帳或線下付款'],
  fps: ['FPS 轉數快', '轉數快（FPS）'],
  alipayhk: ['AlipayHK 支付寶香港', '支付寶香港'],
  wechatpay: ['WeChat Pay 微信支付', '微信支付'],
  cash: ['Cash', '現金'],
  cheque: ['Cheque', '支票'],
}

export async function buildReceiptPdf(opts: BaseDoc & {
  source: string
  paymentMethod?: ReceiptPaymentMethod | null
  quoteNumber?: string | null
  language?: 'en' | 'zh' | 'zh-CN'
}): Promise<Uint8Array> {
  const { number, clientName, clientEmail, currency, items, issuedAt, source, quoteNumber, paymentMethod } = opts
  const totalCents = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)

  const doc = await PDFDocument.create()
  const ctx = await makeCtx(doc)
  const page = doc.addPage([595, 842])
  const M = 54
  const company = await getCompanyPayDetails()

  await drawLetterhead(doc, page, ctx, 'OFFICIAL RECEIPT', '正式收據', company)

  ctx.label(page, 'Receipt No.', '收據編號', M, 704, 8.5)
  ctx.draw(page, number, 190, 704, 10, { bold: true })
  ctx.label(page, 'Date of Issue', '發出日期', M, 684, 8.5)
  ctx.draw(page, fmtDate(issuedAt), 190, 684, 9.5)
  if (quoteNumber) {
    ctx.label(page, 'In respect of Quotation', '相關報價單', M, 664, 8.5)
    ctx.draw(page, quoteNumber, 190, 664, 9.5)
  }

  partyBlock(ctx, page, 636, 'Received with thanks from', '茲收到', clientName, clientEmail ?? null)
  page.drawLine({ start: { x: M, y: 588 }, end: { x: 595 - M, y: 588 }, thickness: 0.5, color: HAIR })

  // Being payment of — formal receipt wording
  let y = 562
  ctx.label(page, 'Being payment of', '款項性質', M, y, 9)
  y -= 18
  const desc = items.length === 1 ? items[0].description : items.map((it) => it.description).join('; ')
  y = ctx.wrap(page, desc, M, y, 595 - M * 2, 10.5) - 8

  // Amount block — plain bordered box (prints clean in mono), dark key line
  y -= 10
  page.drawRectangle({ x: M, y: y - 74, width: 595 - M * 2, height: 80, borderColor: HAIR_DARK, borderWidth: 1 })
  ctx.label(page, 'Amount Received', '已收金額', M + 16, y - 14, 9)
  {
    // Method line top-right of the box, inside padding
    const m = (paymentMethod && METHOD_LABELS[paymentMethod]) || (source === 'stripe' ? METHOD_LABELS.stripe : METHOD_LABELS.bank)
    const method = m[0]
    const methodCjk = m[1]
    const cjkW = ctx.cjk.widthOfTextAtSize(methodCjk, 8.5)
    const enW = ctx.helv.widthOfTextAtSize(method + '  ', 8.5)
    const methodX = 541 - 16 - enW - cjkW
    page.drawText(method + '  ', { x: methodX, y: y - 14, size: 8.5, font: ctx.helv, color: MUTED })
    page.drawText(methodCjk, { x: methodX + enW, y: y - 14, size: 8.5, font: ctx.cjk, color: MUTED })
  }
  {
    const s = `${currency.toUpperCase()} ${money(totalCents)}`
    page.drawText(s, { x: M + 16, y: y - 48, size: 19, font: ctx.helvBold, color: INK })
  }
  y -= 100

  // Itemised listing (small, secondary — the "being payment of" above is the legal line)
  ctx.label(page, 'Breakdown', '明細', M, y, 8.5)
  ctx.labelRight(page, 'Amount', '金額', 541, y, 8.5)
  y -= 6
  page.drawLine({ start: { x: M, y }, end: { x: 595 - M, y }, thickness: 0.9, color: HAIR_DARK })
  y -= 18
  const bCur = currency.toUpperCase() + ' '
  for (const it of items) {
    ctx.wrap(page, it.description, M + 2, y, 330, 9.5)
    ctx.draw(page, `${it.qty} × ${bCur}${money(it.unitPrice)}`, 460, y, 9.5, { alignRight: 460 })
    ctx.draw(page, bCur + money(it.qty * it.unitPrice), 541, y, 9.5, { alignRight: 541 })
    y -= 17
  }
  y -= 2
  page.drawLine({ start: { x: M, y }, end: { x: 595 - M, y }, thickness: 0.4, color: HAIR })

  // Receipt does not need a signature block, but a formal issued-by line adds authority
  const issued = Math.min(y - 30, 300)
  ctx.label(page, 'Issued by', '發出人', M, issued, 8.5)
  ctx.draw(page, 'EaseCity Technologies Limited', M, issued - 16, 10, { bold: true })
  ctx.draw(page, 'Authorised Representative / 授權代表', M, issued - 30, 8.5, { color: MUTED })

  drawFooter(ctx, page, 'This official receipt was issued electronically.', '本正式收據由系統電子發出。')


  return doc.save()
}
