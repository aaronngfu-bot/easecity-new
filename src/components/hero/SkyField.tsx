'use client'

import { useEffect, useRef } from 'react'

/** Deterministic RNG so the sky digits are stable across resizes/rebuilds. */
function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type P = {
  bx: number; by: number; b0x: number; b0y: number
  x: number; y: number
  fa: number; fs: number; fph: number
  vx: number; vy: number
  ch: string
  bright: number
  phase: number
  speed: number
  white: boolean
}

/**
 * SkyField — an animated field of floating 0/1 digits drawn over the hero
 * city image. Digits drift (sine crawl), repel from the cursor, and a few
 * flip 0<->1 each frame. Colors: brand teal + white (light) mix, read from
 * theme tokens so both modes stay legible. Reduced motion draws one static
 * frame. This is the "living" layer that restores motion on top of the static
 * reference artwork.
 */
export function SkyField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctxEl = canvasEl.getContext('2d')
    if (!ctxEl) return
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = ctxEl

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let teal: [number, number, number] = [0, 143, 130]
    let light: [number, number, number] = [245, 248, 248]

    const mouse = { x: -99999, y: -99999, active: false }

    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let t = 0
    let cell = 7
    let radiusPx = 130
    let sky: P[] = []

    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

    function readTheme() {
      const cs = getComputedStyle(document.documentElement)
      const s = cs.getPropertyValue('--signal').trim()
      const tp = cs.getPropertyValue('--text-primary').trim()
      if (s) teal = hexToRgb(s)
      if (tp) light = hexToRgb(tp)
    }

    const rgba = (c: [number, number, number], a: number) =>
      `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`

    function buildSky() {
      sky = []
      const rand = mulberry32(777)
      const small = W < 640
      const bgCell = small ? 26 : 28
      const cols = Math.ceil(W / bgCell)
      const rows = Math.ceil((H * 0.42) / bgCell) // sky band in the upper ~42%
      let count = 0
      const max = small ? 240 : 560
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (count >= max) break
          const px = cc * bgCell + bgCell / 2
          const py = r * bgCell + bgCell / 2
          const skyBias = 1 - (py / (H * 0.42)) * 0.82
          if (rand() > 0.52 * skyBias) continue
          count++
          const isWhite = rand() < 0.45
          sky.push({
            bx: px, by: py, b0x: px, b0y: py,
            fa: 10 + rand() * 22, fs: 0.1 + rand() * 0.25, fph: rand() * Math.PI * 2,
            vx: 0, vy: 0, x: px, y: py,
            ch: rand() > 0.5 ? '1' : '0',
            bright: isWhite ? 0.5 + rand() * 0.35 : 0.25 + rand() * 0.3,
            phase: rand() * Math.PI * 2,
            speed: 0.5 + rand() * 1.2,
            white: isWhite,
          })
        }
      }
    }

    function resize() {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      W = Math.max(1, rect.width)
      H = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cell = Math.max(4, W * 0.008)
      buildSky()
      if (reduceMotion) drawStatic()
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cell * 0.92}px "JetBrains Mono", "Courier New", monospace`
      for (const p of sky) {
        ctx.fillStyle = rgba(p.white ? light : teal, p.bright)
        ctx.fillText(p.ch, p.x, p.y)
      }
    }

    function step() {
      t += 0.016
      for (const p of sky) {
        p.bx = p.b0x + Math.sin(t * p.fs + p.fph) * p.fa
        p.by = p.b0y + Math.cos(t * p.fs * 0.83 + p.fph * 1.7) * p.fa * 0.75
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        if (mouse.active && dist < radiusPx && dist > 0.01) {
          const force = 1 - dist / radiusPx
          const ang = Math.atan2(dy, dx)
          p.vx += Math.cos(ang) * force * 1.7
          p.vy += Math.sin(ang) * force * 1.7
        }
        p.vx += (p.bx - p.x) * 0.05
        p.vy += (p.by - p.y) * 0.05
        p.vx *= 0.86
        p.vy *= 0.86
        p.x += p.vx
        p.y += p.vy
        if (Math.random() < 0.02) p.ch = p.ch === '1' ? '0' : '1'
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cell * 0.92}px "JetBrains Mono", "Courier New", monospace`
      for (const p of sky) {
        const col = p.white ? light : teal
        const a = Math.min(1, p.bright * (0.55 + Math.sin(t * p.speed + p.phase) * 0.4))
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        const mb = mouse.active && dist < radiusPx ? 1 - dist / radiusPx : 0
        ctx.fillStyle = rgba(col, a + mb * 0.4)
        ctx.fillText(p.ch, p.x, p.y)
      }
    }

    function loop() {
      if (!reduceMotion) {
        step()
        draw()
      }
      raf = requestAnimationFrame(loop)
    }

    function onMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    function onLeave() {
      mouse.active = false
      mouse.x = -99999
      mouse.y = -99999
    }

    readTheme()
    resize()
    raf = requestAnimationFrame(loop)

    window.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    const ro = new ResizeObserver(() => resize())
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    const mo = new MutationObserver(() => {
      readTheme()
      buildSky()
      if (reduceMotion) drawStatic()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}