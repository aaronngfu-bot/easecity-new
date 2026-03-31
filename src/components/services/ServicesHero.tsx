'use client'

import { useLanguage } from '@/context/LanguageContext'

export function ServicesHero() {
  const { t } = useLanguage()

  return (
    <section className="relative pt-40 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="container-max relative z-10">
        <div className="max-w-3xl">
          <p className="text-accent-cyan text-sm font-mono tracking-widest uppercase mb-4">
            {t.servicesPage.eyebrow}
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-text-primary leading-tight mb-6">
            {t.servicesPage.heading}{' '}
            <span className="text-gradient-cyan">{t.servicesPage.headingHighlight}</span>
          </h1>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
            {t.servicesPage.desc}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  )
}
