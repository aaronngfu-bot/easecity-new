import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'EC-Share Docs',
  description:
    'EC-Share documentation hub for quickstart, Android setup, billing, and troubleshooting.',
}

const docs = [
  {
    title: 'Quickstart',
    body: 'Install EC-Share, connect the first Android device, and open the device grid.',
  },
  {
    title: 'Android setup',
    body: 'Enable Developer Options, USB debugging, and verify ADB connectivity.',
  },
  {
    title: 'Licensing',
    body: 'Understand trial, Pro, Business, license refresh, and offline grace behavior.',
  },
  {
    title: 'Troubleshooting',
    body: 'Device not appearing, black screen, codec fallback, and network reachability checks.',
  },
]

export default function DocsPage() {
  return (
    <>
      <PageHero
        serial="03"
        sectionCode="DOCS"
        eyebrow="Support"
        heading="EC-Share"
        headingHighlight="documentation."
        description="A lightweight documentation hub for the first public release. Deeper guides will move into a dedicated docs site as M1 and M2 stabilize."
        meta={[
          { label: 'Audience', value: 'Dev / QA / Support' },
          { label: 'Format', value: 'MVP docs' },
          { label: 'Status', value: 'Expanding' },
        ]}
      />

      <section className="section-padding">
        <div className="container-max">
          <div className="grid gap-5 md:grid-cols-2">
            {docs.map((doc) => (
              <article key={doc.title} className="glass-panel p-6">
                <p className="label-mono mb-3">GUIDE</p>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
                  {doc.title}
                </h2>
                <p className="text-text-secondary leading-relaxed">{doc.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 glass-prominent p-6 md:p-8">
            <p className="label-mono mb-4">Download</p>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
              Need the Windows installer?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-5">
              Start from the download page to review release status, system requirements, and the
              latest manifest endpoint before following the setup guides.
            </p>
            <Link href="/download" className="glass-cta inline-flex items-center justify-center">
              Open download page
            </Link>
          </div>

          <div className="mt-12 glass-panel p-6">
            <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
              Need support?
            </h2>
            <p className="text-text-secondary leading-relaxed mb-5">
              Use the contact page for early-access support while the full documentation set is being built.
            </p>
            <Link href="/contact" className="glass-ghost inline-flex items-center justify-center">
              Contact support
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
