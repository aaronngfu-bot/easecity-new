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
            <p className="text-accent-cyan text-sm font-mono tracking-widest uppercase mb-4">
              {t.philosophy.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-text-primary leading-tight mb-6">
              {t.philosophy.heading}{' '}
              <span className="text-gradient-cyan">{t.philosophy.headingHighlight}</span>
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed mb-6">{t.philosophy.body1}</p>
            <p className="text-text-secondary text-base leading-relaxed mb-8">{t.philosophy.body2}</p>

            <div className="p-5 rounded-2xl border border-border bg-bg-surface">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center">
                  <span className="text-accent-cyan text-sm">香</span>
                </div>
                <div>
                  <p className="text-text-primary text-sm font-medium mb-1">{t.philosophy.hkTitle}</p>
                  <p className="text-text-secondary text-xs leading-relaxed">{t.philosophy.hkDesc}</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right">
            <div className="space-y-5">
              {principles.map((p, i) => (
                <motion.div
                  key={p.number}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group flex gap-5 p-5 rounded-2xl border border-border bg-bg-surface hover:border-accent-cyan/20 hover:bg-bg-elevated transition-all duration-300"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent-cyan/8 border border-accent-cyan/15 flex items-center justify-center">
                    <span className="text-accent-cyan text-xs font-mono font-bold">{p.number}</span>
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
