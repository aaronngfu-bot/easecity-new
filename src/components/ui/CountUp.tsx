'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  /** Full display string — e.g. "$149" or "Custom". Only leading digit run is animated. */
  value: string
  /** Duration in ms. */
  duration?: number
  /** Trigger: 'view' counts when scrolled into view, 'now' counts immediately, 'key' counts when `trigger` changes. */
  trigger?: 'view' | 'now' | 'key'
  /** Used when trigger === 'key'. */
  triggerKey?: number | string
  className?: string
}

/** Easing: easeOutCubic. */
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Count up animation for prices/numbers.
 * Parses the first digit run in `value`, animates 0 → target.
 * Any non-digit suffix/prefix is rendered verbatim.
 *
 * "$149" → prefix "$", digits 149, suffix ""
 * "Custom" → no digits, returns value as-is.
 */
export function CountUp({
  value,
  duration = 900,
  trigger = 'view',
  triggerKey,
  className,
}: CountUpProps) {
  const match = value.match(/^(\D*?)(\d[\d,\.]*)(.*)$/)
  const prefix = match?.[1] ?? ''
  const digits = match?.[2] ?? ''
  const suffix = match?.[3] ?? ''

  const target = digits ? Number(digits.replace(/,/g, '')) : 0
  const [n, setN] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const rafRef = useRef<number>(0)
  const playedRef = useRef(false)

  const play = () => {
    if (!digits) return
    cancelAnimationFrame(rafRef.current)
    const start = performance.now()
    const from = 0
    const to = target
    const step = (now: number) => {
      const elapsed = now - start
      const t = Math.min(1, elapsed / duration)
      const eased = easeOut(t)
      const current = Math.round(from + (to - from) * eased)
      setN(current)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }

  // View trigger — start once when visible
  useEffect(() => {
    if (trigger !== 'view' || !ref.current || playedRef.current) return
    const el = ref.current
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((ent) => {
          if (ent.isIntersecting && !playedRef.current) {
            playedRef.current = true
            play()
            obs.disconnect()
          }
        })
      },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  // "now" trigger — start immediately
  useEffect(() => {
    if (trigger !== 'now' || playedRef.current) return
    playedRef.current = true
    play()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  // "key" trigger — re-run on key change (e.g., hover)
  useEffect(() => {
    if (trigger !== 'key') return
    play()
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, triggerKey])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  if (!digits) {
    return <span className={className}>{value}</span>
  }

  return (
    <span ref={ref} className={`count-up ${className ?? ''}`}>
      {prefix}
      {n.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
