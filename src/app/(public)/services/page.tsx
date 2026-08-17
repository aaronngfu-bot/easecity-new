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
  },
  {
    title: 'Web Platforms',
    body: 'Full-stack web applications — marketing sites, dashboards, admin panels, and API backends. Deployed on Vercel with PostgreSQL, Stripe, and Resend.',
    tags: ['Next.js', 'Prisma', 'Stripe', 'Vercel'],
  },
  {
    title: 'UI / UX Design',
    body: 'Interface design that balances aesthetics with function. Dark/light mode systems, component libraries, and interaction design that scales.',
    tags: ['Figma', 'Tailwind', 'Design Systems'],
  },
  {
    title: 'Consulting',
    body: 'Architecture review, performance audits, and team workflow optimization. We help you ship faster without cutting corners.',
    tags: ['Architecture', 'Performance', 'Process'],
  },
]

const process = [
  {
    step: '01',
    title: 'Discovery',
    description: 'We discuss your goals, constraints, and timeline. No assumptions — we map the problem before writing code.',
  },
  {
    step: '02',
    title: 'Design & Prototype',
    description: 'Wireframes, mockups, and a working prototype. You see the product before we commit to the full build.',
  },
  {
    step: '03',
    title: 'Build & Iterate',
    description: 'Weekly builds with progress demos. You steer the direction; we handle the engineering.',
  },
  {
    step: '04',
    title: 'Ship & Maintain',
    description: 'Deployment, monitoring, and ongoing support. We don\'t disappear after launch.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <PageHero
        serial="02"
        sectionCode="SERVICES"
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
                <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
                  {service.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
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
          <h2 className="font-display text-3xl font-bold text-[var(--text-primary)] mb-12 text-center">
            How we work
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {process.map((item) => (
              <div key={item.step}>
                <p className="label-mono text-[var(--signal)] mb-2">{item.step}</p>
                <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
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
