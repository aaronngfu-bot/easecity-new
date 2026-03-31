'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/ui/SectionTitle'
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
    { year: t.techVision.t1Year, label: t.techVision.t1Label, active: true, color: 'bg-accent-cyan' },
    { year: t.techVision.t2Year, label: t.techVision.t2Label, active: false, color: 'bg-text-muted' },
    { year: t.techVision.t3Year, label: t.techVision.t3Label, active: false, color: 'bg-accent-purple' },
    { year: t.techVision.t4Year, label: t.techVision.t4Label, active: false, color: 'bg-text-muted/40' },
  ]

  return (
    <section className="section-padding border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/30 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-accent-purple/4 rounded-full blur-[100px] pointer-events-none" />

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
          className="max-w-4xl mx-auto mb-12 p-7 rounded-2xl border border-accent-cyan/15 bg-gradient-to-br from-accent-cyan/5 to-transparent"
        >
          <p className="text-text-primary text-lg md:text-xl leading-relaxed font-medium text-center">
            {t.techVision.quote}
          </p>
          <p className="text-text-muted text-sm text-center mt-4 font-mono">{t.techVision.quoteAttr}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.domain}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="p-6 rounded-2xl border border-border bg-bg-surface"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-5 rounded-full bg-accent-cyan" />
                <h3 className="font-display text-sm font-semibold text-text-primary">{cap.domain}</h3>
              </div>
              <ul className="space-y-3">
                {cap.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-accent-cyan/60 flex-shrink-0" />
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
          className="mt-10 p-6 rounded-2xl border border-border bg-bg-surface overflow-x-auto"
        >
          <p className="text-text-muted text-xs font-mono uppercase tracking-wide mb-6">
            {t.techVision.timelineLabel}
          </p>
          <div className="flex items-stretch gap-0 min-w-[500px]">
            {timeline.map((item, i, arr) => (
              <div key={item.year} className="flex-1 flex flex-col items-center">
                <div className={`h-2 w-full ${item.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === arr.length - 1 ? 'rounded-r-full' : ''} ${!item.active ? 'opacity-30' : ''}`} />
                <div className="mt-3 text-center">
                  <p className={`text-xs font-mono font-bold ${item.active ? 'text-accent-cyan' : 'text-text-muted'}`}>{item.year}</p>
                  <p className={`text-xs mt-0.5 ${item.active ? 'text-text-secondary' : 'text-text-muted'}`}>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
