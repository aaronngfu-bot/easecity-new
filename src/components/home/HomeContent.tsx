'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { copyKey } from '@/i18n/translations'
import SectionHeading from '@/components/SectionHeading'
import { Scrub } from '@/components/ui/Scrub'
import { ImmersionHero } from '@/components/home/ImmersionHero'
import { BlogTimeline } from '@/components/home/BlogTimeline'
import { QuoteModal } from '@/components/contact/QuoteModal'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { HeroIllustration } from '@/components/illustrations/HeroIllustration'
import { services as serviceCatalog } from '@/lib/services'

function TestimonialCard({
  tm,
  duplicate = false,
}: {
  tm: { q: string; n: string; r: string }
  duplicate?: boolean
}) {
  return (
    <figure
      className={`t-card card relative flex flex-col gap-2 p-6 transition-colors hover:border-[var(--signal)]${duplicate ? ' t-card-dup' : ''}`}
      aria-hidden={duplicate || undefined}
    >
      <div className="flex items-center gap-0.5 text-[var(--amber)]" aria-hidden>
        {Array.from({ length: 5 }, (_, j) => (
          <Star key={j} size={12} fill="currentColor" strokeWidth={0} />
        ))}
      </div>
      <blockquote className="flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
        &ldquo;{tm.q}&rdquo;
      </blockquote>
      <figcaption className="mt-1 border-t border-[var(--border-color)] pt-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{tm.n}</p>
        <p className="label-mono mt-0.5 text-[var(--text-muted)]">{tm.r}</p>
      </figcaption>
    </figure>
  )
}

interface ServiceEntry {
  slug: string
  icon: string
  title: string
  body: string
}

/**
 * One capability in the services flow.
 *
 * The panel is a chevron: its tip points into the next panel's notch, so the
 * six capabilities read as the single pipeline the copy claims rather than six
 * interchangeable boxes. The shape is a clip-path in CSS, which clips pointer
 * events too, so the hit area is the chevron and not its bounding box.
 *
 * `tone` is not decoration. The catalog's build capabilities come first and the
 * advisory ones after, so the build side sits on the raised surface and carries
 * a per-discipline hue on its icon while advisory stays flat and neutral. No
 * panel is singled out at rest — hover and focus are the only accent states, so
 * the row reads as a chain of equals rather than one pick and four also-rans.
 *
 * Motion is scroll-driven from CSS off `--i`, so there is no JS per panel.
 */
