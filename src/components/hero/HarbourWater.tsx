'use client'

import { useEffect, useRef } from 'react'
import {
  CELESTIAL_X,
  LIGHT_SOURCES,
  TONE_VAR,
  VB_H,
  VB_W,
  VESSELS,
  WATER_H,
  mulberry32,
  type Tone,
} from './harbour-scene'

/** Reflections and teal spill hug the shore (water canvas sits beneath the SVG
 *  skyline, so they may slide under building footings without occluding them). */
const CLIP_TOP = 2

/**
 * HarbourWater — the harbour surface, animated on canvas.
 *
 * Sits behind the skyline SVG and shows through its transparent water region,
 * so the vessels drawn in SVG still float on top. Authored in the scene's
 * viewBox units (x 0…1600, y 0…182 below the waterline) and scaled to fit,
 * which keeps every reflection under the light that casts it at any size.
 */

type Rgb = [number, number, number]

const FALLBACK: Record<string, Rgb> = {
  '--hk-water': [10, 18, 51],
  '--hk-water-deep': [5, 9, 31],
  '--hk-win-warm': [255, 209, 102],
  '--hk-win-cool': [168, 236, 247],
  '--hk-win-teal': [0, 229, 204],
  '--hk-accent-pink': [255, 111, 156],
  '--hk-accent-gold': [247, 183, 51],
  '--hk-glint': [245, 196, 81],
  '--hk-ferry': [42, 107, 69],
  '--hk-junk': [30, 21, 18],
  '--hk-hull': [22, 32, 63],
  '--hk-hull-light': [232, 239, 245],
  '--hk-sail': [216, 57, 43],
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

/** Per-source wobble constants, fixed up front so the surface stays coherent. */
const COLUMNS = (() => {
  const rand = mulberry32(60219)
  return LIGHT_SOURCES.map((s) => ({
    x: s.x,
    tone: s.tone as Tone,
    weight: s.weight,
    phase: rand() * Math.PI * 2,
    phase2: rand() * Math.PI * 2,
    speed: 0.55 + rand() * 0.6,
    spread: 0.7 + rand() * 0.7,
    segs: 5 + Math.round(s.weight * 10),
    depth: 28 + s.weight * 140,
  }))
})()

const VESSEL_DASHES = (() => {
  const rand = mulberry32(133707)
  return VESSELS.flatMap((v, vi) =>
    Array.from({ length: 18 }, () => ({
      vi,
      fx: rand(),
      fy: Math.pow(rand(), 1.3),
      w: 0.12 + rand() * 0.3,
      phase: rand() * Math.PI * 2,
      accent: rand() > 0.62,
    })),
  )
})()

const GLINT = (() => {
  const rand = mulberry32(707101)
  return Array.from({ length: 30 }, (_, i) => ({
    f: (i + 0.5) / 30,
    phase: rand() * Math.PI * 2,
    w: 0.45 + rand() * 0.9,
  }))
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
    let visible = true
    const DT = 0.048
    let mapSvgY = (svgY: number) => svgY - WATER_H

    const rgba = (c: Rgb, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    function updateWaterMapping() {
      const cvs = canvasRef.current
      if (!cvs) return
      const scene = cvs.closest('.hk-scene')
      if (!scene) return
      const sceneRect = scene.getBoundingClientRect()
      const canvasRect = cvs.getBoundingClientRect()
      if (sceneRect.height < 1 || canvasRect.height < 1) return
      mapSvgY = (svgY) => {
        const screenY = sceneRect.top + (svgY / VB_H) * sceneRect.height
        return ((screenY - canvasRect.top) / canvasRect.height) * WATER_H
      }
    }

    function resize() {
      const cvs = canvasRef.current
      if (!cvs || !ctx) return
      const rect = cvs.getBoundingClientRect()
      if (rect.width < 1) return
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
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
      updateWaterMapping()
      draw()
    }

    function draw() {
      if (!ctx) return
      updateWaterMapping()
      const deep = pal['--hk-water-deep']
      const surf = pal['--hk-water']

      ctx.clearRect(0, 0, VB_W, WATER_H)

      const grad = ctx.createLinearGradient(0, 0, 0, WATER_H)
      grad.addColorStop(0, rgba(surf, 1))
      grad.addColorStop(0.55, rgba(surf, 1))
      grad.addColorStop(1, rgba(deep, 1))
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, VB_W, WATER_H)

      // Shore shimmer — soft highlight where sky meets water.
      const shore = ctx.createLinearGradient(0, CLIP_TOP, 0, CLIP_TOP + 28)
      shore.addColorStop(0, rgba(pal['--hk-win-cool'], 0.14))
      shore.addColorStop(1, rgba(pal['--hk-win-cool'], 0))
      ctx.fillStyle = shore
      ctx.fillRect(0, CLIP_TOP, VB_W, 28)

      // Reflection columns — softened with a ghost offset for shimmer.
      ctx.globalCompositeOperation = 'lighter'
      for (const c of COLUMNS) {
        const col = pal[TONE_VAR[c.tone]]
        for (let i = 0; i < c.segs; i++) {
          const f = (i + 0.5) / c.segs
          const y = CLIP_TOP + f * c.depth
          const sway =
            Math.sin(t * c.speed + f * 7 + c.phase) * (1.2 + f * 7) * c.spread +
            Math.sin(t * c.speed * 1.7 + f * 11 + c.phase2) * (0.5 + f * 3.5)
          const w = (4 + f * 20) * c.spread
          const flicker = 0.55 + 0.45 * Math.sin(t * 1.6 + c.phase2 + f * 5)
          const a = c.weight * Math.pow(1 - f, 1.55) * flicker * 0.72
          if (a < 0.01) continue
          ctx.fillStyle = rgba(col, a)
          ctx.fillRect(c.x + sway - w / 2, y, w, 1.6 + f * 1.2)
          ctx.fillStyle = rgba(col, a * 0.35)
          ctx.fillRect(c.x + sway * 0.6 + 3 - w * 0.35, y + 1.2, w * 0.55, 1)
        }
      }
      ctx.globalCompositeOperation = 'source-over'

      // Moon or sun glint — tapered path with softer falloff.
      const glint = pal['--hk-glint']
      for (const g of GLINT) {
        const y = Math.max(CLIP_TOP, g.f * WATER_H * 0.92)
        const sway = Math.sin(t * 0.65 + g.f * 6 + g.phase) * (2 + g.f * 22)
        const w = (8 + g.f * 46) * g.w
        const pulse = 0.42 + 0.58 * Math.sin(t * 1.2 + g.phase)
        const a = Math.pow(1 - g.f, 1.35) * pulse * 0.44
        ctx.fillStyle = rgba(glint, a)
        ctx.fillRect(CELESTIAL_X + sway - w / 2, y, w, 1.8 + g.f * 2)
      }

      // Vessel reflections — broken dashes with lateral drift.
      for (const d of VESSEL_DASHES) {
        const v = VESSELS[d.vi]
        const col = pal[d.accent ? v.accent : v.hull]
        const span = v.x1 - v.x0
        const y = mapSvgY(v.contactY + v.reflectionDrop + d.fy * v.depth)
        const sway =
          Math.sin(t * 0.95 + d.fy * 7 + d.phase) * (1.5 + d.fy * 5) +
          Math.sin(t * 1.4 + d.phase) * 0.8
        const w = span * d.w
        const a = Math.pow(1 - d.fy, 1.5) * (0.4 + 0.4 * Math.sin(t * 1.4 + d.phase)) * 0.42
        ctx.fillStyle = rgba(col, a)
        ctx.fillRect(v.x0 + d.fx * (span - w) + sway, y, w, 1.6 + d.fy * 1.6)
      }
    }

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible) return
      if (now - last < 36) return // ~28fps — smooth enough for slow water
      last = now
      t += DT
      draw()
    }

    resize()
    if (!reduce) raf = requestAnimationFrame(loop)

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(canvas)

    const mo = new MutationObserver(() => {
      pal = readPalette()
      draw()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      mo.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
