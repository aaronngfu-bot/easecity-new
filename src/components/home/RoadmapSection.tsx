'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Sparkles } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

const statusConfig = {
  current: {
    badgeClass: 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/25',
    dot: 'bg-accent-cyan',
    dotRing: 'ring-accent-cyan/30',
    line: 'bg-gradient-to-b from-accent-cyan to-accent-cyan/10',
    icon: CheckCircle2,
    iconClass: 'text-accent-cyan',
    cardBorder: 'border-accent-cyan/25 hover:border-accent-cyan/50',
  },
  upcoming: {
    badgeClass: 'bg-bg-elevated text-text-secondary border-border',
    dot: 'bg-text-muted',
    dotRing: 'ring-text-muted/20',
    line: 'bg-gradient-to-b from-text-muted/30 to-transparent',
    icon: Circle,
    iconClass: 'text-text-muted',
    cardBorder: 'border-border hover:border-text-muted/40',
  },
  future: {
    badgeClass: 'bg-accent-purple/10 text-accent-purple border-accent-purple/25',
    dot: 'bg-accent-purple',
    dotRing: 'ring-accent-purple/25',
    line: 'bg-transparent',
    icon: Sparkles,
    iconClass: 'text-accent-purple',
    cardBorder: 'border-accent-purple/20 hover:border-accent-purple/40',
  },
} as const

type PhaseStatus = keyof typeof statusConfig

export function RoadmapSection() {
  const { t } = useLanguage()

  const phases = [
    {
      phase: t.roadmap.p1Phase,
      status: t.roadmap.p1Status as PhaseStatus,
      badge: t.roadmap.p1Badge,
      title: t.roadmap.p1Title,
      period: t.roadmap.p1Period,
      desc: t.roadmap.p1Desc,
      milestones: [t.roadmap.p1M1, t.roadmap.p1M2, t.roadmap.p1M3, t.roadmap.p1M4, t.roadmap.p1M5],
    },
    {
      phase: t.roadmap.p2Phase,
      status: t.roadmap.p2Status as PhaseStatus,
      badge: t.roadmap.p2Badge,
      title: t.roadmap.p2Title,
      period: t.roadmap.p2Period,
      desc: t.roadmap.p2Desc,
      milestones: [t.roadmap.p2M1, t.roadmap.p2M2, t.roadmap.p2M3, t.roadmap.p2M4, t.roadmap.p2M5],
    },
    {
      phase: t.roadmap.p3Phase,
      status: t.roadmap.p3Status as PhaseStatus,
      badge: t.roadmap.p3Badge,
      title: t.roadmap.p3Title,
      period: t.roadmap.p3Period,
      desc: t.roadmap.p3Desc,
      milestones: [t.roadmap.p3M1, t.roadmap.p3M2, t.roadmap.p3M3, t.roadmap.p3M4, t.roadmap.p3M5],
    },
  ]

  return (
    <section className="section-padding relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-surface/20 to-transparent pointer-events-none" />

      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.roadmap.eyebrow}
          title={t.roadmap.heading}
          titleHighlight={t.roadmap.headingHighlight}
          description={t.roadmap.desc}
        />

        <div className="relative max-w-4xl mx-auto">
          {phases.map((phase, i) => {
            const config = statusConfig[phase.status]
            const StatusIcon = config.icon

            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative flex gap-6 md:gap-8 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center flex-shrink-0 pt-1">
                  <div className={`w-8 h-8 rounded-full ${config.dot} ring-4 ${config.dotRing} flex items-center justify-center flex-shrink-0 z-10`}>
                    <StatusIcon size={14} className="text-bg-base" />
                  </div>
                  {i < phases.length - 1 && (
                    <div className={`w-px flex-1 mt-2 min-h-[40px] ${config.line}`} />
                  )}
                </div>

                <div className={`flex-1 rounded-2xl border ${config.cardBorder} bg-bg-surface p-6 md:p-7 transition-all duration-300 mb-2`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-text-muted text-xs font-mono tracking-widest uppercase mb-1">{phase.phase}</p>
                      <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary">{phase.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${config.badgeClass}`}>{phase.badge}</span>
                      <span className="text-text-muted text-xs font-mono">{phase.period}</span>
                    </div>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed mb-5">{phase.desc}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {phase.milestones.map((milestone) => (
                      <div key={milestone} className="flex items-center gap-2.5">
                        <StatusIcon size={13} className={`flex-shrink-0 ${config.iconClass}`} />
                        <span className="text-text-secondary text-xs">{milestone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
