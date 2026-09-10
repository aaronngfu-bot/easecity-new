'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { nextDocumentNumber } from '@/lib/doc-numbers'
import { receiptEmailHtml } from '@/lib/commerce-emails'
import type { Language } from '@/i18n/translations'

/**
 * Receipt server actions (admin side). Receipts are auto-issued by the
 * Stripe webhook for online payments; these actions cover offline
 * settlement (manual issue) and re-emailing the receipt link.
 */

function formatMoney(cents: number, currency: string): string {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function siteBase(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) throw new Error('Unauthorized')
}

/** Manually issue a receipt for an offline-settled order or quote.
 *  paymentMethod: how the money actually arrived — shown on the receipt PDF
 *  and page. Defaults to 'bank'. */
export async function issueManualReceipt(input: {
  orderId?: string
  quoteId?: string
  language?: Language
  paymentMethod?: 'bank' | 'fps' | 'alipayhk' | 'wechatpay' | 'cash' | 'cheque' | 'stripe'
}) {
  await assertAdmin()

  let clientName = ''
  let clientEmail: string | null = null
  let amount = 0
  let currency = 'hkd'

  if (input.orderId) {
    const order = await prisma.order.findUnique({ where: { id: input.orderId }, include: { user: { select: { email: true, name: true } } } })
    if (!order) throw new Error('Order not found')
    if (await prisma.receipt.findUnique({ where: { orderId: order.id } })) throw new Error('Receipt already exists for this order')
    clientName = order.user.name || order.user.email
    clientEmail = order.user.email
    amount = order.amount
    currency = order.currency
  } else if (input.quoteId) {
    const quote = await prisma.quote.findUnique({ where: { id: input.quoteId } })
    if (!quote) throw new Error('Quote not found')
    clientName = quote.clientName
    clientEmail = quote.clientEmail
    const items = JSON.parse(quote.items) as { qty: number; unitPrice: number }[]
    amount = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
    currency = quote.currency
  } else {
    throw new Error('An order or quote reference is required')
  }

  const number = await nextDocumentNumber('REC')
  const receipt = await prisma.receipt.create({
    data: {
      number,
      orderId: input.orderId || null,
      quoteId: input.quoteId || null,
      clientName,
      clientEmail,
      amount,
      currency,
      source: input.paymentMethod === 'stripe' ? 'stripe' : 'manual',
      accessToken: randomBytes(24).toString('base64url'),
      meta: JSON.stringify({ paymentMethod: input.paymentMethod || 'bank' }),
    },
  })

  // If a quote was settled offline, mark it paid.
  if (input.quoteId) {
    await prisma.quote.update({ where: { id: input.quoteId }, data: { status: 'paid' } }).catch(() => {})
  }
  if (input.orderId) {
    await prisma.order.update({ where: { id: input.orderId }, data: { status: 'paid' } }).catch(() => {})
  }

  revalidatePath('/admin/receipts')
  return { id: receipt.id, number: receipt.number }
}

/** Re-emails the receipt link to the client. */
export async function emailReceipt(id: string) {
  await assertAdmin()
  const receipt = await prisma.receipt.findUnique({ where: { id } })
  if (!receipt) throw new Error('Receipt not found')
  if (!receipt.clientEmail) throw new Error('Receipt has no client email — copy the link manually')

  const url = `${siteBase()}/receipt/${receipt.id}?token=${encodeURIComponent(receipt.accessToken)}`
  const { subject, html } = receiptEmailHtml({
    receiptUrl: url,
    language: 'en',
    number: receipt.number,
    clientName: receipt.clientName,
    total: formatMoney(receipt.amount, receipt.currency),
    currency: receipt.currency,
    issuedAt: receipt.issuedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  })

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.AUTH_EMAIL_FROM || 'EaseCity <onboarding@resend.dev>'
    const sent = await resend.emails.send({ from: fromEmail, to: [receipt.clientEmail], subject, html })
    if (sent.error) throw new Error(`Email failed: ${sent.error.message}`)
  }

  return { ok: true, url }
}
