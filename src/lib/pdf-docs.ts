import fs from 'node:fs'
import path from 'node:path'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { getCompanyPayDetails, type CompanyPayDetails, DEFAULT_TERMS_EN, DEFAULT_TERMS_ZH } from '@/lib/company-details'

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
const TEAL_ACCENT = rgb(0.0, 0.49, 0.44)
const HAIR_DARK = rgb(0.15, 0.16, 0.16)

// Line-weight system (three tiers, used consistently across both documents):
//   HEAVY 1.4  — section closes that must anchor the eye (table end, total)
//   STRUCT 0.9 — structural rules (table header/close, signature baselines)
//   HAIRLINE 0.5 — separators (letterhead second line, section top rules,
//                   footer) — anything that should recede
//   FILL 0.6   — hand-fill lines (Name/Title/Date/Company) — slightly
//                   heavier than hairlines so they read as writable
const LINE_HEAVY = 1.4
const LINE_STRUCT = 0.9
const LINE_HAIR = 0.5
const LINE_FILL = 0.6

function money(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtDateByLang = (d: Date, lang: PdfLanguage) =>
  d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'zh-HK', { day: 'numeric', month: 'short', year: 'numeric' })

/** Document language for the mono-language PDFs: 'en' (English only) or
 *  'zh' (繁體中文 only; zh-CN maps here — the site has one Chinese voice). */
export type PdfLanguage = 'en' | 'zh'

/** Every printed string, per document language. Data values (client name,
 *  item descriptions, bank name…) are stored as entered by ops and drawn in
 *  whichever font fits their script — only LABELS/copy are localised here. */
const COPY: Record<PdfLanguage, Record<string, string>> = {
  en: {
    quotation: 'QUOTATION', quotationCjk: '',
    receipt: 'OFFICIAL RECEIPT', receiptCjk: '',
    quotationNo: 'Quotation No.', dateOfIssue: 'Date of Issue', validUntil: 'Valid Until',
    receiptNo: 'Receipt No.', inRespectOf: 'In respect of Quotation',
    preparedFor: 'Prepared for', receivedFrom: 'Received with thanks from',
    description: 'Description', qty: 'Qty', unitPrice: 'Unit Price', amount: 'Amount',
    subtotal: 'Subtotal', totalDue: 'Total Due',
    notes: 'Notes', paymentTerms: 'Payment Terms', bank: 'Bank',
    accountName: 'Account Name', accountNumber: 'Account Number',
    paymentBankDetails: 'Payment & Bank Details', terms: 'Terms & Conditions',
    accepted: 'Accepted & Approved', onBehalf: 'For and on behalf of',
    signature: 'Signature', authorisedSignature: 'Authorised Signature',
    nameLine: 'Name:', authorisedRep: 'Authorised Representative',
    titleLine: 'Title:', dateLine: 'Date:', companyLine: 'Company:',
    dateSlash: 'Date /',
    beingPaymentOf: 'Being payment of', amountReceived: 'Amount Received',
    breakdown: 'Breakdown', issuedBy: 'Issued by',
    // Footer note lines. Both EN and CJK carry the retention requirement —
    // IRD PAM 60(C): electronic business records must be kept for 7 years
    // (IRO s.51C) and are valid without a physical seal (Cap. 553).
    footerQuoteSigned: 'System-issued electronic record — valid without physical seal (Cap. 553). Retain for 7 years.',
    footerQuoteBlank: 'Please sign and return a scanned copy, or confirm online via your quote link. Retain for 7 years.',
    footerReceipt: 'System-issued electronic record — valid without physical seal (Cap. 553). Retain for 7 years.',
    methodStripe: 'Online payment (Stripe)', methodBank: 'Bank transfer / offline payment',
    methodFps: 'FPS', methodAlipay: 'AlipayHK', methodWechat: 'WeChat Pay', methodCash: 'Cash', methodCheque: 'Cheque',
  },
  zh: {
    quotation: '報價單', quotationCjk: '',
    receipt: '正式收據', receiptCjk: '',
    quotationNo: '報價單編號', dateOfIssue: '發出日期', validUntil: '有效期至',
    receiptNo: '收據編號', inRespectOf: '相關報價單',
    preparedFor: '客戶', receivedFrom: '茲收到',
    description: '項目說明', qty: '數量', unitPrice: '單價', amount: '金額',
    subtotal: '小計', totalDue: '應付總額',
    notes: '備註', paymentTerms: '付款條款', bank: '銀行',
    accountName: '帳戶名稱', accountNumber: '帳戶號碼',
    paymentBankDetails: '付款及銀行資料', terms: '條款及細則',
    accepted: '客戶確認及批准', onBehalf: '公司授權代表',
    signature: '簽署', authorisedSignature: '授權簽署',
    nameLine: '姓名:', authorisedRep: '授權代表',
    titleLine: '職銜:', dateLine: '日期:', companyLine: '公司名稱:',
    dateSlash: '日期:',
    beingPaymentOf: '款項性質', amountReceived: '已收金額',
    breakdown: '明細', issuedBy: '發出人',
    footerQuoteSigned: '本文件為系統電子發出，根據《電子交易條例》無需蓋章，請保留7年。',
    footerQuoteBlank: '請簽署後回傳掃描本，或經網上連結確認。請保留7年。',
    footerReceipt: '本正式收據由系統電子發出，根據《電子交易條例》無需蓋章，請保留7年。',
    methodStripe: '網上付款（Stripe）', methodBank: '銀行轉帳或線下付款',
    methodFps: '轉數快（FPS）', methodAlipay: '支付寶香港', methodWechat: '微信支付',
    methodCash: '現金', methodCheque: '支票',
  },
}

