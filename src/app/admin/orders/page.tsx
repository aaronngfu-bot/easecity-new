export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.ORDERS</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Orders</h1>
        <p className="mt-1 text-sm text-text-secondary">{orders.length} total orders</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-border bg-bg-void/80">
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Order ID</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Customer</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Amount</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Status</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Date</th>
                <th className="px-5 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-bg-void/60">
                  <td className="px-5 py-4 text-sm font-mono text-text-primary">{order.id.slice(0, 16)}...</td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-text-primary">{order.user.name || '—'}</p>
                    <p className="text-xs text-text-muted">{order.user.email}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-primary">
                    {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-signal hover:text-signal-light transition-colors">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {orders.length === 0 && (
          <div className="p-8 text-center text-text-muted text-sm">No orders yet</div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    paid: 'bg-status-success/15 text-status-success border-status-success/25',
    completed: 'bg-status-success/15 text-status-success border-status-success/25',
    fulfilled: 'bg-status-info/15 text-status-info border-status-info/25',
    pending_payment: 'bg-status-warning/15 text-status-warning border-status-warning/25',
    created: 'bg-bg-elevated/50 text-text-muted border-border',
    expired: 'bg-status-danger/15 text-status-danger border-status-danger/25',
    cancelled: 'bg-status-danger/15 text-status-danger border-status-danger/25',
    refunded: 'bg-accent-purple/15 text-accent-purple border-accent-purple/25',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${s[status] || s.created}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
