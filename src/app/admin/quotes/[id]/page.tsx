import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { QuoteForm } from '@/components/admin/QuoteForm'

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }
  const { id } = await params

  const quote = await prisma.quote.findUnique({ where: { id } })
  if (!quote) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.QUOTES</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">{quote.number}</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-text-muted">{quote.status}</p>
      </div>
      <div className="rounded-lg border border-border bg-bg-surface p-6">
        {quote.signedPdfUrl && (
          <div className="mb-5 rounded-lg border border-status-success/30 bg-status-success/10 p-4">
            <p className="text-sm font-medium text-status-success">Client returned a signed PDF</p>
            <p className="mt-0.5 text-xs text-text-muted">{quote.signedPdfName}</p>
            <a
              href={quote.signedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-signal underline-offset-2 hover:underline"
            >
              Download signed PDF →
            </a>
          </div>
        )}
        <QuoteForm
          quote={{
            id: quote.id,
            clientName: quote.clientName,
            clientEmail: quote.clientEmail,
            clientPhone: quote.clientPhone,
            language: quote.language,
            currency: quote.currency,
            items: JSON.parse(quote.items),
            notes: quote.notes,
            validUntil: quote.validUntil ? quote.validUntil.toISOString() : null,
            paymentMode: quote.paymentMode,
            status: quote.status,
          }}
        />
      </div>
    </div>
  )
}
