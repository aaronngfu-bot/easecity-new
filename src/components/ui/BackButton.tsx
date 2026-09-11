'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * Global "back" affordance for pages not reachable directly from the primary
 * nav. Hidden on the home page and on top-level nav destinations. Uses
 * history.back() so it returns to wherever the visitor actually came from.
 *
 * Narrow-document routes (quote/receipt) align the button with the document
 * column (max-w-2xl + px-4) instead of the site container, so it sits ABOVE
 * the content it belongs to rather than at the far page edge.
 */
const NAV_ROOTS = new Set(['/', '/ec-share', '/services', '/pricing', '/download'])

export function BackButton() {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()

  if (pathname === '/' || NAV_ROOTS.has(pathname)) return null

  const label = language === 'en' ? 'Back' : '返回'
  const base = pathname.split('?')[0]
  const narrow = base.startsWith('/quote') || base.startsWith('/receipt')

  if (narrow) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 pt-24 sm:pt-28">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]"
          aria-label={label}
        >
          <ArrowLeft size={15} />
          {label}
        </button>
      </div>
    )
  }

  return (
    <div className="mt-28">
      <div className="container-max">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]"
          aria-label={label}
        >
          <ArrowLeft size={15} />
          {label}
        </button>
      </div>
    </div>
  )
}
