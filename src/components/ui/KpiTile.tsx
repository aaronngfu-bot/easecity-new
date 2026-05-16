import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function KpiTile({
  label,
  value,
  detail,
  tone = 'default',
  className,
}: {
  label: ReactNode
  value: ReactNode
  detail?: ReactNode
  tone?: 'default' | 'signal' | 'warning' | 'danger'
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-bg-surface p-4',
        tone === 'signal' && 'border-border-accent bg-signal/5',
        tone === 'warning' && 'border-status-warning/30 bg-status-warning/10',
        tone === 'danger' && 'border-status-danger/30 bg-status-danger/10',
        className
      )}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</p>
      <p
        className={cn(
          'mt-3 font-display text-2xl font-semibold tracking-[-0.04em] tabular-nums text-text-primary',
          tone === 'signal' && 'text-signal',
          tone === 'warning' && 'text-status-warning',
          tone === 'danger' && 'text-status-danger'
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-2 text-xs leading-5 text-text-muted">{detail}</p>}
    </div>
  )
}
