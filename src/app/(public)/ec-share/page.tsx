import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'EC-Share',
  description:
    'EC-Share is Android device mirroring for teams: grid view, focus mode, LAN mirroring, and Business invite sharing.',
}

const features = [
  {
    title: 'Multi-device grid',
    body: 'Watch up to 5 devices on Pro and 15 on Business from one Windows desktop app.',
  },
  {
    title: 'Focus mode',
    body: 'Jump from grid view into a single Android screen when you need precise operation.',
  },
  {
    title: 'LAN-first mirroring',
    body: 'Same-network workflows stay direct and low latency. Cloud sharing comes later for Business.',
  },
  {
    title: 'Team-ready licensing',
    body: 'Email OTP, signed license JWTs, Stripe subscriptions, and offline grace are built into the web backend.',
  },
]

export default function EcSharePage() {
  return (
    <>
      <PageHero
        serial="01"
        sectionCode="EC-SHARE"
        eyebrow="Product"
        heading="Android device mirroring"
        headingHighlight="for teams."
        description="EC-Share turns a Windows machine into a team-ready Android control room for developers, QA teams, support engineers, and enterprise device workflows."
        meta={[
          { label: 'Trial', value: '14 days' },
          { label: 'Pro', value: '$19/mo' },
          { label: 'Business', value: '$49/mo' },
        ]}
      />

      <section className="section-padding">
        <div className="container-max">
          <div className="grid gap-5 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="glass-panel p-6">
                <p className="label-mono mb-3">EC-SHARE</p>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
                  {feature.title}
                </h2>
                <p className="text-text-secondary leading-relaxed">{feature.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link href="/download" className="glass-cta inline-flex items-center justify-center">
              Download for Windows
            </Link>
            <Link href="/pricing" className="glass-ghost inline-flex items-center justify-center">
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
