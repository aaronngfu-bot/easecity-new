'use client'

import { useState, useTransition } from 'react'
import { confirmQuote } from '@/actions/quotes'
import { SignaturePad } from '@/components/commerce/SignaturePad'

/**
 * Customer-facing confirm flow for a quote. Optional hand-drawn signature:
 * drawing one adds a signature pad + signer-name field and submits both with
 * the confirmation; skipping it confirms plainly. Stripe quotes redirect to
 * Checkout after confirm.
 */
export function ConfirmQuoteButton({
  quoteId,
  token,
  labels,
}: {
  quoteId: string
  token: string
  labels: {
    confirm: string
    confirming: string
    offlineDone: string
    signedDone: string
    draw: string
    clear: string
    signerName: string
    signHint: string
    skipSignature: string
    addSignature: string
  }
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<'offline' | 'signed' | null>(null)
  const [mode, setMode] = useState<'plain' | 'sign'>('plain')
  const [signature, setSignature] = useState<string | null>(null)
  const [signerName, setSignerName] = useState('')

  if (done) {
    return (
      <div className="rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 text-center text-sm text-status-success" role="status">
        {done === 'signed' ? labels.signedDone : labels.offlineDone}
      </div>
    )
  }

  const submit = (withSignature: { pngDataUri: string; signerName: string } | undefined) =>
    startTransition(async () => {
      setError(null)
      try {
        const res = await confirmQuote(quoteId, token, withSignature)
        if (res.status === 'stripe_redirect' && res.url) {
          window.location.href = res.url
          return
        }
        setDone(withSignature ? 'signed' : 'offline')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })

  const inputCls = 'w-full rounded-lg border border-border bg-bg-void px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-signal/50 focus:outline-none'

  return (
    <div className="space-y-3">
      {mode === 'sign' && (
        <div className="space-y-3 rounded-xl border border-border/60 bg-bg-base/40 p-4">
          <input
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            placeholder={labels.signerName}
            maxLength={120}
            className={inputCls}
          />
          <SignaturePad onSignature={setSignature} labels={{ draw: labels.draw, clear: labels.clear }} />
          <p className="text-center text-[11px] leading-relaxed text-text-muted">{labels.signHint}</p>
        </div>
      )}

      <button
        type="button"
        disabled={pending || (mode === 'sign' && (!signature || !signerName.trim()))}
        onClick={() => submit(mode === 'sign' && signature ? { pngDataUri: signature, signerName } : undefined)}
        className="w-full rounded-lg bg-signal px-5 py-3 text-sm font-semibold text-bg-base transition-transform hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 motion-safe:hover:-translate-y-px"
      >
        {pending ? labels.confirming : labels.confirm}
      </button>
      {mode === 'sign' && (
        <p className="text-center text-[11px] text-text-muted">{labels.signHint}</p>
      )}
      <div className="text-center">
        <button
          type="button"
          onClick={() => setMode(mode === 'sign' ? 'plain' : 'sign')}
          className="text-xs text-text-muted underline-offset-2 transition-colors hover:text-signal hover:underline"
        >
          {mode === 'sign' ? labels.skipSignature : labels.addSignature}
        </button>
      </div>
      {error && <p className="text-center text-xs text-status-danger" role="alert">{error}</p>}
    </div>
  )
}
