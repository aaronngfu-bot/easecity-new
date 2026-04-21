export const revalidate = 0

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  })

  if (!order) notFound()

  const items = (() => {
    try { return JSON.parse(order.items) as Array<{ priceId: string; quantity: number }> } catch { return [] }
  })()

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-sm text-text-muted hover:text-text-primary transition-colors">
        ← Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-4">
          <h2 className="font-display text-lg font-bold text-text-primary">Order Details</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-text-muted mb-1">Order ID</p>
              <p className="font-mono text-text-primary break-all">{order.id}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Status</p>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                order.status === 'paid' ? 'bg-green-500/15 text-green-400 border-green-500/25' :
                'bg-gray-500/15 text-gray-400 border-gray-500/25'
              }`}>
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Amount</p>
              <p className="text-text-primary font-semibold">{(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Date</p>
              <p className="text-text-primary">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            {order.stripeSessionId && (
              <div className="col-span-2">
                <p className="text-xs text-text-muted mb-1">Stripe Session</p>
                <p className="font-mono text-text-secondary text-xs break-all">{order.stripeSessionId}</p>
              </div>
            )}
            {order.stripePaymentIntentId && (
              <div className="col-span-2">
                <p className="text-xs text-text-muted mb-1">Payment Intent</p>
                <p className="font-mono text-text-secondary text-xs break-all">{order.stripePaymentIntentId}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-3">
            <h2 className="font-display text-sm font-semibold text-text-primary">Customer</h2>
            <div>
              <p className="text-sm text-text-primary">{order.user.name || '—'}</p>
              <p className="text-xs text-text-muted">{order.user.email}</p>
            </div>
            <Link
              href={`/admin/users/${order.user.id}`}
              className="inline-block text-xs text-signal hover:text-signal-light transition-colors"
            >
              View user profile →
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-3">
            <h2 className="font-display text-sm font-semibold text-text-primary">Items</h2>
            {items.length === 0 ? (
              <p className="text-text-muted text-sm">No item data</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="font-mono text-text-secondary text-xs">{item.priceId}</span>
                    <span className="text-text-primary">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
