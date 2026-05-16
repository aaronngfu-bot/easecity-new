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
        <p className="label-mono mb-2 text-signal">ADMIN.AUDIT</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Audit Logs</h1>
        <p className="mt-1 text-sm text-text-secondary">Recent system activity</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-bg-surface">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">No audit logs yet</div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-bg-void/60">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary">{log.user.name || log.user.email}</span>
                    <span className="text-xs text-text-muted">performed</span>
                    <code className="rounded-sm border border-signal/20 bg-signal/10 px-1.5 py-0.5 font-mono text-xs text-signal">
                      {log.action}
                    </code>
                    <span className="text-xs text-text-muted">on</span>
                    <span className="text-xs text-text-secondary">{log.targetType} {log.targetId.slice(0, 8)}...</span>
                  </div>
                  {log.changes && (
                    <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-bg-void p-2 font-mono text-xs text-text-muted">
                      {JSON.stringify(JSON.parse(log.changes), null, 2)}
                    </pre>
                  )}
                  {log.ipAddress && (
                    <p className="text-xs text-text-muted mt-1">IP: {log.ipAddress}</p>
                  )}
                </div>
                <span className="shrink-0 font-mono text-xs text-text-muted">
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
