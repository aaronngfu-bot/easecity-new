'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import {
  CreditCard, CheckCircle, Clock, AlertCircle, XCircle,
  ArrowRight, Zap, Shield, Cpu, Building2,
  MessageCircle, Activity, ChevronRight, Loader2, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'
import { getPortalSessionUrl } from '@/actions/stripe'

// ─── Serialised types (Dates → string) ───────────────────────────────────────

export interface SerializedSubscription {
  status: string
  stripePriceId: string
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
  currentPeriodEnd: string | null
}

export interface SerializedOrder {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
}

interface Props {
  userName: string | null
  subscription: SerializedSubscription | null
  recentOrders: SerializedOrder[]
}

// ─── Plan metadata (icons / colours only — text comes from translations) ─────

const PLAN_STYLE: Record<string, {
  icon: React.ElementType
  tier: 'free' | 'pro' | 'premium' | 'enterprise'
  sla: string
}> = {
  starter:    { icon: Cpu,       tier: 'free',       sla: '99.5%' },
  pro:        { icon: Zap,       tier: 'pro',        sla: '99.9%' },
  business:   { icon: Shield,    tier: 'premium',    sla: '99.99%' },
  enterprise: { icon: Building2, tier: 'enterprise', sla: 'Custom' },
  unknown:    { icon: Cpu,       tier: 'free',       sla: '—' },
}

function getPlanKey(priceId: string): string {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID) return 'starter'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID)     return 'pro'
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_BIZ_PRICE_ID)     return 'business'
  return 'unknown'
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(locale === 'zh' ? 'zh-TW' : 'en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
}

// ─── ManageBillingButton ──────────────────────────────────────────────────────

