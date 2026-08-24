'use client'

import { useLayoutEffect, useRef } from 'react'

/**
 * Two scroll variables per section, both written to the wrapper:
 *
 *   `--p`  0 → 1   entrance. Saturates once the section has arrived and stays
 *                  there, so entrance motion plays once and settles.
 *   `--q`  -1 → 1  sustained travel, 0 when the section is centred. Never
 *                  saturates, so parallax keeps tracking the scroll for as long
 *                  as the section is on screen.
 *
 * Only sections intersecting the viewport are measured, and a value is written
 * only when it actually changed — writing a custom property on the wrapper
 * invalidates style for the whole subtree, which is expensive on sections like
 * the testimonial wall (48 cards). `data-scrubbing` marks the visible ones so
 * CSS can scope `will-change` to them instead of pinning layers page-wide.
 *
 * Shared rAF. Reduced-motion locks `--p` at 1 and `--q` at 0 so CSS falls
 * through to the rested layout with no movement.
 */

interface Entry {
  el: HTMLElement
  visible: boolean
  p: number
  q: number
}

const entries = new Map<HTMLElement, Entry>()
let raf = 0
let listening = false
let observer: IntersectionObserver | null = null

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v)

function apply(entry: Entry) {
  const { el } = entry
  if (reduced()) {
    el.style.setProperty('--p', '1')
    el.style.setProperty('--q', '0')
    return
  }

  const r = el.getBoundingClientRect()
  const vh = window.innerHeight
  const pace = el.dataset.pace
  const tight = pace === 'tight'
  const last = pace === 'last'

  const start = last ? vh * 0.92 : vh * 0.52
  const travel = last
    ? clamp(r.height * 0.28, vh * 0.18, vh * 0.28)
    : tight
      ? clamp(r.height * 0.55, vh * 0.38, vh * 0.55)
      : clamp(r.height * 0.5, vh * 0.48, vh * 0.72)

  let p = clamp((start - r.top) / travel, 0, 1)
  if (last && r.bottom <= vh + 8) p = 1
  if (!last && r.top < 0) p = 1

  // Signed distance of the section's centre from the viewport centre. Divided
  // by the full span either can travel, so a tall section drifts no faster
  // than a short one.
  const centre = r.top + r.height / 2
  const q = clamp((vh / 2 - centre) / (vh / 2 + r.height / 2), -1, 1)

  // Custom-property writes invalidate the subtree; skip sub-perceptual deltas.
  if (Math.abs(p - entry.p) > 0.001) {
    entry.p = p
    el.style.setProperty('--p', p.toFixed(4))
  }
  if (Math.abs(q - entry.q) > 0.001) {
    entry.q = q
    el.style.setProperty('--q', q.toFixed(4))
  }
}

function tick() {
  raf = 0
  entries.forEach((entry) => {
    if (entry.visible) apply(entry)
  })
}

function schedule() {
  if (!raf) raf = requestAnimationFrame(tick)
}

function ensureObserver() {
  if (observer) return observer
  observer = new IntersectionObserver(
    (records) => {
      records.forEach((record) => {
        const entry = entries.get(record.target as HTMLElement)
        if (!entry) return
        entry.visible = record.isIntersecting
        if (record.isIntersecting) {
          entry.el.dataset.scrubbing = ''
        } else {
          delete entry.el.dataset.scrubbing
        }
      })
      schedule()
    },
    // Start tracking before the section edges into view so its entrance is
    // already in progress by the time any of it is visible.
    { rootMargin: '25% 0px 25% 0px' }
  )
  return observer
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
    const entry: Entry = { el, visible: true, p: -1, q: -2 }
    entries.set(el, entry)
    ensureListening()
    const io = ensureObserver()
    io.observe(el)
    apply(entry)
    return () => {
      io.unobserve(el)
      entries.delete(el)
    }
  }, [pace])

  return (
    <div
      ref={ref}
      data-scrub=""
      data-pace={pace}
      className={className}
      style={{ ['--p' as string]: 0, ['--q' as string]: 0 }}
    >
      {children}
    </div>
  )
}
