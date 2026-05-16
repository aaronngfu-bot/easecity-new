'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="control-canvas grid min-h-screen place-items-center px-5">
      <div className="signal-panel max-w-md px-8 py-10 text-center">
        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-lg border border-signal/25 bg-signal/10">
          <span className="font-display text-3xl font-semibold tabular-nums text-signal">404</span>
        </div>
        <div className="label-mono mb-3 text-signal">SIGNAL.LOST</div>
        <h1 className="mb-3 font-display text-2xl font-semibold tracking-[-0.04em] text-text-primary">
          {t.errors.notFound}
        </h1>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-6 text-text-secondary">{t.errors.notFoundDesc}</p>
        <Link href="/" className="signal-cta">
          {t.errors.backToHome}
        </Link>
      </div>
    </div>
  )
}
