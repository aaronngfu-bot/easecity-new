import fs from 'node:fs'
import path from 'node:path'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

/**
 * Server-side PDF generation for quotes and receipts.
 * Layout: A4, brand teal accents, line-item table, totals block, and — for
 * signed quotes — the customer's hand-drawn signature with signer name and
 * timestamp. CJK text needs the embedded Noto Sans TC font (subset on embed,
 * so output stays small); Latin fallbacks use Helvetica.
 */

const FONT_PATH = path.join(process.cwd(), 'src/assets/fonts/NotoSansTC-Regular.otf')
let fontCache: Uint8Array | null = null
function cjkFontBytes(): Uint8Array {
  if (!fontCache) fontCache = new Uint8Array(fs.readFileSync(FONT_PATH))
  return fontCache
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

const TEAL = rgb(0.0, 0.49, 0.44)
const INK = rgb(0.08, 0.15, 0.15)
const MUTED = rgb(0.37, 0.45, 0.44)
const LINE = rgb(0.85, 0.89, 0.89)
const SOFT = rgb(0.955, 0.97, 0.965)

function money(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** Draws wrapped text; returns the y after the last line. */
function wrapText(page: import('pdf-lib').PDFPage, text: string, x: number, y: number, maxWidth: number, size: number, font: import('pdf-lib').PDFFont, color = INK, lineHeight = size * 1.5): number {
  // Simple char-count wrap (CJK has no spaces; measuring every glyph is slow —
  // approximate width via font.widthOfTextAtSize on growing slices).
  let line = ''
  let cursorY = y
  const push = () => {
    page.drawText(line, { x, y: cursorY, size, font, color })
    cursorY -= lineHeight
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

export async function buildQuotePdf(opts: BaseDoc & {
  signature?: { pngDataUri: string; signerName: string; signedAt: Date } | null
}): Promise<Uint8Array> {
  const { number, clientName, clientEmail, currency, items, notes, issuedAt, validUntil, signature } = opts

  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const cjk = await doc.embedFont(cjkFontBytes(), { subset: true })
  const helv = await doc.embedFont(StandardFonts.Helvetica)
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const use = (text: string, size: number) => {
    // CJK font covers Latin too; use it when any non-ASCII char is present,
    // or when the text is numeric-ish (safe either way).
    return /[\u3000-\u9fff\uff00-\uffef\u2018\u2019\u201c\u201d]/.test(text) ? cjk : helv
  }
  const draw = (page: import('pdf-lib').PDFPage, text: string, x: number, y: number, size: number, bold = false, color = INK) => {
    const f = bold ? (text.match(/[\u3000-\u9fff]/) ? cjk : helvBold) : use(text, size)
    page.drawText(text, { x, y, size, font: f, color })
  }

  const page = doc.addPage([595, 842]) // A4
  const M = 50
  let y = 792

  // Header band
  page.drawRectangle({ x: 0, y: 802, width: 595, height: 40, color: TEAL })
  draw(page, 'EaseCity', M, 812, 18, true, rgb(1, 1, 1))
  const kindLabel = 'QUOTATION / 報價單'
  {
    const f = cjk
    const w = f.widthOfTextAtSize(kindLabel, 10)
    page.drawText(kindLabel, { x: 595 - M - w, y: 815, size: 10, font: f, color: rgb(1, 1, 1) })
  }
  y = 770

  draw(page, number, M, y, 11, false, MUTED)
  y -= 16
  draw(page, fmtDate(issuedAt), M, y, 11, false, MUTED)
  y -= 34

  draw(page, 'Prepared for / 客戶', M, y, 10, false, MUTED)
  y -= 16
  draw(page, clientName, M, y, 13, true)
  if (clientEmail) {
    y -= 15
    draw(page, clientEmail, M, y, 10, false, MUTED)
  }
  if (validUntil) {
    draw(page, `Valid until / 有效期至: ${fmtDate(validUntil)}`, 340, y + (clientEmail ? 15 : 0) + 1, 10, false, MUTED)
  }
  y -= 34

  // Table header
  page.drawRectangle({ x: M, y: y - 6, width: 595 - M * 2, height: 24, color: SOFT })
  draw(page, 'Item / 項目', M + 10, y, 9, false, MUTED)
  draw(page, 'Qty', 380, y, 9, false, MUTED)
  draw(page, 'Amount / 金額', 545 - 60, y, 9, false, MUTED)
  y -= 30

  // Rows
  for (const it of items) {
    const descStartY = y
    const afterDesc = wrapText(page, it.description, M + 10, y, 300, 10, use(it.description, 10))
    const lineTotal = it.qty * it.unitPrice
    draw(page, String(it.qty), 380, y, 10)
    {
      const s = money(lineTotal)
      const f = use(s, 10)
      const w = f.widthOfTextAtSize(s, 10)
      page.drawText(s, { x: 545 - w, y, size: 10, font: f, color: INK })
    }
    y = Math.min(afterDesc, y - 18) - 8
    page.drawLine({ start: { x: M, y: y + 10 }, end: { x: 595 - M, y: y + 10 }, thickness: 0.5, color: LINE })
  }

  // Total
  const totalCents = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
  y -= 14
  draw(page, 'Total / 合計', M, y, 12, true)
  {
    const s = `${money(totalCents)} ${currency.toUpperCase()}`
    const f = cjk
    const w = f.widthOfTextAtSize(s, 14)
    page.drawText(s, { x: 545 - w, y: y - 2, size: 14, font: f, color: TEAL })
  }
  y -= 36

  // Notes
  if (notes) {
    draw(page, 'Notes / 備註', M, y, 9, false, MUTED)
    y -= 16
    y = wrapText(page, notes, M, y, 595 - M * 2, 10, use(notes, 10), INK) - 12
  }

  // Signature block: baked-in signature (online signing) or blank fillable
  // lines (emailed PDF for print-and-sign).
  if (signature) {
    if (y < 220) { y = 220 }
    y -= 10
    draw(page, 'Accepted & signed / 已確認並簽署', M, y, 10, false, MUTED)
    y -= 12
    // signature image
    try {
      const b64 = signature.pngDataUri.replace(/^data:image\/png;base64,/, '')
      const png = await doc.embedPng(Buffer.from(b64, 'base64'))
      const maxW = 200
      const maxH = 70
      const scale = Math.min(maxW / png.width, maxH / png.height)
      page.drawImage(png, { x: M, y: y - png.height * scale, width: png.width * scale, height: png.height * scale })
      page.drawLine({ start: { x: M, y: y - png.height * scale - 6 }, end: { x: M + 220, y: y - png.height * scale - 6 }, thickness: 0.75, color: MUTED })
    } catch {
      draw(page, '[signature]', M, y, 12, false, MUTED)
    }
    const sigY = y - 76
    draw(page, signature.signerName, M, sigY, 11, true)
    draw(page, `Signed at / 簽署時間: ${signature.signedAt.toISOString()}`, M, sigY - 14, 8, false, MUTED)
    draw(page, `Doc: ${number}`, M, sigY - 26, 8, false, MUTED)
    y = sigY - 40
  } else {
    // Blank signature block for the emailed/print-and-sign copy.
    if (y < 260) { y = 260 }
    y -= 16
    draw(page, 'Accepted & signed / 已確認並簽署', M, y, 10, false, MUTED)
    y -= 30
    // signature line
    page.drawLine({ start: { x: M, y }, end: { x: M + 220, y }, thickness: 0.75, color: MUTED })
    draw(page, 'Signature / 簽署', M, y - 14, 8, false, MUTED)
    // name line
    page.drawLine({ start: { x: 300, y }, end: { x: 545, y }, thickness: 0.75, color: MUTED })
    draw(page, 'Name / 姓名', 300, y - 14, 8, false, MUTED)
    y -= 44
    // date line
    page.drawLine({ start: { x: M, y }, end: { x: M + 160, y }, thickness: 0.75, color: MUTED })
    draw(page, 'Date / 日期', M, y - 14, 8, false, MUTED)
    // company line
    page.drawLine({ start: { x: 300, y }, end: { x: 545, y }, thickness: 0.75, color: MUTED })
    draw(page, 'Company / 公司', 300, y - 14, 8, false, MUTED)
    y -= 30
  }

  // Footer
  draw(page, 'EaseCity Technologies Limited · admin@easecity.hk', M, 60, 8, false, MUTED)
  if (signature) {
    draw(page, 'This quotation was generated electronically and is valid without physical signature.', M, 48, 7.5, false, MUTED)
  } else {
    draw(page, 'Sign above, then return a scanned copy to admin@easecity.hk — or confirm online via your quote link.', M, 48, 7.5, false, MUTED)
  }

  return doc.save()
}

export async function buildReceiptPdf(opts: BaseDoc & {
  source: string
  quoteNumber?: string | null
}): Promise<Uint8Array> {
  const { number, clientName, clientEmail, currency, items, issuedAt, source, quoteNumber } = opts
  const totalCents = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)

  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const cjk = await doc.embedFont(cjkFontBytes(), { subset: true })
  const helv = await doc.embedFont(StandardFonts.Helvetica)
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const draw = (page: import('pdf-lib').PDFPage, text: string, x: number, y: number, size: number, bold = false, color = INK) => {
    const f = bold ? (text.match(/[\u3000-\u9fff]/) ? cjk : helvBold) : (/[\u3000-\u9fff]/.test(text) ? cjk : helv)
    page.drawText(text, { x, y, size, font: f, color })
  }

  const page = doc.addPage([595, 842])
  const M = 50

  page.drawRectangle({ x: 0, y: 802, width: 595, height: 40, color: TEAL })
  draw(page, 'EaseCity', M, 812, 18, true, rgb(1, 1, 1))
  {
    const label = 'RECEIPT / 收據'
    const w = cjk.widthOfTextAtSize(label, 10)
    page.drawText(label, { x: 595 - M - w, y: 815, size: 10, font: cjk, color: rgb(1, 1, 1) })
  }

  let y = 770
  draw(page, number, M, y, 11, false, MUTED)
  y -= 16
  draw(page, fmtDate(issuedAt), M, y, 11, false, MUTED)
  y -= 34

  draw(page, 'Billed to / 付款人', M, y, 10, false, MUTED)
  y -= 16
  draw(page, clientName, M, y, 13, true)
  if (clientEmail) {
    y -= 15
    draw(page, clientEmail, M, y, 10, false, MUTED)
  }
  y -= 30

  // Amount box
  page.drawRectangle({ x: M, y: y - 58, width: 595 - M * 2, height: 64, color: SOFT, borderColor: LINE, borderWidth: 0.75 })
  draw(page, 'Amount paid / 已收金額', M + 14, y - 8, 9, false, MUTED)
  {
    const s = `${money(totalCents)} ${currency.toUpperCase()}`
    page.drawText(s, { x: M + 14, y: y - 36, size: 20, font: cjk, color: TEAL })
  }
  draw(page, source === 'stripe' ? 'Online payment (Stripe)' : 'Bank transfer / offline', 340, y - 8, 9, false, MUTED)
  if (quoteNumber) draw(page, `Re: ${quoteNumber}`, 340, y - 24, 9, false, MUTED)
  y -= 90

  // Item lines (simplified receipt listing)
  for (const it of items) {
    draw(page, it.description, M, y, 10)
    const s = money(it.qty * it.unitPrice)
    const f = helv
    const w = f.widthOfTextAtSize(s, 10)
    page.drawText(s, { x: 545 - w, y, size: 10, font: f, color: INK })
    y -= 18
  }

  draw(page, 'EaseCity Technologies Limited · admin@easecity.hk', M, 60, 8, false, MUTED)
  draw(page, 'This receipt was generated electronically.', M, 48, 7.5, false, MUTED)

  return doc.save()
}
