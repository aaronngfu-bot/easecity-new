export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'
import Link from 'next/link'

/**
 * Admin live-support inbox: every waiting/active chat session. Clicking
 * through opens the shared SupportConsole (same component + API as the
 * emailed magic link) with a server-minted agent token — no email needed.
 */
export default async function AdminSupportPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  const sessions = await prisma.supportSession.findMany({
    where: { status: { in: ['waiting', 'active'] } },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true, role: true } },
      _count: { select: { messages: true } },
    },
  })

  const badge = (status: string) =>
    status === 'waiting'
      ? 'bg-status-warning/10 text-status-warning border-status-warning/25'
      : 'bg-signal/10 text-signal border-signal/25'

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.SUPPORT</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Live support</h1>
        <p className="mt-1 text-sm text-text-secondary">
          {sessions.filter((s) => s.status === 'waiting').length} waiting · {sessions.length} open conversations
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead>
              <tr className="border-b border-border bg-bg-void/80">
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Visitor</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Status</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Language</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Last message</th>
                <th className="px-5 py-3 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Updated</th>
                <th className="px-5 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-bg-void/60">
                  <td className="px-5 py-4">
                    <p className="text-sm text-text-primary">{s.name || 'Visitor'}</p>
                    <p className="text-xs text-text-muted">{s.email || s.pageUrl || '—'}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${badge(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs uppercase text-text-secondary">{s.language}</td>
                  <td className="max-w-[280px] truncate px-5 py-4 text-sm text-text-secondary">
                    {s.messages[0] ? `${s.messages[0].role === 'agent' ? '↩ ' : ''}${s.messages[0].content}` : '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-text-secondary">
                    {new Date(s.updatedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/support/${s.id}`}
                      className="text-xs text-signal hover:text-signal-light transition-colors"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sessions.length === 0 && (
          <div className="p-8 text-center text-sm text-text-muted">No open support sessions</div>
        )}
      </div>
    </div>
  )
}
