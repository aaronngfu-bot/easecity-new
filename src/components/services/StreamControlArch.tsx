'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'
import { InteractiveArchDiagram } from './InteractiveArchDiagram'

export function StreamControlArch() {
  const { t } = useLanguage()

  const steps = [
    { step: '01', title: t.streamArch.step1Title, desc: t.streamArch.step1Desc },
    { step: '02', title: t.streamArch.step2Title, desc: t.streamArch.step2Desc },
    { step: '03', title: t.streamArch.step3Title, desc: t.streamArch.step3Desc },
    { step: '04', title: t.streamArch.step4Title, desc: t.streamArch.step4Desc },
  ]

  return (
    <section className="section-padding border-t border-border">
      <div className="container-max">
        <SectionTitle
          eyebrow={t.streamArch.eyebrow}
          title={t.streamArch.heading}
          titleHighlight={t.streamArch.headingHighlight}
          description={t.streamArch.desc}
          align="left"
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 glass-panel p-4 md:p-6"
          >
            <InteractiveArchDiagram termLabel={t.streamArch.termLabel} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2 space-y-5"
          >
            {steps.map((item) => (
              <div key={item.step} className="flex gap-4 group">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg border border-signal/20 bg-signal/5 flex items-center justify-center group-hover:bg-signal/10 group-hover:border-signal/40 transition-colors">
                  <span className="text-signal text-xs font-mono font-bold">{item.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary text-sm mb-1.5">{item.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
