import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PanelTone = 'default' | 'raised' | 'highlight' | 'paper' | 'danger'

const toneClasses: Record<PanelTone, string> = {
  default: 'border-border bg-bg-surface text-text-primary',
  raised: 'border-border-strong bg-bg-elevated text-text-primary shadow-card',
  highlight:
    'border-border-accent bg-[linear-gradient(135deg,rgba(0,229,204,0.10),#171d22_42%,#101418)] text-text-primary shadow-panel',
  paper: 'border-paper-border bg-paper-card text-paper-ink shadow-paper',
  danger: 'border-status-danger/30 bg-status-danger/10 text-text-primary',
}

interface SignalPanelProps extends HTMLAttributes<HTMLDivElement> {
  tone?: PanelTone
  children: ReactNode
}

export function SignalPanel({
  tone = 'default',
  className,
  children,
  ...props
}: SignalPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border transition-colors duration-200',
        toneClasses[tone],
        className
      )}
      {...props}
    >
      {tone === 'highlight' && (
        <span className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-signal to-transparent" />
      )}
      {children}
    </div>
  )
}

export function PanelHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-current">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