function ManageBillingButton({ label, className }: { label: string; className: string }) {
  const [isPending, startTransition] = useTransition()
  const { t } = useLanguage()

  const handleClick = () => {
    startTransition(async () => {
      try {
        const url = await getPortalSessionUrl()
        window.open(url, '_blank', 'noopener,noreferrer')
      } catch {
        alert(t.dashboard.billingError)
      }
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending} className={className}>
      {isPending ? <Loader2 size={13} className="animate-spin" /> : label}
      {!isPending && <ArrowRight size={12} />}
    </button>
  )
}

// ─── AlertBanner ─────────────────────────────────────────────────────────────

function AlertBanner({ subscription }: { subscription: SerializedSubscription }) {
  const { t, language } = useLanguage()
  const trialDays = daysUntil(subscription.trialEnd)
  const periodDays = daysUntil(subscription.currentPeriodEnd)

  if (subscription.status === 'past_due') {
    return (
      <div className="glass-panel flex items-center gap-3 px-5 py-3.5 !border-yellow-500/40 text-yellow-300 text-sm">
        <AlertCircle size={16} className="shrink-0" />
        <span className="flex-1">
          {language === 'zh'
            ? '付款失敗。請更新你的付款方式以維持服務存取。'
            : 'Payment failed. Update your payment method to maintain service access.'}
        </span>
        <ManageBillingButton
          label={t.dashboard.alertUpdatePayment}
          className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:text-yellow-200 flex items-center gap-1"
        />
      </div>
    )
  }

  if (subscription.status === 'trialing' && trialDays !== null && trialDays <= 3) {
    return (
      <div className="glass-prominent flex items-center gap-3 px-5 py-3.5 text-sm">
        <Clock size={16} className="shrink-0 text-signal" />
        <span className="flex-1 text-signal">
          {language === 'zh'
            ? `試用期剩 ${trialDays} 天。到期後自動轉為正式訂閱，不需要重新設定。`
            : `${trialDays} days left in your trial. Auto-converts to paid — no reconfiguration needed.`}
        </span>
        <ManageBillingButton
          label={t.dashboard.alertManageBilling}
          className="shrink-0 text-xs font-semibold underline underline-offset-2 text-signal hover:text-signal-light flex items-center gap-1"
        />
      </div>
    )
  }

  if (subscription.cancelAtPeriodEnd && periodDays !== null && periodDays <= 7) {
    return (
      <div className="glass-panel flex items-center gap-3 px-5 py-3.5 !border-orange-500/40 text-orange-300 text-sm">
        <XCircle size={16} className="shrink-0" />
        <span className="flex-1">
          {language === 'zh'
            ? `服務將於 ${periodDays} 天後終止。如需繼續使用，請重新啟用訂閱。`
            : `Service ends in ${periodDays} days. Renew to maintain access.`}
        </span>
        <ManageBillingButton
          label={t.dashboard.alertRenew}
          className="shrink-0 text-xs font-semibold underline underline-offset-2 hover:text-orange-200 flex items-center gap-1"
        />
      </div>
    )
  }

  return null
}

// ─── SubscriptionCard ─────────────────────────────────────────────────────────

function SubscriptionCard({ subscription }: { subscription: SerializedSubscription }) {
  const { t, language } = useLanguage()
  const planKey = getPlanKey(subscription.stripePriceId)
  const style = PLAN_STYLE[planKey]
  const PlanIcon = style.icon

  const statusMap: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    trialing:   { label: t.dashboard.statusTrialing,   icon: Clock,       cls: 'text-signal bg-signal/10 border-signal/25' },
    active:     { label: t.dashboard.statusActive,     icon: CheckCircle, cls: 'text-signal bg-signal/10 border-signal/25' },
    past_due:   { label: t.dashboard.statusPastDue,    icon: AlertCircle, cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
    canceled:   { label: t.dashboard.statusCanceled,   icon: XCircle,     cls: 'text-red-400 bg-red-400/10 border-red-400/25' },
    incomplete: { label: t.dashboard.statusIncomplete, icon: AlertCircle, cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
  }
  const st = statusMap[subscription.status] ?? statusMap.incomplete
  const StatusIcon = st.icon

  const isTrialing = subscription.status === 'trialing'
  const dateLabel = subscription.cancelAtPeriodEnd
    ? t.dashboard.serviceEndsLabel
    : isTrialing
      ? t.dashboard.trialEndsLabel
      : t.dashboard.nextBillingLabel
  const dateValue = isTrialing ? subscription.trialEnd : subscription.currentPeriodEnd
  const locale = language

  const featuresByPlan: Record<string, string[]> = {
    starter:    [t.pricingPage.starterF1, t.pricingPage.starterF2, t.pricingPage.starterF3, t.pricingPage.starterF4, t.pricingPage.starterF5],
    pro:        [t.pricingPage.proF1,     t.pricingPage.proF2,     t.pricingPage.proF3,     t.pricingPage.proF4,     t.pricingPage.proF5,     t.pricingPage.proF6],
    business:   [t.pricingPage.bizF1,     t.pricingPage.bizF2,     t.pricingPage.bizF3,     t.pricingPage.bizF4,     t.pricingPage.bizF5,     t.pricingPage.bizF6, t.pricingPage.bizF7],
    enterprise: [t.pricingPage.entF1,     t.pricingPage.entF2,     t.pricingPage.entF3,     t.pricingPage.entF4,     t.pricingPage.entF5],
    unknown:    [],
  }
  const features = featuresByPlan[planKey] ?? featuresByPlan.unknown

  const planNames: Record<string, string> = {
    starter: t.pricingPage.starterName,
    pro: t.pricingPage.proName,
    business: t.pricingPage.bizName,
    enterprise: t.pricingPage.entName,
    unknown: t.dashboard.planCustomName,
  }

  const isPremium = style.tier === 'premium' || style.tier === 'enterprise'

  return (
    <div className={cn('p-6', isPremium ? 'glass-prominent' : 'glass-panel')}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center border',
            isPremium
              ? 'bg-signal/15 border-signal/30 text-signal'
              : 'bg-bg-base/40 border-border text-text-secondary'
          )}>
            <PlanIcon size={20} />
          </div>
          <div>
            <p className="label-mono mb-1">{t.dashboard.planLabel}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-xl font-bold text-text-primary">
                {planNames[planKey]}
              </span>
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', st.cls)}>
                <StatusIcon size={11} />
                {st.label}
              </span>
              {subscription.cancelAtPeriodEnd && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-orange-500/30 text-orange-400 bg-orange-500/8">
                  {t.dashboard.cancelAtPeriodEnd}
                </span>
              )}
            </div>
          </div>
        </div>

        <ManageBillingButton
          label={t.dashboard.manageBilling}
          className="glass-ghost !py-2 !px-3 !text-xs shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className={cn(
          'flex-1 min-w-[160px] px-4 py-3 rounded-xl border text-sm',
          isTrialing ? 'bg-signal/8 border-signal/20' : 'bg-bg-base/40 border-border'
        )}>
          <p className="label-mono mb-1">{dateLabel}</p>
          <p className={cn('font-semibold tabular-nums', isTrialing ? 'text-signal' : 'text-text-primary')}>
            {formatDate(dateValue, locale)}
          </p>
        </div>
        <div className="flex-1 min-w-[160px] px-4 py-3 rounded-xl border bg-bg-base/40 border-border text-sm">
          <p className="label-mono mb-1">{t.dashboard.slaLabel}</p>
          <p className="font-semibold text-text-primary font-mono tabular-nums">{style.sla} SLA</p>
        </div>
      </div>

      {features.length > 0 && (
        <div>
          <p className="label-mono mb-3">{t.dashboard.featuresLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                <CheckCircle size={13} className={isPremium ? 'text-signal' : 'text-signal/60'} />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── NoSubscriptionCard ───────────────────────────────────────────────────────

function NoSubscriptionCard() {
  const { t } = useLanguage()
  return (
    <div className="glass-panel p-8 text-center !border-dashed">
      <div className="w-14 h-14 rounded-2xl bg-bg-base/40 border border-border flex items-center justify-center mx-auto mb-4">
        <CreditCard size={22} className="text-text-muted" />
      </div>
      <h3 className="font-display text-base font-semibold text-text-primary mb-1">{t.dashboard.noSubTitle}</h3>
      <p className="text-sm text-text-muted mb-5">{t.dashboard.noSubDesc}</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/pricing" className="glass-cta">
          {t.dashboard.noSubCta}
          <ArrowRight size={14} />
        </Link>
        <Link href="/services" className="glass-ghost">
          {t.dashboard.noSubAlt}
        </Link>
      </div>
    </div>
  )
}

// ─── QuickActions ─────────────────────────────────────────────────────────────

function QuickActions() {
  const { t } = useLanguage()

  const actions = [
    { icon: Settings,      label: t.dashboard.qaSettings, desc: t.dashboard.qaSettingsDesc, href: '/dashboard/settings' },
    { icon: Zap,           label: t.dashboard.qaUpgrade,  desc: t.dashboard.qaUpgradeDesc,  href: '/pricing' },
    { icon: MessageCircle, label: t.dashboard.qaSupport,  desc: t.dashboard.qaSupportDesc,  href: '/contact' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {actions.map((a) => (
        <Link
          key={a.label}
          href={a.href}
          className="glass-panel glass-panel-interactive group flex items-center gap-3 p-4"
        >
          <div className="w-10 h-10 rounded-lg bg-bg-base/40 border border-border group-hover:bg-signal/10 group-hover:border-signal/25 flex items-center justify-center text-text-muted group-hover:text-signal transition-colors shrink-0">
            <a.icon size={17} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{a.label}</p>
            <p className="text-xs text-text-muted truncate">{a.desc}</p>
          </div>
          <ChevronRight size={14} className="text-text-muted group-hover:text-signal group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
      ))}
    </div>
  )
}

// ─── PlatformStatus ───────────────────────────────────────────────────────────

function PlatformStatus() {
  const { t } = useLanguage()
  return (
    <div className="glass-panel flex items-center justify-between px-5 py-3.5">
      <div className="flex items-center gap-3">
        <Activity size={15} className="text-signal" />
        <span className="text-sm text-text-secondary">{t.dashboard.platformStatus}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-signal animate-signal-pulse" />
        <span className="text-xs font-mono text-signal tracking-wider uppercase">{t.dashboard.platformOnline}</span>
      </div>
    </div>
  )
}

// ─── PaymentHistory ───────────────────────────────────────────────────────────

function PaymentHistory({ orders, locale }: { orders: SerializedOrder[]; locale: string }) {
  const { t } = useLanguage()
  if (orders.length === 0) return null

  const statusStyle: Record<string, string> = {
    paid:            'bg-signal/15 text-signal border-signal/25',
    completed:       'bg-signal/15 text-signal border-signal/25',
    pending_payment: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    refunded:        'bg-blue-500/15 text-blue-400 border-blue-500/25',
    cancelled:       'bg-red-500/15 text-red-400 border-red-500/25',
    expired:         'bg-red-500/15 text-red-400 border-red-500/25',
  }

  const statusLabel: Record<string, string> = {
    paid:            t.dashboard.paidLabel,
    completed:       t.dashboard.completedLabel,
    pending_payment: t.dashboard.pendingPaymentLabel,
    refunded:        t.dashboard.refundedLabel,
    cancelled:       t.dashboard.cancelledLabel,
    expired:         t.dashboard.expiredLabel,
    created:         t.dashboard.createdLabel,
  }

  return (
    <div className="glass-panel overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
          <h2 className="label-mono text-signal/80">{t.dashboard.paymentHistory}</h2>
        </div>
        <Link href="/dashboard/orders" className="text-xs text-text-muted hover:text-signal transition-colors font-mono tracking-wider">
          {t.dashboard.viewAllOrders} →
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {orders.map((order) => (
          <div key={order.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-bg-base/20 transition-colors">
            <div className="min-w-0">
              <p className="text-xs text-text-muted font-mono tracking-wider">{order.id.slice(0, 14)}…</p>
              <p className="text-xs text-text-muted mt-0.5">
                {new Date(order.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-TW' : 'en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-medium text-text-primary tabular-nums font-mono">
                {(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
              </span>
              <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', statusStyle[order.status] ?? 'bg-gray-500/15 text-gray-400 border-gray-500/25')}>
                {statusLabel[order.status] ?? order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardClient({ userName, subscription, recentOrders }: Props) {
  const { t, language } = useLanguage()

  const needsAlert = subscription && (
    subscription.status === 'past_due' ||
    (subscription.status === 'trialing' && (daysUntil(subscription.trialEnd) ?? 99) <= 3) ||
    (subscription.cancelAtPeriodEnd && (daysUntil(subscription.currentPeriodEnd) ?? 99) <= 7)
  )

  return (
    <div className="space-y-5 pt-24 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
              DASHBOARD.00
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-signal/40 to-transparent" />
            <span className="glass-badge">
              <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" />
              {language === 'zh' ? '控制台' : 'CONTROL DECK'}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
            {userName
              ? (language === 'zh' ? `${userName}，你好` : `Welcome, ${userName}`)
              : (language === 'zh' ? '控制台' : 'Dashboard')}
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            {subscription ? t.dashboard.subtitleActive : t.dashboard.subtitleInactive}
          </p>
        </div>
      </div>

      {needsAlert && subscription && <AlertBanner subscription={subscription} />}

      {subscription ? (
        <SubscriptionCard subscription={subscription} />
      ) : (
        <NoSubscriptionCard />
      )}

      <QuickActions />

      <PlatformStatus />

      <PaymentHistory orders={recentOrders} locale={language} />
    </div>
  )
}
