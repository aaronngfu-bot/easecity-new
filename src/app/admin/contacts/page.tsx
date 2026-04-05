export const revalidate = 0

import { prisma } from '@/lib/db'

export default async function AdminContactsPage() {
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Contact Submissions</h1>
        <p className="text-text-secondary text-sm mt-1">{submissions.length} total submissions</p>
      </div>

      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="p-8 rounded-xl border border-border bg-bg-surface text-center text-text-muted text-sm">
            No contact submissions yet
          </div>
        ) : (
          submissions.map((sub) => (
            <div key={sub.id} className="p-5 rounded-xl border border-border bg-bg-surface space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-text-primary">{sub.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      sub.status === 'new' ? 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/25' :
                      sub.status === 'read' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' :
                      sub.status === 'replied' ? 'bg-green-500/15 text-green-400 border-green-500/25' :
                      'bg-gray-500/15 text-gray-400 border-gray-500/25'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{sub.email}{sub.company ? ` · ${sub.company}` : ''}</p>
                </div>
                <span className="text-xs text-text-muted shrink-0">
                  {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div>
                <p className="text-xs text-accent-cyan font-medium mb-1">{sub.subject}</p>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{sub.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
