'use client'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { getService } from '@/lib/services'

function ServiceIcon({ icon, size = 22 }: { icon: string; size?: number }) {
  const common = { strokeWidth: 1.8, stroke: 'currentColor', fill: 'none', width: size, height: size } as const
  switch (icon) {
    case 'code':
      return <svg viewBox="0 0 24 24" {...common}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'web':
      return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" strokeLinecap="round" /></svg>
    case 'design':
      return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
    case 'consult':
      return <svg viewBox="0 0 24 24" {...common}><path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17h-8v-2.3A7 7 0 0 1 5 9a7 7 0 0 1 7-7Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 21h6" strokeLinecap="round" /></svg>
    case 'ad':
      return <svg viewBox="0 0 24 24" {...common}><path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" strokeLinecap="round" /></svg>
    case 'brand':
      return <svg viewBox="0 0 24 24" {...common}><path d="M12 21a9 9 0 1 1 0-18c4.97 0 9 4.03 9 9 0 1.5-1 2-2.5 2H15a2 2 0 0 0-2 2c0 .6-.5 1-1 1h0a3 3 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7.5" cy="11.5" r="0.5" fill="currentColor" /><circle cx="10" cy="7.5" r="0.5" fill="currentColor" /><circle cx="14" cy="7.5" r="0.5" fill="currentColor" /></svg>
    default:
      return null
  }
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { t, language } = useLanguage()
  const service = getService(slug)
  if (!service) notFound()

  const c = t.servicesPage
  const title = c[service.titleKey as keyof typeof c] as string
  const body = c[service.bodyKey as keyof typeof c] as string
  const bullets = language === 'zh' ? service.bullets.zh : service.bullets.en
  const subject = language === 'zh' ? service.subject.zh : service.subject.en
  const contactHref = `/about#contact?subject=${encodeURIComponent(`${c.enquireSubjectPrefix}${subject}`)}`

  return (
    <main className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-4xl py-28 md:py-36">
        <Link href="/services" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]">
          <ArrowLeft size={14} />
          {t.nav.services}
        </Link>

        <div className="mt-8">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--signal-soft)] text-[var(--signal)]">
            <ServiceIcon icon={service.icon} />
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
                  transition={{ duration: 0.4 }}
                  className="flex items-start gap-2.5"
                >
                  <Check size={16} className="mt-1 shrink-0 text-[var(--signal)]" />
                  <span className="text-sm leading-relaxed text-[var(--text-secondary)]">{b}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {service.tags.map((tag) => (
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
                <Link
                  href={contactHref}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--signal)] px-4 py-3 text-sm font-semibold text-[var(--signal-ink)] transition-colors hover:bg-[var(--signal-light)]"
                >
                  {c.requestQuote}
                  <ArrowUpRight size={16} />
                </Link>
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
                transition={{ duration: 0.45, delay: i * 0.08 }}
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
    </main>
  )
}