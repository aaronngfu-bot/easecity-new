'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { Settings, LogOut, CreditCard, Loader2, ExternalLink, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPortalSessionUrl } from '@/actions/stripe'

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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    trialing:   { label: '試用中',   icon: Clock,         className: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20' },
    active:     { label: '已啟用',   icon: CheckCircle,   className: 'text-green-400 bg-green-400/10 border-green-400/20' },
    past_due:   { label: '付款逾期', icon: AlertCircle,   className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
    canceled:   { label: '已取消',   icon: XCircle,       className: 'text-red-400 bg-red-400/10 border-red-400/20' },
    incomplete: { label: '設定未完成', icon: AlertCircle, className: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
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

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function SettingsClient({ user, subscription }: Props) {
  const [signingOut, setSigningOut] = useState(false)
  const [isPending, startTransition] = useTransition()

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
        alert('無法開啟帳單管理。請確認您已有有效的訂閱。')
      }
    })
  }

  return (
    <div className="space-y-6 pt-20">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary flex items-center gap-3">
          <Settings size={24} className="text-accent-cyan" />
          Account Settings
        </h1>
        <p className="text-text-secondary text-sm mt-1">管理帳號資訊與訂閱方案</p>
      </div>

      <div className="space-y-4">
        {/* Profile Info */}
        <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-4">
          <h2 className="font-display text-sm font-semibold text-text-primary">個人資訊</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-text-muted mb-1">名稱</p>
              <p className="text-sm text-text-primary">{user.name || '未設定'}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Email</p>
              <p className="text-sm text-text-primary">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">身份</p>
              <p className="text-sm text-accent-cyan font-medium">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Billing Section */}
        <div className="p-6 rounded-xl border border-border bg-bg-surface space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-text-primary flex items-center gap-2">
              <CreditCard size={18} className="text-accent-purple" />
              訂閱方案與帳單
            </h2>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-text-primary font-semibold">{subscription.planName}</span>
                <StatusBadge status={subscription.status} />
                {subscription.cancelAtPeriodEnd && (
                  <span className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">
                    到期後取消
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {subscription.status === 'trialing' && subscription.trialEnd && (
                  <div className="p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/15">
                    <p className="text-xs text-text-muted mb-1">試用期截止</p>
                    <p className="text-accent-cyan font-medium">{formatDate(subscription.trialEnd)}</p>
                  </div>
                )}
                {subscription.currentPeriodEnd && (
                  <div className="p-3 rounded-lg bg-bg-elevated border border-border">
                    <p className="text-xs text-text-muted mb-1">
                      {subscription.cancelAtPeriodEnd ? '服務到期日' : '下次扣款日'}
                    </p>
                    <p className="text-text-primary font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleManageBilling}
                disabled={isPending}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg',
                  'bg-bg-elevated border border-border text-text-primary hover:bg-border/50 hover:text-accent-cyan transition-colors',
                  'disabled:opacity-60 disabled:cursor-not-allowed'
                )}
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : (
                  <><ExternalLink size={14} className="text-text-muted" />管理帳單 / 更改方案</>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">您目前沒有有效的訂閱方案。</p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-accent-cyan text-bg-base hover:bg-accent-cyan-light transition-colors"
              >
                查看方案
              </a>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="p-6 rounded-xl border border-red-500/15 bg-bg-surface space-y-4">
          <h2 className="font-display text-sm font-semibold text-red-400">登出</h2>
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
            {signingOut ? '登出中...' : '登出'}
          </button>
        </div>
      </div>
    </div>
  )
}
