'use client'

import { useRef, useState } from 'react'

/**
 * "Return your signed PDF" uploader on the customer quote page — for the
 * print-and-sign path: client prints the attached PDF, signs on paper, scans
 * it back. Uploads to the tokened API which stores it on Vercel Blob.
 */
export function SignedPdfUpload({
  quoteId,
  token,
  labels,
}: {
  quoteId: string
  token: string
  labels: { title: string; hint: string; choose: string; uploading: string; done: string; error: string }
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [fileName, setFileName] = useState<string | null>(null)
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const upload = async (file: File) => {
    setState('uploading')
    setErrMsg(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/quote/${quoteId}/signed-pdf?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        body: form,
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok || !d.success) throw new Error(d.error || labels.error)
      setFileName(file.name)
      setState('done')
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : labels.error)
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-lg border border-status-success/30 bg-status-success/10 px-4 py-3 text-sm text-status-success" role="status">
        {labels.done}
        {fileName && <span className="ml-1 opacity-70">({fileName})</span>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text-primary">{labels.title}</p>
      <p className="text-xs leading-relaxed text-text-muted">{labels.hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) void upload(f)
        }}
      />
      <button
        type="button"
        disabled={state === 'uploading'}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-lg border border-signal/40 bg-signal/10 px-5 py-2.5 text-sm font-medium text-signal transition-colors hover:bg-signal/20 disabled:opacity-50"
      >
        {state === 'uploading' ? labels.uploading : labels.choose}
      </button>
      {state === 'error' && errMsg && (
        <p className="text-xs text-status-danger" role="alert">{errMsg}</p>
      )}
    </div>
  )
}
