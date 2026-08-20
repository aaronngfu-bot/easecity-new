'use client'

import { useEffect, useRef } from 'react'

type Variant = 'up' | 'left' | 'right' | 'scale' | 'fade'

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('is-visible')
            io.disconnect()
          }
        }
      },
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  /** Entrance direction: up (default), left, right, or scale. */
  variant?: Variant
}

/**
 * RevealSection — whole-section entrance transition on first scroll into
 * view (IntersectionObserver, once). CSS handles the transition +
 * prefers-reduced-motion; JS only flips a class. Content stays fully visible
 * if JS never runs (no opacity in the base markup).
 */
export function RevealSection({ children, className, variant = 'up' }: RevealSectionProps) {
  const ref = useRevealOnce<HTMLDivElement>()
  return (
    <div ref={ref} data-reveal={variant} className={`reveal ${className ?? ''}`}>
      {children}
    </div>
  )
}

interface RevealItemProps {
  children: React.ReactNode
  className?: string
  variant?: Variant
  /** Seconds to wait after entering view before the entrance starts. */
  delay?: number
}

/**
 * RevealItem — element-level entrance (opacity 0→1 + motion) for staggering
 * cards/steps inside a section. Same visual language as RevealSection.
 */
export function RevealItem({ children, className, variant = 'up', delay = 0 }: RevealItemProps) {
  const ref = useRevealOnce<HTMLDivElement>()
  return (
    <div
      ref={ref}
      data-reveal={variant}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={`reveal ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
