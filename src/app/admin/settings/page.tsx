'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, Upload, CheckCircle2, Trash2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [payMsg, setPayMsg] = useState('')
  const [payLoading, setPayLoading] = useState(true)
  const [pay, setPay] = useState<Record<string, string>>({
    'pay:companyName': '',
    'pay:companyBrNo': '',
    'pay:companyAddress': '',
    'pay:bankName': '',
    'pay:accountName': '',
    'pay:accountNumber': '',
    'pay:paymentTerms': '30 days from invoice date',
    'pay:termsAndConditions': '',
  })
  const fileInput = { current: null as HTMLInputElement | null }

  const PAY_FIELDS: { key: string; label: string; rows?: number }[] = [
    { key: 'pay:companyName', label: 'Company name (as on BR) 公司名稱' },
    { key: 'pay:companyBrNo', label: 'BR number 商業登記號' },
    { key: 'pay:companyAddress', label: 'Registered address 註冊地址', rows: 2 },
    { key: 'pay:bankName', label: 'Bank 銀行' },
    { key: 'pay:accountName', label: 'Account name (must match BR) 帳戶名稱' },
    { key: 'pay:accountNumber', label: 'Account number 帳戶號碼' },
    { key: 'pay:paymentTerms', label: 'Payment terms 付款條款' },
    { key: 'pay:termsAndConditions', label: 'Terms & conditions 條款及細則', rows: 5 },
  ]

  const loadPay = useCallback(async () => {
    setPayLoading(true)
    try {
      const res = await fetch('/api/admin/site')
      const d = await res.json()
      if (res.ok && d.success && d.data) {
        setPay((prev) => {
          const next = { ...prev }
          for (const f of PAY_FIELDS) if (d.data[f.key]) next[f.key] = d.data[f.key]
          return next
        })
      }
    } catch { /* ignore */ }
    setPayLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { loadPay() }, [loadPay])

  const savePay = async () => {
    setPayMsg('')
    try {
      const body: Record<string, string | null> = {}
      for (const f of PAY_FIELDS) body[f.key] = pay[f.key] || null
      const res = await fetch('/api/admin/site', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok || !d.success) throw new Error(d.error?.message || 'Save failed')
      setPayMsg('Saved ✓ — new quotes/receipts will print these details.')
    } catch (e) {
      setPayMsg(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/site')
      const d = await res.json()
      if (res.ok && d.success) setLogoUrl(d.data?.ecshare_logo_url ?? null)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onUpload = async (file: File) => {
    setUploading(true)
    setMsg('')
    try {
      const buf = await file.arrayBuffer()
      const bytes = new Uint8Array(buf)
      let binary = ''
      const chunk = 0x8000
      for (let i = 0; i < bytes.length; i += chunk) {
        const end = Math.min(i + chunk, bytes.length)
        let part = ''
        for (let j = i; j < end; j++) part += String.fromCharCode(bytes[j])
        binary += part
      }
      const data = btoa(binary)
      const res = await fetch('/api/admin/blog/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type, data }),
      })
      const d = await res.json()
      if (!res.ok || !d.success) throw new Error(d.error?.message || 'Upload failed')
      setLogoUrl(d.data.url)
      setMsg('Uploaded — click Save to apply.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    setMsg('')
    try {
      const res = await fetch('/api/admin/site', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ecshare_logo_url: logoUrl }),
      })
      const d = await res.json()
      if (!res.ok || !d.success) throw new Error(d.error?.message || 'Save failed')
      setMsg('Saved ✓')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-signal mb-2">ADMIN.SETTINGS</p>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.05em] text-text-primary">Site settings</h1>
        <p className="mt-1 text-sm text-text-secondary">EC-Share logo shown on the public site.</p>
      </div>

      <div className="rounded-lg border border-border bg-bg-surface p-5">
        <p className="mb-3 text-sm font-medium text-text-secondary">EC-Share Logo</p>
        <div className="flex items-start gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="EC-Share logo" className="h-16 w-16 shrink-0 rounded-md border border-border object-contain" />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-xs text-text-muted">
              none
            </div>
          )}
          <div className="flex-1 space-y-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => { fileInput.current = el }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f) }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary transition-colors hover:border-signal disabled:opacity-60"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? 'Uploading…' : 'Upload logo'}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="signal-cta inline-flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                Save
              </button>
              <button
                type="button"
                onClick={() => setLogoUrl(null)}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text-muted transition-colors hover:text-status-danger"
              >
                <Trash2 size={15} /> Clear
              </button>
            </div>
          </div>
        </div>
        {msg && <p className="mt-3 text-sm text-status-success">{msg}</p>}
        {logoUrl && <p className="mt-3 break-all font-mono text-[11px] text-text-muted">{logoUrl}</p>}
      </div>

      {/* ── Company payment details ── */}
      <div className="rounded-lg border border-border bg-bg-surface p-5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-medium text-text-secondary">Company payment details 公司收款資料</p>
          <button onClick={() => loadPay()} className="inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-signal">
            <RefreshCw size={12} /> Reload
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-text-muted">
          Printed on every quote and receipt PDF. Account name must match your Business Registration exactly.
        </p>
        {payLoading ? (
          <p className="py-4 text-sm text-text-muted"><Loader2 size={14} className="mr-2 inline animate-spin" />Loading…</p>
        ) : (
          <div className="space-y-3">
            {PAY_FIELDS.map((f) => (
              <label key={f.key} className="block space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">{f.label}</span>
                {f.rows ? (
                  <textarea
                    rows={f.rows}
                    value={pay[f.key]}
                    onChange={(e) => setPay((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full resize-none rounded-lg border border-border bg-bg-void px-3 py-2 text-sm text-text-primary focus:border-signal/50 focus:outline-none"
                  />
                ) : (
                  <input
                    value={pay[f.key]}
                    onChange={(e) => setPay((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-bg-void px-3 py-2 text-sm text-text-primary focus:border-signal/50 focus:outline-none"
                  />
                )}
              </label>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={savePay}
                className="signal-cta inline-flex items-center gap-2"
              >
                <CheckCircle2 size={15} /> Save payment details
              </button>
              {payMsg && <p className="text-sm text-status-success">{payMsg}</p>}
            </div>
          </div>
        )}
      </div>

      <button onClick={load} className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-signal">
        <RefreshCw size={14} /> Reload
      </button>
    </div>
  )
}