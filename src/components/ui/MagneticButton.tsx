'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Max pull distance in px. Default 8. */
  strength?: number
  /** Radius around button where magnetic effect begins. Default 140. */
  radius?: number
}

/**
 * A button that gently "attracts" the cursor when nearby — small translate
 * toward the pointer. Snaps back on mouse leave. Disables on touch devices.
 */
export function MagneticButton({
  strength = 8,
  radius = 140,
  className,
  children,
  ...rest
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Skip on coarse pointers (touch devices)
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return
    }

    let raf = 0
    const pending = { x: 0, y: 0, active: false }

    const flush = () => {
      raf = 0
      if (!ref.current) return
      ref.current.style.transform = pending.active
        ? `translate(${pending.x.toFixed(2)}px, ${pending.y.toFixed(2)}px)`
        : 'translate(0, 0)'
    }

    const handleMove = (e: PointerEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)

      if (dist > radius) {
        if (pending.active) {
          pending.active = false
          pending.x = 0
          pending.y = 0
          if (!raf) raf = requestAnimationFrame(flush)
        }
        return
      }

      const falloff = 1 - dist / radius
      pending.active = true
      pending.x = dx * 0.3 * falloff
      pending.y = dy * 0.3 * falloff
      // cap by strength
      const mag = Math.hypot(pending.x, pending.y)
      if (mag > strength) {
        const k = strength / mag
        pending.x *= k
        pending.y *= k
      }
      if (!raf) raf = requestAnimationFrame(flush)
    }

    const reset = () => {
      pending.active = false
      pending.x = 0
      pending.y = 0
      if (!raf) raf = requestAnimationFrame(flush)
    }

    const capturedEl = el
    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('blur', reset)
    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('blur', reset)
      if (raf) cancelAnimationFrame(raf)
      capturedEl.style.transform = ''
    }
  }, [radius, strength])

  return (
    <button ref={ref} className={cn('magnetic-target', className)} {...rest}>
      {children}
    </button>
  )
}
