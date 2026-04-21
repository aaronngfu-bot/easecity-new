'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Radio, BrainCircuit, Globe, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

export function CoreServices() {
  const { t } = useLanguage()

  const primary = {
    num: '01',
    icon: Radio,
    tag: t.coreServices.s1Tag,
    title: t.coreServices.s1Title,
    description: t.coreServices.s1Desc,
    features: [t.coreServices.s1F1, t.coreServices.s1F2, t.coreServices.s1F3, t.coreServices.s1F4],
    href: '/services',
    cta: t.coreServices.s1Cta,
    isLive: true,
  }

  const secondary = [
    {
      num: '02',
      icon: Globe,
      tag: t.coreServices.s2Tag,
      title: t.coreServices.s2Title,
      description: t.coreServices.s2Desc,
      href: '/services#future',
      cta: t.coreServices.s2Cta,
      period: '2027',
    },
    {
      num: '03',
      icon: BrainCircuit,
      tag: t.coreServices.s3Tag,
      title: t.coreServices.s3Title,
      description: t.coreServices.s3Desc,
      href: '/services#future',
      cta: t.coreServices.s3Cta,
      period: '2028 →',
    },
  ]

  return (
    <section id="services-section" className="section-padding relative overflow-hidden border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-surface/30 to-bg-base pointer-events-none" />

      <div className="container-max relative z-10">
        {/* Editorial header row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-14 md:mb-20 grid grid-cols-12 gap-6 items-end"
        >
          <div className="col-span-12 md:col-span-8">
            <div className="flex items-center gap-3 mb-5">
              <span className="label-mono text-signal">§ CORE SERVICES</span>
              <span className="h-px w-16 bg-border" />
              <span className="label-mono">003 CAPABILITIES</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[0.95] tracking-tight text-text-primary">
              {t.coreServices.heading}{' '}
              <span className="text-outline">{t.coreServices.headingHighlight}</span>
            </h2>
          </div>
          <p className="col-span-12 md:col-span-4 text-text-secondary text-sm md:text-base leading-relaxed">
            {t.coreServices.desc}
          </p>
        </motion.div>

        {/* Asymmetric grid: 2+1 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-6">
          {/* Primary — the live one, 3 columns */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:col-span-3 relative group rounded-2xl border border-signal/25 bg-bg-surface overflow-hidden transition-all duration-300 hover:border-signal/60 hover:shadow-glow-signal"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent" />
            {/* Rule grid bg */}
            <div className="absolute inset-0 bg-rule-grid opacity-[0.08] pointer-events-none" />

            <div className="relative p-7 md:p-10 flex flex-col h-full min-h-[480px]">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-signal/30 bg-signal/10">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-signal opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-signal" />
                  </span>
                  <span className="text-signal text-[10px] font-mono tracking-widest uppercase">
                    {primary.tag}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className="font-display font-bold text-signal/15 leading-none"
                    style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}
                  >
                    {primary.num}
                  </span>
                </div>
              </div>

              {/* Icon + title */}
              <div className="mb-5">
                <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/25 text-signal flex items-center justify-center mb-5 group-hover:bg-signal/15 transition-colors">
                  <primary.icon size={22} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-3 leading-tight">
                  {primary.title}
                </h3>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-lg">
                  {primary.description}
                </p>
              </div>

              {/* Features grid */}
              <ul className="mt-auto pt-6 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3">
                {primary.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-signal" />
                    <span className="text-text-secondary text-xs md:text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={primary.href}
                className="mt-6 group/cta inline-flex items-center gap-2 text-sm font-mono tracking-wider text-signal hover:text-signal-light transition-colors"
              >
                <span className="text-signal">→</span>
                <span className="border-b border-dashed border-signal/40 pb-0.5">{primary.cta}</span>
                <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.article>

          {/* Secondary stack — 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-5 lg:gap-6">
            {secondary.map((s, i) => (
              <motion.article
                key={s.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                className={cn(
                  'relative group rounded-2xl border border-border bg-bg-surface overflow-hidden transition-all duration-300 flex-1',
                  'hover:border-border/80 hover:bg-bg-elevated'
                )}
              >
                <div className="relative p-6 md:p-7 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-bg-elevated">
                      <Lock size={9} className="text-text-muted" />
                      <span className="text-text-muted text-[10px] font-mono tracking-widest uppercase">
                        {s.tag}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[10px] text-text-muted tracking-widest pt-1">
                        {s.period}
                      </span>
                      <span
                        className="font-display font-bold text-text-muted/15 leading-none"
                        style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)' }}
                      >
                        {s.num}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-bg-elevated border border-border text-text-muted flex items-center justify-center">
                      <s.icon size={16} />
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-bold text-text-primary leading-tight">
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-text-secondary text-xs md:text-sm leading-relaxed flex-1">
                    {s.description}
                  </p>

                  <Link
                    href={s.href}
                    className="mt-5 group/cta inline-flex items-center gap-1.5 text-xs font-mono tracking-wider text-text-muted hover:text-text-secondary transition-colors w-fit"
                  >
                    {s.cta}
                    <ArrowRight size={12} className="group-hover/cta:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
