'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MessageSquare, Search, Send, ArrowUpRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { PageHero } from '@/components/ui/PageHero'

function ServiceIcon({ icon }: { icon: string }) {
  const common = { strokeWidth: 1.8, stroke: 'currentColor', fill: 'none' } as const
  switch (icon) {
    case 'code':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'web':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" strokeLinecap="round" /></svg>
    case 'design':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
    case 'consult':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17h-8v-2.3A7 7 0 0 1 5 9a7 7 0 0 1 7-7Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 21h6" strokeLinecap="round" /></svg>
    case 'search':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" strokeLinecap="round" /></svg>
    case 'layout':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" strokeLinecap="round" /></svg>
    case 'build':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4L14 12l-2-2 2.7-3.7Z" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'ship':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><path d="M12 15V3m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 21h16" strokeLinecap="round" /></svg>
    case 'ad':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" strokeLinecap="round" /></svg>
    case 'brand':
      return <svg viewBox="0 0 24 24" width="20" height="20" {...common}><path d="M12 21a9 9 0 1 1 0-18c4.97 0 9 4.03 9 9 0 1.5-1 2-2.5 2H15a2 2 0 0 0-2 2c0 .6-.5 1-1 1h0a3 3 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7.5" cy="11.5" r="0.5" fill="currentColor" /><circle cx="10" cy="7.5" r="0.5" fill="currentColor" /><circle cx="14" cy="7.5" r="0.5" fill="currentColor" /></svg>
    default:
      return null
  }
}

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

  const services = [
    { icon: 'code', title: c.s1Title, body: c.s1Body, tags: ['C++', 'Flutter', 'Next.js', 'Node.js'] },
    { icon: 'web', title: c.s2Title, body: c.s2Body, tags: ['Next.js', 'Prisma', 'Stripe', 'Vercel'] },
    { icon: 'design', title: c.s3Title, body: c.s3Body, tags: ['Figma', 'Tailwind', 'Design Systems'] },
    { icon: 'consult', title: c.s4Title, body: c.s4Body, tags: ['Architecture', 'Performance', 'Process'] },
    { icon: 'ad', title: c.s5Title, body: c.s5Body, tags: ['Google Ads', 'Meta', 'SEO'] },
    { icon: 'brand', title: c.s6Title, body: c.s6Body, tags: ['Logo', 'Brand Identity', 'Visual System'] },
  ]

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
        eyebrow={c.heroEyebrow}
        heading={c.heroHeading}
        headingHighlight={c.heroHighlight}
        description={c.heroDescription}
        meta={[
          { label: c.metaBasedIn, value: c.metaBasedValue },
          { label: c.metaTeam, value: c.metaTeamValue },
        ]}
      />

      <section className="section-padding">
        <div className="container-max">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                className="card flex flex-col p-8 transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                  <ServiceIcon icon={service.icon} />
                </div>
                <h3 className="mb-3 font-display text-xl font-bold text-[var(--text-primary)]">
                  {service.title}
                </h3>
                <p className="mb-4 leading-relaxed text-[var(--text-secondary)]">
                  {service.body}
                </p>
                <div className="mb-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
                <Link
                  href={`/about#contact?subject=${encodeURIComponent(c.enquireSubjectPrefix + service.title)}`}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] transition-colors hover:text-[var(--signal-light)]"
                >
                  {c.enquireService}
                  <ArrowUpRight size={14} />
                </Link>
              </motion.div>
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
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
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
            <h2 className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
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
            className="mt-12 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <Link href="/about#contact" className="btn-primary px-7 py-3 text-sm">
                {c.requestQuote}
                <ArrowRight size={16} />
              </Link>
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
    </>
  )
}