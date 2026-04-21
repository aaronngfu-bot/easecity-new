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
    <aside className="w-64 border-r border-border bg-bg-surface flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-lg glass-panel flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-5 h-5">
              <circle cx="18" cy="6" r="1.2" fill="#52525b" />
              <circle cx="30" cy="18" r="1.2" fill="#52525b" />
              <circle cx="18" cy="30" r="1.2" fill="#52525b" />
              <circle cx="6" cy="18" r="1.2" fill="#52525b" />
              <circle cx="18" cy="18" r="3.5" fill="#22ff88" opacity="0.3" />
              <circle cx="18" cy="18" r="2" fill="#22ff88" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm text-text-primary">
            easecity <span className="text-signal font-mono text-xs tracking-wider uppercase">Admin</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <span className="text-signal text-xs">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
        >
          ← Back to Site
        </Link>
      </div>
    </aside>
  )
}

function AdminHeader() {
  return (
    <header className="h-16 border-b border-border bg-bg-surface flex items-center justify-between px-6">
      <h2 className="font-display text-sm font-semibold text-text-secondary">
        Admin Dashboard
      </h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-signal animate-signal-pulse" />
          <span className="text-xs text-signal/80 font-mono tracking-wider uppercase">System Online</span>
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
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6 bg-bg-base">
          {children}
        </main>
      </div>
    </div>
  )
}
