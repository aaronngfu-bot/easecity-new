'use client'

import { useEffect, useRef } from 'react'
import {
  LIGHT_SOURCES,
  VB_W,
  WATER_H,
  mulberry32,
} from './harbour-scene'

/** Surface chops hug the shore (water canvas sits beneath the SVG skyline). */
const CLIP_TOP = 2

/**
 * HarbourWater — the harbour surface, animated on canvas.
 *
 * Sits behind the skyline SVG and shows through its transparent water region,
 * so the vessels drawn in SVG still float on top. Authored in the scene's
 * viewBox units (x 0…1600, y 0…182 below the waterline) and scaled to fit,
 * which keeps surface chops denser under the skyline at any size.
 */

type Rgb = [number, number, number]

const FALLBACK: Record<string, Rgb> = {
  '--hk-water': [10, 18, 51],
  '--hk-water-deep': [5, 9, 31],
  '--hk-win-cool': [168, 236, 247],
  '--hk-hull-light': [232, 239, 245],
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function hexToRgb(raw: string, fallback: Rgb): Rgb {
  const h = raw.trim().replace('#', '')
  if (h.length === 3) {
    const n = parseInt(h, 16)
    if (Number.isNaN(n)) return fallback
    return [((n >> 8) & 15) * 17, ((n >> 4) & 15) * 17, (n & 15) * 17]
  }
  if (h.length >= 6) {
    const n = parseInt(h.slice(0, 6), 16)
    if (Number.isNaN(n)) return fallback
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  return fallback
}

function readPalette(): Record<string, Rgb> {
  const cs = getComputedStyle(document.documentElement)
  const out: Record<string, Rgb> = {}
  for (const name of Object.keys(FALLBACK)) {
    out[name] = hexToRgb(cs.getPropertyValue(name), FALLBACK[name])
  }
  return out
}

function chopLife(life: number) {
  if (life < 0.08) return life / 0.08
  if (life < 0.14) return 1
  if (life < 0.32) return 1 - (life - 0.14) / 0.18
  return 0
}

/** Short surface chops — denser under the skyline, born / stretch / vanish. */
const RIPPLES = (() => {
  const rand = mulberry32(904411)
  const out: Array<{
    x: number
    y: number
    w: number
    phase: number
    period: number
    spread: number
    amp: number
  }> = []

  for (let i = 0; i < 72; i++) {
    out.push({
      x: rand() * VB_W,
      y: CLIP_TOP + 10 + Math.pow(rand(), 0.72) * WATER_H * 0.68,
      w: 9 + rand() * 20,
      phase: rand(),
      period: 8.2 + rand() * 5.4,
      spread: 1.12 + rand() * 0.38,
      amp: 0.52 + rand() * 0.3,
    })
  }

  for (const s of LIGHT_SOURCES) {
    const n = 3 + Math.round(s.weight * 7)
    for (let i = 0; i < n; i++) {
      const f = Math.pow(rand(), 0.8)
      out.push({
        x: s.x + (rand() - 0.5) * 26,
        y: CLIP_TOP + 8 + f * (42 + s.weight * 86),
        w: 7 + rand() * 18 + s.weight * 6,
        phase: rand(),
        period: 7.6 + rand() * 5.8,
        spread: 1.14 + rand() * 0.4,
        amp: 0.56 + s.weight * 0.26,
      })
    }
  }
  return out
})()

export function HarbourWater({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let pal = readPalette()
    let raf = 0
    let last = 0
    let t = 0
    let visible = false
    let pageVisible = document.visibilityState === 'visible'
    const DT = 0.048

    const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    function resize() {
      const cvs = canvasRef.current
      if (!cvs || !ctx) return
      const rect = cvs.getBoundingClientRect()
      if (rect.width < 1) return
      const mobile = rect.width < 720
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5)
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      // Reassigning width/height clears the canvas and re-lays it out, so skip
      // the no-op case that ResizeObserver otherwise fires on every draw.
      if (cvs.width === w && cvs.height === h) return
      cvs.width = w
      cvs.height = h
      const sx = (rect.width / VB_W) * dpr
      const sy = (rect.height / WATER_H) * dpr
      ctx.setTransform(sx, 0, 0, sy, 0, 0)
      draw()
    }

    function draw() {
      if (!ctx) return
      const deep = pal['--hk-water-deep']
      const surf = pal['--hk-water']
      // Light mode: the canvas owns the entire water→page fade. Its deep stop
      // lands ON --bg-base so the bitmap's bottom edge is the page color —
      // nothing below it can band or cut. (GPU tile seams kept banding the
      // CSS gradient on some displays; canvas rasterization dithers for free
      // behind the animated chops.)
      const lightWater = (surf[0] + surf[1] + surf[2]) / 3 > 90
      let deepStop = deep
      if (lightWater) {
        const baseRaw = getComputedStyle(document.documentElement).getPropertyValue('--bg-base')
        deepStop = hexToRgb(baseRaw, [237, 241, 243])
      }

      ctx.clearRect(0, 0, VB_W, WATER_H)

      const grad = ctx.createLinearGradient(0, 0, 0, WATER_H)
      grad.addColorStop(0, rgba(surf, 1))
      grad.addColorStop(0.55, rgba(surf, 1))
      if (lightWater) {
        // Ease out: hold tone, then relax in widening steps. Mid color =
        // surf mixed ~55% toward the page tone.
        const mid = mixRgb(surf, deepStop, 0.55)
        grad.addColorStop(0.78, rgba(mid, 1))
      }
      grad.addColorStop(1, rgba(deepStop, 1))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, VB_W, WATER_H)

      // Shore shimmer — soft highlight where sky meets water.
      const shore = ctx.createLinearGradient(0, CLIP_TOP, 0, CLIP_TOP + 28)
      shore.addColorStop(0, rgba(pal['--hk-win-cool'], 0.14))
      shore.addColorStop(1, rgba(pal['--hk-win-cool'], 0))
      ctx.fillStyle = shore
      ctx.fillRect(0, CLIP_TOP, VB_W, 28)

      // Harbour chops — cream ticks that appear, stretch, and vanish in place.
      const foam = mixRgb(surf, pal['--hk-hull-light'], lightWater ? 0.78 : 0.64)
      const chopGain = lightWater ? 0.48 : 0.36
      for (const r of RIPPLES) {
        const life = ((t / r.period + r.phase) % 1 + 1) % 1
        const env = chopLife(life)
        if (env <= 0) continue
        const fade = Math.pow(1 - Math.min(1, (r.y - CLIP_TOP) / (WATER_H * 0.85)), 1.15)
        const a = fade * env * r.amp * chopGain
        if (a < 0.028) continue
        const stretch = 0.82 + life * r.spread
        const w = r.w * stretch
        ctx.fillStyle = rgba(foam, a)
        ctx.fillRect(r.x - w / 2, r.y, w, lightWater ? 1.35 : 1.2)
      }
    }

    const shouldRun = () => visible && pageVisible && !reduce

    const loop = (now: number) => {
      raf = 0
      if (!shouldRun()) return
      if (now - last >= 36) {
        last = now
        t += DT
        draw()
      }
      raf = requestAnimationFrame(loop)
    }

    const kick = () => {
      if (shouldRun()) {
        if (!raf) raf = requestAnimationFrame(loop)
        return
      }
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
    }

    resize()
    if (reduce) draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      kick()
    }, { rootMargin: '80px' })
    io.observe(canvas)

    const mo = new MutationObserver(() => {
      pal = readPalette()
      draw()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const onPageVis = () => {
      pageVisible = document.visibilityState === 'visible'
      kick()
    }
    document.addEventListener('visibilitychange', onPageVis)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onPageVis)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
