'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { RevealSection } from '@/components/ui/RevealSection'
import SectionHeading from '@/components/SectionHeading'
import { ImmersionHero } from '@/components/home/ImmersionHero'
import { BlogTimeline } from '@/components/home/BlogTimeline'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { HeroIllustration } from '@/components/illustrations/HeroIllustration'
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
 * Section rhythm (each section uses a distinct composition on purpose):
 *  hero        full-viewport particle immersion
 *  blog        horizontal drag rail
 *  products    narrative + animated device-farm illustration
 *  services    bento grid (one dominant card) with hover-flip small cards
 *  process     connected timeline
 *  cases       asymmetric duo
 *  testimonials staggered trio
 *  cta         glow panel
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
    tags: s.tags,
    title: c2[s.titleKey as keyof typeof c2] as string,
    body: c2[s.bodyKey as keyof typeof c2] as string,
    bullets: language === 'zh' ? s.bullets.zh : s.bullets.en,
  }))
  const [featA, featB, ...restServices] = services

  return (
    <main className="relative min-h-screen">
      {/* Hero — full-viewport immersion with binary particle EC mark */}
      <ImmersionHero />

      {/* Blog rail — active proof, surfaced early */}
      <RevealSection>
        <section id="latest" className="section-padding section-bridge">
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

      {/* Products — narrative beside the living device-farm illustration */}
      <RevealSection>
        <section className="section-padding">
          <div className="container-max">
            <div className="grid items-center gap-12 lg:grid-cols-[2fr_3fr]">
              <div className="text-left">
                <span className="label-mono text-[var(--signal)]">{c.productsBadge}</span>
                <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
                  {c.productsNarrative}
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-[var(--text-secondary)]">
                  {c.productsNarrativeDesc}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
                    <p className="font-mono text-xl font-bold text-[var(--signal)]">{c.productLatency}</p>
                    <p className="label-mono mt-1">{c.product01Sub}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-4">
                    <p className="font-mono text-xl font-bold text-[var(--signal)]">{c.productDevices}</p>
                    <p className="label-mono mt-1">{c.product01Name}</p>
                  </div>
                </div>

                <a href="/ec-share" className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] hover:text-[var(--signal-light)]">
                  {c.productsExploreCta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              <div className="relative">
                <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_45%,var(--signal-soft),transparent_75%)]" />
                <HeroIllustration showFeatures={false} />
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Services — bento grid: two dominant capabilities, four compact flips */}
      <RevealSection>
        <section className="section-padding section-bridge bg-[var(--bg-surface)]">
          <div className="container-max">
            <SectionHeading
              badge={c.servicesBadge}
              align="center"
              title={c.servicesTitle}
              subtitle={c.servicesSubtitle}
            />

            <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
              {/* Dominant card — system development */}
              <Link
                href={`/services/${featA.slug}`}
                className="card group relative flex flex-col justify-between overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:p-8 lg:col-span-4 lg:row-span-2"
              >
                <div aria-hidden className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--signal-soft)] blur-2xl transition-opacity opacity-0 group-hover:opacity-100" />
                <div className="flex items-start justify-between">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                    <ServiceIcon icon={featA.icon} size={28} />
                  </div>
                  <span className="text-[var(--signal)]"><ArrowUpRight size={16} /></span>
                </div>
                <div className="mt-6">
                  <h3 className="font-display text-2xl font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                    {featA.title}
                  </h3>
                  <p className="mt-3 max-w-lg leading-relaxed text-[var(--text-secondary)]">{featA.body}</p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {featA.bullets.slice(0, 4).map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {featA.tags.map((tag) => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
              </Link>

              {/* Secondary dominant — web platforms */}
              <Link
                href={`/services/${featB.slug}`}
                className="card group relative flex flex-col justify-between overflow-hidden p-6 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] lg:col-span-2 lg:row-span-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                    <ServiceIcon icon={featB.icon} size={24} />
                  </div>
                  <span className="text-[var(--signal)]"><ArrowUpRight size={15} /></span>
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-lg font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                    {featB.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{featB.body}</p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {featB.tags.map((tag) => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
              </Link>

              {/* Compact flip cards */}
              {restServices.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group block [perspective:1000px] md:col-span-1 lg:col-span-2"
                >
                  <div className="relative h-56 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                    {/* FRONT */}
                    <div className="card absolute inset-0 flex flex-col justify-between p-5 [backface-visibility:hidden]">
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                          <ServiceIcon icon={s.icon} size={22} />
                        </div>
                        <span className="text-[var(--signal)]"><ArrowUpRight size={15} /></span>
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                          {s.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
                      </div>
                    </div>
                    {/* BACK — bullets */}
                    <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-[var(--signal)] bg-[var(--signal-soft)] p-5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <h3 className="font-display text-base font-bold text-[var(--text-primary)]">{s.title}</h3>
                      <ul className="space-y-2">
                        {s.bullets.slice(0, 3).map((b) => (
                          <li key={b} className="flex items-start gap-1.5 text-xs leading-snug text-[var(--text-secondary)]">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--signal)]" />
                            <span className="line-clamp-2">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Link>
              ))}

              {/* CTA tile fills the bento's last row */}
              <Link
                href="/services"
                className="group flex min-h-[14rem] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--border-strong)] p-6 text-center transition-colors hover:border-[var(--signal)] hover:bg-[var(--signal-soft)] lg:col-span-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-strong)] text-[var(--text-secondary)] transition-all group-hover:border-[var(--signal)] group-hover:text-[var(--signal)]">
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="font-display text-lg font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                  {c.servicesCta}
                </span>
                <span className="label-mono">{c.aboutCta}</span>
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Process — connected four-step timeline */}
      <RevealSection>
        <section className="section-padding bg-[var(--bg-surface)]">
          <div className="container-max">
            <SectionHeading
              badge={c.processBadge}
              align="center"
              title={c.processTitle}
              subtitle={c.processSubtitle}
            />

            <div className="relative mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <div aria-hidden className="process-line" />
              {[
                { n: '01', t: c.processS1Title, time: c.processS1Time, d: c.processS1Desc },
                { n: '02', t: c.processS2Title, time: c.processS2Time, d: c.processS2Desc },
                { n: '03', t: c.processS3Title, time: c.processS3Time, d: c.processS3Desc },
                { n: '04', t: c.processS4Title, time: c.processS4Time, d: c.processS4Desc },
              ].map((s) => (
                <div key={s.n} className="group relative">
                  <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--bg-surface)] font-mono text-sm font-semibold text-[var(--signal)] transition-shadow group-hover:shadow-[0_0_0_6px_var(--signal-soft)]">
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

      {/* Case studies — asymmetric proof duo */}
      <RevealSection>
        <section className="section-padding section-bridge">
          <div className="container-max">
            <SectionHeading
              badge={c.caseBadge}
              align="center"
              title={c.caseTitle}
              subtitle={c.caseSubtitle}
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-5">
              <div className="card relative flex flex-col overflow-hidden p-8 lg:col-span-3">
                <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--signal)] to-transparent" />
                <span className="label-mono text-[var(--signal)]">{c.caseC1Title}</span>
                <h3 className="mt-3 font-display text-2xl font-bold leading-snug text-[var(--text-primary)]">
                  {c.caseC1Head}
                </h3>
                <p className="mt-3 max-w-xl leading-relaxed text-[var(--text-secondary)]">{c.caseC1Desc}</p>
                <p className="mt-auto inline-flex items-center gap-2 self-start rounded-lg bg-[var(--signal-soft)] px-4 py-2.5 font-mono text-sm font-semibold text-[var(--signal)]">
                  <ArrowRight size={14} />
                  {c.caseC1Res}
                </p>
              </div>

              <div className="card flex flex-col p-8 lg:col-span-2">
                <span className="label-mono text-[var(--signal)]">{c.caseC2Title}</span>
                <h3 className="mt-3 font-display text-xl font-bold leading-snug text-[var(--text-primary)]">
                  {c.caseC2Head}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{c.caseC2Desc}</p>
                <p className="mt-auto border-t border-[var(--border-color)] pt-4 text-sm font-semibold text-[var(--signal)]">
                  {c.caseC2Res}
                </p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Testimonials — staggered trio, words only */}
      <RevealSection>
        <section className="section-padding bg-[var(--bg-surface)]">
          <div className="container-max">
            <SectionHeading
              badge={c.testimBadge}
              align="center"
              title={c.testimTitle}
              subtitle={c.testimSubtitle}
            />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                { q: c.t1Quote, n: c.t1Name, r: c.t1Role },
                { q: c.t2Quote, n: c.t2Name, r: c.t2Role },
                { q: c.t3Quote, n: c.t3Name, r: c.t3Role },
              ].map((tm, i) => (
                <figure
                  key={tm.n}
                  className={`card relative flex h-full flex-col p-7 transition-transform hover:-translate-y-1 ${i === 1 ? 'card-elevated lg:translate-y-6' : ''}`}
                >
                  <span aria-hidden className="font-display text-5xl font-bold leading-none text-[var(--signal)] opacity-30">
                    &ldquo;
                  </span>
                  <div className="mb-3 flex items-center gap-1 text-[var(--amber)]" aria-label="5 stars">
                    {'★★★★★'.split('').map((s, j) => <span key={j}>{s}</span>)}
                  </div>
                  <blockquote className="flex-1 text-[var(--text-secondary)] leading-relaxed">
                    {tm.q}
                  </blockquote>
                  <figcaption className="mt-5 border-t border-[var(--border-color)] pt-4">
                    <p className="font-semibold text-[var(--text-primary)]">{tm.n}</p>
                    <p className="label-mono mt-0.5 text-[var(--text-muted)]">{tm.r}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* Frictionless CTA — glow panel */}
      <RevealSection>
        <section className="section-padding section-bridge">
          <div className="container-max">
            <div className="card group relative mx-auto max-w-3xl overflow-hidden p-10 text-center transition-colors hover:border-[var(--signal)] md:p-14">
              <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_50%_110%,var(--signal-soft),transparent_70%)]" />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
                  {c.homeCtaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[var(--text-secondary)]">
                  {c.homeCtaSub}
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <a href="/about#contact" className="inline-flex items-center gap-2 rounded-lg bg-[var(--amber)] px-8 py-3.5 text-base font-semibold text-[var(--amber-ink)] transition hover:brightness-105 hover:shadow-[0_8px_30px_-6px_var(--amber-soft)]">
                    {c.homeCtaBtn}
                    <ArrowRight size={16} />
                  </a>
                  <a href="mailto:admin@easecity.hk" className="text-sm text-[var(--text-muted)] underline-offset-4 transition-colors hover:text-[var(--signal)]">
                    {c.homeCtaEmail}
                  </a>
                </div>
                <p className="label-mono mt-6 text-[var(--text-muted)]">{c.homeCtaTrust}</p>
              </div>
            </div>
          </div>
        </section>
      </RevealSection>
    </main>
  )
}
