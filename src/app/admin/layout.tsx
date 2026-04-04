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
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5">
              <circle cx="10" cy="10" r="3" fill="white" />
              <line x1="10" y1="2" x2="10" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="10" y1="13" x2="10" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="2" y1="10" x2="7" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="13" y1="10" x2="18" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm text-text-primary">
            easecity <span className="text-accent-cyan">Admin</span>
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
            <span className="text-accent-cyan text-xs">{item.icon}</span>
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
          <div className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse-slow" />
          <span className="text-xs text-text-muted font-mono">System Online</span>
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
