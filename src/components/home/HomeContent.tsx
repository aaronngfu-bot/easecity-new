'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import SectionHeading from '@/components/SectionHeading'
import { Scrub } from '@/components/ui/Scrub'
import { ImmersionHero } from '@/components/home/ImmersionHero'
import { BlogTimeline } from '@/components/home/BlogTimeline'
import { QuoteModal } from '@/components/contact/QuoteModal'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { HeroIllustration } from '@/components/illustrations/HeroIllustration'
import { CityField } from '@/components/hero/CityField'
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
 *
 * Section rhythm (distinct compositions, one visual language):
 *  hero         pinned dissolve (sky lag + copy fade)
 *  blog         clip-reveal rail from the left
 *  products     split assemble (copy left, art right)
 *  services     staggered cascade cards
 *  testimonials mask-open scale
 *  cta          punch in
 */
export function HomeContent() {
  const { t, language } = useLanguage()
  const c = t.companyPage
  const c2 = t.servicesPage

  // Client-fetch blog posts so the first paint doesn't wait on the DB. While
  // loading, a skeleton occupies the rail; posts arrive shortly after.
  const [blogPosts, setBlogPosts] = useState<HomeBlogPost[]>([])
  const [blogLoading, setBlogLoading] = useState(true)
  const [quoteOpen, setQuoteOpen] = useState(false)

  // Measure each testimonial column's single-iteration height so the marquee
  // loop point aligns exactly (translateY(-50%) drifts when card heights
  // differ — sub-pixel rounding makes the seam hitch). Store it as --t-loop.
  const tMarqueeRef = useRef<HTMLDivElement>(null)
  const measureTracks = useCallback(() => {
    const root = tMarqueeRef.current
    if (!root) return
    root.querySelectorAll<HTMLElement>('.t-marquee-track').forEach((track) => {
      const col = track.parentElement
      if (!col) return
      const single = track.scrollHeight / 2
      if (single > 0) col.style.setProperty('--t-loop', `${single}px`)
    })
  }, [])
  useEffect(() => {
    measureTracks()
    const ro = new ResizeObserver(measureTracks)
    if (tMarqueeRef.current) ro.observe(tMarqueeRef.current)
    window.addEventListener('load', measureTracks)
    return () => {
      ro.disconnect()
      window.removeEventListener('load', measureTracks)
    }
  }, [measureTracks])

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
    tags: s.tags,
    title: c2[s.titleKey as keyof typeof c2] as string,
    body: c2[s.bodyKey as keyof typeof c2] as string,
    bullets: language === 'zh' ? s.bullets.zh : s.bullets.en,
  }))
  const [featA, featB, ...restServices] = services

  const testimonials = [
    { q: c.t1Quote, n: c.t1Name, r: c.t1Role },
    { q: c.t2Quote, n: c.t2Name, r: c.t2Role },
    { q: c.t3Quote, n: c.t3Name, r: c.t3Role },
    { q: c.t4Quote, n: c.t4Name, r: c.t4Role },
    { q: c.t5Quote, n: c.t5Name, r: c.t5Role },
    { q: c.t6Quote, n: c.t6Name, r: c.t6Role },
    { q: c.t7Quote, n: c.t7Name, r: c.t7Role },
    { q: c.t8Quote, n: c.t8Name, r: c.t8Role },
    { q: c.t9Quote, n: c.t9Name, r: c.t9Role },
    { q: c.t10Quote, n: c.t10Name, r: c.t10Role },
    { q: c.t11Quote, n: c.t11Name, r: c.t11Role },
    { q: c.t12Quote, n: c.t12Name, r: c.t12Role },
  ]
  // Equal column sizes (4 / 4 / 4) so all three rails keep identical height;
  // only their start phase differs. Each column loops its own list seamlessly.
  const tCols = [
    testimonials.slice(0, 4),
    testimonials.slice(4, 8),
    testimonials.slice(8),
  ].map(col => [...col, ...col])

  return (
    <main className="relative min-h-screen">
      {/* Hero — full-viewport living city */}
      <ImmersionHero onStartProject={() => setQuoteOpen(true)} />

      {/* Blog — clip-reveal from the left */}
      <Scrub pace="tight">
        <section id="latest" className="relative z-10 section-padding bg-[var(--bg-base)]">
          <div className="container-max">
            <div className="scrub-blog-head">
              <SectionHeading
                badge={c.blogBadge}
                align="right"
                title={c.blogTitle}
                subtitle={c.blogSubtitle}
              />
            </div>

            <div className="scrub-blog-rail mt-10">
              <BlogTimeline posts={blogPosts} loading={blogLoading} />
            </div>
          </div>
        </section>
      </Scrub>

      {/* Products — split assemble. Tight pace so the scene arrives earlier. */}
      <Scrub pace="tight">
        <section className="relative z-10 overflow-hidden section-padding bg-[var(--bg-base)]">
          <div className="scrub-prod-stars pointer-events-none absolute inset-0" aria-hidden>
            <div className="scrub-prod-sky absolute inset-x-0 -top-[22%] h-[144%] w-full">
              <CityField className="h-full w-full" />
            </div>
          </div>
          <div className="container-max relative z-10">
            <div className="grid items-center gap-8 lg:grid-cols-[5fr_7fr]">
              <div className="scrub-prod-copy text-left">
                <span className="scrub-kicker mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-signal">
                  <span aria-hidden className="scrub-rule h-px w-10 origin-left bg-signal" />
                  <span className="scrub-kicker-label">{c.productsBadge}</span>
                </span>
                <h2 className="scrub-title mt-3 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
                  {c.productsNarrative}
                </h2>
                <p className="scrub-sub mt-4 max-w-md leading-relaxed text-[var(--text-secondary)]">
                  {c.productsNarrativeDesc}
                </p>

                <div className="scrub-meta mt-6 flex flex-wrap items-center gap-2">
                  <span className="badge font-mono">{c.productLatency}</span>
                  <span className="badge font-mono">{c.productDevices}</span>
                  <span className="badge">{c.badgeTrial}</span>
                </div>

                <a href="/ec-share" className="scrub-cta-line signal-cta group mt-8">
                  {c.productsExploreCta}
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <div className="scrub-prod-art relative">
                <div aria-hidden className="scrub-prod-glow absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,var(--signal-soft),transparent_75%)]" />
                <HeroIllustration showFeatures={false} />
              </div>
            </div>
          </div>
        </section>
      </Scrub>

      {/* Services — staggered cascade */}
      <Scrub>
        <section className="relative z-10 bg-[var(--bg-base)] py-20 md:py-28">
          <div className="container-max">
            <div className="scrub-svc-head flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <div className="scrub-kicker mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-signal">
                  <span aria-hidden className="scrub-rule h-px w-10 origin-left bg-signal" />
                  <span className="scrub-kicker-label">{c.servicesBadge}</span>
                </div>
                <h2 className="scrub-title font-display text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-5xl">
                  {c.servicesTitle}
                </h2>
                <p className="scrub-sub mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
                  {c.servicesSubtitle}
                </p>
              </div>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[featA, featB, ...restServices].map((s, i) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="scrub-svc-card group flex h-full flex-col rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--signal)] hover:shadow-[var(--shadow-lg)]"
                  style={{ ['--i' as string]: i }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--signal-soft)] text-[var(--signal)]">
                      <ServiceIcon icon={s.icon} size={22} />
                    </span>
                  </div>

                  <h3 className="mt-6 font-display text-xl font-bold text-[var(--text-primary)] transition-colors duration-300 group-hover:text-[var(--signal)]">
                    {s.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {s.body}
                  </p>

                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-[var(--signal)] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {c.servicesCta} <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </Scrub>

      {/* Testimonials — mask-open scale */}
      <Scrub>
        <section className="relative z-10 section-padding bg-[var(--bg-surface)]">
          <div className="container-max">
            <div className="scrub-t-head">
              <SectionHeading
                badge={c.testimBadge}
                align="center"
                line={false}
                title={c.testimTitle}
                subtitle={c.testimSubtitle}
              />
            </div>

            <div className="scrub-t-wall t-marquee mt-12" ref={tMarqueeRef} aria-label={c.testimTitle}>
              {/* Desktop — three parallel masked rails, staggered phases */}
              <div className="t-marquee-row">
                {tCols.map((col, ci) => (
                  <div key={`col-${ci}`} className="t-marquee-col" style={{ ['--ci' as string]: ci }}>
                    <div className="t-marquee-track" style={{ animationDelay: `${ci * -15}s` }}>
                      {col.map((tm, i) => (
                        <figure
                          key={`${tm.n}-${ci}-${i}`}
                          className="t-card card relative flex flex-col gap-2 p-6 transition-colors hover:border-[var(--signal)]"
                        >
                          <figcaption>
                            <p className="text-sm font-semibold text-[var(--text-primary)]">{tm.n}</p>
                            <p className="label-mono mt-0.5 text-[var(--text-muted)]">{tm.r}</p>
                          </figcaption>
                          <div className="flex items-center gap-1 text-[var(--amber)]" aria-label="5 stars">
                            {'★★★★★'.split('').map((s, j) => <span key={j}>{s}</span>)}
                          </div>
                          <blockquote className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                            &ldquo;{tm.q}&rdquo;
                          </blockquote>
                        </figure>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Mobile — single full-height rail with all 12 cards */}
              <div className="t-marquee-single">
                <div className="t-marquee-track">
                  {[...testimonials, ...testimonials].map((tm, i) => (
                    <figure
                      key={`s-${tm.n}-${i}`}
                      className="t-card card relative flex flex-col gap-2 p-6 transition-colors hover:border-[var(--signal)]"
                    >
                      <figcaption>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{tm.n}</p>
                        <p className="label-mono mt-0.5 text-[var(--text-muted)]">{tm.r}</p>
                      </figcaption>
                      <div className="flex items-center gap-1 text-[var(--amber)]" aria-label="5 stars">
                        {'★★★★★'.split('').map((s, j) => <span key={j}>{s}</span>)}
                      </div>
                      <blockquote className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                        &ldquo;{tm.q}&rdquo;
                      </blockquote>
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </Scrub>

      {/* CTA — punch in. Last section: snap to fully visible as soon as it enters. */}
      <Scrub pace="last">
        <section className="relative z-10 section-padding bg-[var(--bg-base)]">
          <div className="container-max">
            <div className="scrub-cta mx-auto max-w-2xl text-center">
              <h2 className="scrub-title font-display text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-5xl">
                {c.homeCtaTitle}
              </h2>

              <p className="scrub-sub mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                {c.homeCtaSub}
              </p>

              <div className="mt-9 flex justify-center">
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="group inline-flex items-center gap-2 rounded-lg bg-[var(--signal)] px-9 py-4 text-base font-semibold text-[var(--signal-ink)] transition hover:bg-[var(--signal-light)]"
                >
                  {c.homeCtaBtn}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </Scrub>

      {/* Frictionless multi-step quote modal (no service → general brief) */}
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </main>
  )
}
