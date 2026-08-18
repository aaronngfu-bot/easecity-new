'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { RevealSection } from '@/components/ui/RevealSection'
import SectionHeading from '@/components/SectionHeading'
import { CompanyIllustration } from '@/components/illustrations/CompanyIllustration'

export default function HomePage() {
  const { t } = useLanguage()
  const c = t.companyPage

  return (
    <main className="relative min-h-screen">
      {/* Hero — company-level, not product-specific */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[var(--bg-base)]">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,var(--signal-soft),transparent_70%)]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <p className="label-mono mb-6 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)] animate-pulse" />
            {c.heroEyebrow}
          </p>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
            {c.heroTitle}
            <br />
            <span className="text-gradient-signal">{c.heroHighlight}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
            {c.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/ec-share" className="btn-primary">
              {c.heroCtaProduct}
            </Link>
            <Link href="/services" className="btn-secondary">
              {c.heroCtaServices}
            </Link>
          </div>

          {/* Illustration */}
          <div className="mx-auto mt-14 max-w-3xl">
            <CompanyIllustration />
          </div>
        </div>
      </section>

      {/* Products overview */}
      <RevealSection>
        <section className="section-padding">
          <div className="container-max">
            <SectionHeading
              badge={c.productsBadge}
              align="center"
              title={c.productsTitle}
              subtitle={c.productsSubtitle}
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {/* EC-Share */}
              <Link href="/ec-share" className="card p-8 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)]">
                    <svg className="h-5 w-5 text-[var(--signal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="label-mono">{c.product01Label}</p>
                    <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.product01Name}</h3>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {c.product01Desc}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="badge">Windows</span>
                  <span className="badge">Android</span>
                  <span className="badge">14-day trial</span>
                </div>
              </Link>

              {/* Services */}
              <Link href="/services" className="card p-8 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)]">
                    <svg className="h-5 w-5 text-[var(--signal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="label-mono">{c.servicesLabel}</p>
                    <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.servicesName}</h3>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {c.servicesDesc}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="badge">Web</span>
                  <span className="badge">Desktop</span>
                  <span className="badge">Design</span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* About teaser */}
      <RevealSection>
        <section className="section-padding bg-[var(--bg-surface)]">
          <div className="container-max">
            <div className="mx-auto max-w-3xl text-center">
              <SectionHeading
                badge={c.aboutBadge}
                align="center"
                title={c.aboutTitle}
                subtitle={c.aboutSubtitle}
              />
              <div className="mt-8">
                <Link href="/about" className="btn-secondary">
                  {c.aboutCta}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>
    </main>
  )
}
