'use client'

import { useLanguage } from '@/context/LanguageContext'

export function PricingHero() {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-20 md:pt-40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 50% 0%, var(--signal-soft), transparent 60%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--signal)]/25 to-transparent" />

      <div className="container-max relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="type-section mb-7 font-display text-4xl font-bold md:text-6xl">
            <span className="text-[var(--text-primary)]">{t.pricingPage.heading1}</span>
            <br />
            <span className="text-[var(--signal)]">{t.pricingPage.headingHighlight}</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
            {t.pricingPage.desc}
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
            {[t.pricingPage.benefit1, t.pricingPage.benefit2, t.pricingPage.benefit3].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
                <span className="font-mono text-[12px] tracking-wide">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent" />
    </section>
  )
}
