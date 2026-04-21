'use client'

import { motion } from 'framer-motion'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function TechProcess() {
  const { t } = useLanguage()

  const steps = [
    { number: '01', title: t.techProcess.s1Title, description: t.techProcess.s1Desc, technical: [t.techProcess.s1T1, t.techProcess.s1T2, t.techProcess.s1T3, t.techProcess.s1T4] },
    { number: '02', title: t.techProcess.s2Title, description: t.techProcess.s2Desc, technical: [t.techProcess.s2T1, t.techProcess.s2T2, t.techProcess.s2T3, t.techProcess.s2T4] },
    { number: '03', title: t.techProcess.s3Title, description: t.techProcess.s3Desc, technical: [t.techProcess.s3T1, t.techProcess.s3T2, t.techProcess.s3T3, t.techProcess.s3T4] },
    { number: '04', title: t.techProcess.s4Title, description: t.techProcess.s4Desc, technical: [t.techProcess.s4T1, t.techProcess.s4T2, t.techProcess.s4T3, t.techProcess.s4T4] },
    { number: '05', title: t.techProcess.s5Title, description: t.techProcess.s5Desc, technical: [t.techProcess.s5T1, t.techProcess.s5T2, t.techProcess.s5T3, t.techProcess.s5T4] },
  ]

  return (
    <section id="process" className="section-padding border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/20 to-transparent pointer-events-none" />

      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.techProcess.eyebrow}
          title={t.techProcess.heading}
          titleHighlight={t.techProcess.headingHighlight}
          description={t.techProcess.desc}
        />

        <div className="relative">
          <div className="absolute left-4 md:left-[3.25rem] top-0 bottom-0 w-px bg-gradient-to-b from-signal/40 via-signal/20 to-transparent pointer-events-none" />

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative flex gap-6 md:gap-8"
              >
                <div className="flex-shrink-0 z-10">
                  <div className="w-8 h-8 md:w-[6.5rem] flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full glass-panel !rounded-full border border-signal/30 flex items-center justify-center">
                      <span className="text-signal text-xs font-mono font-bold relative z-10">{step.number}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 pb-6">
                  <div className="glass-panel glass-panel-interactive p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:gap-8">
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="font-display text-lg font-semibold text-text-primary mb-2.5">{step.title}</h3>
                        <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                      </div>
                      <div className="md:w-64 flex-shrink-0">
                        <p className="label-mono mb-2">{t.techProcess.technicalLabel}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {step.technical.map((tech) => (
                            <div key={tech} className="px-2 py-1 rounded-md bg-bg-base/40 border border-border text-[11px] text-text-muted font-mono leading-snug">
                              {tech}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
