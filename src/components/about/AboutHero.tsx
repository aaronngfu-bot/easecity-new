'use client'

import { PageHero } from '@/components/ui/PageHero'
import { useLanguage } from '@/context/LanguageContext'

export function AboutHero() {
  const { t } = useLanguage()

  return (
    <PageHero
      serial="04"
      sectionCode="ABOUT"
      eyebrow={t.aboutPage.eyebrow}
      heading={t.aboutPage.heading}
      headingHighlight={t.aboutPage.headingHighlight}
      description={t.aboutPage.desc}
      meta={[
        { label: 'BASED IN', value: 'HONG KONG' },
        { label: 'FOUNDED', value: '2025' },
        { label: 'STACK', value: 'EDGE-NATIVE' },
      ]}
    />
  )
}
