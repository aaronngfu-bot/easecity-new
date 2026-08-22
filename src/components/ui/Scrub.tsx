'use client'

import { useLayoutEffect, useRef } from 'react'

/**
 * Writes `--p` (0→1) as the node travels into view. No pin, no extra height.
 * Shared rAF. Reduced-motion locks `--p` at 1 so CSS falls through to rest.
 */

const registry = new Set<HTMLElement>()
let raf = 0
let listening = false
let reduce = false

function apply(el: HTMLElement) {
  if (reduce) {
    el.style.setProperty('--p', '1')
    return
  }
  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  const tight = el.dataset.pace === 'tight'
  const last = el.dataset.pace === 'last'
  const start = last ? vh * 0.92 : vh * 0.52
  const travel = last
    ? Math.min(Math.max(r.height * 0.28, vh * 0.18), vh * 0.28)
    : tight
      ? Math.min(Math.max(r.height * 0.55, vh * 0.38), vh * 0.55)
      : Math.min(Math.max(r.height * 0.5, vh * 0.48), vh * 0.72)
  let raw = Math.max(0, Math.min(1, (start - r.top) / travel))
  if (last && r.bottom <= vh + 8) raw = 1
  if (!last && r.top < 0) raw = 1
  el.style.setProperty('--p', raw.toFixed(4))
}

function tick() {
  raf = 0
  registry.forEach(apply)
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(tick)
}

function ensureListening() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
}

export function Scrub({
  children,
  className,
  pace = 'normal',
}: {
  children: React.ReactNode
  className?: string
  pace?: 'normal' | 'tight' | 'last'
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    registry.add(el)
    ensureListening()
    apply(el)
    return () => {
      registry.delete(el)
    }
  }, [pace])

  return (
    <div
      ref={ref}
      data-scrub=""
      data-pace={pace}
      className={className}
      style={{ ['--p' as string]: 0 }}
    >
      {children}
    </div>
  )
}
