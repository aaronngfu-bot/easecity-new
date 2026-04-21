'use client'

import { motion } from 'framer-motion'
import { Layers, Zap, Shield, Network, MonitorPlay, GitBranch } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function TechAdvantages() {
  const { t } = useLanguage()

  const advantages = [
    { num: '01', icon: Network,     title: t.techAdvantages.a1Title, description: t.techAdvantages.a1Desc },
    { num: '02', icon: Zap,         title: t.techAdvantages.a2Title, description: t.techAdvantages.a2Desc },
    { num: '03', icon: MonitorPlay, title: t.techAdvantages.a3Title, description: t.techAdvantages.a3Desc },
    { num: '04', icon: Layers,      title: t.techAdvantages.a4Title, description: t.techAdvantages.a4Desc },
    { num: '05', icon: Shield,      title: t.techAdvantages.a5Title, description: t.techAdvantages.a5Desc },
    { num: '06', icon: GitBranch,   title: t.techAdvantages.a6Title, description: t.techAdvantages.a6Desc },
  ]

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-signal/[0.02] via-transparent to-signal/[0.01] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-signal/3 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-rule-grid opacity-[0.12] pointer-events-none" />

      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.techAdvantages.eyebrow}
          title={t.techAdvantages.heading}
          titleHighlight={t.techAdvantages.headingHighlight}
          description={t.techAdvantages.desc}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="glass-panel glass-panel-interactive group relative p-6 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
                  ADV.{adv.num}
                </span>
                <div className="w-11 h-11 rounded-xl bg-bg-base/40 border border-border group-hover:bg-signal/10 group-hover:border-signal/25 flex items-center justify-center text-text-muted group-hover:text-signal transition-all duration-300">
                  <adv.icon size={20} />
                </div>
              </div>

              <h3 className="font-display text-lg font-semibold text-text-primary mb-2.5 group-hover:text-white transition-colors duration-200">
                {adv.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">{adv.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
