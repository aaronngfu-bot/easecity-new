'use client'

import { motion } from 'framer-motion'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { useLanguage } from '@/context/LanguageContext'

export function Philosophy() {
  const { t } = useLanguage()

  const principles = [
    { number: t.philosophy.p1Num, title: t.philosophy.p1Title, body: t.philosophy.p1Body },
    { number: t.philosophy.p2Num, title: t.philosophy.p2Title, body: t.philosophy.p2Body },
    { number: t.philosophy.p3Num, title: t.philosophy.p3Title, body: t.philosophy.p3Body },
    { number: t.philosophy.p4Num, title: t.philosophy.p4Title, body: t.philosophy.p4Body },
  ]

  return (
    <section className="section-padding border-t border-border">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <AnimatedSection direction="left">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-glow-signal-sm" />
              <p className="label-mono text-signal/80">{t.philosophy.eyebrow}</p>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary leading-[1.05] tracking-tight mb-6">
              {t.philosophy.heading}{' '}
              <span className="text-gradient-signal">{t.philosophy.headingHighlight}</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">{t.philosophy.body1}</p>
            <p className="text-text-secondary text-base leading-relaxed mb-8">{t.philosophy.body2}</p>

            <div className="glass-panel p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-signal/8 border border-signal/20 flex items-center justify-center">
                  <span className="text-signal text-sm font-display">香</span>
                </div>
                <div>
                  <p className="text-text-primary text-sm font-medium mb-1">{t.philosophy.hkTitle}</p>
                  <p className="text-text-secondary text-xs leading-relaxed">{t.philosophy.hkDesc}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <div className="space-y-4">
              {principles.map((p, i) => (
                <motion.div
                  key={p.number}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group glass-panel glass-panel-interactive flex gap-5 p-5"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-signal/8 border border-signal/15 flex items-center justify-center group-hover:bg-signal/12 transition-colors">
                    <span className="text-signal text-xs font-mono font-bold">{p.number}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary text-sm mb-1.5 group-hover:text-white transition-colors">{p.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
