'use client'

import { motion } from 'framer-motion'
import { MonitorPlay, Building2, Radio, Server, Camera, Cpu } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function UseCases() {
  const { t } = useLanguage()

  const cases = [
    { icon: Radio, title: t.useCases.c1Title, description: t.useCases.c1Desc, tags: [t.useCases.c1T1, t.useCases.c1T2, t.useCases.c1T3] },
    { icon: Building2, title: t.useCases.c2Title, description: t.useCases.c2Desc, tags: [t.useCases.c2T1, t.useCases.c2T2, t.useCases.c2T3] },
    { icon: Camera, title: t.useCases.c3Title, description: t.useCases.c3Desc, tags: [t.useCases.c3T1, t.useCases.c3T2, t.useCases.c3T3] },
    { icon: Server, title: t.useCases.c4Title, description: t.useCases.c4Desc, tags: [t.useCases.c4T1, t.useCases.c4T2, t.useCases.c4T3] },
    { icon: MonitorPlay, title: t.useCases.c5Title, description: t.useCases.c5Desc, tags: [t.useCases.c5T1, t.useCases.c5T2, t.useCases.c5T3] },
    { icon: Cpu, title: t.useCases.c6Title, description: t.useCases.c6Desc, tags: [t.useCases.c6T1, t.useCases.c6T2, t.useCases.c6T3] },
  ]

  return (
    <section className="section-padding border-t border-border">
      <div className="container-max">
        <SectionTitle
          eyebrow={t.useCases.eyebrow}
          title={t.useCases.heading}
          titleHighlight={t.useCases.headingHighlight}
          description={t.useCases.desc}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cases.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="glass-panel glass-panel-interactive group p-6"
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.25em] text-text-muted">
                  CASE.{String(i + 1).padStart(2, '0')}
                </span>
                <div className="w-10 h-10 rounded-xl bg-bg-base/40 border border-border group-hover:bg-signal/10 group-hover:border-signal/25 flex items-center justify-center text-text-muted group-hover:text-signal transition-all duration-300">
                  <item.icon size={18} />
                </div>
              </div>
              <h3 className="font-display text-lg font-semibold text-text-primary mb-2.5 group-hover:text-white transition-colors">{item.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">{item.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-bg-base/40 border border-border text-text-muted text-[11px] font-mono tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
