'use client'

import { useEffect, useRef } from 'react'

export function GrainField() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const loop = () => {
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12
      el.style.setProperty('--mx', `${currentX}px`)
      el.style.setProperty('--my', `${currentY}px`)
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="fixed inset-0 bg-grain pointer-events-none z-[1] opacity-[0.55]"
      style={{
        maskImage:
          'radial-gradient(circle 260px at var(--mx, 50%) var(--my, 50%), transparent 0%, black 78%)',
        WebkitMaskImage:
          'radial-gradient(circle 260px at var(--mx, 50%) var(--my, 50%), transparent 0%, black 78%)',
        mixBlendMode: 'overlay',
      }}
      aria-hidden="true"
    />
  )
}
