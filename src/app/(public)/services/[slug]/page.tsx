'use client'

import { useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpRight, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { getService } from '@/lib/services'
import { QuoteModal } from '@/components/contact/QuoteModal'
import { ServiceIcon } from '@/components/ui/ServiceIcon'

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { t, language } = useLanguage()
  const service = getService(slug)
  const [quoteOpen, setQuoteOpen] = useState(false)
  if (!service) notFound()

  const c = t.servicesPage
  const title = c[service.titleKey as keyof typeof c] as string
  const body = c[service.bodyKey as keyof typeof c] as string
  const bullets = language === 'zh' ? service.bullets.zh : service.bullets.en
  const subject = language === 'zh' ? service.subject.zh : service.subject.en

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-4xl pt-2 pb-24 md:pb-32">
        <div className="mt-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--signal-soft)] text-[var(--signal)]">
            <ServiceIcon icon={service.icon} size={22} />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">{body}</p>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-5">
          {/* What's included */}
          <div className="md:col-span-3">
            <h2 className="mb-5 font-display text-xl font-semibold text-[var(--text-primary)]">
              {t.pricingPage.whatsIncluded}
            </h2>
            <ul className="space-y-3">
              {bullets.map((b) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-start gap-2.5"
                >
                  <Check size={16} className="mt-1 shrink-0 text-[var(--signal)]" />
                  <span className="text-sm leading-relaxed text-[var(--text-secondary)]">{b}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags[language].map((tag) => (
                <span key={tag} className="badge">{tag}</span>
              ))}
            </div>
          </div>

          {/* Enquiry card */}
          <div className="md:col-span-2">
            <div className="sticky top-24 rounded-xl border border-[var(--signal)] bg-[var(--bg-surface)] p-6 shadow-[0_0_0_1px_var(--signal),0_8px_30px_-12px_var(--signal)]">
              <p className="label-mono mb-2 text-[var(--signal)]">START A CONVERSATION</p>
              <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                {c.enquireService}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {c.quoteStep1Desc}
              </p>
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--signal)] px-4 py-3 text-sm font-semibold text-[var(--signal-ink)] transition-colors hover:bg-[var(--signal-light)]"
                >
                  {c.requestQuote}
                  <ArrowUpRight size={16} />
                </button>
                <a
                  href={`mailto:admin@easecity.hk?subject=${encodeURIComponent(`${subject}`)}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-elevated)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--signal)] hover:text-[var(--signal)]"
                >
                  {c.contactEmailHint} admin@easecity.hk
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery process — from brief to sign-off */}
        <div className="mt-16">
          <div className="mb-8">
            <p className="label-mono mb-3 text-[var(--signal)]">{c.processBadge}</p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
              {c.processTitle}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{c.processSubtitle}</p>
          </div>

          <ol className="relative space-y-0">
            {[
              { num: '01', title: c.p1Title, desc: c.p1Desc },
              { num: '02', title: c.p2Title, desc: c.p2Desc },
              { num: '03', title: c.p3Title, desc: c.p3Desc },
              { num: '04', title: c.p4Title, desc: c.p4Desc },
            ].map((step, i) => (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.22, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                className="relative flex gap-5 pb-8 last:pb-0"
              >
                {/* vertical connector */}
                {i < 3 && (
                  <span aria-hidden className="absolute left-[22px] top-12 bottom-0 w-px bg-[var(--border-strong)]" />
                )}
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--bg-surface)] font-mono text-sm font-semibold text-[var(--signal)]">
                  {step.num}
                </div>
                <div className="pt-1">
                  <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">{step.desc}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>

      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} serviceSlug={service.slug} serviceTitle={title} />
    </div>
  )
}