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
}

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
