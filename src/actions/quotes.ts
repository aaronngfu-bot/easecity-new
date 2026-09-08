'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { getStripe } from '@/lib/stripe'
import { nextDocumentNumber } from '@/lib/doc-numbers'
import { quoteEmailHtml } from '@/lib/commerce-emails'
import type { Language } from '@/i18n/translations'

/**
 * Quote server actions. Admin side: create/update/send/cancel. Customer
 * side: confirm by quoteToken (magic link, no login) — confirming creates
 * the Order; when paymentMode is stripe it also returns a Checkout URL.
 */

export interface QuoteItemInput {
  description: string
  qty: number
  unitPrice: number // smallest currency unit
}

async function assertAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    throw new Error('Unauthorized')
  }
  return session
}

function parseItems(raw: unknown): QuoteItemInput[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Quote needs at least one line item')
  return raw.map((it) => {
    const { description, qty, unitPrice } = it as Record<string, unknown>
    if (typeof description !== 'string' || !description.trim()) throw new Error('Item description required')
    const q = Number(qty)
    const p = Number(unitPrice)
    if (!Number.isFinite(q) || q < 1 || q > 100000) throw new Error('Invalid quantity')
    if (!Number.isFinite(p) || p < 0) throw new Error('Invalid unit price')
    return { description: description.trim().slice(0, 500), qty: Math.round(q), unitPrice: Math.round(p) }
  })
}

function quoteTotalCents(items: QuoteItemInput[]): number {
  return items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0)
}

