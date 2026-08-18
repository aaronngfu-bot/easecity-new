'use client'

import { useLanguage } from '@/context/LanguageContext'
import { PageHero } from '@/components/ui/PageHero'

export default function SecurityPage() {
  const { t } = useLanguage()
  const c = t.securityPage

  const controls = [
    { title: c.c1Title, body: c.c1Body },
    { title: c.c2Title, body: c.c2Body },
    { title: c.c3Title, body: c.c3Body },
    { title: c.c4Title, body: c.c4Body },
  ]

  return (
    <>
      <PageHero
        eyebrow={c.heroEyebrow}
        heading={c.heroHeading}
        headingHighlight={c.heroHighlight}
        description={c.heroDescription}
        meta={[
          { label: c.metaAuth, value: c.metaAuthValue },
          { label: c.metaBilling, value: c.metaBillingValue },
          { label: c.metaLicense, value: c.metaLicenseValue },
        ]}
      />

      <section className="section-padding">
        <div className="container-max grid gap-5 md:grid-cols-2">
          {controls.map((control) => (
            <div key={control.title} className="card p-6">
              <p className="label-mono mb-3 text-[var(--signal)]">CONTROL</p>
              <h2 className="mb-3 font-display text-2xl font-bold text-[var(--text-primary)]">
                {control.title}
              </h2>
              <p className="leading-relaxed text-[var(--text-secondary)]">{control.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
