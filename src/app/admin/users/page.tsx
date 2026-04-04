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
          <h1 className="font-display text-2xl font-bold text-text-primary">Users</h1>
          <p className="text-text-secondary text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg-elevated/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Orders</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Joined</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-bg-elevated/30 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-text-primary">{user.name || '—'}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.role === 'SUPER_ADMIN' ? 'bg-purple-500/15 text-purple-400 border-purple-500/25' :
                    user.role === 'ADMIN' ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/25' :
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
                    className="text-xs text-accent-cyan hover:text-accent-cyan-light transition-colors"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="p-8 text-center text-text-muted text-sm">No users found</div>
        )}
      </div>
    </div>
  )
}
