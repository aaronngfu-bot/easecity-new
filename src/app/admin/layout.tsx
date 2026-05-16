import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    default: 'Admin Dashboard',
    template: '%s | Admin | easecity',
  },
}

function AdminSidebar() {
  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '◉' },
    { href: '/admin/users', label: 'Users', icon: '◎' },
    { href: '/admin/orders', label: 'Orders', icon: '◈' },
    { href: '/admin/contacts', label: 'Contacts', icon: '◇' },
    { href: '/admin/logs', label: 'Audit Logs', icon: '◆' },
  ]

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-bg-void">
      <div className="flex h-16 items-center border-b border-border px-5">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-signal/30 bg-signal/10">
            <svg viewBox="0 0 36 36" className="w-5 h-5">
              <circle cx="18" cy="6" r="1.2" fill="#52525b" />
              <circle cx="30" cy="18" r="1.2" fill="#52525b" />
              <circle cx="18" cy="30" r="1.2" fill="#52525b" />
              <circle cx="6" cy="18" r="1.2" fill="#52525b" />
              <circle cx="18" cy="18" r="3.5" fill="#00e5cc" opacity="0.3" />
              <circle cx="18" cy="18" r="2" fill="#00e5cc" />
            </svg>
          </div>
          <span className="font-display text-sm font-semibold tracking-[-0.03em] text-text-primary">
            easecity <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">Admin</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-11 items-center gap-3 rounded-md border border-transparent px-3 text-sm text-text-secondary transition-colors hover:border-border hover:bg-bg-surface hover:text-text-primary"
          >
            <span className="text-xs text-signal">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex min-h-10 items-center gap-2 rounded-md px-3 text-sm text-text-muted transition-colors hover:bg-bg-surface hover:text-signal"
        >
          ← Back to Site
        </Link>
      </div>
    </aside>
  )
}

function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-bg-void px-6">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">operator surface</p>
        <h2 className="font-display text-sm font-semibold tracking-[-0.02em] text-text-primary">
          Admin Dashboard
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-sm border border-signal/25 bg-signal/10 px-2.5 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-signal animate-signal-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-signal">System Online</span>
        </div>
      </div>
    </header>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-void text-text-primary">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="control-canvas flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
