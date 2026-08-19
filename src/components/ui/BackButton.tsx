'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * Global "back" affordance for pages not reachable directly from the primary
 * nav. Hidden on the home page and on top-level nav destinations. Rendered as
 * a bare text link, left-aligned with the page content container (not pinned
 * to the viewport edge). Uses history.back() so it returns to wherever the
 * visitor actually came from.
 */
const NAV_ROOTS = new Set(['/', '/ec-share', '/services', '/pricing', '/download'])

export function BackButton() {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()

  if (pathname === '/' || NAV_ROOTS.has(pathname)) return null

  const label = language === 'zh' ? '返回' : 'Back'

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[90]">
      <div className="container-max">
        <button
          type="button"
          onClick={() => router.back()}
          className="pointer-events-auto inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]"
          aria-label={label}
        >
          <ArrowLeft size={15} />
          {label}
        </button>
      </div>
    </div>
  )
}