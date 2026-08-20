'use client'

import { useEffect, useRef } from 'react'

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
}

/**
 * RevealSection — fade-up on first scroll into view (IntersectionObserver,
 * once). CSS handles the transition + prefers-reduced-motion; JS only flips
 * a class. Content stays fully visible if JS never runs (no opacity in the
 * base markup).
 */
export function RevealSection({ children, className }: RevealSectionProps) {
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
    <div ref={ref} className={`reveal ${className ?? ''}`}>
      {children}
    </div>
  )
}
