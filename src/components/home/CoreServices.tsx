'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Radio, BrainCircuit, Globe, ArrowRight, Lock, CheckCircle2 } from 'lucide-react'
import { SectionTitle } from '@/components/ui/SectionTitle'
import { useLanguage } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

export function CoreServices() {
  const { t } = useLanguage()

  const services = [
    {
      num: '01',
      icon: Radio,
      tag: t.coreServices.s1Tag,
      tagColor: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20',
      title: t.coreServices.s1Title,
      description: t.coreServices.s1Desc,
      features: [t.coreServices.s1F1, t.coreServices.s1F2, t.coreServices.s1F3, t.coreServices.s1F4],
      href: '/services',
      cta: t.coreServices.s1Cta,
      highlight: true,
      isLive: true,
    },
    {
      num: '02',
      icon: Globe,
      tag: t.coreServices.s2Tag,
      tagColor: 'text-text-muted bg-bg-elevated border-border',
      title: t.coreServices.s2Title,
      description: t.coreServices.s2Desc,
      features: [t.coreServices.s2F1, t.coreServices.s2F2, t.coreServices.s2F3, t.coreServices.s2F4],
      href: '/services#future',
      cta: t.coreServices.s2Cta,
      highlight: false,
      isLive: false,
    },
    {
      num: '03',
      icon: BrainCircuit,
      tag: t.coreServices.s3Tag,
      tagColor: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20',
      title: t.coreServices.s3Title,
      description: t.coreServices.s3Desc,
      features: [t.coreServices.s3F1, t.coreServices.s3F2, t.coreServices.s3F3, t.coreServices.s3F4],
      href: '/services#future',
      cta: t.coreServices.s3Cta,
      highlight: false,
      isLive: false,
    },
  ]

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/20 to-transparent pointer-events-none" />

      <div className="container-max relative z-10">
        <SectionTitle
          eyebrow={t.coreServices.eyebrow}
          title={t.coreServices.heading}
          titleHighlight={t.coreServices.headingHighlight}
          description={t.coreServices.desc}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={cn(
                'relative group rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col',
                service.highlight
                  ? 'border-accent-cyan/30 bg-bg-surface hover:border-accent-cyan/60 hover:shadow-[0_0_40px_#22d3ee18]'
                  : 'border-border bg-bg-surface hover:border-border/80 hover:bg-bg-elevated'
              )}
            >
              {/* Top accent line for highlighted */}
              {service.highlight && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent" />
              )}

              {/* Subtle background glow */}
              <div className={cn(
                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none',
                service.highlight
                  ? 'bg-gradient-to-b from-accent-cyan/5 to-transparent'
                  : i === 2
                    ? 'bg-gradient-to-b from-accent-purple/4 to-transparent'
                    : 'bg-gradient-to-b from-white/2 to-transparent'
              )} />

              <div className="relative z-10 p-7 flex flex-col flex-1">
                {/* Header row */}
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium',
                    service.tagColor
                  )}>
                    {service.isLive && <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />}
                    {!service.isLive && <Lock size={9} />}
                    {service.tag}
                  </div>
                  <div className="flex items-center gap-2.5">
                    {/* Card number */}
                    <span className="font-mono text-xs text-text-muted/40 font-bold">{service.num}</span>
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                      service.highlight
                        ? 'bg-accent-cyan/15 text-accent-cyan group-hover:bg-accent-cyan/25 group-hover:shadow-glow-cyan-sm'
                        : i === 2
                          ? 'bg-accent-purple/10 text-accent-purple group-hover:bg-accent-purple/20'
                          : 'bg-bg-elevated text-text-muted group-hover:text-text-secondary group-hover:bg-bg-elevated'
                    )}>
                      <service.icon size={20} />
                    </div>
                  </div>
                </div>

                <h3 className="font-display text-xl font-bold text-text-primary mb-3 group-hover:text-white transition-colors duration-200">
                  {service.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Features with check icons */}
                <ul className="space-y-2.5 mb-7 flex-1">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle2
                        size={14}
                        className={cn(
                          'mt-0.5 flex-shrink-0 transition-colors duration-200',
                          service.highlight
                            ? 'text-accent-cyan'
                            : i === 2
                              ? 'text-accent-purple/60 group-hover:text-accent-purple'
                              : 'text-text-muted group-hover:text-text-secondary'
                        )}
                      />
                      <span className="text-text-secondary text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={service.href}
                  className={cn(
                    'group/cta inline-flex items-center gap-1.5 text-sm font-semibold transition-all duration-200',
                    service.highlight
                      ? 'text-accent-cyan hover:text-accent-cyan-light'
                      : i === 2
                        ? 'text-accent-purple/70 hover:text-accent-purple'
                        : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  {service.cta}
                  <ArrowRight size={14} className="group-hover/cta:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
