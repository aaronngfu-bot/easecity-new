'use client'

import { useLayoutEffect, useRef } from 'react'

type Variant = 'up' | 'left' | 'right' | 'scale' | 'fade'

/**
 * Scroll-scrubbed reveals: elements stay hidden until the user actually
 * scrolls them toward the viewport, then emerge in proportion to scroll
 * progress (opacity 0→1 + directional motion). Scroll back up and they
 * recede again. One shared rAF-throttled scroll/resize listener drives all
 * registered elements. Reduced motion (or no JS) leaves content visible.
 */

const registry = new Map<HTMLElement, { variant: Variant; delay: number }>()
let raf = 0
let listening = false

const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)

function applyEl(el: HTMLElement, meta: { variant: Variant; delay: number }) {
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  const trigger = vh * 0.92
  const travel = Math.max(120, Math.min(vh * 0.5, r.height * 0.7 + 100))
  let p = (trigger - r.top) / travel
  p = Math.max(0, Math.min(1, p))
  if (meta.delay > 0) p = Math.max(0, Math.min(1, (p - meta.delay) / (1 - meta.delay)))
  const e = easeOutCubic(p)
  const d = 1 - e
  el.style.opacity = e.toFixed(3)
  switch (meta.variant) {
    case 'left':
      el.style.transform = `translateX(${(-36 * d).toFixed(1)}px)`
      break
    case 'right':
      el.style.transform = `translateX(${(36 * d).toFixed(1)}px)`
      break
    case 'scale':
      el.style.transform = `scale(${(0.94 + 0.06 * e).toFixed(3)})`
      break
    case 'up':
      el.style.transform = `translateY(${(28 * d).toFixed(1)}px)`
      break
    default:
      el.style.transform = 'none'
  }
}

function updateAll() {
  raf = 0
  registry.forEach((meta, el) => applyEl(el, meta))
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(updateAll)
}

function ensureListening() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
}

function useScrollReveal(variant: Variant, delay: number) {
  const ref = useRef<HTMLDivElement | null>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.opacity = '1'
      el.style.transform = 'none'
      return
    }
    ensureListening()
    const meta = { variant, delay }
    registry.set(el, meta)
    applyEl(el, meta) // set the correct state before first paint
    schedule()
    return () => {
      registry.delete(el)
    }
  }, [variant, delay])
  return ref
}

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  /** Entrance direction: up (default), left, right, scale, or fade. */
  variant?: Variant
}

export function RevealSection({ children, className, variant = 'up' }: RevealSectionProps) {
  const ref = useScrollReveal(variant, 0)
  return (
    <div ref={ref} data-reveal={variant} className={className}>
      {children}
    </div>
  )
}

interface RevealItemProps {
  children: React.ReactNode
  className?: string
  variant?: Variant
  /** 0..0.6 — holds the element back a fraction of the scroll travel. */
  delay?: number
}

export function RevealItem({ children, className, variant = 'up', delay = 0 }: RevealItemProps) {
  const ref = useScrollReveal(variant, delay)
  return (
    <div ref={ref} data-reveal={variant} className={className}>
      {children}
    </div>
  )
}
