export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { QuoteRowActions } from '@/components/admin/QuoteRowActions'
import { IssueReceiptButton } from '@/components/admin/IssueReceiptButton'

/**
 * Admin quotes list. The full quote funnel (create → send → confirm →
 * convert → receipt) lives under here; see actions/quotes.ts.
 */
export default async function AdminQuotesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
  })

  const statusStyle: Record<string, string> = {
    draft: 'bg-bg-elevated text-text-muted border-border',
    sent: 'bg-signal/10 text-signal border-signal/25',
    confirmed: 'bg-status-warning/10 text-status-warning border-status-warning/25',
    converted: 'bg-status-warning/10 text-status-warning border-status-warning/25',
    paid: 'bg-status-success/15 text-status-success border-status-success/25',
    cancelled: 'bg-status-danger/10 text-status-danger border-status-danger/25',
    expired: 'bg-bg-elevated text-text-muted border-border',
  }

  const money = (itemsJson: string, currency: string) => {
    try {
      const items = JSON.parse(itemsJson) as { qty: number; unitPrice: number }[]
      const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
      return `${(total / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`
    } catch {
      return '—'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-mono mb-2 text-signal">ADMIN.QUOTES</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Quotes</h1>
          <p className="mt-1 text-sm text-text-secondary">{quotes.length} quotations</p>
        </div>
        <Link
          href="/admin/quotes/new"
          className="rounded-lg border border-signal/40 bg-signal/15 px-4 py-2 text-sm font-medium text-signal transition-colors hover:bg-signal/25"
        >
          + New quote
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-bg-void/80">
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Number</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Client</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Total</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Status</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Valid until</th>
                <th className="px-5 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quotes.map((q) => (
                <tr key={q.id} className="transition-colors hover:bg-bg-void/60">
                  <td className="px-5 py-4 font-mono text-xs text-text-primary">{q.number}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-text-primary">{q.clientName}</p>
                    <p className="text-xs text-text-muted">{q.clientEmail || '—'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-primary">{money(q.items, q.currency)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${statusStyle[q.status] || statusStyle.draft}`}>
                      {q.status}
                    </span>
                    {q.signedAt && (
                      <span className="ml-1.5 rounded-sm border border-status-success/25 bg-status-success/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-status-success" title={`Signed by ${q.signerName ?? ''}`}>
                        signed
                      </span>
                    )}
                    {q.signedPdfUrl && (
                      <a
                        href={q.signedPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1.5 rounded-sm border border-signal/25 bg-signal/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-signal"
                        title="Client returned a signed PDF"
                      >
                        PDF ↩
                      </a>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <QuoteRowActions id={q.id} status={q.status} clientEmail={q.clientEmail} />
                    {q.status === 'confirmed' && (
                      <span className="ml-2"><IssueReceiptButton quoteId={q.id} /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {quotes.length === 0 && (
          <div className="p-8 text-center text-sm text-text-muted">
            No quotes yet — create the first one
          </div>
        )}
      </div>
    </div>
  )
}