/** EN-keyed labels missing from the zh map above (kept separate so the two
 *  blocks stay readable) — resolved through keyMap() with EN fallbacks. */
function L(lang: PdfLanguage, enKey: string): string {
  const table = COPY[lang]
  return table[enKey] ?? COPY.en[enKey] ?? enKey
}

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
  /** Script-aware font picker — Helvetica for Latin, Noto for CJK runs. */
  pick: (text: string, bold?: boolean) => import('pdf-lib').PDFFont
  wrap: (page: import('pdf-lib').PDFPage, text: string, x: number, y: number, maxWidth: number, size: number, opts?: { color?: ReturnType<typeof rgb>; lineHeight?: number }) => number
  /** Line count a wrap() call will produce, for layout budgeting. */
  measureLines: (text: string, maxWidth: number, size: number) => number
  hasCJK: (text: string) => boolean
}

/** Word-aware greedy wrap: Latin words are never split mid-word (a long
 *  word wider than the column is hard-broken); CJK runs break per char.
 *  Module-level so paginated sections (T&C) can reuse it with ctx.pick. */
function splitTextLines(text: string, maxWidth: number, size: number, pick: (s: string) => import('pdf-lib').PDFFont): string[] {
  const widthOf = (s: string) => pick(s).widthOfTextAtSize(s, size)
  const lines: string[] = []
  for (const para of text.split('\n')) {
    let line = ''
    for (const word of para.split(' ')) {
      if (!word) continue
      const candidate = line ? line + ' ' + word : word
      if (widthOf(candidate) <= maxWidth) { line = candidate; continue }
      if (widthOf(word) > maxWidth) {
        // Single token wider than the column (URL / CJK run): hard-break.
        if (line) { lines.push(line); line = '' }
        let chunk = ''
        for (const ch of word) {
          if (widthOf(chunk + ch) > maxWidth) { lines.push(chunk); chunk = ch }
          else chunk += ch
        }
        line = chunk
      } else {
        lines.push(line)
        line = word
      }
    }
    if (line) lines.push(line)
  }
  return lines
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
    // If cjkText is empty, draw en in the font its script needs (a zh
    // single-language label carries CJK in the en slot; Helvetica would
    // throw WinAnsi encode errors on it).
    if (!cjkText) {
      page.drawText(en, { x, y, size, font: pick(en), color })
      return
    }
    page.drawText(en + '  ', { x, y, size, font: helv, color })
    const enW = helv.widthOfTextAtSize(en + '  ', size)
    page.drawText(cjkText, { x: x + enW, y, size, font: cjk, color })
  }

  /** Right-aligned trilingual label: the whole EN+CJK run ends at x. */
  const labelRight: Ctx['labelRight'] = (page, en, cjkText, xRight, y, size = 8.5, color = MUTED) => {
    if (!cjkText) {
      const f = pick(en)
      const w = f.widthOfTextAtSize(en, size)
      page.drawText(en, { x: xRight - w, y, size, font: f, color })
      return
    }
    const enW = helv.widthOfTextAtSize(en + '  ', size)
    const cjkW = cjk.widthOfTextAtSize(cjkText, size)
    const x = xRight - enW - cjkW
    page.drawText(en + '  ', { x, y, size, font: helv, color })
    if (cjkText) page.drawText(cjkText, { x: x + enW, y, size, font: cjk, color })
  }

  const splitLines = (text: string, maxWidth: number, size: number): string[] =>
    splitTextLines(text, maxWidth, size, pick)

  const wrap: Ctx['wrap'] = (page, text, x, y, maxWidth, size, opts = {}) => {
    let cursorY = y
    for (const line of splitLines(text, maxWidth, size)) {
      page.drawText(line, { x, y: cursorY, size, font: pick(line), color: opts.color ?? INK })
      cursorY -= opts.lineHeight ?? size * 1.55
    }
    return cursorY
  }

  /** Line count a wrap() call will produce — lets callers budget layout
   *  before drawing (placement must never depend on render side effects). */
  const measureLines = (text: string, maxWidth: number, size: number) => splitLines(text, maxWidth, size).length

  return { doc, cjk, helv, helvBold, label, labelRight, draw, wrap, measureLines, pick, hasCJK }
}

/** Small vector contact icons (globe / phone / envelope) drawn as shapes —
 *  Noto CJK renders ☎✉ as tofu boxes, so glyph characters are never used.
 *  Shared by the letterhead contact row and the document footer. */
type ContactIconKind = 'globe' | 'phone' | 'mail'

