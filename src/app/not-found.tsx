'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="glass-panel text-center max-w-md px-8 py-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl glass-panel !rounded-2xl !border-signal/25 mb-6">
          <span className="font-display text-3xl font-bold text-signal tabular-nums">404</span>
        </div>
        <div className="label-mono text-signal/70 mb-3">SIGNAL.LOST</div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-3">{t.errors.notFound}</h1>
        <p className="text-text-secondary text-sm max-w-sm mx-auto mb-8">{t.errors.notFoundDesc}</p>
        <Link href="/" className="glass-cta">
          {t.errors.backToHome}
        </Link>
      </div>
    </div>
  )
}
