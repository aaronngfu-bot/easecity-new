'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { HKSkyline } from '@/components/shared/HKSkyline'
import { useLanguage } from '@/context/LanguageContext'

export function CTASection() {
  const { t } = useLanguage()

  return (
    <section id="connect-section" className="relative py-24 md:py-32 overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base to-bg-surface pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-radial from-signal/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-rule-grid opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-signal rounded-full blur-[140px] pointer-events-none"
      />

      <div className="container-max relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Label row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-10"
          >
            <span className="h-px w-16 bg-border" />
            <span className="label-mono text-signal">§ CONNECT</span>
            <span className="h-px w-16 bg-border" />
          </motion.div>

          {/* Terminal prompt — the signature moment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="terminal rounded-xl overflow-hidden max-w-3xl mx-auto mb-12"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3f3f46]" />
                <span className="w-2 h-2 rounded-full bg-[#3f3f46]" />
                <span className="w-2 h-2 rounded-full bg-signal/80" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-text-muted uppercase">
                easecity — contact.shell
              </span>
              <span className="text-[10px] font-mono text-text-muted">
                {t.cta.badge}
              </span>
            </div>
            <div className="px-5 md:px-8 py-6 md:py-8 font-mono text-sm md:text-base leading-relaxed">
              <div className="text-text-muted mb-1">
                <span className="text-signal">&gt;</span> welcome to easecity control shell
              </div>
              <div className="text-text-muted mb-3">
                <span className="text-signal">&gt;</span> type your intent below to connect an engineer
              </div>
              <div className="text-text-primary">
                <span className="text-signal">$</span>{' '}
                <span className="text-text-primary">./start_conversation</span>{' '}
                <span className="text-text-secondary">--with</span>{' '}
                <span className="text-signal">easecity</span>
              </div>
              <div className="mt-3">
                <span className="text-signal">→</span>{' '}
                <span className="text-text-secondary">awaiting input</span>
                <span className="terminal-caret" />
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary leading-[0.95] tracking-tight text-center mb-6"
          >
            {t.cta.heading}{' '}
            <span className="text-outline-signal">{t.cta.headingHighlight}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-text-secondary text-base md:text-lg leading-relaxed text-center max-w-2xl mx-auto mb-10"
          >
            {t.cta.desc}
          </motion.p>

          {/* Keyboard-key CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap justify-center items-center gap-4"
          >
            <Link
              href="/contact"
              className="group inline-flex items-stretch rounded-lg overflow-hidden bg-signal text-bg-base hover:bg-signal-light transition-colors shadow-glow-signal-sm hover:shadow-glow-signal"
            >
              <span className="px-5 py-3 font-semibold text-sm tracking-wide">
                {t.cta.cta1}
              </span>
              <span className="flex items-center justify-center px-3 border-l border-bg-base/20 font-mono text-[10px] tracking-[0.2em] bg-signal/90 group-hover:bg-signal-light/90 transition-colors">
                ENTER
                <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
            <Link
              href="/services"
              className="group inline-flex items-stretch rounded-lg overflow-hidden border border-border bg-bg-elevated hover:border-signal/40 hover:bg-signal/5 text-text-primary transition-colors"
            >
              <span className="px-5 py-3 font-semibold text-sm tracking-wide">
                {t.cta.cta2}
              </span>
              <span className="flex items-center justify-center px-3 border-l border-border font-mono text-[10px] tracking-[0.2em] text-text-muted group-hover:text-signal transition-colors">
                ESC
              </span>
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 pt-8 border-t border-border flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] md:text-xs font-mono tracking-widest uppercase text-text-muted"
          >
            {[t.cta.trust1, t.cta.trust2, t.cta.trust3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-signal/60" />
                {item}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none">
        <HKSkyline className="opacity-10" />
      </div>
    </section>
  )
}
