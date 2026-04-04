'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div className="text-center px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-bg-surface border border-red-500/25 mb-8">
          <span className="font-display text-2xl font-bold text-red-400">
            !
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-3">
          Something went wrong
        </h1>
        <p className="text-text-secondary text-sm max-w-sm mx-auto mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-cyan text-bg-base font-semibold text-sm rounded-xl hover:bg-accent-cyan-light transition-all duration-200 shadow-glow-cyan-sm hover:shadow-glow-cyan"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
