'use client'

import { useLayoutEffect, useRef } from 'react'

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n))
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function easeOutQuad(t: number) {
  return t * (2 - t)
}

/**
 * Scroll theater. Track is taller than the viewport; the inner panel stays
 * pinned (JS fixed — CSS sticky dies under overflow-x-clip on the public
 * layout) and `--p` (0→1) scrubs child CSS.
 *
 * Do not wrap this in a transformed ancestor: that breaks pinning.
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
      pin.style.setProperty('--p-depth', '0')
      pin.style.setProperty('--p-fade', '0')
      pin.style.setProperty('--p-exit', '0')
      pin.style.setProperty('--p-mask', '0')
      pin.style.position = 'relative'
      pin.style.height = '100svh'
      track.style.height = 'auto'
      return
    }

    let raf = 0
    let lastP = -1
    let lastMode = ''
    let lastScrub = false
    let lastCopyGone = false
    const update = () => {
      raf = 0
      const r = track.getBoundingClientRect()
      const vh = window.innerHeight
      const travel = Math.max(1, r.height - vh)
      let p = 0
      let mode = 'top'
      if (r.top <= 0 && r.bottom > vh) {
        p = Math.min(1, -r.top / travel)
        mode = 'fixed'
      } else if (r.bottom <= vh) {
        p = 1
        mode = 'bottom'
      }
      if (mode !== lastMode) {
        lastMode = mode
        if (mode === 'fixed') {
          pin.style.position = 'fixed'
          pin.style.top = '0'
          pin.style.bottom = 'auto'
        } else if (mode === 'bottom') {
          pin.style.position = 'absolute'
          pin.style.top = 'auto'
          pin.style.bottom = '0'
        } else {
          pin.style.position = 'absolute'
          pin.style.top = '0'
          pin.style.bottom = 'auto'
        }
      }
      const p4 = Number(p.toFixed(4))
      if (p4 === lastP) return
      lastP = p4
      // ease-out on fade/depth so the first scroll reads immediately. The mask
      // stays linear and starts a third of the way in: it drives the water
      // closing over the harbour, and a descent has to be gradual to read as
      // one. Starting it at half meant nothing happened, then everything did.
      const pDepth = easeOutQuad(clamp01((p - 0.1) / 0.9))
      const pFade = easeOutCubic(clamp01(p / 0.75))
      const pExit = clamp01((p - 0.5) / 0.5)
      const pMask = clamp01((p - 0.22) / 0.78)
      pin.style.setProperty('--p', p4.toFixed(4))
      pin.style.setProperty('--p-depth', pDepth.toFixed(4))
      pin.style.setProperty('--p-fade', pFade.toFixed(4))
      pin.style.setProperty('--p-exit', pExit.toFixed(4))
      pin.style.setProperty('--p-mask', pMask.toFixed(4))
      const scrub = p4 > 0.01 && p4 < 0.99
      if (scrub !== lastScrub) {
        lastScrub = scrub
        pin.classList.toggle('is-scrubbing', scrub)
      }
      const copyGone = pFade >= 0.99
      if (copyGone !== lastCopyGone) {
        lastCopyGone = copyGone
        pin.classList.toggle('is-copy-gone', copyGone)
      }
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
        className={`scroll-pin absolute inset-x-0 top-0 z-0 h-[100svh] w-full overflow-x-clip overflow-y-visible ${className ?? ''}`}
        style={{ ['--p' as string]: 0, ['--p-mask' as string]: 0 }}
      >
        {children}
      </div>
    </div>
  )
}
