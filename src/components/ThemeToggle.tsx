'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

/**
 * Theme toggle with a circular "wipe" reveal using the View Transitions API.
 * On click, a circle grows outward from the toggle button's position, revealing
 * the new theme underneath. Falls back to a plain instant switch in browsers
 * without View Transitions (`document.startViewTransition) support — or when
 * the user prefers reduced motion — so it never blocks the toggle.
 */
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  const toggle = () => {
    const next = isDark ? 'light' : 'dark'
    const el = btnRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Bail to a plain switch when transitions aren't available or user prefers
    // reduced motion.
    if (!(document as Document & { startViewTransition?: unknown }).startViewTransition || reduce) {
      setTheme(next)
      return
    }

    const r = el?.getBoundingClientRect()
    if (!r) {
      setTheme(next)
      return
    }
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

    // Set the reveal origin BEFORE the transition starts so the CSS
    // (::view-transition-new(root) + theme-circle-reveal) reads the correct
    // --vt-x/--vt-y/--vt-r on the very first frame — otherwise the circle
    // grows from the origin (top-left) instead of the toggle button.
    const root = document.documentElement
    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)
    root.style.setProperty('--vt-r', `${radius}px`)

    const transition = (document as Document & {
      startViewTransition: (cb: () => void) => { ready: Promise<void> }
    }).startViewTransition(() => {
      setTheme(next)
    })

    void transition.ready
  }

  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode'

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