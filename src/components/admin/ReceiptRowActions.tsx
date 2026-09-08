'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { emailReceipt } from '@/actions/receipts'

/** Per-row receipt actions: PDF, email the link to the client. */
export function ReceiptRowActions({ id, clientEmail }: { id: string; clientEmail: string | null }) {
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const send = () =>
    startTransition(async () => {
      try {
        const res = await emailReceipt(id)
        setMessage(res.url ? 'Sent' : 'Sent')
        await navigator.clipboard.writeText(res.url).catch(() => {})
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Failed')
      }
      setTimeout(() => setMessage(null), 4000)
    })

  return (
    <div className="flex items-center justify-end gap-2 text-xs">
      {message && <span className="mr-1 text-text-muted">{message}</span>}
      <a
        href={`/api/receipt/${id}/pdf`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-signal transition-colors hover:text-signal-light"
      >
        PDF
      </a>
      {clientEmail && (
        <button
          type="button"
          disabled={pending}
          onClick={send}
          className="text-text-secondary transition-colors hover:text-signal disabled:opacity-40"
        >
          Email
        </button>
      )}
    </div>
  )
}
