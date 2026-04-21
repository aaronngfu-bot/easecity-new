'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeroProps {
  /** Serial number displayed in top-left — e.g. "02" */
  serial: string
  /** Section code displayed with serial — e.g. "SERVICES" */
  sectionCode: string
  /** Short eyebrow label */
  eyebrow: string
  /** Main heading (first part, solid fill) */
  heading: string
  /** Highlighted ending of the heading (signal gradient) */
  headingHighlight: string
  /** Description paragraph */
  description: string
  /** Optional telemetry/meta items shown beneath the paragraph */
  meta?: { label: string; value: string }[]
  /** Optional alignment — default left, center for some pages */
  align?: 'left' | 'center'
}

export function PageHero({
  serial,
  sectionCode,
  eyebrow,
  heading,
  headingHighlight,
  description,
  meta,
  align = 'left',
}: PageHeroProps) {
  return (
    <section className="relative pt-32 md:pt-40 pb-20 md:pb-24 overflow-hidden">
      {/* Background: signal glow + rule grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, #22ff8810, transparent 60%), radial-gradient(ellipse 35% 25% at 15% 80%, #22ff8806, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 bg-rule-grid opacity-[0.18] pointer-events-none" />

      {/* Top-right serial badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute top-24 right-6 md:right-12 hidden md:flex items-center gap-2 glass-badge"
      >
        <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" />
        <span>SYS_ONLINE</span>
      </motion.div>

      <div className="container-max relative z-10">
        <div className={cn('max-w-4xl', align === 'center' && 'mx-auto text-center')}>
          {/* Serial + section code — editorial header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              'flex items-center gap-3 mb-8 md:mb-10',
              align === 'center' && 'justify-center'
            )}
          >
            <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
              {sectionCode}.{serial}
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-signal/40 to-transparent" />
            <span className="label-mono text-signal/80">{eyebrow}</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-text-primary leading-[1.02] tracking-tight mb-7 md:mb-9"
          >
            {heading}
            <br />
            <span className="text-gradient-signal">{headingHighlight}</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={cn(
              'text-text-secondary text-base md:text-lg leading-relaxed max-w-2xl',
              align === 'center' && 'mx-auto'
            )}
          >
            {description}
          </motion.p>

          {/* Optional telemetry meta row */}
          {meta && meta.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className={cn(
                'mt-10 md:mt-14 flex flex-wrap items-stretch gap-0 border-t border-b border-border/60',
                align === 'center' && 'justify-center'
              )}
            >
              {meta.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex flex-col py-4 md:py-5 pr-8 md:pr-12',
                    i > 0 && 'pl-8 md:pl-12 border-l border-border/60'
                  )}
                >
                  <span className="label-mono mb-2">{item.label}</span>
                  <span className="font-mono text-sm md:text-base text-text-primary tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom edge — signal thread */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-signal/20 to-transparent" />
    </section>
  )
}
