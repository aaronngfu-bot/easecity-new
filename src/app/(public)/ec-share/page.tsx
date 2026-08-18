'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const features = [
  { key: 'f1Title', desc: 'f1Desc', icon: 'grid' },
  { key: 'f2Title', desc: 'f2Desc', icon: 'focus' },
  { key: 'f3Title', desc: 'f3Desc', icon: 'clipboard' },
  { key: 'f4Title', desc: 'f4Desc', icon: 'share' },
  { key: 'f5Title', desc: 'f5Desc', icon: 'input' },
  { key: 'f6Title', desc: 'f6Desc', icon: 'record' },
] as const

function FeatureIcon({ icon }: { icon: string }) {
  const common = { strokeWidth: 1.8, stroke: 'currentColor', fill: 'none' } as const
  switch (icon) {
    case 'grid':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'focus':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...common}>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'clipboard':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...common}>
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <path d="M9 12h6M9 16h4" strokeLinecap="round" />
        </svg>
      )
    case 'share':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...common}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.7 10.5l6.6-3.8M8.7 13.5l6.6 3.8" strokeLinecap="round" />
        </svg>
      )
    case 'input':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...common}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M10 14h.01" strokeLinecap="round" />
        </svg>
      )
    case 'record':
      return (
        <svg viewBox="0 0 24 24" width="20" height="20" {...common}>
          <circle cx="12" cy="12" r="3" />
          <rect x="3" y="3" width="18" height="18" rx="4" />
        </svg>
      )
    default:
      return null
  }
}

export default function EcSharePage() {
  const { t } = useLanguage()
  const c = t.ecSharePage

  return (
    <main className="relative min-h-screen bg-[var(--bg-base)]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,var(--signal-soft),transparent_70%)]"
        />

        <div className="container-max relative z-10 pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="label-mono mb-6 flex items-center justify-center gap-2 text-[var(--signal)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />
              {c.heroEyebrow}
            </p>

            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              {c.heroTitle}
              <br />
              <span className="text-gradient-signal">{c.heroHighlight}</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
              {c.heroSubtitle}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="btn-primary px-7 py-3 text-sm">
                {c.heroCtaPrimary}
              </Link>
              <Link href="/pricing" className="btn-secondary px-7 py-3 text-sm">
                {c.heroCtaSecondary}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {[
                { label: c.heroStat1, value: c.heroStat1Value },
                { label: c.heroStat2, value: c.heroStat2Value },
                { label: c.heroStat3, value: c.heroStat3Value },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-[var(--text-primary)]">
                    {s.value}
                  </p>
                  <p className="label-mono mt-1 text-[var(--text-muted)]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section-padding">
        <div className="container-max">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="label-mono mb-4 text-[var(--signal)]">{c.featuresBadge}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              {c.featuresTitle}
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">{c.featuresSubtitle}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.key}
                className="card p-7 transition hover:border-[var(--signal)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                  <FeatureIcon icon={f.icon} />
                </div>
                <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                  {c[f.key]}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {c[f.desc]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="section-padding bg-[var(--bg-surface)]">
        <div className="container-max">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="label-mono mb-4 text-[var(--signal)]">{c.workflowBadge}</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              {c.workflowTitle}
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">{c.workflowSubtitle}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: '01', title: c.w1Title, desc: c.w1Desc },
              { n: '02', title: c.w2Title, desc: c.w2Desc },
              { n: '03', title: c.w3Title, desc: c.w3Desc },
              { n: '04', title: c.w4Title, desc: c.w4Desc },
            ].map((step) => (
              <div key={step.n}>
                <p className="font-mono text-2xl font-semibold text-[var(--signal)]">
                  {step.n}
                </p>
                <h3 className="mt-3 font-display text-lg font-semibold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-padding">
        <div className="container-max">
          <div className="card mx-auto max-w-3xl p-12 text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              {c.ctaTitle}
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">{c.ctaSubtitle}</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/download" className="btn-primary px-7 py-3 text-sm">
                {c.ctaPrimary}
              </Link>
              <Link href="/about#contact" className="btn-secondary px-7 py-3 text-sm">
                {c.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
