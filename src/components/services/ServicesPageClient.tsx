'use client'

import Link from 'next/link'
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
            {services.map((service) => (
              <div key={service.title} className="card p-8">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                  <ServiceIcon icon={service.icon} />
                </div>
                <h3 className="mb-3 font-display text-xl font-bold text-[var(--text-primary)]">
                  {service.title}
                </h3>
                <p className="mb-4 leading-relaxed text-[var(--text-secondary)]">
                  {service.body}
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="badge">{tag}</span>
                  ))}
                </div>
              </div>
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
            {process.map((item) => (
              <div key={item.title}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--signal-soft)] text-[var(--signal)]">
                  <ServiceIcon icon={item.icon} />
                </div>
                <h3 className="mb-2 font-display text-lg font-bold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/about#contact" className="btn-primary">
              {c.getInTouch}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
