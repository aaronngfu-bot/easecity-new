'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { copyKey } from '@/i18n/translations'

/**
 * Global "back" affordance for pages not reachable directly from the primary
 * nav. Hidden on the home page and on top-level nav destinations. The button
 * sits at the END of the page content (BackButton), and a matching spacer
 * (BackButtonSpacer) reserves the same top clearance the button used to occupy,
 * so the floating pill nav never overlaps the first element of the page.
 * Uses history.back() so it returns to wherever the visitor actually came from.
 */
const NAV_ROOTS = new Set(['/', '/ec-share', '/services', '/pricing', '/download'])

function useShowBack(): boolean {
  const pathname = usePathname()
  return pathname !== '/' && !NAV_ROOTS.has(pathname)
}

/** Top clearance matching the old in-flow BackButton height (mt-12 + button). */
export function BackButtonSpacer() {
  const show = useShowBack()
  if (!show) return null
  return <div aria-hidden className="h-[68px]" />
}

export function BackButton() {
  const show = useShowBack()
  const router = useRouter()
  const { language } = useLanguage()

  if (!show) return null

  const label = language === 'en' ? 'Back' : '返回'

  return (
    <div className="mt-12">
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
