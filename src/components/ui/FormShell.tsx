import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FormShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-xl border border-border bg-bg-surface p-6 shadow-card md:p-8', className)}>
      {(eyebrow || title || description) && (
        <header className="mb-6">
          {eyebrow && <div className="mb-3">{eyebrow}</div>}
          {title && (
            <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] text-text-primary">
              {title}
            </h1>
          )}
          {description && <p className="mt-2 text-sm leading-6 text-text-secondary">{description}</p>}
        </header>
      )}
      {children}
    </section>
  )
}

export function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-text-secondary"
    >
      {children}
      {required && <span className="ml-1 text-signal">*</span>}
    </label>
  )
}
