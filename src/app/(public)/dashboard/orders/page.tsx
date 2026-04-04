import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Orders
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            View your order history
          </p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted text-sm mb-4">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-elevated/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-bg-elevated/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono text-text-primary">
                    {order.id.slice(0, 16)}...
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-primary">
                    {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    paid: 'bg-green-500/15 text-green-400 border-green-500/25',
    completed: 'bg-green-500/15 text-green-400 border-green-500/25',
    fulfilled: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    pending_payment: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    created: 'bg-gray-500/15 text-gray-400 border-gray-500/25',
    expired: 'bg-red-500/15 text-red-400 border-red-500/25',
    cancelled: 'bg-red-500/15 text-red-400 border-red-500/25',
    refunded: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  }
  return styles[status] || styles.created
}