function formatMoney(cents: number, currency: string): string {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function siteBase(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

/* ─── Admin actions ─────────────────────────────────────────────────────── */

export async function createQuote(input: {
  clientName: string
  clientEmail?: string
  clientPhone?: string
  language?: Language
  currency?: string
  items: QuoteItemInput[]
  notes?: string
  validUntil?: string // ISO date string
  paymentMode?: 'none' | 'stripe'
  sessionId?: string // support-session provenance
}) {
  await assertAdmin()
  const items = parseItems(input.items)
  if (!input.clientName?.trim()) throw new Error('Client name required')
  if (input.clientEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.clientEmail)) {
    throw new Error('Invalid client email')
  }

  const number = await nextDocumentNumber('QUO')
  const quote = await prisma.quote.create({
    data: {
      number,
      clientName: input.clientName.trim().slice(0, 200),
      clientEmail: input.clientEmail?.trim().slice(0, 255) || null,
      clientPhone: input.clientPhone?.trim().slice(0, 60) || null,
      language: input.language || 'en',
      currency: (input.currency || 'hkd').toLowerCase().slice(0, 8),
      items: JSON.stringify(items),
      notes: input.notes?.slice(0, 4000) || null,
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      paymentMode: input.paymentMode === 'stripe' ? 'stripe' : 'none',
      sessionId: input.sessionId || null,
      quoteToken: randomBytes(24).toString('base64url'),
    },
  })
  revalidatePath('/admin/quotes')
  return { id: quote.id, number: quote.number }
}

export async function updateQuote(id: string, input: {
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  language?: Language
  currency?: string
  items?: QuoteItemInput[]
  notes?: string
  validUntil?: string
  paymentMode?: 'none' | 'stripe'
}) {
  await assertAdmin()
  const existing = await prisma.quote.findUnique({ where: { id } })
  if (!existing) throw new Error('Quote not found')
  if (['confirmed', 'converted', 'paid', 'cancelled'].includes(existing.status)) {
    throw new Error('Quote is locked after confirmation')
  }

  const data: Record<string, unknown> = {}
  if (input.clientName !== undefined) data.clientName = input.clientName.trim().slice(0, 200)
  if (input.clientEmail !== undefined) data.clientEmail = input.clientEmail?.trim().slice(0, 255) || null
  if (input.clientPhone !== undefined) data.clientPhone = input.clientPhone?.trim().slice(0, 60) || null
  if (input.language !== undefined) data.language = input.language
  if (input.currency !== undefined) data.currency = input.currency.toLowerCase().slice(0, 8)
  if (input.items !== undefined) data.items = JSON.stringify(parseItems(input.items))
  if (input.notes !== undefined) data.notes = input.notes?.slice(0, 4000) || null
  if (input.validUntil !== undefined) data.validUntil = input.validUntil ? new Date(input.validUntil) : null
  if (input.paymentMode !== undefined) data.paymentMode = input.paymentMode === 'stripe' ? 'stripe' : 'none'

  await prisma.quote.update({ where: { id }, data })
  revalidatePath('/admin/quotes')
  return { ok: true }
}

/** Marks the quote sent and emails the client: PDF attachment (print-and-sign
 * copy with blank signature block) + the magic link for online signing. */
export async function sendQuote(id: string) {
  await assertAdmin()
  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) throw new Error('Quote not found')
  if (!quote.clientEmail) throw new Error('Quote has no client email — copy the link manually')
  if (['cancelled', 'converted', 'paid'].includes(quote.status)) throw new Error('Quote can no longer be sent')

  const url = `${siteBase()}/quote/${quote.id}?token=${encodeURIComponent(quote.quoteToken)}`
  const items: QuoteItemInput[] = JSON.parse(quote.items)
  const totalCents = quoteTotalCents(items)

  const { subject, html } = quoteEmailHtml({
    quoteUrl: url,
    hasAttachment: true,
    language: (quote.language || 'en') as Language,
    number: quote.number,
    clientName: quote.clientName,
    items: items.map((it) => ({
      description: it.description,
      qty: it.qty,
      lineTotal: formatMoney(it.qty * it.unitPrice, quote.currency),
    })),
    total: formatMoney(totalCents, quote.currency),
    currency: quote.currency,
    validUntil: quote.validUntil ? quote.validUntil.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null,
    notes: quote.notes,
  })

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const { buildQuotePdf } = await import('@/lib/pdf-docs')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const fromEmail = process.env.AUTH_EMAIL_FROM || 'EaseCity <onboarding@resend.dev>'

    // Print-and-sign copy: blank signature block, no online signature baked in.
    const pdfBytes = await buildQuotePdf({
      number: quote.number,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      currency: quote.currency,
      items,
      notes: quote.notes,
      issuedAt: quote.createdAt,
      validUntil: quote.validUntil,
      signature: null,
    })

    const sent = await resend.emails.send({
      from: fromEmail,
      to: [quote.clientEmail],
      subject,
      html,
      attachments: [
        {
          filename: `${quote.number}.pdf`,
          content: Buffer.from(pdfBytes).toString('base64'),
        },
      ],
    })
    if (sent.error) throw new Error(`Email failed: ${sent.error.message}`)
  }

  await prisma.quote.update({ where: { id }, data: { status: quote.status === 'draft' ? 'sent' : quote.status } })
  revalidatePath('/admin/quotes')
  return { ok: true, url }
}

export async function cancelQuote(id: string) {
  await assertAdmin()
  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) throw new Error('Quote not found')
  if (['paid', 'converted'].includes(quote.status)) throw new Error('Quote already paid')
  await prisma.quote.update({ where: { id }, data: { status: 'cancelled' } })
  revalidatePath('/admin/quotes')
  return { ok: true }
}

/** Regenerates the client token (revokes the old link) and returns the new URL. */
export async function regenerateQuoteLink(id: string) {
  await assertAdmin()
  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) throw new Error('Quote not found')
  const quoteToken = randomBytes(24).toString('base64url')
  await prisma.quote.update({ where: { id }, data: { quoteToken } })
  revalidatePath('/admin/quotes')
  return { url: `${siteBase()}/quote/${id}?token=${encodeURIComponent(quoteToken)}` }
}

/* ─── Customer action (magic-link, no login) ────────────────────────────── */

