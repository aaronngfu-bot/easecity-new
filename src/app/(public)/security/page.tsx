import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Security',
  description:
    'Security posture for EC-Share and EaseCity: signed license JWTs, Stripe billing, minimal session metadata, and enterprise roadmap.',
}

const controls = [
  {
    title: 'Signed licensing',
    body: 'EC-Share licenses are Ed25519-signed JWTs scoped to product, tier, device fingerprint, and organization role.',
  },
  {
    title: 'Payment isolation',
    body: 'Card handling stays with Stripe Checkout and Billing Portal. EaseCity does not process raw card data.',
  },
  {
    title: 'Minimal device data',
    body: 'The web backend stores account, billing, device fingerprint, and session metadata. Device screen content is not stored.',
  },
  {
    title: 'Enterprise roadmap',
    body: 'SSO, full RBAC, SIEM export, and on-prem signaling/TURN are planned for the Enterprise milestone.',
  },
]

export default function SecurityPage() {
  return (
    <>
      <PageHero
        serial="04"
        sectionCode="SECURITY"
        eyebrow="Trust"
        heading="Security for"
        headingHighlight="device teams."
        description="EC-Share is designed for professional and enterprise workflows where licensing, account control, privacy, and auditability matter from the start."
        meta={[
          { label: 'Auth', value: 'Email OTP' },
          { label: 'Billing', value: 'Stripe' },
          { label: 'License', value: 'Ed25519 JWT' },
        ]}
      />

      <section className="section-padding">
        <div className="container-max grid gap-5 md:grid-cols-2">
          {controls.map((control) => (
            <div key={control.title} className="glass-panel p-6">
              <p className="label-mono mb-3">CONTROL</p>
              <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
                {control.title}
              </h2>
              <p className="text-text-secondary leading-relaxed">{control.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
