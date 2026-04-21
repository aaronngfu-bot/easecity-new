'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

export function PricingHero() {
  const { t } = useLanguage()

  return (
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-20 overflow-hidden">
      {/* Background: centered signal glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 0%, #22ff8814, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 bg-rule-grid opacity-[0.18] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal/25 to-transparent" />

      {/* Ambient pulse */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-signal rounded-full blur-[140px] pointer-events-none"
      />

      <div className="container-max relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Section code */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
              PRICING.03
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-signal/40 to-transparent" />
            <span className="glass-badge">
              <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" />
              {t.pricingPage.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="font-display text-5xl md:text-7xl lg:text-[5rem] font-bold leading-[1.02] tracking-tight mb-7"
          >
            <span className="text-text-primary">{t.pricingPage.heading1}</span>
            <br />
            <span className="text-gradient-signal">{t.pricingPage.headingHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-text-secondary text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            {t.pricingPage.desc}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-text-muted"
          >
            {[t.pricingPage.benefit1, t.pricingPage.benefit2, t.pricingPage.benefit3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-signal" />
                <span className="font-mono text-[12px] tracking-wide">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  )
}
