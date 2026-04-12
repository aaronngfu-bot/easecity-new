export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { CreditCard, CheckCircle, Clock, AlertCircle, XCircle, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

function getPlanName(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) return 'Starter'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'Pro'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID) return 'Business'
  return '訂閱方案'
}

function formatDate(date: Date | null) {
  if (!date) return null
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string; border: string }> = {
  trialing:   { label: '試用中',     icon: Clock,         className: 'text-accent-cyan',  border: 'border-accent-cyan/30' },
  active:     { label: '已啟用',     icon: CheckCircle,   className: 'text-green-400',    border: 'border-green-500/30' },
  past_due:   { label: '付款逾期',   icon: AlertCircle,   className: 'text-yellow-400',   border: 'border-yellow-500/30' },
  canceled:   { label: '已取消',     icon: XCircle,       className: 'text-red-400',      border: 'border-red-500/30' },
  incomplete: { label: '設定未完成', icon: AlertCircle,   className: 'text-yellow-400',   border: 'border-yellow-500/30' },
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [orderCount, recentOrders, subscription] = await Promise.all([
    prisma.order.count({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ])

  const statusCfg = subscription ? (statusConfig[subscription.status] ?? statusConfig.incomplete) : null

  return (
    <div className="space-y-6 pt-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            歡迎回來，{session.user.name || 'User'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">管理你的帳號與訂閱</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/orders"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            全部訂單
          </Link>
          <Link
            href="/dashboard/settings"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            設定
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-border bg-bg-surface">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">總訂單數</p>
          <p className="font-display text-2xl font-bold text-text-primary mt-2">{orderCount}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-surface">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">帳號身份</p>
          <p className="font-display text-2xl font-bold text-accent-cyan mt-2">{session.user.role}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-bg-surface">
          <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Email</p>
          <p className="text-sm text-text-primary mt-2 truncate">{session.user.email}</p>
        </div>
      </div>

      {/* Subscription Card */}
      {subscription && statusCfg ? (
        <div className={cn(
          'p-6 rounded-xl border bg-bg-surface',
          statusCfg.border
        )}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-bg-elevated', statusCfg.className)}>
                <CreditCard size={20} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">目前方案</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-xl font-bold text-text-primary">
                    {getPlanName(subscription.stripePriceId)}
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    statusCfg.className,
                    statusCfg.border,
                    'bg-transparent'
                  )}>
                    <statusCfg.icon size={11} />
                    {statusCfg.label}
                  </span>
                  {subscription.cancelAtPeriodEnd && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-yellow-500/30 text-yellow-400">
                      到期後取消
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/settings"
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-border text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/40 transition-colors"
            >
              管理帳單
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {subscription.status === 'trialing' && subscription.trialEnd && (
              <div className="px-4 py-2.5 rounded-lg bg-accent-cyan/5 border border-accent-cyan/15 text-sm">
                <span className="text-text-muted text-xs">試用期截止：</span>
                <span className="text-accent-cyan font-medium ml-1.5">{formatDate(subscription.trialEnd)}</span>
              </div>
            )}
            {subscription.currentPeriodEnd && (
              <div className="px-4 py-2.5 rounded-lg bg-bg-elevated border border-border text-sm">
                <span className="text-text-muted text-xs">
                  {subscription.cancelAtPeriodEnd ? '服務到期日：' : '下次扣款日：'}
                </span>
                <span className="text-text-primary font-medium ml-1.5">{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-dashed border-border bg-bg-surface flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-bg-elevated text-text-muted">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">尚未訂閱任何方案</p>
              <p className="text-xs text-text-muted mt-0.5">立即訂閱，解鎖完整功能</p>
            </div>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl bg-accent-cyan text-bg-base hover:bg-accent-cyan-light transition-colors"
          >
            查看方案
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-bg-surface">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display text-sm font-semibold text-text-primary">最近訂單</h2>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-muted text-sm">尚無訂單記錄</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-primary font-mono">{order.id.slice(0, 12)}...</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('zh-TW')}
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
    paid:            'bg-green-500/15 text-green-400 border-green-500/25',
    completed:       'bg-green-500/15 text-green-400 border-green-500/25',
    fulfilled:       'bg-blue-500/15 text-blue-400 border-blue-500/25',
    pending_payment: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    created:         'bg-gray-500/15 text-gray-400 border-gray-500/25',
    expired:         'bg-red-500/15 text-red-400 border-red-500/25',
    cancelled:       'bg-red-500/15 text-red-400 border-red-500/25',
    refunded:        'bg-purple-500/15 text-purple-400 border-purple-500/25',
  }
  return (
    <span className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-medium border',
      styles[status] ?? styles.created
    )}>
      {status.replace('_', ' ')}
    </span>
  )
}