function drawContactIcon(
  page: import('pdf-lib').PDFPage,
  kind: ContactIconKind,
  x: number,
  cy: number,
  s: number,
  color: ReturnType<typeof rgb>,
) {
  if (kind === 'globe') {
    page.drawCircle({ x: x + s / 2, y: cy, size: s / 2, borderColor: color, borderWidth: 0.8, opacity: 0, borderOpacity: 1 })
    page.drawLine({ start: { x: x + s / 2, y: cy - s / 2 }, end: { x: x + s / 2, y: cy + s / 2 }, thickness: 0.6, color })
    page.drawLine({ start: { x, y: cy }, end: { x: x + s, y: cy }, thickness: 0.6, color })
  } else if (kind === 'phone') {
    // torch/phone: vertical cylinder body + lens cap line at the top
    page.drawRectangle({ x: x + s * 0.22, y: cy - s / 2, width: s * 0.56, height: s, borderColor: color, borderWidth: 0.8, opacity: 0, borderOpacity: 1 })
    page.drawLine({ start: { x: x + s * 0.22, y: cy + s / 2 }, end: { x: x + s * 0.78, y: cy + s / 2 }, thickness: 1.4, color })
  } else {
    // envelope: rectangle + flap chevron
    page.drawRectangle({ x, y: cy - s * 0.36, width: s, height: s * 0.72, borderColor: color, borderWidth: 0.8, opacity: 0, borderOpacity: 1 })
    page.drawLine({ start: { x, y: cy + s * 0.22 }, end: { x: x + s / 2, y: cy - s * 0.06 }, thickness: 0.7, color })
    page.drawLine({ start: { x: x + s / 2, y: cy - s * 0.06 }, end: { x: x + s, y: cy + s * 0.22 }, thickness: 0.7, color })
  }
}

const CONTACT_ITEMS: [ContactIconKind, string][] = [
  ['globe', 'https://easecity.hk'],
  ['phone', '3997 1396'],
  ['mail', 'admin@easecity.hk'],
]

/** Contact row: icon + text per item, one shared baseline (icon centre sits
 *  2.5pt above the baseline). Draws left-aligned from x, or centred on
 *  centreX when given. Returns the row's total width. */
function drawContactRow(
  page: import('pdf-lib').PDFPage,
  ctx: Ctx,
  opts: { x?: number; centreAt?: number; baselineY: number; size?: number; iconSize?: number; color?: ReturnType<typeof rgb>; iconColor?: ReturnType<typeof rgb>; gapIcon?: number; gapUnit?: number },
): number {
  const size = opts.size ?? 8.5
  const iconSize = opts.iconSize ?? 5.5
  const color = opts.color ?? MUTED
  const iconColor = opts.iconColor ?? TEAL_ACCENT
  const gapIcon = opts.gapIcon ?? 3
  const gapUnit = opts.gapUnit ?? 12
  const width =
    CONTACT_ITEMS.reduce((w, [, t]) => w + iconSize + gapIcon + ctx.helv.widthOfTextAtSize(t, size) + gapUnit, 0) - gapUnit
  let x = opts.centreAt !== undefined ? opts.centreAt - width / 2 : opts.x ?? 0
  for (const [kind, t] of CONTACT_ITEMS) {
    drawContactIcon(page, kind, x, opts.baselineY + 2.5, iconSize, iconColor)
    page.drawText(t, { x: x + iconSize + gapIcon, y: opts.baselineY, size, font: ctx.helv, color })
    x += iconSize + gapIcon + ctx.helv.widthOfTextAtSize(t, size) + gapUnit
  }
  return width
}

/** Company chop (scanned real seal) helper — shared by quote and receipt
 *  chop-versions. Fetches the chop image (URL or data URI), validates it as
 *  a genuine PNG (embedPng hangs forever on corrupt data), draws it centred
 *  at (cx, cy) scaled to maxD. Chop is cosmetic on an already-valid record:
 *  any failure logs and skips, never throws. */
async function drawCompanyChop(
  doc: PDFDocument,
  page: import('pdf-lib').PDFPage,
  chopUrl: string,
  cx: number,
  cy: number,
  maxD = 74,
) {
  try {
    const res = await fetch(chopUrl)
    if (!res.ok) return
    const buf = Buffer.from(await res.arrayBuffer())
    // Only embed genuine PNGs — embedPng hangs forever on corrupt data.
    const isPng = buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
    if (!isPng) return
    const chop = await doc.embedPng(buf)
    const scale = Math.min(maxD / chop.width, maxD / chop.height)
    const w = chop.width * scale
    const h = chop.height * scale
    page.drawImage(chop, { x: cx - w / 2, y: cy - h / 2, width: w, height: h, opacity: 0.9 })
  } catch (e) {
    console.error('[pdf-docs] chop draw failed:', e)
  }
}

/** Formal letterhead: logo mark top-left, company block (registered name +
 *  BR No. + address), doc title top-right, double rule. Title comes from the
 *  doc-language COPY table (single-language documents). */
