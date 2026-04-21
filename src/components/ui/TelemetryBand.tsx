'use client'

import { useEffect, useState } from 'react'

interface Metric {
  key: string
  label: string
  value: string
  tint?: 'signal' | 'data' | 'default'
}

const seed = (): Metric[] => [
  {
    key: 'nodes',
    label: 'NODES',
    value: (1200 + Math.floor(Math.random() * 60)).toString(),
    tint: 'signal',
  },
  {
    key: 'lat',
    label: 'LAT p50',
    value: `${(0.6 + Math.random() * 0.4).toFixed(2)}ms`,
  },
  {
    key: 'streams',
    label: 'STREAMS/s',
    value: (12000 + Math.floor(Math.random() * 900)).toLocaleString(),
  },
  {
    key: 'uptime',
    label: 'UPTIME',
    value: '99.99%',
    tint: 'signal',
  },
]

export function TelemetryBand() {
  const [metrics, setMetrics] = useState<Metric[]>(seed)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setMetrics(seed())
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null

  return (
    <aside
      className="fixed bottom-4 left-4 z-30 hidden md:block pointer-events-none"
      aria-hidden="true"
    >
      <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-md bg-bg-base/80 backdrop-blur-md border border-border/60 telemetry-row text-[10px]">
        <span className="flex items-center gap-1.5">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-signal opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal" />
          </span>
          <span className="text-signal font-bold">LIVE</span>
        </span>
        <span className="text-border">|</span>
        {metrics.map((m, i) => (
          <span key={m.key} className="flex items-center gap-1.5">
            <span className="text-text-muted">{m.label}</span>
            <span
              className={
                m.tint === 'signal'
                  ? 'text-signal'
                  : m.tint === 'data'
                    ? 'text-accent-cyan'
                    : 'text-text-primary'
              }
            >
              {m.value}
            </span>
            {i < metrics.length - 1 && <span className="text-border ml-1">·</span>}
          </span>
        ))}
      </div>
    </aside>
  )
}
