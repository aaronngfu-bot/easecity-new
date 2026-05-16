'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'

export function PricingHero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-20 md:pt-40">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 0%, rgba(0,229,204,0.16), transparent 60%)',
        }}
      />
      <div className="absolute inset-0 control-grid opacity-[0.26] pointer-events-none" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/25 to-transparent" />

      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.14, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute left-1/2 top-[-20%] h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-signal blur-[140px]"
      />

      <div className="container-max relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-center gap-3"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              PRICING.03
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-signal/40 to-transparent" />
            <span className="signal-badge">
              <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" />
              {t.pricingPage.badge}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-7 font-display text-display-xl font-semibold"
          >
            <span className="text-text-primary">{t.pricingPage.heading1}</span>
            <br />
            <span className="text-signal">{t.pricingPage.headingHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg"
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
                <span className="h-1.5 w-1.5 rounded-full bg-signal" />
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
