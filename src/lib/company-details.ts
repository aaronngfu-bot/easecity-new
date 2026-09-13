import { prisma } from '@/lib/db'

/**
 * Company payment details for quotes/receipts — stored in SiteSetting so the
 * team can update them from the admin settings page without a code change.
 * Bank account name must match the BR exactly; the company name is the full
 * registered name from the Business Registration.
 *
 * Keys (SiteSetting.key):
 *   pay:companyName    — full BR name, e.g. "EaseCity Technologies Limited"
 *   pay:companyBrNo    — BR number, e.g. "1234567" (optional, printed as BR No.)
 *   pay:companyAddress — registered address (printed under the client block? No — company block)
 *   pay:bankName       — e.g. "The Hongkong and Shanghai Banking Corporation (HSBC)"
 *   pay:accountName    — account name, MUST match BR
 *   pay:accountNumber  — e.g. "XXX-XXXXXX-XXX"
 *   pay:paymentTerms   — e.g. "30 days from invoice date"
 */

export interface CompanyPayDetails {
  companyName: string
  companyBrNo: string | null
  companyAddress: string | null
  bankName: string | null
  accountName: string | null
  accountNumber: string | null
  paymentTerms: string
  termsAndConditions: string | null
  companyChopUrl: string | null // scanned company chop (PNG, transparent) — drawn on chop-version PDFs
  contactName: string | null // sales contact printed on the quote ("Frankie Lam")
  contactEmail: string | null // sales contact email (e.g. frankielam@easecity.hk)
  contactTitle: string | null // sales contact job title (printed under our signature line)
}

/** Fallbacks when admin settings are empty — clearly placeholder values. */
const DEFAULTS: CompanyPayDetails = {
  companyName: 'EaseCity Technologies Limited',
  companyBrNo: null,
  companyAddress: null,
  bankName: 'HSBC',
  accountName: 'EaseCity Technologies Limited',
  accountNumber: 'XXX-XXXXXX-XXX',
  paymentTerms: '30 days from invoice date',
  termsAndConditions: null,
  companyChopUrl: null,
  contactName: null,
  contactEmail: null,
  contactTitle: null,
}

/** Detailed default T&C (used when pay:termsAndConditions is unset). EN runs
 *  first with the 繁中 version after a blank line; pdf-lib wrap() handles the
 *  mixed-script block. Sections cover the standard HK quotation essentials:
 *  validity, payment, scope, revisions, IP, confidentiality, liability. */
export const DEFAULT_TERMS_EN = `1. Validity — This quotation is valid for 30 days from the date of issue unless otherwise stated. After this period, prices and availability are subject to reconfirmation.

2. Scope of work — The services and deliverables listed above constitute the entire scope of this quotation. Any work outside the agreed scope will be quoted separately before it begins.

3. Payment — Unless otherwise agreed, payment is due within 30 days of the invoice date. For projects spanning more than one month, we may invoice in stages (e.g. 50% on commencement, balance on delivery). Late payments may accrue interest at 1% per month.

4. Revisions — Unless stated otherwise, the quoted price includes two rounds of client revisions per deliverable. Additional revisions are chargeable at our then-current hourly rate.

5. Third-party costs — Hosting, domains, licences, stock assets, payment-gateway fees and similar third-party charges are billed at cost and are not included unless explicitly listed above.

6. Intellectual property — Full ownership of final deliverables transfers to the client upon full payment. We retain the right to showcase non-confidential work in our portfolio.

7. Confidentiality — Both parties will keep confidential information received from the other party confidential and use it only for the purposes of this engagement.

8. Liability — Our total liability under this quotation is limited to the value of this quotation. We are not liable for indirect or consequential losses.

9. Cancellation — Work cancelled after commencement is billable for all hours expended and committed third-party costs up to the cancellation date.

10. Governing law — This quotation and the resulting engagement are governed by the laws of Hong Kong SAR.`

export const DEFAULT_TERMS_ZH = `1. 有效期——除非另有說明，本報價單自發出日期起 30 天內有效。逾期後價格及供應情況可能有變。

2. 工作範圍——本報價單所列項目即為全部工作範圍；超出範圍之工作將另行報價並經雙方確認後方會開展。

3. 付款條款——除非另有說明，款項須於發票日期起 30 天內付清。跨月項目或會分期開票（例如開展時 50%、完成時餘款）。逾期款項或按每月 1% 計算利息。

4. 修改次數——除非另有說明，報價已包括每項交付物兩次客戶修改；額外修改將按當時時薪另行收費。

5. 第三方費用——代管、網域、授權、素材、支付閘道等第三方費用按實報銷，除非已列明，否則不包括在內。

6. 知識產權——付清全數後，最終交付物之知識產權歸客戶所有；我們保留於作品集中展示非機密成果之權利。

7. 保密——雙方就本次合作知悉之對方資料負保密義務，僅用於本報價相關用途。

8. 責任上限——我們在本報價單下之總責任以本報價單金額為限，並不承擔任何間接或相應損失。

9. 取消——工作開展後取消，已投入之工時及已承諾之第三方費用仍須支付。

10. 管轄法律——本報價單及由此產生之合作受香港特別行政區法律管轄。`

const KEYS: Record<keyof CompanyPayDetails, string> = {
  companyName: 'pay:companyName',
  companyBrNo: 'pay:companyBrNo',
  companyAddress: 'pay:companyAddress',
  bankName: 'pay:bankName',
  accountName: 'pay:accountName',
  accountNumber: 'pay:accountNumber',
  paymentTerms: 'pay:paymentTerms',
  termsAndConditions: 'pay:termsAndConditions',
  companyChopUrl: 'pay:companyChopUrl',
  contactName: 'pay:contactName',
  contactEmail: 'pay:contactEmail',
  contactTitle: 'pay:contactTitle',
}

export async function getCompanyPayDetails(): Promise<CompanyPayDetails> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: 'pay:' } },
  })
  const map = new Map(rows.map((r) => [r.key, r.value ?? '']))
  const out = { ...DEFAULTS }
  for (const [field, key] of Object.entries(KEYS) as [keyof CompanyPayDetails, string][]) {
    const v = map.get(key)?.trim()
    if (v) out[field] = v
  }
  return out
}

export async function setCompanyPayDetails(input: { [K in keyof CompanyPayDetails]?: string | null }) {
  const data: { key: string; value: string | null }[] = []
  for (const [field, key] of Object.entries(KEYS) as [keyof CompanyPayDetails, string][]) {
    const v = input[field]
    if (v !== undefined) data.push({ key, value: v || null })
  }
  // Upsert each provided field.
  for (const row of data) {
    await prisma.siteSetting.upsert({
      where: { key: row.key },
      create: row,
      update: { value: row.value },
    })
  }
}
