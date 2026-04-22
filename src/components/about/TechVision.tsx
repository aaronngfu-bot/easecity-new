'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { TypewriterQuote } from '@/components/ui/TypewriterQuote'
import { useLanguage } from '@/context/LanguageContext'

export function TechVision() {
  const { t } = useLanguage()

  const capabilities = [
    {
      domain: t.techVision.cap1Domain,
      items: [t.techVision.cap1I1, t.techVision.cap1I2, t.techVision.cap1I3, t.techVision.cap1I4],
    },
    {
      domain: t.techVision.cap2Domain,
      items: [t.techVision.cap2I1, t.techVision.cap2I2, t.techVision.cap2I3, t.techVision.cap2I4],
    },
    {
      domain: t.techVision.cap3Domain,
      items: [t.techVision.cap3I1, t.techVision.cap3I2, t.techVision.cap3I3, t.techVision.cap3I4],
    },
  ]

  const timeline = [
    { year: t.techVision.t1Year, label: t.techVision.t1Label, active: true, stage: 'live' as const },
    { year: t.techVision.t2Year, label: t.techVision.t2Label, active: false, stage: 'planned' as const },
    { year: t.techVision.t3Year, label: t.techVision.t3Label, active: false, stage: 'planned' as const },
    { year: t.techVision.t4Year, label: t.techVision.t4Label, active: false, stage: 'future' as const },
  ]

  return (
    <section className="section-padding border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/20 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-signal/3 rounded-full blur-[100px] pointer-events-none" />

      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.techVision.eyebrow}
          title={t.techVision.heading}
          titleHighlight={t.techVision.headingHighlight}
          description={t.techVision.desc}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-14 glass-prominent p-8 md:p-10"
        >
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="label-mono text-signal/60">PRINCIPLE</span>
            <span className="h-px w-8 bg-gradient-to-r from-signal/40 to-transparent" />
          </div>
          <TypewriterQuote
            text={t.techVision.quote}
            speed={22}
            className="text-text-primary text-lg md:text-xl leading-relaxed font-medium text-center min-h-[4rem]"
          />
          <p className="text-text-muted text-sm text-center mt-4 font-mono tracking-wide">
            — {t.techVision.quoteAttr}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.domain}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-panel glass-panel-interactive p-6 group"
            >
              <div className="flex items-center gap-2 mb-5">
                <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
                  DOMAIN.{String(i + 1).padStart(2, '0')}
                </span>
                <span className="h-px flex-1 bg-border/60" />
              </div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full bg-signal" />
                <h3 className="font-display text-base font-semibold text-text-primary">{cap.domain}</h3>
              </div>
              <ul className="space-y-2.5">
                {cap.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-signal/50 flex-shrink-0" />
                    <span className="text-text-secondary text-sm leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="glass-panel p-6 md:p-7 overflow-x-auto"
        >
          <div className="flex items-center gap-2 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-signal-pulse" />
            <p className="label-mono text-signal/80">{t.techVision.timelineLabel}</p>
          </div>
          <div className="flex items-stretch gap-0 min-w-[500px]">
            {timeline.map((item, i, arr) => (
              <div key={item.year} className="flex-1 flex flex-col items-center">
                <div
                  className={`h-[3px] w-full ${
                    item.stage === 'live'
                      ? 'bg-signal'
                      : item.stage === 'planned'
                      ? 'bg-text-muted/60'
                      : 'bg-text-muted/25'
                  } ${i === 0 ? 'rounded-l-full' : ''} ${i === arr.length - 1 ? 'rounded-r-full' : ''}`}
                />
                <div className="mt-4 text-center">
                  <p
                    className={`text-xs font-mono font-bold tabular-nums ${
                      item.active ? 'text-signal' : 'text-text-muted'
                    }`}
                  >
                    {item.year}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      item.active ? 'text-text-secondary' : 'text-text-muted'
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
