export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import {
  CreditCard, CheckCircle, Clock, AlertCircle, XCircle,
  ArrowRight, ArrowUpRight, Zap, Shield, Cpu, Building2,
  MessageCircle, Activity, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Subscription, Order } from '@prisma/client'

// ─── Plan metadata ────────────────────────────────────────────────────────────

const PLAN_META: Record<string, {
  name: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  features: string[]
  sla: string
}> = {
  starter: {
    name: 'Starter',
    icon: Cpu,
    color: 'text-text-secondary',
    bg: 'bg-bg-elevated',
    border: 'border-border',
    sla: '99.5%',
    features: ['1 個控制中樞', '最多 5 個端點', '720p 串流品質', '基本監控儀表板', '電郵支援'],
  },
  pro: {
    name: 'Pro',
    icon: Zap,
    color: 'text-accent-cyan',
    bg: 'bg-accent-cyan/10',
    border: 'border-accent-cyan/30',
    sla: '99.9%',
    features: ['3 個控制中樞', '無限端點', '4K 串流品質', '進階分析', '優先支援（12 小時）', 'API 存取'],
  },
  business: {
    name: 'Business',
    icon: Shield,
    color: 'text-accent-purple',
    bg: 'bg-accent-purple/10',
    border: 'border-accent-purple/30',
    sla: '99.99%',
    features: ['10 個控制中樞', '無限端點', '4K HDR 串流', '專用基礎設施', '24/7 隨叫隨到支援', 'SSO / SAML', '完整審計追蹤'],
  },
  enterprise: {
    name: 'Enterprise',
    icon: Building2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    sla: '自訂 SLA',
    features: ['一切無限', '本地部署選項', '8K / 自訂編解碼器', '專屬客戶成功團隊', '自訂 MSA / DPA'],
  },
}

function getPlanKey(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return 'pro'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID) return 'business'
  return 'starter'
}

