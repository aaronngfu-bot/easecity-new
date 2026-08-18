'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Calendar, Code2, Globe, Palette, Lightbulb, Megaphone, Fingerprint, Cpu } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { RevealSection } from '@/components/ui/RevealSection'
import SectionHeading from '@/components/SectionHeading'
import { CompanyIllustration } from '@/components/illustrations/CompanyIllustration'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: 'easeOut' as const },
  }),
}

export default function HomePage() {
  const { t } = useLanguage()
  const c = t.companyPage

  const services = [
    { icon: Cpu, title: t.servicesPage.s1Title, body: t.servicesPage.s1Body },
    { icon: Globe, title: t.servicesPage.s2Title, body: t.servicesPage.s2Body },
    { icon: Palette, title: t.servicesPage.s3Title, body: t.servicesPage.s3Body },
    { icon: Lightbulb, title: t.servicesPage.s4Title, body: t.servicesPage.s4Body },
    { icon: Megaphone, title: t.servicesPage.s5Title, body: t.servicesPage.s5Body },
    { icon: Fingerprint, title: t.servicesPage.s6Title, body: t.servicesPage.s6Body },
  ]

  return (
    <main className="relative min-h-screen">
      {/* Hero */}
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

          <div className="mx-auto mt-14 max-w-3xl">
            <CompanyIllustration />
          </div>
        </div>
      </section>

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
              <Link href="/ec-share" className="card group p-8 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]">
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
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                  {t.product.pricing.cta}
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <Link href="/services" className="card group p-8 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)]">
                    <Code2 className="h-5 w-5 text-[var(--signal)]" />
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
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
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

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => (
                <motion.div
                  key={s.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  variants={fadeUp}
                  className="card flex flex-col p-6 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                    <s.icon size={18} />
                  </div>
                  <h3 className="mb-2 font-display text-base font-semibold text-[var(--text-primary)]">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                    {s.body}
                  </p>
                  <Link
                    href="/services"
                    className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] transition-colors hover:text-[var(--signal-light)]"
                  >
                    {t.servicesPage.enquireService}
                    <ArrowUpRight size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/services" className="btn-secondary">
                {c.servicesCta}
              </Link>
            </div>
          </div>
        </section>
      </RevealSection>

      {/* VLOG / updates log */}
      <RevealSection>
        <section className="section-padding">
          <div className="container-max">
            <SectionHeading
              badge={c.vlogBadge}
              align="center"
              title={c.vlogTitle}
              subtitle={c.vlogSubtitle}
            />

            <div className="mx-auto mt-12 max-w-3xl">
              <ol className="relative space-y-6 border-l border-[var(--border-color)] pl-6">
                {c.vlogItems.map((item) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-[var(--signal)] ring-4 ring-[var(--bg-base)]" />
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[var(--signal)]" />
                      <span className="label-mono">{item.date}</span>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                      {item.body}
                    </p>
                  </motion.li>
                ))}
              </ol>
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