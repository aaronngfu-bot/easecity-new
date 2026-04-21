'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Globe2, BrainCircuit, Layers3 } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function Expansion() {
  const { t } = useLanguage()

  const pillars = [
    {
      icon: Layers3,
      title: t.expansion.e1Title,
      description: t.expansion.e1Desc,
      status: t.expansion.e1Status,
      stage: 'live' as const,
    },
    {
      icon: Globe2,
      title: t.expansion.e2Title,
      description: t.expansion.e2Desc,
      status: t.expansion.e2Status,
      stage: 'planned' as const,
    },
    {
      icon: BrainCircuit,
      title: t.expansion.e3Title,
      description: t.expansion.e3Desc,
      status: t.expansion.e3Status,
      stage: 'research' as const,
    },
  ]

  const stageStyle = (stage: 'live' | 'planned' | 'research') => {
    if (stage === 'live') {
      return {
        dot: 'bg-signal animate-signal-pulse',
        label: 'text-signal',
        border: 'border-signal/25',
        bg: 'bg-signal/8',
      }
    }
    if (stage === 'planned') {
      return {
        dot: 'bg-text-muted',
        label: 'text-text-muted',
        border: 'border-border',
        bg: 'bg-bg-base/40',
      }
    }
    return {
      dot: 'bg-text-muted/60',
      label: 'text-text-muted',
      border: 'border-border',
      bg: 'bg-bg-base/40',
    }
  }

  return (
    <section className="section-padding border-t border-border relative overflow-hidden">
      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.expansion.eyebrow}
          title={t.expansion.heading}
          titleHighlight={t.expansion.headingHighlight}
          description={t.expansion.desc}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {pillars.map((pillar, i) => {
            const s = stageStyle(pillar.stage)
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="group glass-panel glass-panel-interactive p-6 md:p-7"
              >
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] px-2.5 py-1 rounded-full border ${s.border} ${s.bg} ${s.label} uppercase`}
                  >
                    <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                    {pillar.status}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
                    EXP.{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="mb-5 w-11 h-11 rounded-xl bg-bg-base/40 group-hover:bg-signal/10 border border-border group-hover:border-signal/25 flex items-center justify-center text-text-muted group-hover:text-signal transition-all duration-300">
                  <pillar.icon size={20} />
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-3 group-hover:text-white transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-text-secondary text-base mb-6 max-w-2xl mx-auto">{t.expansion.closing}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="glass-cta group">
              {t.expansion.cta1}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link href="/services" className="glass-ghost">
              {t.expansion.cta2}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
