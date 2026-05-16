import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { StatusBadge } from './StatusBadge'

export function ProductFrame({
  title,
  meta,
  status = 'LIVE',
  children,
  className,
  bodyClassName,
}: {
  title: ReactNode
  meta?: ReactNode
  status?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border-strong bg-bg-void shadow-panel',
        className
      )}
    >
      <header className="flex min-h-12 items-center justify-between gap-4 border-b border-border bg-bg-surface/90 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-status-danger/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-status-warning/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-signal/80" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-mono text-[11px] uppercase tracking-[0.16em] text-text-primary">
              {title}
            </p>
            {meta && <p className="truncate text-xs text-text-muted">{meta}</p>}
          </div>
        </div>
        <StatusBadge tone="signal" pulse className="shrink-0">
          {status}
        </StatusBadge>
      </header>
      <div className={cn('relative bg-bg-void p-3 md:p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

export function ProductRow({
  label,
  value,
  tone = 'neutral',
}: {
  label: ReactNode
  value: ReactNode
  tone?: 'neutral' | 'signal' | 'warning' | 'danger'
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border-subtle py-2.5 last:border-b-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{label}</span>
      <span
        className={cn(
          'text-right font-mono text-xs tabular-nums',
          tone === 'signal' && 'text-signal',
          tone === 'warning' && 'text-status-warning',
          tone === 'danger' && 'text-status-danger',
          tone === 'neutral' && 'text-text-primary'
        )}
      >
        {value}
      </span>
    </div>
  )
}
