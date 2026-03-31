'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import { HKSkyline } from '@/components/shared/HKSkyline'
import { useLanguage } from '@/context/LanguageContext'

export function CTASection() {
  const { t } = useLanguage()

  return (
    <section className="relative py-24 md:py-32 overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base to-bg-surface pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-accent-cyan/6 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/30 to-transparent" />

      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-cyan rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent-purple rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-cyan/25 bg-accent-cyan/8 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse-slow" />
            <span className="text-accent-cyan text-xs font-mono tracking-wider">{t.cta.badge}</span>
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-tight mb-6">
            {t.cta.heading}{' '}
            <span className="text-gradient-primary">{t.cta.headingHighlight}</span>
          </h2>

          <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10">
            {t.cta.desc}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 px-7 py-4 bg-accent-cyan text-bg-base font-semibold text-base rounded-xl hover:bg-accent-cyan-light transition-all duration-200 shadow-glow-cyan hover:shadow-glow-cyan"
            >
              <Mail size={18} />
              {t.cta.cta1}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-7 py-4 border border-border text-text-primary font-semibold text-base rounded-xl hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all duration-200"
            >
              {t.cta.cta2}
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-wrap justify-center gap-8 text-sm text-text-muted">
            {[t.cta.trust1, t.cta.trust2, t.cta.trust3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent-cyan/50" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
        <HKSkyline className="opacity-15" />
      </div>
    </section>
  )
}