async function drawLetterhead(doc: PDFDocument, page: import('pdf-lib').PDFPage, ctx: Ctx, title: string, company: CompanyPayDetails) {
  const M = 54
  // Vertical rhythm: top margin = footer bottom margin = 42pt
  // (page 842 → content top 800; footer note baseline 42).
  try {
    const img = await doc.embedPng(logoBytes())
    const h = 32
    const w = (img.width / img.height) * h
    // Align logo top with the doc title top (title cap-top ≈ 800)
    page.drawImage(img, { x: M, y: 800 - h, width: w, height: h })
  } catch {
    ctx.draw(page, 'EaseCity', M, 778, 16, { bold: true })
  }
  // Company block under logo: registered name + address + contact row
  // (web / phone / email, each prefixed with a small glyph). Fixed budget
  // so the block never runs into the double rule below (696/692).
  // Note: business registration number is NOT printed — quotes don't require it.
  ctx.draw(page, company.companyName, M, 744, 8.5, { color: MUTED })
  let ly = 733
  if (company.companyAddress) {
    ly = ctx.wrap(page, company.companyAddress, M, ly, 300, 8.5, { color: MUTED, lineHeight: 11 })
    if (ly < 722) ly = 722 // clamp
  }
  // Contact row with shared vector icons (globe / phone / envelope)
  drawContactRow(page, ctx, { x: M, baselineY: ly - 11 })

  // Doc title top-right (single big title; mono-language documents)
  ctx.draw(page, title, 595 - M, 800, 20, { bold: true, alignRight: 595 - M })

  // Double rule: 1.6pt dark + hairline — formal document staple, prints crisply in mono
  page.drawLine({ start: { x: M, y: 696 }, end: { x: 595 - M, y: 696 }, thickness: LINE_HEAVY, color: HAIR_DARK })
  page.drawLine({ start: { x: M, y: 692 }, end: { x: 595 - M, y: 692 }, thickness: LINE_HAIR, color: HAIR })
}

/** Formal footer: contact row (web / phone / email with icons) + one legal
 *  note line, centred as a group. The note may be EN or CJK depending on the
 *  document language — the font follows the script (Helvetica throws on CJK). */
function drawFooter(ctx: Ctx, page: import('pdf-lib').PDFPage, noteEn: string, noteCjk: string) {
  const M = 54
  const centre = 595 / 2
  page.drawLine({ start: { x: M, y: 82 }, end: { x: 595 - M, y: 82 }, thickness: LINE_HAIR, color: HAIR })
  // Contact row centred under the rule, same treatment as the letterhead row
  drawContactRow(page, ctx, { centreAt: centre, baselineY: 66, size: 7.8, iconSize: 5.2, gapUnit: 10 })
  // Note line: EN + CJK two runs, centred as a group (mono-language docs
  // pass the whole note in one slot and leave the other empty)
  const fEn = ctx.hasCJK(noteEn) ? ctx.cjk : ctx.helv
  const enW = fEn.widthOfTextAtSize(noteEn + (noteCjk ? ' ' : ''), 7.5)
  const cjkW = ctx.cjk.widthOfTextAtSize(noteCjk, 7.5)
  const startX = centre - (enW + cjkW) / 2
  page.drawText(noteEn + (noteCjk ? ' ' : ''), { x: startX, y: 42, size: 7.5, font: fEn, color: MUTED })
  if (noteCjk) page.drawText(noteCjk, { x: startX + enW, y: 42, size: 7.5, font: ctx.cjk, color: MUTED })
}

function partyBlock(ctx: Ctx, page: import('pdf-lib').PDFPage, y: number, label: string, name: string, email: string | null, contactLine?: string | null) {
  const M = 54
  ctx.label(page, label, '', M, y)
  ctx.draw(page, name, M, y - 16, 12.5, { bold: true })
  let bottom = y - 30
  if (email) {
    ctx.draw(page, email, M, y - 30, 9.5, { color: MUTED })
    bottom = y - 44
  }
  // Sales contact under the client's email — the person on OUR side handling
  // this quote ("Frankie Lam frankielam@easecity.hk"), from admin settings.
  if (contactLine) {
    const f = ctx.hasCJK(contactLine) ? ctx.cjk : ctx.helv
    page.drawText(contactLine, { x: M, y: bottom - 15, size: 8.5, font: f, color: MUTED })
    bottom -= 15
  }
  return bottom
}

