import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { UserRoleForm } from './UserRoleForm'

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      orders: { orderBy: { createdAt: 'desc' }, take: 10 },
      _count: { select: { orders: true, auditLogs: true, conversations: true } },
    },
  })

  if (!user) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          ← Users
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-bg-surface">
            <h2 className="font-display text-lg font-bold text-text-primary mb-4">Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-muted mb-1">Name</p>
                <p className="text-sm text-text-primary">{user.name || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Email</p>
                <p className="text-sm text-text-primary">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Joined</p>
                <p className="text-sm text-text-primary">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-1">Auth Method</p>
                <p className="text-sm text-text-primary">
                  {user.hashedPassword ? 'Credentials' : 'OAuth'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display text-sm font-semibold text-text-primary">Recent Orders</h2>
            </div>
            {user.orders.length === 0 ? (
              <div className="p-6 text-center text-text-muted text-sm">No orders</div>
            ) : (
              <div className="divide-y divide-border">
                {user.orders.map((order) => (
                  <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-text-primary">{order.id.slice(0, 12)}...</p>
                      <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-text-secondary">
                        {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        order.status === 'paid' ? 'bg-green-500/15 text-green-400 border-green-500/25' :
                        'bg-gray-500/15 text-gray-400 border-gray-500/25'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-4">
            <h2 className="font-display text-sm font-semibold text-text-primary">Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Orders</span>
                <span className="text-sm font-medium text-text-primary">{user._count.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Conversations</span>
                <span className="text-sm font-medium text-text-primary">{user._count.conversations}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-text-muted">Audit Events</span>
                <span className="text-sm font-medium text-text-primary">{user._count.auditLogs}</span>
              </div>
            </div>
          </div>

          <UserRoleForm userId={user.id} currentRole={user.role} currentStatus={user.status} />
        </div>
      </div>
    </div>
  )
}
