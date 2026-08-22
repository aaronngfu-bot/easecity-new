'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function BinarySkylinePreview() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <main className="min-h-screen bg-[var(--bg-void)] flex flex-col overflow-hidden items-center justify-center">
      <p className="text-[var(--signal)] font-mono text-sm">BinarySkyline removed</p>
    </main>
  )
}
