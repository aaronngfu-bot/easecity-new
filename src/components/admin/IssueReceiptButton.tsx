'use client'

import { useState, useTransition } from 'react'
import { issueManualReceipt } from '@/actions/receipts'

/**
 * "Issue receipt" flow for admin: pick the order/quote context implicitly
 * from the row this component lives in, choose how the money arrived
 * (FPS / AlipayHK / WeChat Pay / bank / cash / cheque), then issue.
 * The chosen method is stored in receipt.meta and printed on the PDF.
 */
export function IssueReceiptButton({ orderId, quoteId }: { orderId?: string; quoteId?: string }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState('bank')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const METHODS = [
    { v: 'bank', label: 'Bank transfer 銀行轉帳' },
    { v: 'fps', label: 'FPS 轉數快' },
    { v: 'alipayhk', label: 'AlipayHK 支付寶香港' },
    { v: 'wechatpay', label: 'WeChat Pay 微信支付' },
    { v: 'cash', label: 'Cash 現金' },
    { v: 'cheque', label: 'Cheque 支票' },
  ]

  const submit = () =>
    startTransition(async () => {
      try {
        const res = await issueManualReceipt({ orderId, quoteId, paymentMethod: method as 'bank' })
        setMessage(`Issued ${res.number}`)
        setOpen(false)
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Failed')
      }
      setTimeout(() => setMessage(null), 5000)
    })

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-status-success transition-colors hover:text-status-success/80"
      >
        {message || 'Issue receipt'}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl border border-border bg-bg-surface p-5">
        <p className="mb-4 font-display text-lg font-semibold text-text-primary">Issue receipt</p>
        <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
          Payment method 付款方式
        </label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="mb-4 w-full rounded-lg border border-border bg-bg-void px-3 py-2 text-sm text-text-primary focus:border-signal/50 focus:outline-none"
        >
          {METHODS.map((m) => (
            <option key={m.v} value={m.v}>{m.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={submit}
            className="flex-1 rounded-lg bg-signal px-4 py-2 text-sm font-semibold text-bg-base disabled:opacity-40"
          >
            {pending ? 'Issuing…' : 'Issue'}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
