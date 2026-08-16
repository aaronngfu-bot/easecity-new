export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { headers } from 'next/headers'

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const h = await headers()
  const acceptLang = h.get('accept-language') || ''
  const isZh = acceptLang.startsWith('zh')
  const locale = isZh ? 'zh-TW' : 'en-US'

  const statusLabel: Record<string, string> = isZh
    ? {
        paid: '已付款', completed: '已完成', fulfilled: '已履行',
        pending_payment: '待付款', created: '已建立',
        expired: '已過期', cancelled: '已取消', refunded: '已退款',
      }
    : {
        paid: 'Paid', completed: 'Completed', fulfilled: 'Fulfilled',
        pending_payment: 'Pending', created: 'Created',
        expired: 'Expired', cancelled: 'Cancelled', refunded: 'Refunded',
      }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              ORDERS.02
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-signal/40 to-transparent" />
            <span className="signal-badge">PAYMENTS</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-text-primary md:text-5xl">{isZh ? '付款紀錄' : 'Payment History'}</h1>
          <p className="mt-2 text-sm text-text-secondary">{isZh ? '所有訂閱付款與交易記錄' : 'All subscription payments and transactions'}</p>
        </div>
        <Link href="/dashboard" className="signal-secondary">
          {isZh ? '← 返回控制台' : '← Back to Dashboard'}
        </Link>
      </div>

      <div className="signal-panel overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="mb-4 font-mono text-sm text-text-muted">NO.TRANSACTIONS.YET</p>
            <Link href="/pricing" className="signal-cta">
              查看訂閱方案
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-border bg-bg-void/80">
                  <th className="text-left px-5 py-3 label-mono">交易 ID</th>
                  <th className="text-left px-5 py-3 label-mono">日期</th>
                  <th className="text-left px-5 py-3 label-mono">金額</th>
                  <th className="text-left px-5 py-3 label-mono">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-bg-void/60">
                    <td className="px-5 py-4 text-sm font-mono text-text-primary tracking-wider">
                      {order.id.slice(0, 16)}…
                    </td>
                    <td className="px-5 py-4 text-sm text-text-secondary font-mono">
                      {new Date(order.createdAt).toLocaleDateString(locale, {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-text-primary tabular-nums font-mono">
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
          </div>
        )}
      </div>
    </div>
  )
}

function getStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    paid:            'bg-signal/15 text-signal border-signal/25',
    completed:       'bg-signal/15 text-signal border-signal/25',
    fulfilled:       'bg-status-info/15 text-status-info border-status-info/25',
    pending_payment: 'bg-status-warning/15 text-status-warning border-status-warning/25',
    created:         'bg-bg-elevated/50 text-text-muted border-border',
    expired:         'bg-status-danger/15 text-status-danger border-status-danger/25',
    cancelled:       'bg-status-danger/15 text-status-danger border-status-danger/25',
    refunded:        'bg-status-info/15 text-status-info border-status-info/25',
  }
  return styles[status] || styles.created
}
