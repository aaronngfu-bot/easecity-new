'use client'

import { useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLanguage()

  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="glass-panel text-center max-w-md px-8 py-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl glass-panel !rounded-2xl !border-red-500/30 mb-6">
          <span className="font-display text-3xl font-bold text-red-400">!</span>
        </div>
        <div className="label-mono !text-red-400/70 mb-3">SYS.ERROR</div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-3">{t.errors.somethingWrong}</h1>
        <p className="text-text-secondary text-sm max-w-sm mx-auto mb-8">{t.errors.unexpectedError}</p>
        <button onClick={reset} className="glass-cta">
          {t.errors.tryAgain}
        </button>
      </div>
    </div>
  )
}
