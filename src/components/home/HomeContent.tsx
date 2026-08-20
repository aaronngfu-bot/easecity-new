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
    <svg viewBox="0 0 320 220" className={className} fill="none" aria-hidden>
      {/* backdrop */}
      <rect x="8" y="8" width="304" height="204" rx="16" fill="var(--signal-soft)" opacity="0.6" />
      {/* big monitor showing the mirrored phone grid */}
      <rect x="36" y="36" width="176" height="120" rx="8" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="2.5" />
      <rect x="124" y="156" width="8" height="12" rx="3" fill="var(--signal)" stroke="var(--signal)" strokeWidth="1.5" />
      <rect x="108" y="168" width="32" height="6" rx="3" fill="var(--signal)" stroke="var(--signal)" strokeWidth="1.5" />
      {/* monitor screen: 2x2 phone grid being mirrored */}
      <rect x="48" y="48" width="38" height="52" rx="5" fill="var(--bg-elevated)" stroke="var(--signal)" strokeOpacity="0.6" strokeWidth="1.5" />
      <rect x="88" y="48" width="38" height="52" rx="5" fill="var(--bg-elevated)" stroke="var(--signal)" strokeOpacity="0.6" strokeWidth="1.5" />
      <rect x="48" y="112" width="38" height="52" rx="5" fill="var(--bg-elevated)" stroke="var(--signal)" strokeOpacity="0.6" strokeWidth="1.5" />
      <rect x="88" y="112" width="38" height="52" rx="5" fill="var(--bg-elevated)" stroke="var(--signal)" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="59" cy="52" r="2" fill="var(--signal)" />
      <circle cx="99" cy="52" r="2" fill="var(--signal)" />
      <circle cx="59" cy="116" r="2" fill="var(--signal)" />
      <circle cx="99" cy="116" r="2" fill="var(--signal)" />
      <line x1="52" y1="62" x2="80" y2="62" stroke="var(--signal)" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
      <line x1="92" y1="62" x2="120" y2="62" stroke="var(--signal)" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
      {/* a phone in front, mirroring into the monitor */}
      <rect x="226" y="60" width="78" height="150" rx="16" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="2.5" />
      <rect x="234" y="104" width="62" height="62" rx="8" fill="var(--bg-elevated)" stroke="var(--signal)" strokeOpacity="0.6" strokeWidth="1.5" />
      <circle cx="258" cy="132" r="16" stroke="var(--signal)" strokeWidth="2" />
      <line x1="246" y1="150" x2="270" y2="126" stroke="var(--signal)" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="252" y="176" width="26" height="4" rx="2" fill="var(--signal)" fillOpacity="0.5" />
      {/* connection from phone to monitor */}
      <path d="M226 110 Q 200 84 212 78" stroke="var(--signal)" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
    </svg>
  )
}

function ConsoleArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} fill="none" aria-hidden>
      <rect x="8" y="8" width="304" height="204" rx="16" fill="var(--signal-soft)" opacity="0.55" />
      {/* terminal */}
      <rect x="52" y="24" width="216" height="172" rx="10" fill="var(--bg-raised)" stroke="var(--signal-soft)" strokeWidth="2.5" />
      {/* title bar */}
      <rect x="52" y="24" width="216" height="26" rx="10" fill="var(--signal)" fillOpacity="0.14" />
      <circle cx="68" cy="37" r="3.5" fill="var(--signal)" />
      <circle cx="82" cy="37" r="3.5" fill="var(--signal)" fillOpacity="0.5" />
      <circle cx="96" cy="37" r="3.5" fill="var(--signal)" fillOpacity="0.3" />
      <rect x="120" y="33" width="52" height="6" rx="3" fill="var(--signal)" fillOpacity="0.7" />
      {/* prompt + code lines */}
      <rect x="72" y="70" width="10" height="10" rx="2" fill="var(--signal)" opacity="0.9" />
      <rect x="90" y="72" width="80" height="6" rx="3" fill="var(--signal)" fillOpacity="0.5" />
      <rect x="90" y="86" width="120" height="6" rx="3" fill="var(--signal)" fillOpacity="0.25" />
      <rect x="90" y="100" width="60" height="6" rx="3" fill="var(--signal)" fillOpacity="0.35" />
      <rect x="72" y="124" width="8" height="8" rx="2" fill="var(--signal)" opacity="0.7" />
      <rect x="88" y="126" width="96" height="6" rx="3" fill="var(--signal)" fillOpacity="0.4" />
      <rect x="88" y="140" width="132" height="6" rx="3" fill="var(--signal)" fillOpacity="0.22" />
      <rect x="88" y="154" width="70" height="6" rx="3" fill="var(--signal)" fillOpacity="0.3" />
      {/* blinking cursor */}
      <rect x="226" y="168" width="4" height="14" rx="2" fill="var(--signal)" opacity="0.9" />
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
  const { t, language } = useLanguage()
  const c = t.companyPage
  const c2 = t.servicesPage

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
              <Link href="/ec-share" className="card group relative flex min-h-[260px] flex-col justify-end overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:min-h-[300px] md:p-10">
                <DeviceGridArt className="pointer-events-none absolute right-0 top-0 h-full w-full object-cover opacity-25 transition-opacity duration-500 group-hover:opacity-35" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent" />
                <div className="relative z-10">
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
                  <p className="max-w-md text-left leading-relaxed text-[var(--text-secondary)]">
                    {c.product01Desc}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="badge">Windows</span>
                    <span className="badge">Android</span>
                    <span className="badge">14-day trial</span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                    {t.product.pricing.cta}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              {/* Custom Development */}
              <Link href="/services" className="card group relative flex min-h-[260px] flex-col justify-end overflow-hidden p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] md:min-h-[300px] md:p-10">
                <ConsoleArt className="pointer-events-none absolute right-0 top-0 h-full w-full object-cover opacity-25 transition-opacity duration-500 group-hover:opacity-35" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[var(--bg-surface)] via-[var(--bg-surface)]/90 to-transparent" />
                <div className="relative z-10">
                  <div className="mb-3 flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)]">
                      <Code2 className="h-5 w-5 text-[var(--signal)]" />
                    </div>
                    <div className="text-left">
                      <p className="label-mono">{c.servicesLabel}</p>
                      <h3 className="font-display text-xl font-bold text-[var(--text-primary)]">{c.servicesName}</h3>
                    </div>
                  </div>
                  <p className="max-w-md text-left leading-relaxed text-[var(--text-secondary)]">
                    {c.servicesDesc}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className="badge">Web</span>
                    <span className="badge">Desktop</span>
                    <span className="badge">Design</span>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
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