'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ThemeToggleProps {
  className?: string
}

/**
 * Theme toggle with a circular "wipe" reveal using the View Transitions API.
 *
 * On click we write the button center into `--wc-x` / `--wc-y` CSS variables
 * on the document element, then start a view transition. The wipe itself is
 * driven entirely by a CSS @keyframes (see `theme-wipe`) on
 * `::view-transition-new(root)` — no WAAPI pseudo-element animation, which is
 * unreliable across browsers. Falls back to an instant switch when View
 * Transitions or reduced motion isn't available.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    const el = btnRef.current
    const root = document.documentElement

    // Remember the wipe origin (button center) in CSS space for the theme-wipe keyframes.
    if (el) {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      root.style.setProperty('--wc-x', `${cx.toFixed(1)}px`)
      root.style.setProperty('--wc-y', `${cy.toFixed(1)}px`)
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const doc = document as Document & {
      startViewTransition: (cb: () => void) => { ready: Promise<void> }
    }

    if (typeof doc.startViewTransition !== 'function' || reduce) {
      setTheme(next)
      return
    }

    // Call on `document` directly — destructuring startViewTransition off the
    // object loses `this`, which throws TypeError: Illegal invocation.
    doc.startViewTransition(() => setTheme(next))
  }

  const label = isDark ? t.footer.themeLight : t.footer.themeDark

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      suppressHydrationWarning
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-signal/30 bg-signal/10 text-signal transition-colors hover:border-signal/60 hover:bg-signal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50 ${className}`}
    >
      {mounted ? (
        isDark ? <Sun size={16} /> : <Moon size={16} />
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  )
}