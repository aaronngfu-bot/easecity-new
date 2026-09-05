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

type Overrides = { en: Record<string, string>; zh: Record<string, string> }

type State = {
  slots: Slot[]
  defaults: Record<string, string | null>
  overrides: Overrides
}

type Lang = 'en' | 'zh'

const LANG_LABEL: Record<Lang, string> = { en: 'English', zh: '繁體中文' }
/** Column order on the card: the site's default language first. */
const LANGS: readonly Lang[] = ['en', 'zh']

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

  /** Upload, then point the slot's language column at the result. One action,
   *  so a successful upload can never be left unattached to its slot. */
  const replace = async (slot: Slot, lang: Lang, file: File) => {
    setBusy(`${slot.id}:${lang}`)
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

      await commit(slot.id, lang, upBody.data.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setBusy(null)
    }
  }

  const commit = async (id: string, lang: Lang, url: string | null) => {
    const res = await fetch('/api/admin/site-images', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, lang, url }),
    })
    const body = await res.json()
    if (!res.ok || !body.success) throw new Error(body.error?.message || 'Could not save')
    setState(body.data)
    setSaved(`${id}:${lang}`)
  }

  const restore = async (slot: Slot, lang: Lang) => {
    setBusy(`${slot.id}:${lang}`)
    setError('')
    setSaved(null)
    try {
      await commit(slot.id, lang, null)
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
              defaults={state.defaults}
              overrides={state.overrides}
              busy={busy}
              saved={saved}
              onPick={(lang, file) => replace(slot, lang, file)}
              onRestore={(lang) => restore(slot, lang)}
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
  defaults,
  overrides,
  busy,
  saved,
  onPick,
  onRestore,
}: {
  slot: Slot
  defaults: Record<string, string | null>
  overrides: Overrides
  busy: string | null
  saved: string | null
  onPick: (lang: Lang, file: File) => void
  onRestore: (lang: Lang) => void
}) {
  const inputs = useRef<Record<Lang, HTMLInputElement | null>>({ en: null, zh: null })

  /** What each column shows now: its override, else the other language's
   *  override (the public pages fall back across languages), else the shipped
   *  asset. Mirrors getSiteImages' chain so the admin screen never lies. */
  const effective = (lang: Lang): string | null =>
    overrides[lang][slot.id] ?? overrides[lang === 'en' ? 'zh' : 'en'][slot.id] ?? defaults[slot.id] ?? null
  const ownOverride = (lang: Lang): string | null => overrides[lang][slot.id] ?? null

  return (
    <div className="rounded-lg border border-border bg-bg-surface p-5">
      <div className="flex items-center gap-2">
        <p className="font-display text-sm font-semibold text-text-primary">{slot.label}</p>
        {LANGS.some((l) => ownOverride(l)) && (
          <span className="rounded-sm border border-signal/30 bg-signal/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-signal">
            replaced
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {LANGS.map((lang) => {
          const current = effective(lang)
          const own = ownOverride(lang)
          const isBusy = busy === `${slot.id}:${lang}`
          const isSaved = saved === `${slot.id}:${lang}`
          const otherOwn = ownOverride(lang === 'en' ? 'zh' : 'en')
          return (
            <div key={lang} className="rounded-md border border-border bg-bg-void/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  {LANG_LABEL[lang]}
                </span>
                {isSaved && !isBusy && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-status-success">
                    saved
                  </span>
                )}
              </div>

              <div className="mt-2 flex gap-3">
                {current ? (
                  /* Native img: these are blob URLs on an admin screen, so there
                     is nothing for the image optimiser to do here. */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={current}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded border border-border bg-bg-surface object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded border border-dashed border-border bg-bg-surface px-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-text-muted">
                    none
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {!own && otherOwn && current && (
                    <p className="text-[10px] leading-snug text-text-muted">
                      Falling back to the {LANG_LABEL[lang === 'en' ? 'zh' : 'en']} image
                    </p>
                  )}
                  {!current && (
                    <p className="text-[10px] leading-snug text-text-muted">
                      The page composes this frame from type.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                  className="hidden"
                  ref={(el) => {
                    inputs.current[lang] = el
                  }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onPick(lang, f)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => inputs.current[lang]?.click()}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-bg-elevated px-2.5 text-xs text-text-primary transition-colors hover:border-signal disabled:opacity-60"
                >
                  {isBusy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {isBusy ? 'Uploading' : own ? 'Replace' : 'Upload'}
                </button>
                {own && (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => onRestore(lang)}
                    className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-text-muted transition-colors hover:text-text-primary disabled:opacity-60"
                  >
                    <RotateCcw size={13} />
                    Remove
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
