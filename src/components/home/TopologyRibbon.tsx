'use client'

import { useState, useEffect } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion'

interface Section {
  num: string
  label: string
}

const SECTIONS: Section[] = [
  { num: '01', label: 'OBJECTIVE' },
  { num: '02', label: 'FOUNDATION' },
  { num: '03', label: 'SERVICES' },
  { num: '04', label: 'ADVANTAGES' },
  { num: '05', label: 'ROADMAP' },
  { num: '06', label: 'CONNECT' },
]

export function TopologyRibbon() {
  const { scrollYProgress } = useScroll()
  const [activeIdx, setActiveIdx] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const idx = Math.min(
      SECTIONS.length - 1,
      Math.max(0, Math.floor(v * (SECTIONS.length - 0.001)))
    )
    setActiveIdx(idx)
  })

  const headY = useTransform(scrollYProgress, [0, 1], ['4%', '96%'])
  const progressPct = useTransform(
    scrollYProgress,
    (v) => `${Math.round(v * 100)}%`
  )

  if (!mounted) return null

  return (
    <aside
      className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden xl:flex items-center gap-5 pointer-events-none select-none"
      aria-hidden="true"
    >
      {/* Vertical ruler SVG */}
      <div className="relative h-[60vh] w-8 flex items-center justify-center">
        <svg
          viewBox="0 0 32 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="ribbonTrunk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22ff88" stopOpacity="0" />
              <stop offset="10%" stopColor="#22ff88" stopOpacity="0.6" />
              <stop offset="90%" stopColor="#22ff88" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22ff88" stopOpacity="0" />
            </linearGradient>
            <filter id="ribbonHeadGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* trunk */}
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="98"
            stroke="url(#ribbonTrunk)"
            strokeWidth="1"
          />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="98"
            stroke="#27272a"
            strokeWidth="0.3"
          />

          {/* ticks — one per section */}
          {SECTIONS.map((_, i) => {
            const y = 4 + (i / (SECTIONS.length - 1)) * 92
            const isActive = i === activeIdx
            const isPast = i < activeIdx
            return (
              <g key={i}>
                <line
                  x1="12"
                  y1={y}
                  x2="20"
                  y2={y}
                  stroke={isActive || isPast ? '#22ff88' : '#3f3f46'}
                  strokeWidth={isActive ? 1.5 : 0.7}
                  strokeOpacity={isActive ? 1 : isPast ? 0.6 : 0.4}
                />
                <circle
                  cx="16"
                  cy={y}
                  r={isActive ? 2 : 1.2}
                  fill={isActive ? '#22ff88' : isPast ? '#22ff8870' : '#27272a'}
                  stroke={isActive ? '#22ff88' : 'none'}
                  strokeWidth="0.5"
                  filter={isActive ? 'url(#ribbonHeadGlow)' : undefined}
                />
              </g>
            )
          })}
        </svg>

        {/* Traveling head circle — follows scroll */}
        <motion.div
          style={{ top: headY }}
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <div className="relative w-3 h-3">
            <span className="absolute inset-0 rounded-full bg-signal/30 blur-[6px]" />
            <span className="absolute inset-[3px] rounded-full bg-signal" />
            <span className="absolute inset-0 rounded-full border border-signal/60 animate-ping" />
          </div>
        </motion.div>
      </div>

      {/* Labels column */}
      <div className="flex flex-col justify-between h-[60vh] py-1 -ml-1">
        {SECTIONS.map((s, i) => {
          const isActive = i === activeIdx
          const isPast = i < activeIdx
          return (
            <div
              key={s.num}
              className="flex items-center gap-2 transition-opacity duration-200"
              style={{ opacity: isActive ? 1 : isPast ? 0.45 : 0.25 }}
            >
              <span
                className={`font-mono text-[10px] tracking-[0.2em] ${
                  isActive ? 'text-signal' : 'text-text-muted'
                }`}
              >
                {s.num}
              </span>
              <span
                className={`font-mono text-[10px] tracking-[0.18em] ${
                  isActive ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Progress readout — floats below */}
      <div className="absolute -bottom-6 left-10 flex items-center gap-2 text-[9px] font-mono tracking-[0.2em] text-text-muted uppercase">
        <span>SECTION</span>
        <span className="text-signal">
          {SECTIONS[activeIdx].num}
        </span>
        <span>/</span>
        <span>{String(SECTIONS.length).padStart(2, '0')}</span>
        <span className="ml-2 text-text-muted">·</span>
        <motion.span className="text-text-secondary">{progressPct}</motion.span>
      </div>
    </aside>
  )
}
