'use client'

import { useState, useTransition } from 'react'
import { signOut } from 'next-auth/react'
import { Settings, LogOut, CreditCard, Loader2, ExternalLink, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPortalSessionUrl } from '@/actions/stripe'
import { useLanguage } from '@/context/LanguageContext'
import { isZh, type Language } from '@/i18n/translations'

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

function StatusBadge({ status, language }: { status: string; language: Language }) {
  const zh = isZh(language)
  const config: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    trialing:   { label: zh ? '試用中' : 'Trial',      icon: Clock,       className: 'text-signal bg-signal/10 border-signal/25' },
    active:     { label: zh ? '已啟用' : 'Active',     icon: CheckCircle, className: 'text-signal bg-signal/10 border-signal/25' },
    past_due:   { label: zh ? '付款逾期' : 'Past due', icon: AlertCircle, className: 'text-status-warning bg-status-warning/10 border-status-warning/25' },
    canceled:   { label: zh ? '已取消' : 'Canceled',   icon: XCircle,     className: 'text-status-danger bg-red-400/10 border-red-400/25' },
    incomplete: { label: zh ? '設定未完成' : 'Incomplete', icon: AlertCircle, className: 'text-status-warning bg-status-warning/10 border-status-warning/25' },
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

function formatDate(dateStr: string | null, language: Language) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString(isZh(language) ? (language === 'zh-CN' ? 'zh-CN' : 'zh-TW') : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function SettingsClient({ user, subscription }: Props) {
  const [signingOut, setSigningOut] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { language } = useLanguage()
  const zh = isZh(language)
  const isCN = language === 'zh-CN'

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
        alert(zh ? (isCN ? '无法打开账单管理。请确认您已有有效的订阅。' : '無法開啟帳單管理。請確認您已有有效的訂閱。') : 'Unable to open billing. Please ensure you have an active subscription.')
      }
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
            SETTINGS.01
          </span>
          <span className="h-px w-12 bg-gradient-to-r from-signal/40 to-transparent" />
          <span className="signal-badge">
            <Settings size={10} />
            {zh ? (isCN ? '设置' : '設定') : 'SETTINGS'}
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.05em] text-text-primary md:text-5xl">
          {zh ? (isCN ? '账号设置' : '帳號設定') : 'Account Settings'}
        </h1>
        <p className="text-text-secondary text-sm mt-2">
          {zh ? (isCN ? '管理账号信息与订阅方案' : '管理帳號資訊與訂閱方案') : 'Manage account info and subscription plans'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Info */}
        <div className="signal-panel space-y-4 p-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
            <h2 className="label-mono text-signal/80">{zh ? (isCN ? '个人信息' : '個人資訊') : 'PROFILE'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="label-mono mb-1">{zh ? (isCN ? '名称' : '名稱') : 'Name'}</p>
              <p className="text-sm text-text-primary">{user.name || (zh ? (isCN ? '未设置' : '未設定') : 'Not set')}</p>
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
        <div className="signal-panel space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-signal/60" />
              <h2 className="label-mono text-signal/80 flex items-center gap-2">
                <CreditCard size={12} />
                {zh ? (isCN ? '订阅方案与账单' : '訂閱方案與帳單') : 'SUBSCRIPTION & BILLING'}
              </h2>
            </div>
          </div>

          {subscription ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-text-primary font-semibold">{subscription.planName}</span>
                <StatusBadge status={subscription.status} language={language} />
                {subscription.cancelAtPeriodEnd && (
                  <span className="text-xs text-status-warning bg-status-warning/10 border border-status-warning/20 px-2.5 py-1 rounded-full">
                    {zh ? (isCN ? '到期后取消' : '到期後取消') : 'Cancels at period end'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {subscription.status === 'trialing' && subscription.trialEnd && (
                  <div className="p-3 rounded-lg bg-signal/5 border border-signal/20">
                    <p className="label-mono mb-1">{zh ? (isCN ? '试用期截止' : '試用期截止') : 'Trial ends'}</p>
                    <p className="text-signal font-medium tabular-nums">{formatDate(subscription.trialEnd, language)}</p>
                  </div>
                )}
                {subscription.currentPeriodEnd && (
                  <div className="p-3 rounded-lg bg-bg-base/40 border border-border">
                    <p className="label-mono mb-1">
                      {subscription.cancelAtPeriodEnd
                        ? (zh ? (isCN ? '服务到期日' : '服務到期日') : 'Service ends')
                        : (zh ? (isCN ? '下次扣款日' : '下次扣款日') : 'Next billing')}
                    </p>
                    <p className="text-text-primary font-medium tabular-nums">{formatDate(subscription.currentPeriodEnd, language)}</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleManageBilling}
                disabled={isPending}
                className="signal-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : (
                  <>
                    <ExternalLink size={13} />
                    {zh ? (isCN ? '管理账单 / 更改方案' : '管理帳單 / 更改方案') : 'Manage billing / Change plan'}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-text-secondary">
                {zh ? (isCN ? '您目前没有有效的订阅方案。' : '您目前沒有有效的訂閱方案。') : 'You do not have an active subscription.'}
              </p>
              <a href="/pricing" className="signal-cta">
                {zh ? '查看方案' : 'See plans'}
              </a>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="signal-panel space-y-4 border-status-danger/25 p-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-status-danger/70" />
            <h2 className="label-mono !text-status-danger">{zh ? (isCN ? '退出' : '登出') : 'SIGN OUT'}</h2>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium',
              'border border-status-danger/25 text-status-danger transition-colors hover:bg-status-danger/10',
              'disabled:opacity-60 disabled:cursor-not-allowed'
            )}
          >
            <LogOut size={16} />
            {signingOut ? (zh ? (isCN ? '退出中…' : '登出中…') : 'Signing out…') : (zh ? (isCN ? '退出' : '登出') : 'Sign out')}
          </button>
        </div>
      </div>
    </div>
  )
}
