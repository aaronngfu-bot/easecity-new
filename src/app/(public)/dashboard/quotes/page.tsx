import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

/**
 * Logged-in customer view of their quotes (matched by account email).
 * Deep-links into the shared quote page — already authed there by email,
 * so no token needed.
 */
/** Cheap locale guess from the account email — dashboard copy language. */
function localeFromEmail(email: string): string {
  // No locale data on the session; default English. Quotes themselves render
  // in the quote's language on their own page.
  return 'en'
}

export default async function DashboardQuotesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  const email = session.user.email!
  if (!email) redirect('/dashboard')

  const quotes = await prisma.quote.findMany({
    where: { clientEmail: email, status: { not: 'draft' } },
    orderBy: { createdAt: 'desc' },
  })

  const statusStyle: Record<string, string> = {
    sent: 'bg-signal/10 text-signal border-signal/25',
    confirmed: 'bg-status-warning/10 text-status-warning border-status-warning/25',
    converted: 'bg-status-warning/10 text-status-warning border-status-warning/25',
    paid: 'bg-status-success/15 text-status-success border-status-success/25',
    cancelled: 'bg-status-danger/10 text-status-danger border-status-danger/25',
    expired: 'bg-bg-elevated text-text-muted border-border',
  }

  const money = (itemsJson: string, currency: string) => {
    try {
      const items = JSON.parse(itemsJson) as { qty: number; unitPrice: number }[]
      const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)
      return `${(total / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency.toUpperCase()}`
    } catch {
      return '—'
    }
  }

  const labels = {
    en: { title: 'My quotes', number: 'Number', total: 'Total', status: 'Status', valid: 'Valid until', view: 'View', empty: 'No quotes yet — quotes we send you appear here.' },
    zh: { title: '我的報價', number: '編號', total: '金額', status: '狀態', valid: '有效期', view: '查看', empty: '暫時沒有報價——我們發送的報價會顯示在這裡。' },
    'zh-CN': { title: '我的报价', number: '编号', total: '金额', status: '状态', valid: '有效期', view: '查看', empty: '暂时没有报价——我们发送的报价会显示在这里。' },
  }
  const t = labels[localeFromEmail(email) as 'en' | 'zh' | 'zh-CN'] ?? labels.en

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ACCOUNT.QUOTES</p>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.04em] text-text-primary">{t.title}</h1>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface p-8 text-center text-sm text-text-muted">{t.empty}</div>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <div key={q.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg-surface p-4">
              <div className="min-w-0">
                <p className="font-mono text-xs text-text-primary">{q.number}</p>
                <p className="mt-0.5 text-sm text-text-secondary">
                  {money(q.items, q.currency)}
                  {q.validUntil && ` · ${t.valid} ${new Date(q.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${statusStyle[q.status] || statusStyle.expired}`}>
                  {q.status}
                </span>
                <Link
                  href={`/quote/${q.id}`}
                  className="text-xs text-signal transition-colors hover:text-signal-light"
                >
                  {t.view} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
