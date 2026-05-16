import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StatusTone = 'signal' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const toneClasses: Record<StatusTone, string> = {
  signal: 'border-signal/30 bg-signal/10 text-signal',
  success: 'border-status-success/30 bg-status-success/10 text-status-success',
  warning: 'border-status-warning/35 bg-status-warning/10 text-status-warning',
  danger: 'border-status-danger/35 bg-status-danger/10 text-status-danger',
  info: 'border-status-info/35 bg-status-info/10 text-status-info',
  neutral: 'border-border bg-bg-elevated text-text-muted',
}

export function StatusBadge({
  children,
  tone = 'neutral',
  pulse = false,
  className,
}: {
  children: ReactNode
  tone?: StatusTone
  pulse?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.16em]',
        toneClasses[tone],
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'signal' && 'bg-signal',
          tone === 'success' && 'bg-status-success',
          tone === 'warning' && 'bg-status-warning',
          tone === 'danger' && 'bg-status-danger',
          tone === 'info' && 'bg-status-info',
          tone === 'neutral' && 'bg-text-faint',
          pulse && 'animate-signal-pulse'
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  )
}
