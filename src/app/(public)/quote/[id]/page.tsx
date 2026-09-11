import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { QuoteView } from '@/components/commerce/QuoteView'

/**
 * Customer-facing quote page. Two access paths:
 *  1. Magic link  /quote/{id}?token=…  (emailed, no login)
 *  2. Logged-in   /quote/{id}          (only when session user email matches)
 * The page is a thin server loader (auth + data); ALL copy lives in the
 * client QuoteView and follows the site's live language (useLanguage).
 */

export default async function QuotePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string; payment?: string }>
}) {
  const { id } = await params
  const { token, payment } = await searchParams

  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) notFound()

  // Auth: token match OR logged-in user with matching email.
  let authed = !!token && token === quote.quoteToken
  if (!authed) {
    const session = await getServerSession(authOptions)
    authed = !!session?.user?.email && session.user.email === quote.clientEmail
  }
  if (!authed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-text-muted">
        This quote link is invalid.
      </div>
    )
  }

  // When the quote is paid, its receipt (if already issued) is the primary
  // artefact the client should see — link it instead of the quote PDF.
  const receiptForQuote = await prisma.receipt.findFirst({
    where: { quoteId: quote.id, status: 'issued' },
    select: { id: true, accessToken: true },
  })

  return (
    <QuoteView
      token={token || ''}
      paymentCancelled={payment === 'cancelled'}
      receiptForQuote={receiptForQuote}
      quote={{
        id: quote.id,
        number: quote.number,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        status: quote.status,
        currency: quote.currency,
        items: JSON.parse(quote.items) as { description: string; qty: number; unitPrice: number }[],
        notes: quote.notes,
        validUntil: quote.validUntil ? quote.validUntil.toISOString() : null,
        paymentMode: quote.paymentMode,
        signaturePng: quote.signaturePng,
        signerName: quote.signerName,
        signedAt: quote.signedAt ? quote.signedAt.toISOString() : null,
        signedPdfUrl: quote.signedPdfUrl,
      }}
    />
  )
}
