import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Services',
  description:
    'EaseCity provides system development, web platforms, and design services for teams who need reliable, beautiful tools.',
}

const services = [
  {
    title: 'System Development',
    body: 'Custom desktop and backend systems built with modern stacks. From real-time streaming infrastructure to internal tools and automation pipelines.',
    tags: ['C++', 'Flutter', 'Next.js', 'Node.js'],
    icon: 'code',
  },
  {
    title: 'Web Platforms',
    body: 'Full-stack web applications — marketing sites, dashboards, admin panels, and API backends. Deployed on Vercel with PostgreSQL, Stripe, and Resend.',
    tags: ['Next.js', 'Prisma', 'Stripe', 'Vercel'],
    icon: 'web',
  },
  {
    title: 'UI / UX Design',
    body: 'Interface design that balances aesthetics with function. Dark/light mode systems, component libraries, and interaction design that scales.',
    tags: ['Figma', 'Tailwind', 'Design Systems'],
    icon: 'design',
  },
  {
    title: 'Consulting',
    body: 'Architecture review, performance audits, and team workflow optimization. We help you ship faster without cutting corners.',
    tags: ['Architecture', 'Performance', 'Process'],
    icon: 'consult',
  },
]

const process = [
  { icon: 'search', title: 'Discovery', description: 'We discuss your goals, constraints, and timeline. No assumptions — we map the problem before writing code.' },
  { icon: 'layout', title: 'Design & Prototype', description: 'Wireframes, mockups, and a working prototype. You see the product before we commit to the full build.' },
  { icon: 'build', title: 'Build & Iterate', description: 'Weekly builds with progress demos. You steer the direction; we handle the engineering.' },
  { icon: 'ship', title: 'Ship & Maintain', description: 'Deployment, monitoring, and ongoing support. We don\'t disappear after launch.' },
]

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
    default:
      return null
  }
}

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        heading="Development & design"
        headingHighlight="for teams."
        description="EaseCity builds custom systems, web platforms, and interfaces for teams who need reliable tools that work. From concept to deployment, we handle the full cycle."
        meta={[
          { label: 'Based in', value: 'Hong Kong' },
          { label: 'Team', value: 'Lean & focused' },
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
            How we work
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
              Get in touch
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