/**
 * Confirms a quote via its public token. Creates the Order linked to the
 * quote. `signature` (optional hand-drawn PNG data URI + signer name) turns
 * the confirmation into a signed acceptance — stored on the quote and baked
 * into the generated PDF. Stripe-mode quotes get a Checkout URL back;
 * none-mode quotes are recorded for offline settlement. Auth optional:
 * callers holding the token from the email/dashboard can confirm without
 * logging in.
 */
export async function confirmQuote(id: string, token: string, signature?: {
  pngDataUri: string
  signerName: string
}) {
  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote || quote.quoteToken !== token) throw new Error('Invalid quote link')
  if (['cancelled', 'converted', 'paid'].includes(quote.status)) {
    throw new Error('Quote is no longer confirmable')
  }
  const expired = quote.validUntil && quote.validUntil < new Date()
  if (expired) throw new Error('Quote has expired')

  // Validate signature payload early.
  let sig: { pngDataUri: string; signerName: string } | null = null
  if (signature?.pngDataUri) {
    if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(signature.pngDataUri)) {
      throw new Error('Invalid signature image')
    }
    if (signature.pngDataUri.length > 400_000) throw new Error('Signature image too large')
    const name = signature.signerName?.trim()
    if (!name) throw new Error('Signer name required')
    sig = { pngDataUri: signature.pngDataUri, signerName: name.slice(0, 120) }
  }

  // Already confirmed before → return existing checkout if stripe mode.
  if (quote.status === 'confirmed' && quote.paymentMode === 'stripe' && quote.stripeSessionId) {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(quote.stripeSessionId)
    if (session.url) return { status: 'stripe_redirect', url: session.url }
    throw new Error('Payment session expired — ask us to re-send the payment link')
  }
  if (quote.status === 'confirmed') return { status: 'already_confirmed' }

  const items: QuoteItemInput[] = JSON.parse(quote.items)
  const totalCents = quoteTotalCents(items)

  // Find a matching site account by email (order ownership; optional).
  const user = quote.clientEmail
    ? await prisma.user.findUnique({ where: { email: quote.clientEmail }, select: { id: true } })
    : null

  // 1. Order (quotes without a site account get one owned by the first admin —
  //    kept out of the customer dashboard flows; metadata records the truth).
  let ownerId = user?.id
  if (!ownerId) {
    const admin = await prisma.user.findFirst({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] } },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    })
    ownerId = admin?.id
  }
  if (!ownerId) throw new Error('No user available to own the order')

  const order = await prisma.order.create({
    data: {
      userId: ownerId,
      status: 'pending_payment',
      amount: totalCents,
      currency: quote.currency,
      items: JSON.stringify(items.map((it) => ({ description: it.description, quantity: it.qty, unitPrice: it.unitPrice }))),
      metadata: JSON.stringify({ quoteId: quote.id, quoteNumber: quote.number, source: 'quote' }),
      quoteId: quote.id,
    },
  })

  await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: 'confirmed',
      confirmedAt: new Date(),
      ...(sig && { signedAt: new Date(), signerName: sig.signerName, signaturePng: sig.pngDataUri }),
    },
  })

  // 2. Stripe Checkout for pay-now quotes.
  if (quote.paymentMode === 'stripe') {
    const stripe = getStripe()
    const baseUrl = siteBase()
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: items.map((it) => ({
        quantity: it.qty,
        price_data: {
          currency: quote.currency,
          unit_amount: it.unitPrice,
          product_data: { name: it.description.slice(0, 200) },
        },
      })),
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/quote/${quote.id}?token=${encodeURIComponent(token)}&payment=cancelled`,
      metadata: {
        orderId: order.id,
        quoteId: quote.id,
        source: 'quote',
      },
    })
    await prisma.quote.update({ where: { id: quote.id }, data: { stripeSessionId: checkout.id } })
    if (!checkout.url) throw new Error('Could not create payment session')
    revalidatePath(`/quote/${quote.id}`)
    return { status: 'stripe_redirect', url: checkout.url, orderId: order.id }
  }

  revalidatePath('/admin/quotes')
  return { status: 'confirmed_offline', orderId: order.id, signed: !!sig }
}
