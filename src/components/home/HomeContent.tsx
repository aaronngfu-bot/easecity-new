'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Code2, Globe, Palette, Lightbulb, Megaphone, Fingerprint, Cpu } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { RevealSection } from '@/components/ui/RevealSection'
import SectionHeading from '@/components/SectionHeading'
import { BinaryField } from '@/components/hero/BinaryField'
import { BlogTimeline } from '@/components/home/BlogTimeline'
import { services as serviceCatalog } from '@/lib/services'

const SERVICE_ICONS: Record<string, React.ElementType> = {
  code: Code2,
  web: Globe,
  design: Palette,
  consult: Lightbulb,
  ad: Megaphone,
  brand: Fingerprint,
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
    icon: SERVICE_ICONS[s.icon] ?? Code2,
    title: c2[s.titleKey as keyof typeof c2] as string,
    body: c2[s.bodyKey as keyof typeof c2] as string,
    bullets: language === 'zh' ? s.bullets.zh : s.bullets.en,
  }))

  return (
    <main className="relative min-h-screen">
      {/* Hero — left copy / right illustration on desktop */}
      <section className="relative overflow-hidden bg-[var(--bg-base)]">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_20%,var(--signal-soft),transparent_70%)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:pt-40 lg:grid-cols-2 lg:gap-8">
          <div className="text-left">
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              {c.heroTitle}
              <br />
              <span className="text-gradient-signal">{c.heroHighlight}</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]">
              {c.heroSubtitle}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/ec-share" className="btn-primary px-7 py-3 text-sm">
                {c.heroCtaProduct}
              </Link>
              <Link href="/services" className="btn-secondary px-7 py-3 text-sm">
                {c.heroCtaServices}
              </Link>
            </div>
          </div>

          <div className="relative h-[320px] sm:h-[380px] lg:h-full lg:min-h-[420px] lg:pl-4">
            <BinaryField className="h-full w-full" />
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

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {/* EC-Share */}
              <Link href="/ec-share" className="card group relative flex flex-col overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:p-8">
                <div className="relative">
                  <div className="mb-3 text-left">
                    <p className="label-mono">{c.product01Label}</p>
                    <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.product01Name}</h3>
                  </div>
                  <p className="text-left leading-relaxed text-[var(--text-secondary)]">
                    {c.product01Desc}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="badge">Windows</span>
                    <span className="badge">Android</span>
                    <span className="badge">14-day trial</span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                    {t.product.pricing.cta}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              {/* Custom Development */}
              <Link href="/services" className="card group relative flex flex-col overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:p-8">
                <div className="relative">
                  <div className="mb-3 text-left">
                    <p className="label-mono">{c.servicesLabel}</p>
                    <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.servicesName}</h3>
                  </div>
                  <p className="text-left leading-relaxed text-[var(--text-secondary)]">
                    {c.servicesDesc}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="badge">Web</span>
                    <span className="badge">Desktop</span>
                    <span className="badge">Design</span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                    {c.servicesCta}
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
                  <div className="relative h-44 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] md:h-52">
                    {/* FRONT */}
                    <div className="card absolute inset-0 flex flex-col justify-between p-4 [backface-visibility:hidden]">
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                          <s.icon size={17} />
                        </div>
                        <span className="text-[var(--signal)]">
                          <ArrowUpRight size={15} />
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-sm font-bold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                          {s.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                          {s.body}
                        </p>
                      </div>
                    </div>
                    {/* BACK — bullets */}
                    <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-[var(--signal)] bg-[var(--signal-soft)] p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <h3 className="font-display text-sm font-bold leading-snug text-[var(--text-primary)]">
                        {s.title}
                      </h3>
                      <ul className="space-y-1.5">
                        {s.bullets.map((b) => (
                          <li key={b} className="flex items-start gap-1.5 text-[11px] leading-snug text-[var(--text-secondary)]">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[var(--signal)]" />
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
    </main>
  )
}