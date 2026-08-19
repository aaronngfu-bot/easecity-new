'use client'

import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * Global "back" affordance for pages not reachable directly from the primary
 * nav. Hidden on the home page and on top-level nav destinations (the nav bar
 * already provides navigation there). Uses history.back() so it returns to
 * wherever the visitor actually came from.
 */
const NAV_ROOTS = new Set(['/', '/ec-share', '/services', '/pricing', '/download'])

export function BackButton() {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()

  if (pathname === '/' || NAV_ROOTS.has(pathname)) return null

  const label = language === 'zh' ? '返回' : 'Back'

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="fixed left-4 top-24 z-[90] inline-flex items-center gap-1.5 rounded-full border border-[var(--border-color)] bg-[var(--nav-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-md)] backdrop-blur-md transition-colors hover:border-[var(--signal)] hover:text-[var(--signal)] md:left-6"
      aria-label={label}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  )
}