'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { PageHero } from '@/components/ui/PageHero'

export default function DocsPage() {
  const { t } = useLanguage()
  const c = t.docsPage

  const docs = [
    { title: c.d1Title, body: c.d1Body },
    { title: c.d2Title, body: c.d2Body },
    { title: c.d3Title, body: c.d3Body },
    { title: c.d4Title, body: c.d4Body },
  ]

  return (
    <>
      <PageHero
        eyebrow={c.heroEyebrow}
        heading={c.heroHeading}
        headingHighlight={c.heroHighlight}
        description={c.heroDescription}
        meta={[
          { label: c.metaAudience, value: c.metaAudienceValue },
          { label: c.metaFormat, value: c.metaFormatValue },
          { label: c.metaStatus, value: c.metaStatusValue },
        ]}
      />

      <section className="section-padding">
        <div className="container-max">
          <div className="grid gap-5 md:grid-cols-2">
            {docs.map((doc) => (
              <article key={doc.title} className="card p-6">
                <p className="label-mono mb-3 text-[var(--signal)]">GUIDE</p>
                <h2 className="mb-3 font-display text-2xl font-bold text-[var(--text-primary)]">
                  {doc.title}
                </h2>
                <p className="leading-relaxed text-[var(--text-secondary)]">{doc.body}</p>
              </article>
            ))}
          </div>

          <div className="card mt-12 p-6 md:p-8">
            <p className="label-mono mb-4 text-[var(--signal)]">Download</p>
            <h2 className="mb-3 font-display text-2xl font-bold text-[var(--text-primary)]">
              {c.needInstaller ?? 'Need the Windows installer?'}
            </h2>
            <p className="mb-5 leading-relaxed text-[var(--text-secondary)]">
              {c.installerHint ?? 'Start from the download page to review release status, system requirements, and the latest manifest endpoint.'}
            </p>
            <Link href="/download" className="btn-primary inline-flex items-center justify-center">
              {c.openDownload ?? 'Open download page'}
            </Link>
          </div>

          <div className="card mt-12 p-6">
            <h2 className="mb-3 font-display text-2xl font-bold text-[var(--text-primary)]">
              {c.needSupport ?? 'Need support?'}
            </h2>
            <p className="mb-5 leading-relaxed text-[var(--text-secondary)]">
              {c.supportHint ?? 'Use the contact page for early-access support while the full documentation set is being built.'}
            </p>
            <Link href="/about#contact" className="btn-secondary inline-flex items-center justify-center">
              {c.openContact ?? 'Contact support'}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
