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
    <section className="relative overflow-hidden pb-20 pt-32 md:pb-24 md:pt-40">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 42% at 72% 0%, rgba(0,229,204,0.14), transparent 58%)',
        }}
      />
      <div className="absolute inset-0 control-grid opacity-[0.28] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="absolute right-6 top-24 hidden items-center gap-2 rounded-sm border border-signal/25 bg-signal/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-signal md:right-12 md:flex"
      >
        <span className="w-1 h-1 rounded-full bg-signal animate-signal-pulse" />
        <span>SYS_ONLINE</span>
      </motion.div>

      <div className="container-max relative z-10">
        <div className={cn('max-w-4xl', align === 'center' && 'mx-auto text-center')}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
              'mb-8 flex items-center gap-3 md:mb-10',
              align === 'center' && 'justify-center'
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
              {sectionCode}.{serial}
            </span>
            <span className="h-px w-12 bg-gradient-to-r from-signal/50 to-transparent" />
            <span className="signal-badge">{eyebrow}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mb-7 font-display text-display-xl font-semibold text-text-primary md:mb-9"
          >
            {heading}
            <br />
            <span className="text-signal">{headingHighlight}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className={cn(
              'max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg',
              align === 'center' && 'mx-auto'
            )}
          >
            {description}
          </motion.p>

          {meta && meta.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className={cn(
                'mt-10 flex flex-wrap items-stretch gap-0 border-y border-border md:mt-14',
                align === 'center' && 'justify-center'
              )}
            >
              {meta.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex flex-col py-4 pr-8 md:py-5 md:pr-12',
                    i > 0 && 'border-l border-border pl-8 md:pl-12'
                  )}
                >
                  <span className="label-mono mb-2">{item.label}</span>
                  <span className="font-mono text-sm tabular-nums text-text-primary md:text-base">
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
