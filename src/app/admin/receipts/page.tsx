export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import { ReceiptRowActions } from '@/components/admin/ReceiptRowActions'

/**
 * Admin receipts list. Stripe payments create receipts automatically
 * (webhook); offline settlements are issued manually from here.
 */
export default async function AdminReceiptsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  const receipts = await prisma.receipt.findMany({
    orderBy: { issuedAt: 'desc' },
  })

  const money = (cents: number, currency: string) =>
    `${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.RECEIPTS</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Receipts</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {receipts.length} issued · Stripe payments are receipted automatically
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-border bg-bg-void/80">
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Number</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Client</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Amount</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Source</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Issued</th>
                <th className="px-5 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {receipts.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-bg-void/60">
                  <td className="px-5 py-4 font-mono text-xs text-text-primary">{r.number}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-text-primary">{r.clientName}</p>
                    <p className="text-xs text-text-muted">{r.clientEmail || '—'}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-primary">{money(r.amount, r.currency)}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-sm border border-border bg-bg-elevated px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                      {r.source}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {new Date(r.issuedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ReceiptRowActions id={r.id} clientEmail={r.clientEmail} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {receipts.length === 0 && (
          <div className="p-8 text-center text-sm text-text-muted">
            No receipts yet — paid quotes (online or offline) generate them
          </div>
        )}
      </div>
    </div>
  )
}
