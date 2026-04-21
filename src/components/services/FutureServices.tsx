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
      stage: 'planned' as const,
    },
    {
      icon: BrainCircuit,
      phase: t.futureServices.f2Phase,
      title: t.futureServices.f2Title,
      description: t.futureServices.f2Desc,
      highlights: [t.futureServices.f2H1, t.futureServices.f2H2, t.futureServices.f2H3, t.futureServices.f2H4, t.futureServices.f2H5],
      stage: 'research' as const,
    },
  ]

  return (
    <section id="future" className="section-padding border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-signal/[0.02] via-transparent to-signal/[0.02] pointer-events-none" />
      <div className="absolute inset-0 bg-rule-grid opacity-[0.1] pointer-events-none" />

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
              className="glass-panel p-7 group"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
                  <span className="label-mono text-text-muted">{item.phase}</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-bg-base/40 border border-border flex items-center justify-center text-text-muted group-hover:text-text-secondary transition-colors">
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
          className="glass-prominent text-center p-8 md:p-10"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-signal animate-signal-pulse" />
            <span className="label-mono text-signal/80">EARLY_ACCESS</span>
          </div>
          <p className="text-text-secondary text-sm mb-3">{t.futureServices.bannerDesc}</p>
          <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary mb-6">{t.futureServices.bannerTitle}</h3>
          <Link href="/contact" className="glass-cta group">
            {t.futureServices.bannerCta}
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
