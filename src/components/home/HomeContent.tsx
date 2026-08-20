'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Code2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { RevealSection } from '@/components/ui/RevealSection'
import SectionHeading from '@/components/SectionHeading'
import { CityPulse } from '@/components/hero/CityPulse'
import { BlogTimeline } from '@/components/home/BlogTimeline'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { services as serviceCatalog } from '@/lib/services'

export interface HomeBlogPost {
  id: string
  slug: string
  title: string
  title_zh: string | null
  excerpt: string | null
  excerpt_zh: string | null
  image: string | null
  publishedAt: string | Date | null
}

/**
 * Client-side home content. All copy reads through useLanguage so switching
 * language re-renders immediately; blog posts are injected from the server
 * parent (bilingual) so the rail also renders on first paint without a fetch.
 */
export function HomeContent() {
  const { t, language } = useLanguage()
  const c = t.companyPage
  const c2 = t.servicesPage

  // Client-fetch blog posts so the first paint doesn't wait on the DB. While
  // loading, a skeleton occupies the rail; posts arrive shortly after.
  const [blogPosts, setBlogPosts] = useState<HomeBlogPost[]>([])
  const [blogLoading, setBlogLoading] = useState(true)

  useEffect(() => {
    let active = true
    setBlogLoading(true)
    const params = new URLSearchParams({ limit: '10', lang: language })
    fetch(`/api/blog?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return
        if (d?.success && Array.isArray(d.data)) setBlogPosts(d.data)
        setBlogLoading(false)
      })
      .catch(() => {
        if (active) setBlogLoading(false)
      })
    return () => {
      active = false
    }
  }, [language])

  const services = serviceCatalog.map((s) => ({
    slug: s.slug,
    icon: s.icon,
    title: c2[s.titleKey as keyof typeof c2] as string,
    body: c2[s.bodyKey as keyof typeof c2] as string,
    bullets: language === 'zh' ? s.bullets.zh : s.bullets.en,
  }))

  return (
    <main className="relative min-h-screen">
      {/* Hero — City pulse vision hook */}
      <section className="relative overflow-hidden bg-[var(--bg-base)]">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_20%,var(--signal-soft),transparent_70%)]" />

        <div className="relative z-10 container-max grid items-center gap-12 pb-20 pt-32 md:pt-40 lg:grid-cols-2 lg:gap-x-16">
          <div className="text-left">
            <p className="label-mono mb-6 flex items-center gap-2 text-[var(--signal)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)] animate-pulse" />
              {c.heroEyebrowNew}
            </p>

            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              {c.heroTitleNew}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]">
              {c.heroSubtitleNew}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/about#contact" className="inline-flex items-center gap-2 rounded-lg bg-[var(--amber)] px-7 py-3 text-sm font-semibold text-[var(--amber-ink)] transition-colors hover:brightness-105">
                {c.heroCtaPrimary}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/services" className="btn-secondary px-7 py-3 text-sm">
                {c.heroCtaSecondary}
              </Link>
            </div>
          </div>

          <div className="relative h-[320px] sm:h-[380px] lg:h-full lg:min-h-[420px] lg:pl-4">
            <CityPulse className="h-full w-full" />
          </div>
        </div>
      </section>

      {/* Blog rail — active proof, surfaced early */}
      <RevealSection>
        <section className="section-padding">
          <div className="container-max">
            <SectionHeading
              badge={c.blogBadge}
              align="right"
              title={c.blogTitle}
              subtitle={c.blogSubtitle}
            />

            <div className="mt-10">
              <BlogTimeline posts={blogPosts} loading={blogLoading} />
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Products */}
      <RevealSection>
        <section className="section-padding">
          <div className="container-max">
            <SectionHeading
              badge={c.productsBadge}
              align="left"
              title={c.productsTitle}
              subtitle={c.productsSubtitle}
            />

            <div className="mt-12 grid items-center gap-10 lg:grid-cols-[2fr_3fr]">
              {/* Narrative */}
              <div className="text-left">
                <h3 className="font-display text-2xl font-bold leading-snug text-[var(--text-primary)] md:text-3xl">
                  {c.productsNarrative}
                </h3>
                <p className="mt-4 max-w-md text-[var(--text-secondary)] leading-relaxed">
                  {c.productsNarrativeDesc}
                </p>
                <a href="/ec-share" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] hover:text-[var(--signal-light)]">
                  {c.productsExploreCta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* EC-Share product card */}
              <Link href="/ec-share" className="card group relative flex flex-col overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:p-8">
                <div className="relative">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="label-mono">{c.product01Label}</span>
                    <span className="text-[var(--signal)]">{c.product01Name}</span>
                  </div>
                  <p className="label-mono text-xs text-[var(--text-muted)]">{c.product01Sub}</p>
                  <h3 className="mb-3 mt-2 font-display text-2xl font-bold text-[var(--text-primary)]">
                    {c.product01Name}
                  </h3>
                  <p className="text-left leading-relaxed text-[var(--text-secondary)]">
                    {c.product01Desc}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="badge">{c.badgeWindows}</span>
                    <span className="badge">{c.badgeAndroid}</span>
                    <span className="badge">{c.badgeTrial}</span>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border-color)] pt-5">
                    <div>
                      <p className="font-mono text-lg font-bold text-[var(--signal)]">{c.productLatency}</p>
                      <p className="label-mono mt-1">{c.product01Sub}</p>
                    </div>
                    <div>
                      <p className="font-mono text-lg font-bold text-[var(--signal)]">{c.productDevices}</p>
                      <p className="label-mono mt-1">{c.badgeAndroid}</p>
                    </div>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                    {t.product.pricing.cta}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Services — expanded six-way grid */}
      <RevealSection>
        <section className="section-padding bg-[var(--bg-surface)]">
          <div className="container-max">
            <SectionHeading
              badge={c.servicesBadge}
              align="center"
              title={c.servicesTitle}
              subtitle={c.servicesSubtitle}
            />

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {services.map((s) => (
                <Link
                  key={s.title}
                  href={`/services/${s.slug}`}
                  className="group block [perspective:1000px]"
                >
                  <div className="relative h-[13rem] w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] sm:h-52 md:h-56">
                    {/* FRONT */}
                    <div className="card absolute inset-0 flex flex-col justify-between p-4 [backface-visibility:hidden]">
                      <div className="flex items-start justify-between">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                          <ServiceIcon icon={s.icon} size={28} />
                        </div>
                        <span className="text-[var(--signal)]">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                          {s.title}
                        </h3>
                        <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-[var(--text-secondary)] sm:line-clamp-3">
                          {s.body}
                        </p>
                      </div>
                    </div>
                    {/* BACK — bullets */}
                    <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-[var(--signal)] bg-[var(--signal-soft)] p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <h3 className="font-display text-sm font-bold leading-snug text-[var(--text-primary)]">
                        {s.title}
                      </h3>
                      <ul className="space-y-2">
                        {s.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-1.5 text-[11px] leading-snug text-[var(--text-secondary)] sm:text-xs">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" />
                            <span className="line-clamp-2">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/about" className="btn-secondary">
                {c.aboutCta}
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Process — transparent four-step collaboration */}
      <RevealSection>
        <section className="section-padding bg-[var(--bg-surface)]">
          <div className="container-max">
            <SectionHeading
              badge={c.processBadge}
              align="center"
              title={c.processTitle}
              subtitle={c.processSubtitle}
            />

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                { n: '01', t: c.processS1Title, time: c.processS1Time, d: c.processS1Desc },
                { n: '02', t: c.processS2Title, time: c.processS2Time, d: c.processS2Desc },
                { n: '03', t: c.processS3Title, time: c.processS3Time, d: c.processS3Desc },
                { n: '04', t: c.processS4Title, time: c.processS4Time, d: c.processS4Desc },
              ].map((s) => (
                <div key={s.n} className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--bg-surface)] font-mono text-sm font-semibold text-[var(--signal)]">
                    {s.n}
                  </div>
                  <span className="label-mono mt-4 block text-[var(--signal)]">{s.time}</span>
                  <h3 className="mt-1 font-display text-lg font-semibold text-[var(--text-primary)]">{s.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>
    </main>
  )
}