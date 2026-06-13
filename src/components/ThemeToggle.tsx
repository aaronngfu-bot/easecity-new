'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === 'dark'

  const toggle = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? '切換至淺色模式' : '切換至深色模式'}
      title={isDark ? '切換至淺色模式' : '切換至深色模式'}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-signal/30 bg-signal/10 text-signal transition-colors hover:border-signal/60 hover:bg-signal/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/50 ${className}`}
    >
      {/* 未掛載前先佔位,避免 hydration mismatch */}
      {mounted ? (
        isDark ? <Sun size={16} /> : <Moon size={16} />
      ) : (
        <span className="h-4 w-4" />
      )}
    </button>
  )
}