export async function buildQuotePdf(opts: BaseDoc & {
  language?: PdfLanguage
  withChop?: boolean // draw the scanned company chop on the signature line (gov/edu procurement copies)
  chopUrlOverride?: string | null // test/preview: draw chop from this data URI instead of the SiteSetting URL
  signature?: { pngDataUri: string; signerName: string; signedAt: Date } | null
}): Promise<Uint8Array> {
  const { number, clientName, clientEmail, currency, items, notes, issuedAt, validUntil, signature } = opts
  const lang: PdfLanguage = opts.language === 'zh' ? 'zh' : 'en'
  const company = await getCompanyPayDetails()

  const doc = await PDFDocument.create()
  const ctx = await makeCtx(doc)
  const page = doc.addPage([595, 842]) // A4
  const M = 54

  await drawLetterhead(doc, page, ctx, L(lang, 'quotation'), company)

  // Number + issue date (left column, formal doc references) — values in a
  // second column at x 190 so the labels never collide with them.
  ctx.label(page, L(lang, 'quotationNo'), '', M, 662, 8.5)
  ctx.draw(page, number, 190, 662, 10, { bold: true })
  ctx.label(page, L(lang, 'dateOfIssue'), '', M, 642, 8.5)
  ctx.draw(page, fmtDateByLang(issuedAt, lang), 190, 642, 9.5)
  if (validUntil) {
    ctx.label(page, L(lang, 'validUntil'), '', M, 622, 8.5)
    ctx.draw(page, fmtDateByLang(validUntil, lang), 190, 622, 9.5)
  }

  // Client party (left, below references) + our sales contact underneath.
  // No rule under it — the table's own top rule below serves as the separator
  // (a second line here read as a double-line with the table rule).
  const contactLine =
    company.contactName
      ? company.contactEmail
        ? `${company.contactName}  ${company.contactEmail}`
        : company.contactName
      : null
  partyBlock(ctx, page, 594, L(lang, 'preparedFor'), clientName, clientEmail ?? null, contactLine)

  // Items table — no top rule above the header (the party-block hairline
  // above already separates the sections); labels, dark rule under, then
  // uniform rows with the text baseline centred between the rules.
  let y = 524
  ctx.label(page, L(lang, 'description'), '', M + 2, y, 8.5)
  ctx.labelRight(page, L(lang, 'qty'), '', 330, y, 8.5)
  ctx.labelRight(page, L(lang, 'unitPrice'), '', 460, y, 8.5)
  ctx.labelRight(page, L(lang, 'amount'), '', 541, y, 8.5)
  y -= 15
  page.drawLine({ start: { x: M, y }, end: { x: 595 - M, y }, thickness: LINE_STRUCT, color: HAIR_DARK })

  const cur = currency.toUpperCase() + ' '
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    // Row band: rule above → text → rule below (9pt under the lowest line).
    // Qty/Unit/Amount are drawn AFTER wrap() at the band's VERTICAL CENTRE —
    // with a 2-line description the figures must sit mid-row, not on top.
    y -= 17
    const firstBaseline = y
    const afterDesc = ctx.wrap(page, it.description, M + 2, firstBaseline, 240, 10)
    const lastBaseline = Math.min(afterDesc, firstBaseline) // afterDesc already includes one lineHeight step
    const rowBottom = lastBaseline - 9
    const descLines = ctx.measureLines(it.description, 240, 10)
    // Visual middle: if 1 line → the line itself; if 2 lines → between them
    const centreY = descLines > 1 ? firstBaseline - 15.5 / 2 - 0.5 : firstBaseline
    ctx.draw(page, String(it.qty), 330, centreY, 10, { alignRight: 330, color: MUTED })
    ctx.draw(page, cur + money(it.unitPrice), 460, centreY, 10, { alignRight: 460, color: MUTED })
    ctx.draw(page, cur + money(it.qty * it.unitPrice), 541, centreY, 10, { alignRight: 541 })
    y = rowBottom
    // Last row's rule is drawn dark (table closing line)
    const last = i === items.length - 1
    page.drawLine({ start: { x: M, y }, end: { x: 595 - M, y }, thickness: last ? LINE_STRUCT : LINE_HAIR, color: last ? HAIR_DARK : HAIR })
  }

  // Subtotal / Total block — right aligned column, dark rule above total.
  // Subtotal is bold (it's the number to check); Total stays the visual peak.
  const totalCents = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  y -= 12
  ctx.labelRight(page, L(lang, 'subtotal'), '', 400, y, 9)
  ctx.draw(page, cur + money(totalCents), 541, y, 10, { alignRight: 541, bold: true })
  y -= 16
  page.drawLine({ start: { x: 310, y }, end: { x: 541, y }, thickness: LINE_HEAVY, color: HAIR_DARK })
  ctx.labelRight(page, L(lang, 'totalDue'), '', 400, y - 12, 9)
  {
    const s = `${cur}${money(totalCents)}`
    const f = ctx.helvBold
    const w = f.widthOfTextAtSize(s, 13)
    // Total sits just below the dark rule, right-aligned to the column edge
    page.drawText(s, { x: 541 - w, y: y - 14, size: 13, font: f, color: INK })
  }
  y -= 46

  // Notes — page 1 when they end above the payment block's top edge,
  // otherwise page 2. Budgeted with measureLines BEFORE drawing.
  const noteH = notes ? 16 + ctx.measureLines(notes, 595 - M * 2, 9.5) * 14.7 + 12 : 0
  const notesFit = !notes || y - noteH >= 348
  if (notes && notesFit) {
    ctx.label(page, L(lang, 'notes'), '', M, y, 8.5)
    y -= 16
    y = ctx.wrap(page, notes, M, y, 595 - M * 2, 9.5, { lineHeight: 14.7 }) - 12
  }

  // ── Payment terms & bank account ────────────────────────────────────────
  // Client essentials: where to pay, account name matching the BR, terms.
  // Compact two-column form: label left, value at x=190. The signature block
  // below is PINNED (top rule at 236); when the rows would run into it, the
  // whole payment block moves to page 2 instead of overlapping.
  const paymentRows: [string, string][] = [
    [L(lang, 'paymentTerms'), company.paymentTerms],
    ...(company.bankName ? [[L(lang, 'bank'), company.bankName] as [string, string]] : []),
    ...(company.accountName ? [[L(lang, 'accountName'), company.accountName] as [string, string]] : []),
    ...(company.accountNumber ? [[L(lang, 'accountNumber'), company.accountNumber] as [string, string]] : []),
  ]
  const drawPaymentBlock = (p: import('pdf-lib').PDFPage, py0: number) => {
    p.drawLine({ start: { x: M, y: py0 }, end: { x: 595 - M, y: py0 }, thickness: LINE_HAIR, color: HAIR })
    let by = py0 - 20
    for (const [label, value] of paymentRows) {
      ctx.label(p, label, '', M, by, 8.5)
      ctx.draw(p, value, 190, by, 9.5)
      by -= 17
    }
    return by
  }
  const paymentEnd = Math.min(y, 360) - 6 - 20 - paymentRows.length * 17
  const paymentFits = paymentEnd >= 264 // 12pt clear of the pinned sig top (252)
  const paymentOnPage2 = !paymentFits
  if (paymentFits) {
    const py = Math.min(y, 360) - 6
    y = drawPaymentBlock(page, py)
  }

  // (Terms & Conditions are printed at the very bottom, after the signature
  // block — see tcBlock call below drawFooter's position.)

  // ── Approval & signature block ──────────────────────────────────────────
  // Formal two-column acceptance, PINNED: top rule at y=252, bottom
  // (Company row) ends ~y=162, safely above the footer rule (y=82).
  // Anything above that cannot fit moves to page 2 (notes / payment block).
  // Left column (client) x = M..270, right column (company) x = 340..541.
  // BOTH columns share the same four rows under the line — the person who
  // requests the quote is often NOT the person who signs, so identity is
  // recorded explicitly: Name / Title / Date / Company.
  const sigTop = 252
  {
    let sy = sigTop
    page.drawLine({ start: { x: M, y: sy }, end: { x: 595 - M, y: sy }, thickness: LINE_HAIR, color: HAIR })
    sy -= 22
    // Section labels — one per column, same baseline
    ctx.label(page, L(lang, 'accepted'), '', M, sy, 9)
    ctx.label(page, L(lang, 'onBehalf'), '', 340, sy, 9)

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
    page.drawLine({ start: { x: M, y: ruleY }, end: { x: M + 216, y: ruleY }, thickness: LINE_STRUCT, color: HAIR_DARK })
    page.drawLine({ start: { x: 340, y: ruleY }, end: { x: 541, y: ruleY }, thickness: LINE_STRUCT, color: HAIR_DARK })
    // Rule captions on one baseline
    ctx.label(page, L(lang, 'signature'), '', M, ruleY - 13, 7.5)
    ctx.label(page, L(lang, 'authorisedSignature'), '', 340, ruleY - 13, 7.5)

    const nameY = ruleY - 30
    const titleY = nameY - 15
    const dateY = titleY - 15
    const companyY = dateY - 15

    // "Label: value" with a hairline filler when the value is blank.
    // All four fill-in lines END at the same x so the column reads as one
    // aligned block (date line included — earlier it was 56pt shorter).
    const fieldLine = (label: string, value: string | null, x: number, lineEndX: number, y: number, bold = false) => {
      const fLabel = ctx.hasCJK(label) ? ctx.cjk : ctx.helv
      page.drawText(label, { x, y, size: 8, font: fLabel, color: MUTED })
      const startX = x + fLabel.widthOfTextAtSize(label, 8) + 4
      if (value) {
        const fVal = ctx.hasCJK(value) ? ctx.cjk : bold ? ctx.helvBold : ctx.helv
        page.drawText(value, { x: startX, y, size: 9, font: fVal, color: INK })
      } else {
        page.drawLine({ start: { x: startX, y: y + 2 }, end: { x: lineEndX, y: y + 2 }, thickness: LINE_FILL, color: HAIR })
      }
    }

    if (signature) {
      // Signed copy: online-signature name+title fills the name/title lines,
      // date prefilled, company pre-printed.
      fieldLine(L(lang, 'nameLine'), signature.signerName, M, M + 216, nameY, true)
      fieldLine(L(lang, 'titleLine'), null, M, M + 216, titleY)
      fieldLine(L(lang, 'dateLine'), fmtDateByLang(signature.signedAt, lang), M, M + 216, dateY)
      fieldLine(L(lang, 'companyLine'), clientName, M, M + 216, companyY)
    } else {
      // Blank copy: four hand-fill lines, all the same length
      fieldLine(L(lang, 'nameLine'), null, M, M + 216, nameY)
      fieldLine(L(lang, 'titleLine'), null, M, M + 216, titleY)
      fieldLine(L(lang, 'dateLine'), null, M, M + 216, dateY)
      fieldLine(L(lang, 'companyLine'), null, M, M + 216, companyY)
    }

    // OUR side — same four rows, always pre-printed from admin settings.
    // Unset fields draw a same-length fill-in line, not a placeholder string.
    fieldLine(L(lang, 'nameLine'), company.contactName, 340, 541, nameY, true)
    fieldLine(L(lang, 'titleLine'), company.contactTitle, 340, 541, titleY)
    fieldLine(L(lang, 'dateLine'), null, 340, 541, dateY) // we sign the paper copy by hand
    fieldLine(L(lang, 'companyLine'), company.companyName, 340, 541, companyY)

    // Chop version (gov/edu procurement): the scanned REAL company chop
    // (uploaded in admin settings) over the company signature line —
    // traditional 蓋章確認 placement, centred on the rule, overlapping it.
    // This is the company's own scanned seal applied by its own system —
    // the electronic equivalent of stamping the paper copy.
    const chopUrl = opts.chopUrlOverride ?? company.companyChopUrl
    if (opts.withChop && chopUrl) {
      await drawCompanyChop(doc, page, chopUrl, 340 + 201 / 2, ruleY + 2)
    }
  }

  drawFooter(ctx, page,
    signature ? L(lang, 'footerQuoteSigned') : L(lang, 'footerQuoteBlank'),
    '')

  // ── Page 2: overflow (notes / payment block) + Terms & Conditions ───────
  // Admin-configured T&C wins; otherwise the detailed default (per doc lang)
  // applies — a formal quotation should always carry its terms.
  const terms = company.termsAndConditions || (lang === 'zh' ? DEFAULT_TERMS_ZH : DEFAULT_TERMS_EN)
  const TC_LINE_H = 15
  const drawTermsPage = (p: import('pdf-lib').PDFPage, text: string, fromIdx: number) => {
    // Paginated T&C: draw lines from fromIdx until the footer floor (y≈110),
    // return the index of the first line that did NOT fit.
    const all = splitTextLines(text, 595 - M * 2, 10, (s) => ctx.pick(s))
    let ty = fromIdx === 0 ? 780 : 800
    if (fromIdx === 0) {
      ctx.label(p, L(lang, 'terms'), '', M, ty, 12)
      p.drawLine({ start: { x: M, y: ty - 14 }, end: { x: 595 - M, y: ty - 14 }, thickness: LINE_STRUCT, color: HAIR_DARK })
      ty -= 40
    }
    let i = fromIdx
    const lines = all
    while (i < lines.length && ty > 100) {
      const line = lines[i]
      p.drawText(line, { x: M, y: ty, size: 10, font: ctx.pick(line), color: INK })
      ty -= TC_LINE_H
      i++
    }
    return i
  }
  if (paymentOnPage2 || !notesFit || terms) {
    const p2 = doc.addPage([595, 842])
    let ty = 780
    if (paymentOnPage2) {
      ctx.label(p2, L(lang, 'paymentBankDetails'), '', M, ty, 10)
      ty -= 18
      ty = drawPaymentBlock(p2, ty) - 14
    }
    if (notes && !notesFit) {
      ctx.label(p2, L(lang, 'notes'), '', M, ty, 10)
      ty -= 18
      ty = ctx.wrap(p2, notes, M, ty, 595 - M * 2, 9.5, { lineHeight: 14.7 }) - 14
    }
    if (terms) {
      if (paymentOnPage2 || !notesFit) {
        // Overflow already used p2 — T&C gets its own page(s).
        const p3 = doc.addPage([595, 842])
        let drawn = drawTermsPage(p3, terms, 0)
        while (drawn < ctx.measureLines(terms, 595 - M * 2, 10)) {
          const pn = doc.addPage([595, 842])
          drawn = drawTermsPage(pn, terms, drawn)
          pn.drawText(number, { x: M, y: 60, size: 8, font: ctx.helv, color: MUTED })
          if (drawn >= ctx.measureLines(terms, 595 - M * 2, 10)) break
        }
        p3.drawText(number, { x: M, y: 60, size: 8, font: ctx.helv, color: MUTED })
      } else {
        ctx.label(p2, L(lang, 'terms'), '', M, ty, 12)
        p2.drawLine({ start: { x: M, y: ty - 14 }, end: { x: 595 - M, y: ty - 14 }, thickness: LINE_STRUCT, color: HAIR_DARK })
        ctx.wrap(p2, terms, M, ty - 26, 595 - M * 2, 10, { lineHeight: TC_LINE_H })
      }
    }
    p2.drawText(number, { x: M, y: 60, size: 8, font: ctx.helv, color: MUTED })
  }

  return doc.save()
}

