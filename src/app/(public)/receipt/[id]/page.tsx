import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ReceiptView } from '@/components/commerce/ReceiptView'
import { ReceiptPdfButton } from '@/components/commerce/PdfButtons'

/**
 * Customer-facing receipt page. Two access paths:
 *  1. Magic link  /receipt/{id}?token=…  (emailed, no login)
 *  2. Logged-in   /receipt/{id}          (only when session email matches)
 * Language follows the receipt record when set, else English.
 */
export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { id } = await params
  const { token } = await searchParams

  const receipt = await prisma.receipt.findUnique({ where: { id } })
  if (!receipt) notFound()

  let authed = !!token && token === receipt.accessToken
  if (!authed) {
    const session = await getServerSession(authOptions)
    authed = !!session?.user?.email && session.user.email === receipt.clientEmail
  }
  if (!authed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center text-sm text-text-muted">
        This receipt link is invalid.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ReceiptView
        receipt={{
          number: receipt.number,
          clientName: receipt.clientName,
          clientEmail: receipt.clientEmail,
          amount: receipt.amount,
          currency: receipt.currency,
          source: receipt.source,
          issuedAt: receipt.issuedAt.toISOString(),
          quoteId: receipt.quoteId,
        }}
        language="en"
      />
      <ReceiptPdfButton receiptId={receipt.id} token={token || ''} label="Download PDF receipt" />
    </div>
  )
}
