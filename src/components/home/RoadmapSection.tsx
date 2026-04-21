'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

const statusConfig = {
  current: {
    dot: 'bg-signal',
    dotRing: 'ring-signal/25',
    badge: 'text-signal bg-signal/10 border-signal/30',
    line: 'bg-signal/70',
    icon: CheckCircle2,
    iconClass: 'text-signal',
    cardBorder: 'border-signal/30 hover:border-signal/50 hover:shadow-glow-signal',
    numberColor: 'text-signal/15',
    markerGlow: 'shadow-glow-signal-sm',
  },
  upcoming: {
    dot: 'bg-text-secondary',
    dotRing: 'ring-text-muted/20',
    badge: 'text-text-secondary bg-bg-elevated border-border',
    line: 'bg-text-muted/40',
    icon: Circle,
    iconClass: 'text-text-muted',
    cardBorder: 'border-border hover:border-text-muted/40',
    numberColor: 'text-text-muted/15',
    markerGlow: '',
  },
  future: {
    dot: 'bg-accent-cyan/80',
    dotRing: 'ring-accent-cyan/20',
    badge: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/25',
    line: 'bg-accent-cyan/30',
    icon: Sparkles,
    iconClass: 'text-accent-cyan',
    cardBorder: 'border-accent-cyan/20 hover:border-accent-cyan/40',
    numberColor: 'text-accent-cyan/15',
    markerGlow: 'shadow-glow-cyan-sm',
  },
} as const

type PhaseStatus = keyof typeof statusConfig

export function RoadmapSection() {
  const { t } = useLanguage()

  const phases = [
    {
      phase: t.roadmap.p1Phase,
      num: '01',
      status: t.roadmap.p1Status as PhaseStatus,
      badge: t.roadmap.p1Badge,
      title: t.roadmap.p1Title,
      period: t.roadmap.p1Period,
      desc: t.roadmap.p1Desc,
      milestones: [t.roadmap.p1M1, t.roadmap.p1M2, t.roadmap.p1M3, t.roadmap.p1M4, t.roadmap.p1M5],
    },
    {
      phase: t.roadmap.p2Phase,
      num: '02',
      status: t.roadmap.p2Status as PhaseStatus,
      badge: t.roadmap.p2Badge,
      title: t.roadmap.p2Title,
      period: t.roadmap.p2Period,
      desc: t.roadmap.p2Desc,
      milestones: [t.roadmap.p2M1, t.roadmap.p2M2, t.roadmap.p2M3, t.roadmap.p2M4, t.roadmap.p2M5],
    },
    {
      phase: t.roadmap.p3Phase,
      num: '03',
      status: t.roadmap.p3Status as PhaseStatus,
      badge: t.roadmap.p3Badge,
      title: t.roadmap.p3Title,
      period: t.roadmap.p3Period,
      desc: t.roadmap.p3Desc,
      milestones: [t.roadmap.p3M1, t.roadmap.p3M2, t.roadmap.p3M3, t.roadmap.p3M4, t.roadmap.p3M5],
    },
  ]

  return (
    <section id="roadmap-section" className="section-padding relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-surface/20 to-transparent pointer-events-none" />

      <div className="container-max relative z-10">
        {/* Editorial header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 md:mb-20 grid grid-cols-12 gap-6 items-end"
        >
          <div className="col-span-12 md:col-span-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="label-mono text-signal">§ TRAJECTORY</span>
              <span className="h-px w-16 bg-border" />
              <span className="label-mono">2026 → 2028+</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight text-text-primary">
              {t.roadmap.heading}{' '}
              <span className="text-outline">{t.roadmap.headingHighlight}</span>
            </h2>
          </div>
          <p className="col-span-12 md:col-span-4 text-text-secondary text-sm md:text-base leading-relaxed">
            {t.roadmap.desc}
          </p>
        </motion.div>

        {/* Horizontal timeline track */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.8 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative mb-8 px-2 origin-left"
        >
          {/* Base line */}
          <div className="absolute top-1/2 left-6 right-6 h-px bg-border" />
          {/* Progress line (covers up to active phase + half) */}
          <div className="absolute top-1/2 left-6 h-px bg-gradient-to-r from-signal to-signal/0 w-[40%]" />

          <div className="relative grid grid-cols-3 gap-4">
            {phases.map((phase, i) => {
              const config = statusConfig[phase.status]
              return (
                <div key={phase.num} className="flex flex-col items-center relative py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={cn(
                        'font-mono text-[10px] tracking-[0.2em] uppercase',
                        phase.status === 'current' ? 'text-signal' : 'text-text-muted'
                      )}
                    >
                      {phase.num}
                    </span>
                    <span className="text-text-muted font-mono text-[10px]">·</span>
                    <span
                      className={cn(
                        'font-mono text-[10px] tracking-wider',
                        phase.status === 'current' ? 'text-signal' : 'text-text-muted'
                      )}
                    >
                      {phase.period}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'relative w-6 h-6 rounded-full ring-4 flex items-center justify-center',
                      config.dot,
                      config.dotRing,
                      config.markerGlow
                    )}
                  >
                    <span className="text-bg-base font-mono text-[9px] font-bold">
                      {i + 1}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Horizontal scrollable phase cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {phases.map((phase, i) => {
            const config = statusConfig[phase.status]
            const StatusIcon = config.icon

            return (
              <motion.article
                key={phase.phase}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={cn(
                  'relative group rounded-2xl border bg-bg-surface p-6 md:p-7 transition-all duration-300 flex flex-col min-h-[420px] overflow-hidden',
                  config.cardBorder
                )}
              >
                {/* Top accent */}
                {phase.status === 'current' && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent" />
                )}

                {/* Big editorial number */}
                <span
                  className={cn(
                    'absolute -top-2 -right-1 font-display font-bold leading-none pointer-events-none select-none',
                    config.numberColor
                  )}
                  style={{ fontSize: 'clamp(5rem, 8vw, 8rem)' }}
                  aria-hidden="true"
                >
                  {phase.num}
                </span>

                <div className="relative flex items-start justify-between mb-5 gap-2">
                  <p className="text-text-muted text-[10px] font-mono tracking-[0.2em] uppercase">
                    {phase.phase}
                  </p>
                  <span className={cn('text-[10px] font-medium px-2.5 py-1 rounded-full border font-mono tracking-wider uppercase', config.badge)}>
                    {phase.badge}
                  </span>
                </div>

                <h3 className="relative font-display text-xl md:text-2xl font-bold text-text-primary mb-3 leading-tight">
                  {phase.title}
                </h3>

                <p className="relative text-text-secondary text-sm leading-relaxed mb-5">
                  {phase.desc}
                </p>

                <div className="relative mt-auto pt-4 border-t border-border">
                  <p className="label-mono mb-3">MILESTONES</p>
                  <ul className="space-y-2">
                    {phase.milestones.map((milestone) => (
                      <li key={milestone} className="flex items-start gap-2.5">
                        <StatusIcon size={12} className={cn('mt-0.5 flex-shrink-0', config.iconClass)} />
                        <span className="text-text-secondary text-xs leading-relaxed">{milestone}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
