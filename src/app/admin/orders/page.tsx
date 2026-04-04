import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Orders</h1>
        <p className="text-text-secondary text-sm mt-1">{orders.length} total orders</p>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg-elevated/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Order ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-bg-elevated/30 transition-colors">
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
                  <Link href={`/admin/orders/${order.id}`} className="text-xs text-accent-cyan hover:text-accent-cyan-light transition-colors">
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-text-muted text-sm">No orders yet</div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    paid: 'bg-green-500/15 text-green-400 border-green-500/25',
    completed: 'bg-green-500/15 text-green-400 border-green-500/25',
    fulfilled: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    pending_payment: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    created: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
    expired: 'bg-red-500/15 text-red-400 border-red-500/25',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/25',
    refunded: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${s[status] || s.created}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
