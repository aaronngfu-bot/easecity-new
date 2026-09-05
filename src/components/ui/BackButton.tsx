'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { copyKey } from '@/i18n/translations'

/**
 * Global "back" affordance for pages not reachable directly from the primary
 * nav. Hidden on the home page and on top-level nav destinations. Sits in flow
 * above the page content, dropped a little below the floating pill nav (mt-20)
 * so the two never read as one crowded strip. Uses history.back() so it
 * returns to wherever the visitor actually came from.
 */
const NAV_ROOTS = new Set(['/', '/ec-share', '/services', '/pricing', '/download'])

export function BackButton() {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()

  if (pathname === '/' || NAV_ROOTS.has(pathname)) return null

  const label = language === 'en' ? 'Back' : '返回'

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
