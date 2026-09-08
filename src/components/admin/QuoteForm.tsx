'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createQuote, updateQuote, type QuoteItemInput } from '@/actions/quotes'

/**
 * Shared create/edit form for quotes. Line items are edited as rows; money
 * inputs are in major units (converted to cents on submit). Create redirects
 * to the list; edit saves in place.
 */
export function QuoteForm({
  quote,
}: {
  quote?: {
    id: string
    clientName: string
    clientEmail: string | null
    clientPhone: string | null
    language: string
    currency: string
    items: { description: string; qty: number; unitPrice: number }[]
    notes: string | null
    validUntil: string | null
    paymentMode: string
    status: string
  }
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [clientName, setClientName] = useState(quote?.clientName ?? '')
  const [clientEmail, setClientEmail] = useState(quote?.clientEmail ?? '')
  const [clientPhone, setClientPhone] = useState(quote?.clientPhone ?? '')
  const [language, setLanguage] = useState(quote?.language ?? 'en')
  const [currency, setCurrency] = useState(quote?.currency ?? 'hkd')
  const [paymentMode, setPaymentMode] = useState(quote?.paymentMode ?? 'none')
  const [notes, setNotes] = useState(quote?.notes ?? '')
  const [validUntil, setValidUntil] = useState(quote?.validUntil ? quote.validUntil.slice(0, 10) : '')
  const [items, setItems] = useState<{ description: string; qty: string; price: string }[]>(
    quote
      ? quote.items.map((it) => ({ description: it.description, qty: String(it.qty), price: (it.unitPrice / 100).toString() }))
      : [{ description: '', qty: '1', price: '' }]
  )

  const locked = quote ? ['confirmed', 'converted', 'paid', 'cancelled'].includes(quote.status) : false

  const setItem = (i: number, patch: Partial<{ description: string; qty: string; price: string }>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  const addItem = () => setItems((prev) => [...prev, { description: '', qty: '1', price: '' }])
  const removeItem = (i: number) => setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))

  const total = items.reduce((sum, it) => {
    const q = parseFloat(it.qty) || 0
    const p = parseFloat(it.price) || 0
    return sum + q * p
  }, 0)

  const submit = () =>
    startTransition(async () => {
      setError(null)
      try {
        const parsed: QuoteItemInput[] = items.map((it) => ({
          description: it.description,
          qty: parseInt(it.qty, 10) || 0,
          unitPrice: Math.round((parseFloat(it.price) || 0) * 100),
        }))
        if (quote) {
          await updateQuote(quote.id, {
            clientName, clientEmail, clientPhone,
            language: language as 'en' | 'zh' | 'zh-CN',
            currency, notes, validUntil: validUntil || undefined,
            paymentMode: paymentMode as 'none' | 'stripe',
            items: parsed,
          })
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        } else {
          const res = await createQuote({
            clientName, clientEmail, clientPhone,
            language: language as 'en' | 'zh' | 'zh-CN',
            currency, notes, validUntil: validUntil || undefined,
            paymentMode: paymentMode as 'none' | 'stripe',
            items: parsed,
          })
          router.push(`/admin/quotes?created=${encodeURIComponent(res.number)}`)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })

  const inputCls = 'w-full rounded-lg border border-border bg-bg-void px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-signal/50 focus:outline-none'

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Client name *</span>
          <input value={clientName} onChange={(e) => setClientName(e.target.value)} disabled={locked} className={inputCls} placeholder="Acme Ltd / 陳先生" />
        </label>
        <label className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Client email</span>
          <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} disabled={locked} type="email" className={inputCls} placeholder="client@example.com" />
        </label>
        <label className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Client phone</span>
          <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} disabled={locked} className={inputCls} placeholder="+852…" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Language</span>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={locked} className={inputCls}>
              <option value="en">EN</option>
              <option value="zh">繁中</option>
              <option value="zh-CN">简体</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Currency</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={locked} className={inputCls}>
              <option value="hkd">HKD</option>
              <option value="usd">USD</option>
              <option value="cny">CNY</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Valid until</span>
            <input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} disabled={locked} type="date" className={inputCls} />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Line items</span>
          {!locked && (
            <button type="button" onClick={addItem} className="text-xs text-signal hover:underline">
              + Add item
            </button>
          )}
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_80px_120px_32px] gap-2">
              <input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} disabled={locked} className={inputCls} placeholder={i === 0 ? 'System development, UI/UX design…' : 'Description'} />
              <input value={it.qty} onChange={(e) => setItem(i, { qty: e.target.value })} disabled={locked} type="number" min="1" className={inputCls} placeholder="Qty" />
              <input value={it.price} onChange={(e) => setItem(i, { price: e.target.value })} disabled={locked} type="number" step="0.01" min="0" className={inputCls} placeholder="Unit price" />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={locked || items.length <= 1}
                className="rounded-lg border border-transparent text-text-muted transition-colors hover:text-status-danger disabled:opacity-30"
                aria-label="Remove item"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <p className="text-right font-mono text-sm text-signal">
          TOTAL {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency.toUpperCase()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Payment</span>
          <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} disabled={locked} className={inputCls}>
            <option value="none">Offline / invoice later</option>
            <option value="stripe">Stripe Checkout (pay online)</option>
          </select>
        </label>
        <label className="space-y-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} disabled={locked} rows={2} className={`${inputCls} resize-none`} placeholder="Scope, assumptions, payment terms…" />
        </label>
      </div>

      {error && <p className="text-sm text-status-danger" role="alert">{error}</p>}
      {saved && <p className="text-sm text-status-success" role="status">Saved</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending || locked}
          className="rounded-lg bg-signal px-5 py-2.5 text-sm font-semibold text-bg-base transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 motion-safe:hover:-translate-y-px"
        >
          {pending ? 'Saving…' : quote ? 'Save changes' : 'Create quote'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm text-text-muted hover:text-text-primary">
          Back
        </button>
        {locked && <span className="text-xs text-text-muted">This quote is locked (already {quote?.status})</span>}
      </div>
    </div>
  )
}
