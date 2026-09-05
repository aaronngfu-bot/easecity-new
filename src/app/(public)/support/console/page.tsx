import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SupportConsole } from '@/components/support/SupportConsole'
import { CANNED_TEMPLATES } from '@/lib/support'

export const metadata: Metadata = {
  title: 'Support Console',
  robots: { index: false, follow: false },
}

export default function SupportConsolePage() {
  // Serializable copy of the canned templates for the client component.
  const templates = CANNED_TEMPLATES.map((t) => ({
    id: t.id,
    label: { en: t.label.en, zh: t.label.zh, 'zh-CN': t.label['zh-CN'] },
    body: { en: t.body.en, zh: t.body.zh, 'zh-CN': t.body['zh-CN'] },
  }))

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm text-text-muted">Loading…</div>}>
        <SupportConsole templates={templates} />
      </Suspense>
    </div>
  )
}
