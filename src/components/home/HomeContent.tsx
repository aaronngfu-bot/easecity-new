'use client'

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

/* Product card art — hand-drawn SVG (no image files). */
function DeviceGridArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 200" className={className} fill="none" aria-hidden>
      <rect x="12" y="16" width="108" height="168" rx="14" fill="var(--signal-soft)" stroke="var(--signal)" strokeWidth="2" />
      <rect x="24" y="30" width="84" height="118" rx="4" fill="var(--bg-surface)" stroke="var(--signal)" strokeOpacity="0.5" />
      <circle cx="42" cy="46" r="4" fill="var(--signal)" />
      <rect x="56" y="42" width="40" height="4" rx="2" fill="var(--signal)" fillOpacity="0.35" />
      <rect x="56" y="54" width="34" height="4" rx="2" fill="var(--signal)" fillOpacity="0.2" />
      <circle cx="42" cy="70" r="3" fill="var(--signal)" />
      <rect x="56" y="66" width="40" height="4" rx="2" fill="var(--signal)" fillOpacity="0.3" />
      <circle cx="42" cy="94" r="3" fill="var(--signal)" />
      <rect x="56" y="90" width="28" height="4" rx="2" fill="var(--signal)" fillOpacity="0.2" />
      <circle cx="66" cy="128" r="10" fill="var(--signal)" fillOpacity="0.85" />
      <rect x="60" y="150" width="40" height="5" rx="2.5" fill="var(--signal)" fillOpacity="0.5" />
      <rect x="38" y="160" width="56" height="4" rx="2" fill="var(--signal)" fillOpacity="0.2" />
      <rect x="140" y="16" width="108" height="168" rx="14" fill="var(--bg-surface)" stroke="var(--signal-soft)" strokeWidth="2" opacity="0.9" />
      <rect x="152" y="30" width="84" height="118" rx="4" fill="var(--bg-elevated)" stroke="var(--signal-soft)" strokeWidth="1.5" />
      <line x1="162" y1="44" x2="226" y2="44" stroke="var(--signal)" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
      <line x1="162" y1="58" x2="214" y2="58" stroke="var(--signal)" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
      <line x1="162" y1="72" x2="220" y2="72" stroke="var(--signal)" strokeOpacity="0.26" strokeWidth="3" strokeLinecap="round" />
      <circle cx="194" cy="128" r="12" stroke="var(--signal)" strokeWidth="2" />
      <circle cx="194" cy="128" r="4" fill="var(--signal)" />
    </svg>
  )
}

function CodeArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 200" className={className} fill="none" aria-hidden>
      <rect x="16" y="20" width="228" height="160" rx="12" fill="var(--bg-elevated)" stroke="var(--signal-soft)" strokeWidth="2" />
      <rect x="16" y="20" width="228" height="30" rx="12" fill="var(--signal)" fillOpacity="0.12" />
      <circle cx="36" cy="35" r="4" fill="var(--signal)" />
      <circle cx="52" cy="35" r="4" fill="var(--signal)" fillOpacity="0.5" />
      <circle cx="68" cy="35" r="4" fill="var(--signal)" fillOpacity="0.3" />
      <line x1="40" y1="78" x2="64" y2="102" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" />
      <line x1="64" y1="78" x2="40" y2="102" stroke="var(--signal)" strokeWidth="3" strokeLinecap="round" />
      <line x1="44" y1="74" x2="74" y2="74" stroke="var(--signal)" strokeOpacity="0.3" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="104" r="4" fill="var(--signal)" />
      <line x1="114" y1="100" x2="196" y2="100" stroke="var(--signal)" strokeOpacity="0.18" strokeWidth="3" strokeLinecap="round" />
      <line x1="114" y1="114" x2="188" y2="114" stroke="var(--signal)" strokeOpacity="0.26" strokeWidth="3" strokeLinecap="round" />
      <line x1="148" y1="128" x2="216" y2="128" stroke="var(--signal)" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round" />
      <line x1="148" y1="142" x2="204" y2="142" stroke="var(--signal)" strokeOpacity="0.32" strokeWidth="3" strokeLinecap="round" />
      <rect x="148" y="154" width="40" height="10" rx="4" fill="var(--signal)" fillOpacity="0.5" />
    </svg>
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
              align="left"
              title={c.productsTitle}
              subtitle={c.productsSubtitle}
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {/* EC-Share */}
              <Link href="/ec-share" className="card group relative flex flex-col overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:p-8">
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
                <p className="max-w-sm text-left leading-relaxed text-[var(--text-secondary)]">
                  {c.product01Desc}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="badge">Windows</span>
                  <span className="badge">Android</span>
                  <span className="badge">14-day trial</span>
                </div>
                <div className="pointer-events-none absolute bottom-4 right-4 text-[var(--signal)] opacity-70">
                  <DeviceGridArt className="h-20 w-20" />
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                  {t.product.pricing.cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              {/* Custom Development */}
              <Link href="/services" className="card group relative flex flex-col overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:p-8">
                <div className="mb-3 flex items-center gap-3 text-left">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)]">
                    <Code2 className="h-5 w-5 text-[var(--signal)]" />
                  </div>
                  <div className="text-left">
                    <p className="label-mono">{c.servicesLabel}</p>
                    <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.servicesName}</h3>
                  </div>
                </div>
                <p className="max-w-sm text-left leading-relaxed text-[var(--text-secondary)]">
                  {c.servicesDesc}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="badge">Web</span>
                  <span className="badge">Desktop</span>
                  <span className="badge">Design</span>
                </div>
                <div className="pointer-events-none absolute bottom-4 right-4 text-[var(--signal)] opacity-70">
                  <CodeArt className="h-20 w-20" />
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                  {c.servicesCta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
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

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {services.map((s) => (
                <Link
                  key={s.title}
                  href={`/services/${s.slug}`}
                  className="card group relative flex flex-col p-5 pr-8 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]"
                >
                  <span className="absolute right-3 top-3 text-[var(--signal)]">
                    <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                    <s.icon size={18} />
                  </div>
                  <h3 className="mb-1.5 font-display text-sm font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                    {s.title}
                  </h3>
                  <p className="line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {s.body}
                  </p>
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