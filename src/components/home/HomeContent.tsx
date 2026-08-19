'use client'

import Link from 'next/link'
import Image from 'next/image'
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
export function HomeContent({ blogPosts }: { blogPosts: HomeBlogPost[] }) {
  const { t } = useLanguage()
  const c = t.companyPage
  const c2 = t.servicesPage

  const services = serviceCatalog.map((s) => ({
    slug: s.slug,
    icon: SERVICE_ICONS[s.icon] ?? Code2,
    title: c2[s.titleKey as keyof typeof c2] as string,
    body: c2[s.bodyKey as keyof typeof c2] as string,
  }))

  return (
    <main className="relative min-h-screen">
      {/* Hero — left copy / right illustration on desktop */}
      <section className="relative overflow-hidden bg-[var(--bg-base)]">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_20%,var(--signal-soft),transparent_70%)]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-32 md:pt-40 lg:grid-cols-2 lg:gap-8">
          <div className="text-left">
            <p className="label-mono mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)] animate-pulse" />
              {c.heroEyebrow}
            </p>

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
              <BlogTimeline posts={blogPosts} />
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
              align="center"
              title={c.productsTitle}
              subtitle={c.productsSubtitle}
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {/* PRODUCT 01 — EC-Share */}
              <Link href="/ec-share" className="card group flex flex-col overflow-hidden transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]">
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-3 flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)]">
                      <svg className="h-5 w-5 text-[var(--signal)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="label-mono">{c.product01Label}</p>
                      <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.product01Name}</h3>
                    </div>
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
                <div className="relative aspect-[16/9] w-full overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-elevated)] sm:aspect-[2/1]">
                  <Image src="/images/ec-share-product-hero.jpg" alt={c.product01Name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
              </Link>

              {/* SERVICES — Custom Development */}
              <Link href="/services" className="card group flex flex-col overflow-hidden transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]">
                <div className="flex flex-1 flex-col p-8">
                  <div className="mb-3 flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)]">
                      <Code2 className="h-5 w-5 text-[var(--signal)]" />
                    </div>
                    <div className="text-left">
                      <p className="label-mono">{c.servicesLabel}</p>
                      <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.servicesName}</h3>
                    </div>
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
                <div className="relative aspect-[16/9] w-full overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-elevated)] sm:aspect-[2/1]">
                  <Image src="/images/service-case-web-platform.jpg" alt={c.servicesName} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
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

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Link
                  key={s.title}
                  href={`/services/${s.slug}`}
                  className="card group flex flex-col p-6 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                    <s.icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-base font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {s.body}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-[var(--signal)]">
                    {t.servicesPage.enquireService}
                    <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link href="/services" className="btn-secondary">
                {c.servicesCta}
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