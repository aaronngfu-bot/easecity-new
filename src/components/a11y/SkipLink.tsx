'use client'

import { useLanguage } from '@/context/LanguageContext'

export function SkipLink({ targetId = 'main' }: { targetId?: string }) {
  const { t } = useLanguage()

  return (
    <a href={`#${targetId}`} className="skip-link">
      {t.a11y.skipToContent}
    </a>
  )
}
