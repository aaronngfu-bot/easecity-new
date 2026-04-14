export const revalidate = 0

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

  const statusLabel: Record<string, string> = {
    paid: '已付款', completed: '已完成', fulfilled: '已履行',
    pending_payment: '待付款', created: '已建立',
    expired: '已過期', cancelled: '已取消', refunded: '已退款',
  }

  return (
    <div className="space-y-6 pt-20 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">付款紀錄</h1>
          <p className="text-text-secondary text-sm mt-1">所有訂閱付款與交易記錄</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          ← 返回控制台
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-text-muted text-sm mb-4">尚無付款紀錄</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all"
            >
              查看訂閱方案
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg-elevated/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">交易 ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">日期</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">金額</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-bg-elevated/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-mono text-text-primary">
                    {order.id.slice(0, 16)}…
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {new Date(order.createdAt).toLocaleDateString('zh-TW', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-text-primary tabular-nums">
                    {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(order.status)}`}>
                      {statusLabel[order.status] ?? order.status}
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
