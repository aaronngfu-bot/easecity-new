'use client'

import { useLayoutEffect, useRef } from 'react'

/**
 * Scroll theater. Track is taller than the viewport; the inner panel stays
 * pinned (JS fixed — CSS sticky dies under overflow-x-clip on the public
 * layout) and `--p` (0→1) scrubs child CSS.
 *
 * Do not wrap this in RevealSection: a transformed ancestor breaks pinning.
 */

export function ScrollPin({
  children,
  className,
  trackClassName = 'h-[180vh] md:h-[220vh]',
}: {
  children: React.ReactNode
  className?: string
  trackClassName?: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const track = trackRef.current
    const pin = pinRef.current
    if (!track || !pin) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      pin.style.setProperty('--p', '0')
      pin.style.position = 'relative'
      pin.style.height = '100svh'
      track.style.height = 'auto'
      return
    }

    let raf = 0
    const update = () => {
      raf = 0
      const r = track.getBoundingClientRect()
      const vh = window.innerHeight
      const travel = Math.max(1, r.height - vh)
      let p = 0
      if (r.top <= 0 && r.bottom > vh) {
        p = Math.min(1, -r.top / travel)
        pin.style.position = 'fixed'
        pin.style.top = '0'
        pin.style.bottom = 'auto'
      } else if (r.bottom <= vh) {
        p = 1
        pin.style.position = 'absolute'
        pin.style.top = 'auto'
        pin.style.bottom = '0'
      } else {
        p = 0
        pin.style.position = 'absolute'
        pin.style.top = '0'
        pin.style.bottom = 'auto'
      }
      pin.style.setProperty('--p', p.toFixed(4))
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <div ref={trackRef} className={`relative ${trackClassName}`}>
      <div
        ref={pinRef}
        className={`scroll-pin absolute inset-x-0 top-0 z-0 h-[100svh] w-full overflow-hidden ${className ?? ''}`}
        style={{ ['--p' as string]: 0 }}
      >
        {children}
      </div>
    </div>
  )
}
