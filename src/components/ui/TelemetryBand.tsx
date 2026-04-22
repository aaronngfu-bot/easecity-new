'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Live telemetry HUD band.
 *
 * Numbers drift continuously via requestAnimationFrame — each metric has
 * a target that re-rolls every 4-7s, and the displayed value smoothly
 * eases toward it. Uptime ticks up deterministically (never resets).
 */

type MetricDef = {
  key: string
  label: string
  tint?: 'signal' | 'data' | 'default'
  /** Format a raw numeric value to its display string. */
  format: (v: number) => string
  /** How to sample a fresh target value. */
  sample: () => number
  /** Retarget cadence in ms. */
  retargetMs: number
  /** Ease factor per frame; higher = snappier. */
  ease: number
}

const METRICS: MetricDef[] = [
  {
    key: 'nodes',
    label: 'NODES',
    tint: 'signal',
    format: (v) => Math.round(v).toLocaleString(),
    sample: () => 1180 + Math.random() * 80,
    retargetMs: 4200,
    ease: 0.02,
  },
  {
    key: 'lat',
    label: 'LAT p50',
    format: (v) => `${v.toFixed(2)}ms`,
    sample: () => 0.55 + Math.random() * 0.45,
    retargetMs: 3400,
    ease: 0.05,
  },
  {
    key: 'streams',
    label: 'STREAMS/s',
    format: (v) => Math.round(v).toLocaleString(),
    sample: () => 12000 + Math.random() * 1200,
    retargetMs: 5600,
    ease: 0.015,
  },
  {
    key: 'uptime',
    label: 'UPTIME',
    tint: 'signal',
    format: (v) => {
      // v is elapsed seconds; render MM:SS offset from 99:00:00 baseline
      const total = Math.floor(v)
      const hh = String(99 + Math.floor(total / 3600)).padStart(2, '0')
      const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
      const ss = String(total % 60).padStart(2, '0')
      return `${hh}:${mm}:${ss}`
    },
    sample: () => 0, // uptime has special handling below
    retargetMs: 0,
    ease: 1,
  },
]

export function TelemetryBand() {
  const [mounted, setMounted] = useState(false)
  const [display, setDisplay] = useState<Record<string, number>>(
    Object.fromEntries(METRICS.map((m) => [m.key, m.key === 'uptime' ? 0 : m.sample()]))
  )

  const currentRef = useRef<Record<string, number>>({
    ...display,
  })
  const targetRef = useRef<Record<string, number>>({
    ...display,
  })
  const lastRetargetRef = useRef<Record<string, number>>(
    Object.fromEntries(METRICS.map((m) => [m.key, 0]))
  )
  const startRef = useRef<number>(0)
  const rafRef = useRef<number>(0)
  const lastFrameRef = useRef<Record<string, number>>({})

  useEffect(() => {
    setMounted(true)
    startRef.current = performance.now()

    const loop = (now: number) => {
      const elapsedMs = now - startRef.current

      // Retarget where due
      METRICS.forEach((m) => {
        if (m.key === 'uptime') {
          // Uptime: monotonic seconds since mount
          targetRef.current.uptime = elapsedMs / 1000
          currentRef.current.uptime = elapsedMs / 1000
          return
        }
        if (elapsedMs - (lastRetargetRef.current[m.key] || 0) > m.retargetMs) {
          targetRef.current[m.key] = m.sample()
          lastRetargetRef.current[m.key] = elapsedMs
        }
        // Ease toward target
        const cur = currentRef.current[m.key]
        const tgt = targetRef.current[m.key]
        currentRef.current[m.key] = cur + (tgt - cur) * m.ease
      })

      // Throttle React updates — only commit when a value changed enough
      const next: Record<string, number> = {}
      let dirty = false
      METRICS.forEach((m) => {
        const v = currentRef.current[m.key]
        const last = lastFrameRef.current[m.key] ?? Number.NaN
        if (m.key === 'uptime') {
          // 1-second ticks
          if (Math.floor(v) !== Math.floor(last)) {
            dirty = true
          }
          next[m.key] = v
          return
        }
        // Commit if fractional change > small epsilon; keeps DOM light
        if (Math.abs(v - last) > (m.key === 'lat' ? 0.005 : 2)) {
          dirty = true
        }
        next[m.key] = v
      })

      if (dirty) {
        lastFrameRef.current = { ...next }
        setDisplay(next)
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  if (!mounted) return null

  return (
    <aside
      className="fixed bottom-4 left-4 z-30 hidden md:block pointer-events-none"
      aria-hidden="true"
    >
      <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-md bg-bg-base/80 backdrop-blur-md border border-border/60 telemetry-row text-[10px] ambient-motion">
        <span className="flex items-center gap-1.5">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-signal opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal" />
          </span>
          <span className="text-signal font-bold">LIVE</span>
        </span>
        <span className="text-border">|</span>
        {METRICS.map((m, i) => (
          <span key={m.key} className="flex items-center gap-1.5">
            <span className="text-text-muted">{m.label}</span>
            <span
              className={
                m.tint === 'signal'
                  ? 'text-signal tabular-nums'
                  : m.tint === 'data'
                    ? 'text-accent-cyan tabular-nums'
                    : 'text-text-primary tabular-nums'
              }
            >
              {m.format(display[m.key])}
            </span>
            {i < METRICS.length - 1 && <span className="text-border ml-1">·</span>}
          </span>
        ))}
      </div>
    </aside>
  )
}
