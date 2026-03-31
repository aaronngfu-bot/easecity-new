'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BrainCircuit, Globe, Sparkles, ArrowRight } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'

export function FutureServices() {
  const { t } = useLanguage()

  const futureItems = [
    {
      icon: Globe,
      phase: t.futureServices.f1Phase,
      title: t.futureServices.f1Title,
      description: t.futureServices.f1Desc,
      highlights: [t.futureServices.f1H1, t.futureServices.f1H2, t.futureServices.f1H3, t.futureServices.f1H4, t.futureServices.f1H5],
      color: 'border-border hover:border-text-muted/40',
      iconBg: 'bg-bg-elevated text-text-secondary',
      phaseBadge: 'text-text-muted bg-bg-elevated border-border',
    },
    {
      icon: BrainCircuit,
      phase: t.futureServices.f2Phase,
      title: t.futureServices.f2Title,
      description: t.futureServices.f2Desc,
      highlights: [t.futureServices.f2H1, t.futureServices.f2H2, t.futureServices.f2H3, t.futureServices.f2H4, t.futureServices.f2H5],
      color: 'border-accent-purple/20 hover:border-accent-purple/50',
      iconBg: 'bg-accent-purple/10 text-accent-purple',
      phaseBadge: 'text-accent-purple bg-accent-purple/10 border-accent-purple/25',
    },
  ]

  return (
    <section id="future" className="section-padding border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/3 via-transparent to-accent-cyan/3 pointer-events-none" />

      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.futureServices.eyebrow}
          title={t.futureServices.heading}
          titleHighlight={t.futureServices.headingHighlight}
          description={t.futureServices.desc}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {futureItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={`group p-7 rounded-2xl border bg-bg-surface transition-all duration-300 ${item.color}`}
            >
              <div className="flex items-start justify-between mb-5">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${item.phaseBadge}`}>{item.phase}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                  <item.icon size={20} />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary mb-3">{item.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-5">{item.description}</p>
              <ul className="space-y-2">
                {item.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2.5">
                    <Sparkles size={11} className="text-text-muted flex-shrink-0" />
                    <span className="text-text-secondary text-xs">{h}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center p-8 rounded-2xl border border-accent-cyan/15 bg-accent-cyan/4"
        >
          <p className="text-text-secondary text-sm mb-3">{t.futureServices.bannerDesc}</p>
          <h3 className="font-display text-xl font-bold text-text-primary mb-5">{t.futureServices.bannerTitle}</h3>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all duration-200 shadow-glow-cyan-sm"
          >
            {t.futureServices.bannerCta}
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
