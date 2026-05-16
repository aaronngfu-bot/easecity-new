import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-dashed border-border bg-bg-void/40 px-6 py-10 text-center',
        className
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-bg-surface text-signal">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl font-semibold tracking-[-0.03em] text-text-primary">
        {title}
      </h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
