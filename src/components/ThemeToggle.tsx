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
    const startVT = (document as Document).startViewTransition

    // Bail to a plain switch when transitions aren't available or reduced motion.
    if (typeof startVT !== 'function' || reduce) {
      setTheme(next)
      return
    }

    const r = el?.getBoundingClientRect()
    if (!r) {
      setTheme(next)
      return
    }
    // Button center in viewport coordinates (== the view-transition root box origin).
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    // Full-viewport diagonal radius — always covers every corner (incl. the
    // button's own corner), so the reveal never stops short of the full page.
    const radius = Math.hypot(window.innerWidth, window.innerHeight)

    const sameSize = () => setTheme(next)

    const transition = (document as Document & {
      startViewTransition: (cb: () => void) => { ready: Promise<void> }
    }).startViewTransition(sameSize)

    // Drive the circle reveal with the Web Animations API directly on the
    // ::view-transition-new(root) pseudo-element. Anchoring at the button center
    // (cx, cy) is precise and works reliably across View Transition-aware
    // browsers — unlike relying on CSS vars read at an indeterminate frame.
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${cx}px ${cy}px)`,
            `circle(${radius}px at ${cx}px ${cy}px)`,
          ],
        },
        {
          duration: 800,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'forwards',
          pseudoElement: '::view-transition-new(root)',
        }
      )
    })
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