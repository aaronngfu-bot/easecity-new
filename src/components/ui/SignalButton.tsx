'use client'

import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border-transparent bg-signal text-[#03100f] shadow-glow-signal-sm hover:bg-signal-light hover:shadow-glow-signal focus-visible:ring-signal/60',
  secondary:
    'border-border bg-bg-surface text-text-primary hover:border-border-accent hover:bg-bg-elevated focus-visible:ring-signal/50',
  ghost:
    'border-transparent bg-transparent text-text-secondary hover:text-signal focus-visible:ring-signal/50',
  danger:
    'border-status-danger/35 bg-status-danger/10 text-status-danger hover:bg-status-danger/15 focus-visible:ring-status-danger/50',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md border font-semibold transition duration-180 ease-out disabled:pointer-events-none disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-void'

interface SharedProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

type SignalButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>

export function SignalButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: SignalButtonProps) {
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

type SignalLinkProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

export function SignalLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: SignalLinkProps) {
  return (
    <Link
      href={href}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Link>
  )
}
