import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function DataTableShell({
  title,
  description,
  action,
  children,
  className,
}: {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('overflow-hidden rounded-lg border border-border bg-bg-surface', className)}>
      {(title || description || action) && (
        <div className="flex flex-col gap-4 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h2 className="font-display text-xl font-semibold tracking-[-0.03em] text-text-primary">
                {title}
              </h2>
            )}
            {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </section>
  )
}

export const tableClassName =
  'min-w-full divide-y divide-border text-left text-sm text-text-secondary'

export const tableHeadClassName =
  'bg-bg-void/80 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted'

export const tableCellClassName = 'px-4 py-3 align-middle'
