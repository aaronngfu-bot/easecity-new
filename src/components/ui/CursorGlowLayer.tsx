'use client'

import { useEffect } from 'react'

/**
 * Delegates pointermove globally and sets --mx / --my CSS variables on
 * the closest `.glass-panel-interactive` ancestor so its refracted-light
 * radial gradient follows the cursor.
 *
 * No per-panel JS — one listener handles the whole page.
 */
export function CursorGlowLayer() {
  useEffect(() => {
    let raf = 0
    let pending: { x: number; y: number; target: HTMLElement } | null = null

    const flush = () => {
      raf = 0
      if (!pending) return
      const { x, y, target } = pending
      const rect = target.getBoundingClientRect()
      const mx = ((x - rect.left) / rect.width) * 100
      const my = ((y - rect.top) / rect.height) * 100
      target.style.setProperty('--mx', `${mx}%`)
      target.style.setProperty('--my', `${my}%`)
      pending = null
    }

    const handle = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(
        '.glass-panel-interactive'
      ) as HTMLElement | null
      if (!el) return
      pending = { x: e.clientX, y: e.clientY, target: el }
      if (!raf) raf = requestAnimationFrame(flush)
    }

    window.addEventListener('pointermove', handle, { passive: true })
    return () => {
      window.removeEventListener('pointermove', handle)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return null
}
