'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { Settings, LogOut, CreditCard, Loader2, ExternalLink, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPortalSessionUrl } from '@/actions/stripe'
import { useLanguage } from '@/context/LanguageContext'

interface SubscriptionInfo {
  status: string
  planName: string
  cancelAtPeriodEnd: boolean
  trialEnd: string | null
  currentPeriodEnd: string | null
}

interface Props {
  user: {
    name: string | null
    email: string | null
    role: string
  }
  subscription: SubscriptionInfo | null
}

function StatusBadge({ status, language }: { status: string; language: string }) {
  const zh = language === 'zh'
  const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    trialing:   { label: zh ? '試用中' : 'Trial',      icon: Clock,       className: 'text-signal bg-signal/10 border-signal/25' },
    active:     { label: zh ? '已啟用' : 'Active',     icon: CheckCircle, className: 'text-signal bg-signal/10 border-signal/25' },
    past_due:   { label: zh ? '付款逾期' : 'Past due', icon: AlertCircle, className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
    canceled:   { label: zh ? '已取消' : 'Canceled',   icon: XCircle,     className: 'text-red-400 bg-red-400/10 border-red-400/25' },
    incomplete: { label: zh ? '設定未完成' : 'Incomplete', icon: AlertCircle, className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' },
  }
  const c = config[status] ?? { label: status, icon: Clock, className: 'text-text-muted bg-bg-elevated border-border' }
  const Icon = c.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', c.className)}>
      <Icon size={12} />
      {c.label}
    </span>
  )
}

function formatDate(dateStr: string | null, language: string) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString(language === 'zh' ? 'zh-TW' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function SettingsClient({ user, subscription }: Props) {
  const [signingOut, setSigningOut] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { language } = useLanguage()
  const zh = language === 'zh'

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut({ callbackUrl: '/' })
  }

  const handleManageBilling = () => {
    startTransition(async () => {
      try {
        const url = await getPortalSessionUrl()
        window.open(url, '_blank', 'noopener,noreferrer')
      } catch {
        alert(zh ? '無法開啟帳單管理。請確認您已有有效的訂閱。' : 'Unable to open billing. Please ensure you have an active subscription.')
      }
    })
  }

  return (
    <div className="space-y-5 pt-24 pb-16">
      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
            SETTINGS.01
          </span>
          <span className="h-px w-12 bg-gradient-to-r from-signal/40 to-transparent" />
          <span className="glass-badge">
            <Settings size={10} />
            {zh ? '設定' : 'SETTINGS'}
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary tracking-tight">
          {zh ? '帳號設定' : 'Account Settings'}
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          {zh ? '管理帳號資訊與訂閱方案' : 'Manage account info and subscription plans'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Info */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
            <h2 className="label-mono text-signal/80">{zh ? '個人資訊' : 'PROFILE'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="label-mono mb-1">{zh ? '名稱' : 'Name'}</p>
              <p className="text-sm text-text-primary">{user.name || (zh ? '未設定' : 'Not set')}</p>
            </div>
            <div>
              <p className="label-mono mb-1">Email</p>
              <p className="text-sm text-text-primary font-mono">{user.email}</p>
            </div>
            <div>
              <p className="label-mono mb-1">{zh ? '身份' : 'Role'}</p>
              <p className="text-sm text-signal font-mono tracking-wider">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
              <h2 className="label-mono text-signal/80 flex items-center gap-2">
                <CreditCard size={12} />
                {zh ? '訂閱方案與帳單' : 'SUBSCRIPTION & BILLING'}
              </h2>
            </div>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-text-primary font-semibold">{subscription.planName}</span>
                <StatusBadge status={subscription.status} language={language} />
                {subscription.cancelAtPeriodEnd && (
                  <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">
                    {zh ? '到期後取消' : 'Cancels at period end'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {subscription.status === 'trialing' && subscription.trialEnd && (
                  <div className="p-3 rounded-lg bg-signal/5 border border-signal/20">
                    <p className="label-mono mb-1">{zh ? '試用期截止' : 'Trial ends'}</p>
                    <p className="text-signal font-medium tabular-nums">{formatDate(subscription.trialEnd, language)}</p>
                  </div>
                )}
                {subscription.currentPeriodEnd && (
                  <div className="p-3 rounded-lg bg-bg-base/40 border border-border">
                    <p className="label-mono mb-1">
                      {subscription.cancelAtPeriodEnd
                        ? (zh ? '服務到期日' : 'Service ends')
                        : (zh ? '下次扣款日' : 'Next billing')}
                    </p>
                    <p className="text-text-primary font-medium tabular-nums">{formatDate(subscription.currentPeriodEnd, language)}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleManageBilling}
                disabled={isPending}
                className="glass-ghost disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : (
                  <>
                    <ExternalLink size={13} />
                    {zh ? '管理帳單 / 更改方案' : 'Manage billing / Change plan'}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                {zh ? '您目前沒有有效的訂閱方案。' : 'You do not have an active subscription.'}
              </p>
              <a href="/pricing" className="glass-cta">
                {zh ? '查看方案' : 'See plans'}
              </a>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="glass-panel p-6 space-y-4 !border-red-500/20">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400/70" />
            <h2 className="label-mono !text-red-400/80">{zh ? '登出' : 'SIGN OUT'}</h2>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg',
              'border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-colors',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            <LogOut size={16} />
            {signingOut ? (zh ? '登出中…' : 'Signing out…') : (zh ? '登出' : 'Sign out')}
          </button>
        </div>
      </div>
    </div>
  )
}