function ServiceStep({
  service,
  index,
  tone,
}: {
  service: ServiceEntry
  index: number
  tone: 'raised' | 'flat'
}) {
  const discipline = tone === 'flat' ? '' : ` svc-step-disc-${index + 1}`

  return (
    <li
      className="scrub-svc-step flex w-[14.5rem] shrink-0 snap-start xl:w-auto xl:min-w-0 xl:flex-1"
      style={{ ['--i' as string]: index }}
    >
      <Link
        href={`/services/${service.slug}`}
        className={`svc-step group svc-step-${tone}${discipline}${index === 0 ? ' svc-step-origin' : ''}`}
      >
        <span className="svc-step-face">
          {/* Index, conduit, outlet — read left to right, the same direction the
              panel points. */}
          <span className="flex items-center gap-2.5" aria-hidden>
            <span className="font-mono text-[1.75rem] font-bold leading-none tracking-[-0.04em] text-[var(--text-primary)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="svc-step-rule" />
            <ArrowRight size={14} className="svc-step-arrow shrink-0 text-[var(--text-muted)]" />
          </span>

          <span className="mt-5 flex items-center gap-2">
            <span className="svc-step-icon">
              <ServiceIcon icon={service.icon} size={15} />
            </span>
            <span className="font-display text-sm font-bold leading-snug text-[var(--text-primary)] transition-colors duration-200 ease-out group-hover:text-[var(--signal)]">
              {service.title}
            </span>
          </span>

          <span className="mt-2.5 line-clamp-6 text-xs leading-[1.7] text-[var(--text-secondary)]">
            {service.body}
          </span>
        </span>
      </Link>
    </li>
  )
}

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
 *  hero         pinned settle onto the waterline, copy wipes out
 *  blog         pier line continues the hero horizon, posts berth beneath it
 *  products     split assemble (copy left, art right)
 *  services     chevron flow, panels arriving in the direction they point
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
  const [blogError, setBlogError] = useState(false)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [compactWall, setCompactWall] = useState<boolean | null>(null)

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
    const mq = window.matchMedia('(max-width: 768px)')
    const sync = () => setCompactWall(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    let active = true
    setBlogLoading(true)
    setBlogError(false)
    const params = new URLSearchParams({ limit: '10', lang: copyKey(language) })
    fetch(`/api/blog?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return
        if (d?.success && Array.isArray(d.data)) {
          setBlogPosts(d.data)
          setBlogError(false)
        } else {
          setBlogPosts([])
          setBlogError(true)
        }
        setBlogLoading(false)
      })
      .catch(() => {
        if (!active) return
        setBlogPosts([])
        setBlogError(true)
        setBlogLoading(false)
      })
    return () => {
      active = false
    }
  }, [language])

  // Brand design keeps its own page and its place in /services; it is left out
  // of the home flow so the chain reads as the build-and-run pipeline.
  const services = serviceCatalog
    .filter((s) => s.slug !== 'brand-design')
    .map((s) => ({
      slug: s.slug,
      icon: s.icon,
      title: c2[s.titleKey as keyof typeof c2] as string,
      body: c2[s.bodyKey as keyof typeof c2] as string,
    }))

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
  const tCols = [
    testimonials.slice(0, 4),
    testimonials.slice(4, 8),
    testimonials.slice(8),
  ]

  return (
    <div className="relative min-h-screen">
      {/* Hero — full-viewport living city */}
      <ImmersionHero onStartProject={() => setQuoteOpen(true)} />

      {/* Blog — clip-reveal from the left. The top edge carries a short fade-down
          from the hero's base so the deep-water gradient's last step never lands
          as a hard tonal line against this section's own background. */}
      <Scrub pace="tight">
        <section id="latest" className="relative z-10 section-padding bg-[var(--bg-base)]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--bg-base)] to-transparent"
          />
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
              <BlogTimeline posts={blogPosts} loading={blogLoading} error={blogError} />
            </div>
          </div>
        </section>
      </Scrub>

      {/* Products — split assemble. Tight pace so the scene arrives earlier. */}
      <Scrub pace="tight">
        <section className="relative z-10 overflow-hidden section-padding bg-[var(--bg-base)]">
          <div className="container-max relative z-10">
            <div className="grid items-center gap-8 lg:grid-cols-[5fr_7fr]">
              <div className="scrub-prod-copy text-left">
                <span className="scrub-kicker mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-signal">
                  <span aria-hidden className="scrub-rule h-px w-10 origin-left bg-signal" />
                  <span className="scrub-kicker-label">{c.productsBadge}</span>
                </span>
                <div className="scrub-reveal">
                  <h2 className="type-section scrub-title font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
                    {c.productsNarrative}
                  </h2>
                </div>
                <p className="scrub-sub mt-4 max-w-md leading-relaxed text-[var(--text-secondary)]">
                  {c.productsNarrativeDesc}
                </p>

                <div className="scrub-meta mt-6 flex flex-wrap items-center gap-2">
                  <span className="badge font-mono">{c.productLatency}</span>
                  <span className="badge font-mono">{c.productDevices}</span>
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

      {/* Services — arrow flow */}
      <Scrub>
        <section className="relative z-10 section-padding bg-[var(--bg-base)]">
          <div className="container-max">
            <div className="max-w-2xl">
              <div className="scrub-kicker mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-signal">
                <span aria-hidden className="scrub-rule h-px w-10 origin-left bg-signal" />
                <span className="scrub-kicker-label">{c.servicesBadge}</span>
              </div>
              <div className="scrub-reveal">
                <h2 className="type-section scrub-title font-display text-3xl font-bold text-[var(--text-primary)] md:text-5xl">
                  {c.servicesTitle}
                </h2>
              </div>
              <p className="scrub-sub mt-4 max-w-xl text-base leading-relaxed text-[var(--text-secondary)]">
                {c.servicesSubtitle}
              </p>
            </div>

            {/* An ordered list because the numerals are the section's argument:
                one team carries a project from infrastructure through to the
                brand around it. One row, always — the chain is the point, so
                below xl it scrolls rather than wrapping and breaking mid-chain. */}
            <ol className="svc-flow mt-12 flex snap-x snap-proximity overflow-x-auto pb-2 xl:overflow-x-visible xl:pb-0">
              {services.map((s, i) => (
                <ServiceStep
                  key={s.slug}
                  service={s}
                  index={i}
                  tone={i < 3 ? 'raised' : 'flat'}
                />
              ))}
            </ol>

            <Link
              href="/services"
              className="scrub-cta-line group mt-8 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal-soft)] px-5 text-sm font-semibold text-[var(--signal)] transition-[background-color,color,transform] duration-200 ease-out hover:bg-[var(--signal)] hover:text-[var(--signal-ink)] active:scale-[0.97]"
            >
              {c.servicesAllCta}
              <ArrowRight size={16} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </Scrub>

      {/* Testimonials — mask-open scale. Early pace: the wall is by far the
          tallest section, so anything slower left its columns still fading in
          after the reader had scrolled past them. */}
      <Scrub pace="early">
        <section className="relative z-10 section-padding bg-[var(--bg-surface)]">
          <div className="container-max">
            <div className="scrub-t-head">
              <SectionHeading
                badge={c.testimBadge}
                line={false}
                align="center"
                title={c.testimTitle}
                subtitle={c.testimSubtitle}
              />
            </div>

            <div className="scrub-t-wall t-marquee mt-12" ref={tMarqueeRef} aria-label={c.testimTitle}>
              {/* Desktop — three parallel masked rails, staggered phases */}
              <div className="t-marquee-row" hidden={compactWall === true} aria-hidden={compactWall === true || undefined}>
                {tCols.map((col, ci) => (
                  <div key={`col-${ci}`} className="t-marquee-col" style={{ ['--ci' as string]: ci }}>
                    <div className="t-marquee-track">
                      {col.map((tm, i) => (
                        <TestimonialCard key={`${tm.n}-${ci}-${i}`} tm={tm} />
                      ))}
                      {col.map((tm, i) => (
                        <TestimonialCard key={`${tm.n}-${ci}-dup-${i}`} tm={tm} duplicate />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="t-marquee-single" hidden={compactWall === false} aria-hidden={compactWall === false || undefined}>
                <div className="t-marquee-track">
                  {testimonials.map((tm, i) => (
                    <TestimonialCard key={`s-${tm.n}-${i}`} tm={tm} />
                  ))}
                  {testimonials.map((tm, i) => (
                    <TestimonialCard key={`s-${tm.n}-dup-${i}`} tm={tm} duplicate />
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
              <h2 className="type-section scrub-title font-display text-3xl font-bold text-[var(--text-primary)] md:text-5xl">
                {c.homeCtaTitle}
              </h2>

              <p className="scrub-sub mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                {c.homeCtaSub}
              </p>

              <div className="mt-9 flex justify-center">
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="group inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--signal)] px-9 py-4 text-base font-semibold text-[var(--signal-ink)] transition-colors duration-200 ease-out hover:bg-[var(--signal-light)] active:scale-[0.97]"
                >
                  {c.homeCtaBtn}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
              <p className="scrub-sub mt-5 text-sm text-[var(--text-muted)]">
                <a href="mailto:admin@easecity.hk" className="underline decoration-[var(--border-color)] underline-offset-4 transition-colors hover:text-[var(--signal)] hover:decoration-[var(--signal)]">
                  {c.homeCtaEmail}
                </a>
              </p>
            </div>
          </div>
        </section>
      </Scrub>

      {/* Frictionless multi-step quote modal (no service → general brief) */}
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} />
    </div>
  )
}
