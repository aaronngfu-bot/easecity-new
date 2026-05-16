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
    <div className="control-canvas grid min-h-screen place-items-center px-5">
      <div className="signal-panel max-w-md px-8 py-10 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-lg border border-status-danger/30 bg-status-danger/10">
          <span className="font-display text-3xl font-bold text-status-danger">!</span>
        </div>
        <div className="label-mono mb-3 !text-status-danger">SYS.ERROR</div>
        <h1 className="mb-3 font-display text-2xl font-semibold tracking-[-0.04em] text-text-primary">
          {t.errors.somethingWrong}
        </h1>
        <p className="mx-auto mb-8 max-w-sm text-sm leading-6 text-text-secondary">
          {t.errors.unexpectedError}
        </p>
        <button onClick={reset} className="signal-cta">
          {t.errors.tryAgain}
        </button>
      </div>
    </div>
  )
}
