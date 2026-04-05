export const revalidate = 0

import { prisma } from '@/lib/db'

export default async function AdminLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary">Audit Logs</h1>
        <p className="text-text-secondary text-sm mt-1">Recent system activity</p>
      </div>

      <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">No audit logs yet</div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">{log.user.name || log.user.email}</span>
                    <span className="text-xs text-text-muted">performed</span>
                    <code className="px-1.5 py-0.5 rounded bg-bg-elevated text-xs text-accent-cyan font-mono">
                      {log.action}
                    </code>
                    <span className="text-xs text-text-muted">on</span>
                    <span className="text-xs text-text-secondary">{log.targetType} {log.targetId.slice(0, 8)}...</span>
                  </div>
                  {log.changes && (
                    <pre className="mt-2 text-xs text-text-muted font-mono bg-bg-elevated rounded p-2 overflow-x-auto">
                      {JSON.stringify(JSON.parse(log.changes), null, 2)}
                    </pre>
                  )}
                  {log.ipAddress && (
                    <p className="text-xs text-text-muted mt-1">IP: {log.ipAddress}</p>
                  )}
                </div>
                <span className="text-xs text-text-muted shrink-0">
                  {new Date(log.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
