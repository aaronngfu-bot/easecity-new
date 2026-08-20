'use client'

import { useEffect, useRef } from 'react'

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  /** Entrance direction: up (default), left, right, or scale. */
  variant?: 'up' | 'left' | 'right' | 'scale'
}

/**
 * RevealSection — entrance transition on first scroll into view
 * (IntersectionObserver, once). CSS handles the transition +
 * prefers-reduced-motion; JS only flips a class. Content stays fully visible
 * if JS never runs (no opacity in the base markup).
 */
export function RevealSection({ children, className, variant = 'up' }: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={ref} data-reveal={variant} className={`reveal ${className ?? ''}`}>
      {children}
    </div>
  )
}
