'use client'

import { PageHero } from '@/components/ui/PageHero'
import { useLanguage } from '@/context/LanguageContext'

export function ServicesHero() {
  const { t } = useLanguage()

  return (
    <PageHero
      serial="02"
      sectionCode="SERVICES"
      eyebrow={t.servicesPage.eyebrow}
      heading={t.servicesPage.heading}
      headingHighlight={t.servicesPage.headingHighlight}
      description={t.servicesPage.desc}
      meta={[
        { label: 'LIVE SERVICES', value: '01' },
        { label: 'PLANNED', value: '02' },
        { label: 'UPTIME SLA', value: '99.9%' },
        { label: 'DEPLOYMENT', value: 'AP-HK' },
      ]}
    />
  )
}
