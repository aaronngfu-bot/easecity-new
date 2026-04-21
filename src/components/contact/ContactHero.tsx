'use client'

import { PageHero } from '@/components/ui/PageHero'
import { useLanguage } from '@/context/LanguageContext'

export function ContactHero() {
  const { t } = useLanguage()

  return (
    <PageHero
      serial="05"
      sectionCode="CONTACT"
      eyebrow={t.contactPage.eyebrow}
      heading={t.contactPage.heading}
      headingHighlight={t.contactPage.headingHighlight}
      description={t.contactPage.desc}
      meta={[
        { label: 'RESPONSE', value: '< 24H' },
        { label: 'CHANNEL', value: 'DIRECT' },
        { label: 'STATUS', value: 'OPEN' },
      ]}
    />
  )
}
