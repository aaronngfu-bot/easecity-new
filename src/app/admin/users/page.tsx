export const revalidate = 0

import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-mono mb-2 text-signal">ADMIN.USERS</p>
          <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">{users.length} total users</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-bg-void/80">
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">User</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Role</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Status</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Orders</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Joined</th>
                <th className="px-5 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-bg-void/60">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-text-primary">{user.name || '—'}</p>
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-500/15 text-purple-400 border-purple-500/25' :
                      user.role === 'ADMIN' ? 'bg-signal/15 text-signal border-signal/25' :
                      'bg-gray-500/15 text-gray-400 border-gray-500/25'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      user.status === 'ACTIVE' ? 'bg-green-500/15 text-green-400 border-green-500/25' :
                      'bg-red-500/15 text-red-400 border-red-500/25'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{user._count.orders}</td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-xs text-signal hover:text-signal-light transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-text-muted text-sm">No users found</div>
        )}
      </div>
    </div>
  )
}
