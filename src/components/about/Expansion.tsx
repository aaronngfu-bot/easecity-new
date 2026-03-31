'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Globe2, BrainCircuit, Layers3 } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function Expansion() {
  const { t } = useLanguage()

  const pillars = [
    {
      icon: Layers3,
      title: t.expansion.e1Title,
      description: t.expansion.e1Desc,
      status: t.expansion.e1Status,
      statusColor: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
    },
    {
      icon: Globe2,
      title: t.expansion.e2Title,
      description: t.expansion.e2Desc,
      status: t.expansion.e2Status,
      statusColor: 'text-text-muted bg-bg-elevated border-border',
    },
    {
      icon: BrainCircuit,
      title: t.expansion.e3Title,
      description: t.expansion.e3Desc,
      status: t.expansion.e3Status,
      statusColor: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
    },
  ]

  return (
    <section className="section-padding border-t border-border relative overflow-hidden">
      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.expansion.eyebrow}
          title={t.expansion.heading}
          titleHighlight={t.expansion.headingHighlight}
          description={t.expansion.desc}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="group p-6 rounded-2xl border border-border bg-bg-surface hover:border-accent-cyan/20 hover:bg-bg-elevated transition-all duration-300"
            >
              <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full border ${pillar.statusColor} mb-5`}>
                {pillar.status}
              </span>
              <div className="mb-4 w-10 h-10 rounded-xl bg-bg-elevated group-hover:bg-accent-cyan/10 border border-border group-hover:border-accent-cyan/20 flex items-center justify-center text-text-muted group-hover:text-accent-cyan transition-all duration-300">
                <pillar.icon size={18} />
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary mb-3">{pillar.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-text-secondary text-base mb-6 max-w-2xl mx-auto">{t.expansion.closing}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all duration-200 shadow-glow-cyan-sm"
            >
              {t.expansion.cta1}
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-border text-text-primary font-semibold text-sm rounded-xl hover:border-accent-cyan/30 hover:bg-accent-cyan/5 transition-all duration-200"
            >
              {t.expansion.cta2}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
