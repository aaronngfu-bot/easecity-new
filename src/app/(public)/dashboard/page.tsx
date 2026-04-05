export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [orderCount, recentOrders] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="space-y-8 pt-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            Welcome, {session.user.name || 'User'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Manage your account and orders
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/orders"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            All Orders
          </Link>
          <Link
            href="/dashboard/settings"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-bg-surface">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            Total Orders
          </p>
          <p className="font-display text-2xl font-bold text-text-primary mt-2">
            {orderCount}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-surface">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            Account Type
          </p>
          <p className="font-display text-2xl font-bold text-accent-cyan mt-2">
            {session.user.role}
          </p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-surface">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">
            Email
          </p>
          <p className="text-sm text-text-primary mt-2 truncate">
            {session.user.email}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display text-sm font-semibold text-text-primary">
            Recent Orders
          </h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-muted text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="px-5 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-text-primary font-mono">
                    {order.id.slice(0, 12)}...
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-secondary">
                    {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
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

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.created
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  )
}