function formatDate(date: Date | null) {
  if (!date) return '—'
  return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

function daysUntil(date: Date | null): number | null {
  if (!date) return null
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AlertBanner({ subscription }: { subscription: Subscription }) {
  const days = daysUntil(subscription.trialEnd)
  const periodDays = daysUntil(subscription.currentPeriodEnd)

  if (subscription.status === 'past_due') {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-yellow-500/40 bg-yellow-500/8 text-yellow-300 text-sm">
        <AlertCircle size={16} className="shrink-0" />
        <span>
          <strong>付款失敗。</strong> 請更新你的付款方式以維持服務存取。
        </span>
        <Link href="/dashboard/settings" className="ml-auto shrink-0 text-xs font-semibold underline underline-offset-2 hover:text-yellow-200">
          更新付款方式 →
        </Link>
      </div>
    )
  }

  if (subscription.status === 'trialing' && days !== null && days <= 3) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-accent-cyan/40 bg-accent-cyan/8 text-accent-cyan text-sm">
        <Clock size={16} className="shrink-0" />
        <span>
          <strong>試用期剩 {days} 天。</strong> 到期後自動轉為正式訂閱，不需要重新設定。
        </span>
        <Link href="/dashboard/settings" className="ml-auto shrink-0 text-xs font-semibold underline underline-offset-2 hover:text-accent-cyan-light">
          管理帳單 →
        </Link>
      </div>
    )
  }

  if (subscription.cancelAtPeriodEnd && periodDays !== null && periodDays <= 7) {
    return (
      <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-orange-500/40 bg-orange-500/8 text-orange-300 text-sm">
        <XCircle size={16} className="shrink-0" />
        <span>
          <strong>服務將於 {periodDays} 天後終止。</strong> 如需繼續使用，請重新啟用訂閱。
        </span>
        <Link href="/dashboard/settings" className="ml-auto shrink-0 text-xs font-semibold underline underline-offset-2 hover:text-orange-200">
          重新啟用 →
        </Link>
      </div>
    )
  }

  return null
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const planKey = getPlanKey(subscription.stripePriceId)
  const plan = PLAN_META[planKey]
  const PlanIcon = plan.icon

  const statusMap: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    trialing:   { label: '試用中',     icon: Clock,         cls: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/25' },
    active:     { label: '已啟用',     icon: CheckCircle,   cls: 'text-green-400 bg-green-400/10 border-green-400/25' },
    past_due:   { label: '付款逾期',   icon: AlertCircle,   cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
    canceled:   { label: '已取消',     icon: XCircle,       cls: 'text-red-400 bg-red-400/10 border-red-400/25' },
    incomplete: { label: '設定未完成', icon: AlertCircle,   cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
  }
  const st = statusMap[subscription.status] ?? statusMap.incomplete
  const StatusIcon = st.icon

  const isTrialing = subscription.status === 'trialing'
  const dateLabel = subscription.cancelAtPeriodEnd ? '服務到期日' : isTrialing ? '試用截止' : '下次扣款日'
  const dateValue = isTrialing ? subscription.trialEnd : subscription.currentPeriodEnd

  return (
    <div className={cn('p-6 rounded-2xl border bg-bg-surface', plan.border)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', plan.bg)}>
            <PlanIcon size={20} className={plan.color} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-mono uppercase tracking-wider mb-1">目前方案</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-xl font-bold text-text-primary">{plan.name}</span>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', st.cls)}>
                <StatusIcon size={11} />
                {st.label}
              </span>
              {subscription.cancelAtPeriodEnd && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-orange-500/30 text-orange-400 bg-orange-500/8">
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

      {/* Date Info */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className={cn(
          'flex-1 min-w-[160px] px-4 py-3 rounded-xl border text-sm',
          isTrialing ? 'bg-accent-cyan/5 border-accent-cyan/15' : 'bg-bg-elevated border-border'
        )}>
          <p className="text-xs text-text-muted mb-1">{dateLabel}</p>
          <p className={cn('font-semibold', isTrialing ? 'text-accent-cyan' : 'text-text-primary')}>
            {formatDate(dateValue)}
          </p>
        </div>
        <div className="flex-1 min-w-[160px] px-4 py-3 rounded-xl border bg-bg-elevated border-border text-sm">
          <p className="text-xs text-text-muted mb-1">正常運行保證</p>
          <p className="font-semibold text-text-primary">{plan.sla} SLA</p>
        </div>
      </div>

      {/* Plan Features */}
      <div>
        <p className="text-xs text-text-muted font-semibold uppercase tracking-wider mb-3">方案功能</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {plan.features.map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-text-secondary">
              <CheckCircle size={13} className={plan.color} />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NoSubscriptionCard() {
  return (
    <div className="p-8 rounded-2xl border border-dashed border-border bg-bg-surface text-center">
      <div className="w-12 h-12 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
        <CreditCard size={22} className="text-text-muted" />
      </div>
      <h3 className="font-display text-base font-semibold text-text-primary mb-1">尚未訂閱任何方案</h3>
      <p className="text-sm text-text-muted mb-5">訂閱後即可存取串流控制平台，並享有 3 天免費試用。</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-accent-cyan text-bg-base hover:bg-accent-cyan-light transition-colors"
        >
          查看方案與定價
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          了解服務功能
        </Link>
      </div>
    </div>
  )
}

function QuickActions({ hasSubscription }: { hasSubscription: boolean }) {
  const actions = [
    {
      icon: CreditCard,
      label: '管理帳單',
      desc: '更改方案、付款方式或取消訂閱',
      href: '/dashboard/settings',
      show: hasSubscription,
      external: false,
    },
    {
      icon: ArrowUpRight,
      label: '升級方案',
      desc: '解鎖更多端點與進階功能',
      href: '/pricing',
      show: true,
      external: false,
    },
    {
      icon: MessageCircle,
      label: '聯絡支援',
      desc: '企業整合或技術問題諮詢',
      href: '/contact',
      show: true,
      external: false,
    },
  ].filter(a => a.show)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className="group flex items-center gap-3 p-4 rounded-xl border border-border bg-bg-surface hover:border-accent-cyan/30 hover:bg-bg-elevated transition-all duration-200"
        >
          <div className="w-9 h-9 rounded-lg bg-bg-elevated group-hover:bg-accent-cyan/10 flex items-center justify-center text-text-muted group-hover:text-accent-cyan transition-colors shrink-0">
            <a.icon size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{a.label}</p>
            <p className="text-xs text-text-muted truncate">{a.desc}</p>
          </div>
          <ChevronRight size={14} className="text-text-muted group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      ))}
    </div>
  )
}

function PlatformStatus() {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 rounded-xl border border-border bg-bg-surface">
      <div className="flex items-center gap-3">
        <Activity size={15} className="text-green-400" />
        <span className="text-sm text-text-secondary">平台運行狀態</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-mono text-green-400">所有系統正常 — 香港</span>
      </div>
    </div>
  )
}

function PaymentHistory({ orders }: { orders: Order[] }) {
  if (orders.length === 0) return null

  const statusStyles: Record<string, string> = {
    paid:            'bg-green-500/15 text-green-400 border-green-500/25',
    completed:       'bg-green-500/15 text-green-400 border-green-500/25',
    pending_payment: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    refunded:        'bg-purple-500/15 text-purple-400 border-purple-500/25',
    cancelled:       'bg-red-500/15 text-red-400 border-red-500/25',
    expired:         'bg-red-500/15 text-red-400 border-red-500/25',
  }

  const statusLabel: Record<string, string> = {
    paid: '已付款', completed: '已完成', pending_payment: '待付款',
    refunded: '已退款', cancelled: '已取消', expired: '已過期', created: '已建立',
  }

  return (
    <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-text-primary">付款紀錄</h2>
        <Link href="/dashboard/orders" className="text-xs text-text-muted hover:text-accent-cyan transition-colors font-mono">
          查看全部 →
        </Link>
      </div>
      <div className="divide-y divide-border">
        {orders.map((order) => (
          <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-text-muted font-mono">{order.id.slice(0, 14)}…</p>
              <p className="text-xs text-text-muted mt-0.5">
                {new Date(order.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-medium text-text-primary tabular-nums">
                {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
              </span>
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusStyles[order.status] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/25')}>
                {statusLabel[order.status] ?? order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const [subscription, recentOrders] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ])

  const needsAlert = subscription && (
    subscription.status === 'past_due' ||
    subscription.status === 'trialing' ||
    subscription.cancelAtPeriodEnd
  )

  return (
    <div className="space-y-5 pt-20 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary">
            {session.user.name ? `${session.user.name}，你好` : '控制台'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {subscription
              ? '你的串流控制服務正在運行中'
              : '訂閱後即可存取串流控制基礎設施'}
          </p>
        </div>
        <Link
          href="/dashboard/settings"
          className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          帳號設定
        </Link>
      </div>

      {/* Alert Banner */}
      {needsAlert && <AlertBanner subscription={subscription} />}

      {/* Subscription */}
      {subscription ? (
        <SubscriptionCard subscription={subscription} />
      ) : (
        <NoSubscriptionCard />
      )}

      {/* Quick Actions */}
      <QuickActions hasSubscription={!!subscription} />

      {/* Platform Status */}
      <PlatformStatus />

      {/* Payment History */}
      <PaymentHistory orders={recentOrders} />
    </div>
  )
}
