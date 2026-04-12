'use client'

import { motion } from 'framer-motion'
import { Layers, Zap, Shield, Network, MonitorPlay, GitBranch } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

const cardAccents = [
  { num: '01', hover: 'hover:border-accent-cyan/30', iconHover: 'group-hover:bg-accent-cyan/10 group-hover:text-accent-cyan group-hover:border-accent-cyan/20', glow: 'group-hover:via-accent-cyan/25' },
  { num: '02', hover: 'hover:border-accent-cyan/20', iconHover: 'group-hover:bg-accent-cyan/8 group-hover:text-accent-cyan/80 group-hover:border-accent-cyan/15', glow: 'group-hover:via-accent-cyan/15' },
  { num: '03', hover: 'hover:border-accent-purple/25', iconHover: 'group-hover:bg-accent-purple/10 group-hover:text-accent-purple group-hover:border-accent-purple/20', glow: 'group-hover:via-accent-purple/20' },
  { num: '04', hover: 'hover:border-accent-cyan/20', iconHover: 'group-hover:bg-accent-cyan/8 group-hover:text-accent-cyan/80 group-hover:border-accent-cyan/15', glow: 'group-hover:via-accent-cyan/15' },
  { num: '05', hover: 'hover:border-accent-purple/20', iconHover: 'group-hover:bg-accent-purple/8 group-hover:text-accent-purple/80 group-hover:border-accent-purple/15', glow: 'group-hover:via-accent-purple/15' },
  { num: '06', hover: 'hover:border-accent-cyan/25', iconHover: 'group-hover:bg-accent-cyan/10 group-hover:text-accent-cyan group-hover:border-accent-cyan/20', glow: 'group-hover:via-accent-cyan/20' },
]

export function TechAdvantages() {
  const { t } = useLanguage()

  const advantages = [
    { icon: Network,     title: t.techAdvantages.a1Title, description: t.techAdvantages.a1Desc },
    { icon: Zap,         title: t.techAdvantages.a2Title, description: t.techAdvantages.a2Desc },
    { icon: MonitorPlay, title: t.techAdvantages.a3Title, description: t.techAdvantages.a3Desc },
    { icon: Layers,      title: t.techAdvantages.a4Title, description: t.techAdvantages.a4Desc },
    { icon: Shield,      title: t.techAdvantages.a5Title, description: t.techAdvantages.a5Desc },
    { icon: GitBranch,   title: t.techAdvantages.a6Title, description: t.techAdvantages.a6Desc },
  ]

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/3 via-transparent to-accent-purple/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-cyan/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.techAdvantages.eyebrow}
          title={t.techAdvantages.heading}
          titleHighlight={t.techAdvantages.headingHighlight}
          description={t.techAdvantages.desc}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advantages.map((adv, i) => {
            const accent = cardAccents[i]
            return (
              <motion.div
                key={adv.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                className={`group relative p-6 rounded-2xl border border-border bg-bg-surface transition-all duration-300 overflow-hidden ${accent.hover} hover:bg-bg-elevated`}
              >
                {/* Top border accent on hover */}
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent ${accent.glow} transition-all duration-500`} />

                {/* Number + Icon row */}
                <div className="flex items-start justify-between mb-5">
                  <span className="font-mono text-xs font-bold text-text-muted/30 group-hover:text-text-muted/60 transition-colors duration-300 pt-1">
                    {accent.num}
                  </span>
                  <div className={`w-11 h-11 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-text-muted transition-all duration-300 ${accent.iconHover}`}>
                    <adv.icon size={20} />
                  </div>
                </div>

                <h3 className="font-display text-base font-semibold text-text-primary mb-2.5 group-hover:text-white transition-colors duration-200">
                  {adv.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">{adv.description}</p>

                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-transparent to-transparent ${accent.glow} transition-all duration-500 rounded-b-2xl`} />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
