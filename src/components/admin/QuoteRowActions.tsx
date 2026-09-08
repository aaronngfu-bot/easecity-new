'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { cancelQuote, regenerateQuoteLink, sendQuote } from '@/actions/quotes'

/**
 * Per-row admin actions for a quote: send (email), copy link, cancel.
 * State feedback inline — the list revalidates server-side after each call.
 */
export function QuoteRowActions({ id, status, clientEmail }: { id: string; status: string; clientEmail: string | null }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const locked = ['cancelled', 'converted', 'paid'].includes(status)

  const run = (fn: () => Promise<{ ok?: boolean; url?: string }>, okMsg: string) =>
    startTransition(async () => {
      try {
        const res = await fn()
        setMessage(res.url ? okMsg : okMsg)
        if (res.url) await navigator.clipboard.writeText(res.url).catch(() => {})
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Failed')
      }
      setTimeout(() => setMessage(null), 4000)
    })

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      {message && <span className="mr-1 max-w-[180px] truncate text-text-muted" title={message}>{message}</span>}
      <Link href={`/admin/quotes/${id}`} className="text-signal transition-colors hover:text-signal-light">
        Edit
      </Link>
      <a
        href={`/api/quote/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-signal transition-colors hover:text-signal-light"
      >
        PDF
      </a>
      {!locked && clientEmail && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => sendQuote(id), 'Sent — link copied')}
          className="text-text-secondary transition-colors hover:text-signal disabled:opacity-40"
        >
          Send
        </button>
      )}
      {!locked && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => regenerateQuoteLink(id), 'New link copied')}
          className="text-text-secondary transition-colors hover:text-signal disabled:opacity-40"
          title="Regenerate client link (revokes the old one)"
        >
          Link
        </button>
      )}
      {!locked && status !== 'cancelled' && (
        <button
          type="button"
          disabled={pending}
          onClick={() => run(() => cancelQuote(id), 'Cancelled')}
          className="text-status-danger/80 transition-colors hover:text-status-danger disabled:opacity-40"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
