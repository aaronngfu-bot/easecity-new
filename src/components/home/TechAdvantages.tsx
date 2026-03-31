'use client'

import { motion } from 'framer-motion'
import { Layers, Zap, Shield, Network, MonitorPlay, GitBranch } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function TechAdvantages() {
  const { t } = useLanguage()

  const advantages = [
    { icon: Network, title: t.techAdvantages.a1Title, description: t.techAdvantages.a1Desc },
    { icon: Zap, title: t.techAdvantages.a2Title, description: t.techAdvantages.a2Desc },
    { icon: MonitorPlay, title: t.techAdvantages.a3Title, description: t.techAdvantages.a3Desc },
    { icon: Layers, title: t.techAdvantages.a4Title, description: t.techAdvantages.a4Desc },
    { icon: Shield, title: t.techAdvantages.a5Title, description: t.techAdvantages.a5Desc },
    { icon: GitBranch, title: t.techAdvantages.a6Title, description: t.techAdvantages.a6Desc },
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
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="group relative p-6 rounded-2xl border border-border bg-bg-surface hover:border-accent-cyan/25 hover:bg-bg-elevated transition-all duration-300"
            >
              <div className="mb-5 w-11 h-11 rounded-xl bg-bg-elevated group-hover:bg-accent-cyan/10 border border-border group-hover:border-accent-cyan/20 flex items-center justify-center text-text-muted group-hover:text-accent-cyan transition-all duration-300">
                <adv.icon size={20} />
              </div>
              <h3 className="font-display text-base font-semibold text-text-primary mb-2.5 group-hover:text-white transition-colors">
                {adv.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">{adv.description}</p>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/0 to-transparent group-hover:via-accent-cyan/30 transition-all duration-500 rounded-b-2xl" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
