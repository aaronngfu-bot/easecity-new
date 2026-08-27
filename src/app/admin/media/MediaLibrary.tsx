'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, RefreshCw, Upload, RotateCcw } from 'lucide-react'

type Slot = {
  id: string
  label: string
  /** Null for a placement that has no photograph yet. */
  fallback: string | null
  usage: string[]
  shape: string
}

type State = {
  slots: Slot[]
  defaults: Record<string, string | null>
  overrides: Record<string, string>
}

/** Chunked so a large file does not blow the argument limit on fromCharCode. */
async function toBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    const end = Math.min(i + chunk, bytes.length)
    for (let j = i; j < end; j++) binary += String.fromCharCode(bytes[j])
  }
  return btoa(binary)
}

export function MediaLibrary() {
  const [state, setState] = useState<State | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/site-images')
      const d = await res.json()
      if (!res.ok || !d.success) throw new Error(d.error?.message || 'Could not load image slots')
      setState(d.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load image slots')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /** Upload, then point the slot at the result. One action, so a successful
   *  upload can never be left unattached to the slot it was chosen for. */
  const replace = async (slot: Slot, file: File) => {
    setBusy(slot.id)
    setError('')
    setSaved(null)
    try {
      const data = await toBase64(file)
      const up = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          data,
          prefix: 'site',
        }),
      })
      const upBody = await up.json()
      if (!up.ok || !upBody.success) throw new Error(upBody.error?.message || 'Upload failed')

      await commit(slot.id, upBody.data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(null)
    }
  }

  const commit = async (id: string, url: string | null) => {
    const res = await fetch('/api/admin/site-images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, url }),
    })
    const body = await res.json()
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Could not save')
    setState(body.data)
    setSaved(id)
  }

  const restore = async (slot: Slot) => {
    setBusy(slot.id)
    setError('')
    setSaved(null)
    try {
      await commit(slot.id, null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-sm text-status-danger">
          {error}
        </p>
      )}

      {!state ? (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={15} className="animate-spin" /> Loading
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {state.slots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              current={state.overrides[slot.id] ?? state.defaults[slot.id] ?? null}
              replaced={!!state.overrides[slot.id]}
              busy={busy === slot.id}
              saved={saved === slot.id}
              onPick={(file) => replace(slot, file)}
              onRestore={() => restore(slot)}
            />
          ))}
        </div>
      )}

      <button
        onClick={load}
        className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-signal"
      >
        <RefreshCw size={14} /> Reload
      </button>
    </div>
  )
}

function SlotCard({
  slot,
  current,
  replaced,
  busy,
  saved,
  onPick,
  onRestore,
}: {
  slot: Slot
  current: string | null
  replaced: boolean
  busy: boolean
  saved: boolean
  onPick: (file: File) => void
  onRestore: () => void
}) {
  const input = useRef<HTMLInputElement | null>(null)

  return (
    <div className="rounded-lg border border-border bg-bg-surface p-5">
      <div className="flex gap-4">
        {current ? (
          /* Native img: these are blob URLs on an admin screen, so there is
             nothing for the image optimiser to do here. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={current}
            alt=""
            className="h-24 w-32 shrink-0 rounded-md border border-border bg-bg-void object-cover"
          />
        ) : (
          <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-bg-void px-2 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            no photo yet
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm font-semibold text-text-primary">{slot.label}</p>
            {replaced && (
              <span className="rounded-sm border border-signal/30 bg-signal/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
                replaced
              </span>
            )}
            {saved && !busy && (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-status-success">
                saved
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-text-muted">{slot.shape}</p>
          <ul className="mt-2 space-y-0.5">
            {slot.usage.map((u) => (
              <li key={u} className="text-xs text-text-secondary">
                {u}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          className="hidden"
          ref={input}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onPick(f)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-bg-elevated px-3 text-sm text-text-primary transition-colors hover:border-signal disabled:opacity-60"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {busy ? 'Uploading' : 'Replace'}
        </button>
        {replaced && (
          <button
            type="button"
            disabled={busy}
            onClick={onRestore}
            className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-text-muted transition-colors hover:text-text-primary disabled:opacity-60"
          >
            <RotateCcw size={15} />
            {/* Slots with no shipped asset have nothing to go back to, so the
                same action reads as clearing rather than reverting. */}
            {slot.fallback ? 'Restore default' : 'Remove'}
          </button>
        )}
      </div>

      <p className="mt-3 break-all font-mono text-[10px] text-text-muted">
        {current ?? 'The page composes this frame from type until a photo is uploaded.'}
      </p>
    </div>
  )
}
