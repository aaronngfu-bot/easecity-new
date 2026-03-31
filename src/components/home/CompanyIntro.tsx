'use client'

import { motion } from 'framer-motion'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { useLanguage } from '@/context/LanguageContext'

export function CompanyIntro() {
  const { t } = useLanguage()

  const metrics = [
    { value: t.companyIntro.m1Value, label: t.companyIntro.m1Label, desc: t.companyIntro.m1Desc },
    { value: t.companyIntro.m2Value, label: t.companyIntro.m2Label, desc: t.companyIntro.m2Desc },
    { value: t.companyIntro.m3Value, label: t.companyIntro.m3Label, desc: t.companyIntro.m3Desc },
    { value: t.companyIntro.m4Value, label: t.companyIntro.m4Label, desc: t.companyIntro.m4Desc },
  ]

  return (
    <section className="section-padding relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-surface/30 to-bg-base pointer-events-none" />

      <div className="container-max relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection direction="left">
            <p className="text-accent-cyan text-sm font-mono tracking-widest uppercase mb-4">
              {t.companyIntro.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-6">
              {t.companyIntro.heading}{' '}
              <span className="text-gradient-cyan">{t.companyIntro.headingHighlight}</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">
              {t.companyIntro.body1}
            </p>
            <p className="text-text-secondary text-base leading-relaxed">
              {t.companyIntro.body2}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 border-2 border-bg-base" />
                ))}
              </div>
              <p className="text-text-muted text-sm">{t.companyIntro.teamLabel}</p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <div className="grid grid-cols-2 gap-4">
              {metrics.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-5 rounded-2xl bg-bg-surface border border-border hover:border-accent-cyan/30 transition-all duration-300 group"
                >
                  <p className="font-display text-2xl font-bold text-accent-cyan mb-1 group-hover:text-accent-cyan-light transition-colors">
                    {metric.value}
                  </p>
                  <p className="text-text-primary text-sm font-medium mb-1">{metric.label}</p>
                  <p className="text-text-muted text-xs leading-snug">{metric.desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
