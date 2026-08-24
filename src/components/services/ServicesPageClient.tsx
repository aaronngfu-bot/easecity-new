'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MessageSquare, Search, Send, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PageHero } from '@/components/ui/PageHero'
import { QuoteModal } from '@/components/contact/QuoteModal'
import { ServiceIcon } from '@/components/ui/ServiceIcon'
import { services as serviceCatalog } from '@/lib/services'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' as const },
  }),
}

export function ServicesPageClient() {
  const { t } = useLanguage()
  const c = t.servicesPage
  const [quoteFor, setQuoteFor] = useState<string | null>(null)

  const services = serviceCatalog.map((s) => ({
    slug: s.slug,
    icon: s.icon,
    title: c[s.titleKey as keyof typeof c] as string,
    body: c[s.bodyKey as keyof typeof c] as string,
    tags: s.tags,
  }))

  const process = [
    { icon: 'search', title: c.p1Title, description: c.p1Desc },
    { icon: 'layout', title: c.p2Title, description: c.p2Desc },
    { icon: 'build', title: c.p3Title, description: c.p3Desc },
    { icon: 'ship', title: c.p4Title, description: c.p4Desc },
  ]

  const cases = [
    { img: '/images/service-case-system-dev.jpg', tag: c.case1Tag, title: c.case1Title, desc: c.case1Desc, href: '/ec-share' },
    { img: '/images/service-case-web-platform.jpg', tag: c.case2Tag, title: c.case2Title, desc: c.case2Desc, href: '/dashboard' },
    { img: '/images/service-case-ui-design.jpg', tag: c.case3Tag, title: c.case3Title, desc: c.case3Desc, href: '/services' },
  ]

  const quoteSteps = [
    { num: '01', icon: MessageSquare, title: c.quoteStep1Title, desc: c.quoteStep1Desc },
    { num: '02', icon: Search, title: c.quoteStep2Title, desc: c.quoteStep2Desc },
    { num: '03', icon: Send, title: c.quoteStep3Title, desc: c.quoteStep3Desc },
  ]

  return (
    <>
      <PageHero
        heading={c.heroHeading}
        headingHighlight={c.heroHighlight}
        description={c.heroDescription}
      />

      <section className="section-padding">
        <div className="container-max">
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.title}
                href={`/services/${service.slug}`}
                className="card group flex flex-col p-7 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                  <ServiceIcon icon={service.icon} />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                  {service.title}
                </h3>
                <p className="mb-4 leading-relaxed text-[var(--text-secondary)]">
                  {service.body}
                </p>
                <div className="mb-4 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)]">
                  {c.enquireService}
                  <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-[var(--bg-surface)]">
        <div className="container-max">
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-[var(--text-primary)]">
            {c.howWeWork}
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {process.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                  <ServiceIcon icon={item.icon} />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies — image + copy, animated */}
      <section className="section-padding">
        <div className="container-max">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <p className="label-mono mb-4 text-[var(--signal)]">{c.casesBadge}</p>
            <h2 className="type-section font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
              {c.casesTitle}
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">{c.casesSubtitle}</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {cases.map((cs, i) => (
              <motion.div
                key={cs.tag}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                className="group card overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-elevated)]">
                  <Image
                    src={cs.img}
                    alt={cs.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
                <div className="p-6">
                  <span className="badge mb-3">{cs.tag}</span>
                  <h3 className="mb-2 font-display text-lg font-bold text-[var(--text-primary)]">
                    {cs.title}
                  </h3>
                  <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {cs.desc}
                  </p>
                  <Link
                    href={cs.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] transition-colors hover:text-[var(--signal-light)]"
                  >
                    {c.getInTouch}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote flow + contact CTA */}
      <section className="section-padding bg-[var(--bg-surface)]">
        <div className="container-max">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeUp}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <p className="label-mono mb-4 text-[var(--signal)]">{c.quoteBadge}</p>
            <h2 className="type-section font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
              {c.quoteTitle}
            </h2>
            <p className="mt-4 text-[var(--text-secondary)]">{c.quoteSubtitle}</p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {quoteSteps.map((step, i) => (
              <motion.div
                key={step.num}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                className="card p-8"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                    <step.icon size={20} />
                  </div>
                  <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-faint)]">{step.num}</span>
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-10 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <button type="button" onClick={() => setQuoteFor('')} className="btn-primary px-7 py-3 text-sm">
                {c.requestQuote}
                <ArrowRight size={16} />
              </button>
              <a
                href="mailto:admin@easecity.hk"
                className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]"
              >
                <Mail size={15} />
                {c.contactEmailHint} admin@easecity.hk
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {quoteFor !== null && (
        <QuoteModal
          open
          onClose={() => setQuoteFor(null)}
          serviceSlug={quoteFor || undefined}
          serviceTitle={quoteFor ? services.find((s) => s.slug === quoteFor)?.title : undefined}
        />
      )}
    </>
  )
}