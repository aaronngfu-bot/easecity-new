'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { SkipLink } from '@/components/a11y/SkipLink'

const NAV = [
  { href: '/admin', key: 'dashboard' as const, icon: '◉' },
  { href: '/admin/users', key: 'users' as const, icon: '◎' },
  { href: '/admin/orders', key: 'orders' as const, icon: '◈' },
  { href: '/admin/contacts', key: 'contacts' as const, icon: '◇' },
  { href: '/admin/blog', key: 'blog' as const, icon: '▤' },
  { href: '/admin/media', key: 'media' as const, icon: '▣' },
  { href: '/admin/settings', key: 'settings' as const, icon: '⚙' },
  { href: '/admin/logs', key: 'logs' as const, icon: '◆' },
]

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()

  return (
    <div className="flex h-screen overflow-hidden bg-bg-void text-text-primary">
      <SkipLink />
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-bg-void">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Link href="/admin" className="flex min-w-0 items-center gap-2">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-signal/30 bg-signal/10">
              <svg viewBox="0 0 36 36" className="h-5 w-5" aria-hidden="true">
                <circle cx="18" cy="6" r="1.2" fill="#52525b" />
                <circle cx="30" cy="18" r="1.2" fill="#52525b" />
                <circle cx="18" cy="30" r="1.2" fill="#52525b" />
                <circle cx="6" cy="18" r="1.2" fill="#52525b" />
                <circle cx="18" cy="18" r="3.5" fill="#00e5cc" opacity="0.3" />
                <circle cx="18" cy="18" r="2" fill="#00e5cc" />
              </svg>
            </div>
            <span className="min-w-0 truncate font-display text-sm font-semibold tracking-[-0.03em] text-text-primary">
              easecity{' '}
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                {t.admin.brand}
              </span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label={t.a11y.primaryNav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center gap-3 rounded-md border border-transparent px-3 text-sm text-text-secondary transition-colors hover:border-border hover:bg-bg-surface hover:text-text-primary"
            >
              <span className="text-xs text-signal" aria-hidden="true">{item.icon}</span>
              <span className="min-w-0 truncate">{t.admin[item.key]}</span>
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/"
            className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-text-muted transition-colors hover:bg-bg-surface hover:text-signal"
          >
            {t.admin.backToSite}
          </Link>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-border bg-bg-void px-6">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              {t.admin.eyebrow}
            </p>
            <p className="truncate font-display text-sm font-semibold tracking-[-0.02em] text-text-primary">
              {t.admin.title}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex items-center gap-2 rounded-sm border border-signal/25 bg-signal/10 px-2.5 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-signal animate-signal-pulse" aria-hidden="true" />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">
                {t.admin.online}
              </span>
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="control-canvas flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