export type ReceiptPaymentMethod = 'stripe' | 'bank' | 'fps' | 'alipayhk' | 'wechatpay' | 'cash' | 'cheque'

/** Payment-method label in the document language (COPY keys per method). */
function methodLabel(lang: PdfLanguage, method: ReceiptPaymentMethod | null | undefined, source: string): string {
  const key: ReceiptPaymentMethod =
    method ?? (source === 'stripe' ? 'stripe' : 'bank')
  const copyKey: Record<ReceiptPaymentMethod, string> = {
    stripe: 'methodStripe', bank: 'methodBank', fps: 'methodFps',
    alipayhk: 'methodAlipay', wechatpay: 'methodWechat',
    cash: 'methodCash', cheque: 'methodCheque',
  }
  return L(lang, copyKey[key])
}

export async function buildReceiptPdf(opts: BaseDoc & {
  source: string
  paymentMethod?: ReceiptPaymentMethod | null
  quoteNumber?: string | null
  language?: 'en' | 'zh' | 'zh-CN'
  withChop?: boolean // draw the scanned company chop beside the issued-by block
  chopUrlOverride?: string | null // test/preview: draw chop from this data URI instead of the SiteSetting URL
}): Promise<Uint8Array> {
  const { number, clientName, clientEmail, currency, items, issuedAt, source, quoteNumber, paymentMethod } = opts
  const lang: PdfLanguage = opts.language === 'zh' || opts.language === 'zh-CN' ? 'zh' : 'en'
  const totalCents = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)

  const doc = await PDFDocument.create()
  const ctx = await makeCtx(doc)
  const page = doc.addPage([595, 842])
  const M = 54
  const company = await getCompanyPayDetails()

  await drawLetterhead(doc, page, ctx, L(lang, 'receipt'), company)

  ctx.label(page, L(lang, 'receiptNo'), '', M, 662, 8.5)
  ctx.draw(page, number, 190, 662, 10, { bold: true })
  ctx.label(page, L(lang, 'dateOfIssue'), '', M, 642, 8.5)
  ctx.draw(page, fmtDateByLang(issuedAt, lang), 190, 642, 9.5)
  if (quoteNumber) {
    ctx.label(page, L(lang, 'inRespectOf'), '', M, 622, 8.5)
    ctx.draw(page, quoteNumber, 190, 622, 9.5)
  }

  partyBlock(ctx, page, 594, L(lang, 'receivedFrom'), clientName, clientEmail ?? null)
  page.drawLine({ start: { x: M, y: 546 }, end: { x: 595 - M, y: 546 }, thickness: LINE_HAIR, color: HAIR })

  // Being payment of — formal receipt wording
  let y = 520
  ctx.label(page, L(lang, 'beingPaymentOf'), '', M, y, 9)
  y -= 18
  const desc = items.length === 1 ? items[0].description : items.map((it) => it.description).join('; ')
  y = ctx.wrap(page, desc, M, y, 595 - M * 2, 10.5) - 8

  // Amount block — plain bordered box (prints clean in mono), dark key line
  y -= 10
  page.drawRectangle({ x: M, y: y - 74, width: 595 - M * 2, height: 80, borderColor: HAIR_DARK, borderWidth: 1 })
  ctx.label(page, L(lang, 'amountReceived'), '', M + 16, y - 14, 9)
  {
    // Method label top-right of the box, inside padding. Single-language
    // label from COPY — pure Latin when lang=en, CJK when lang=zh; drawn in
    // whichever font the script needs (Helvetica cannot encode CJK).
    const method = methodLabel(lang, paymentMethod, source)
    const f = ctx.hasCJK(method) ? ctx.cjk : ctx.helv
    const w = f.widthOfTextAtSize(method, 8.5)
    page.drawText(method, { x: 541 - 16 - w, y: y - 14, size: 8.5, font: f, color: MUTED })
  }
  {
    const s = `${currency.toUpperCase()} ${money(totalCents)}`
    page.drawText(s, { x: M + 16, y: y - 48, size: 19, font: ctx.helvBold, color: INK })
  }
  y -= 100

  // Itemised listing (small, secondary — the "being payment of" above is the legal line)
  ctx.label(page, L(lang, 'breakdown'), '', M, y, 8.5)
  ctx.labelRight(page, L(lang, 'amount'), '', 541, y, 8.5)
  y -= 6
  page.drawLine({ start: { x: M, y }, end: { x: 595 - M, y }, thickness: LINE_STRUCT, color: HAIR_DARK })
  y -= 18
  const bCur = currency.toUpperCase() + ' '
  for (const it of items) {
    ctx.wrap(page, it.description, M + 2, y, 330, 9.5)
    ctx.draw(page, `${it.qty} × ${bCur}${money(it.unitPrice)}`, 460, y, 9.5, { alignRight: 460 })
    ctx.draw(page, bCur + money(it.qty * it.unitPrice), 541, y, 9.5, { alignRight: 541 })
    // Pitch grows with wrapped line count so rows never overlap
    const n = ctx.measureLines(it.description, 330, 9.5)
    y -= (n - 1) * 14.7 + 17
  }

  // Receipt does not need a signature block, but a formal issued-by line adds authority
  const issued = Math.min(y - 30, 300)
  ctx.label(page, L(lang, 'issuedBy'), '', M, issued, 8.5)
  ctx.draw(page, 'EaseCity Technologies Limited', M, issued - 16, 10, { bold: true })
  ctx.draw(page, L(lang, 'authorisedRep'), M, issued - 30, 8.5, { color: MUTED })

  // Chop version (gov/edu procurement): scanned real chop over the issued-by
  // block's right side. Cosmetic on an already-valid record — never fail.
  const chopUrl = opts.chopUrlOverride ?? company.companyChopUrl
  if (opts.withChop && chopUrl) {
    await drawCompanyChop(doc, page, chopUrl, 300, issued - 15)
  }

  drawFooter(ctx, page, L(lang, 'footerReceipt'), '')

  return doc.save()
}
