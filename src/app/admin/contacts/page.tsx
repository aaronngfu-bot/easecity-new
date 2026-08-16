export const revalidate = 0

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/db'

export default async function AdminContactsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !isAdmin(session.user.role)) {
    redirect('/dashboard')
  }

  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="label-mono mb-2 text-signal">ADMIN.CONTACTS</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Contact Submissions</h1>
        <p className="mt-1 text-sm text-text-secondary">{submissions.length} total submissions</p>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="rounded-lg border border-border bg-bg-surface p-8 text-center text-sm text-text-muted">
            No contact submissions yet
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="space-y-3 rounded-lg border border-border bg-bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-text-primary">{sub.name}</h3>
                    <span className={`rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] ${
                      sub.status === 'new' ? 'bg-signal/15 text-signal border-signal/25' :
                      sub.status === 'read' ? 'bg-status-warning/15 text-status-warning border-status-warning/25' :
                      sub.status === 'replied' ? 'bg-status-success/15 text-status-success border-status-success/25' :
                      'bg-bg-elevated/50 text-text-muted border-border'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{sub.email}{sub.company ? ` · ${sub.company}` : ''}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-text-muted">
                  {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-signal">{sub.subject}</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{sub.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
