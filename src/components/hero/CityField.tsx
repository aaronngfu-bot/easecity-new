'use client'

import { useEffect, useRef } from 'react'

/**
 * CityField — 背景星星
 *
 * 星星自然一閃一閃，鼠標經過時產生推動效果。
 */
export function CityField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: -9999, y: -9999, active: false }
    let W = 0, H = 0, raf = 0, t = 0, dpr = 1

    interface Star {
      bx: number; by: number  // base (resting) position
      x: number; y: number    // current position
      vx: number; vy: number  // velocity
      r: number
      base: number
      amp: number
      freq: number
      phase: number
      phase2: number
    }
    let stars: Star[] = []

    function getSignal(): [number, number, number] {
      const s = getComputedStyle(document.documentElement)
      const hex = s.getPropertyValue('--signal').trim() || '#00D4AA'
      const n = parseInt(hex.replace('#', ''), 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

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

    function resize() {
      const cvs = canvasRef.current
      if (!cvs) return
      const c = cvs.getContext('2d')
      if (!c) return
      const parent = cvs.parentElement!
      const rect = parent.getBoundingClientRect()
      W = Math.max(1, rect.width)
      H = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      cvs.width = Math.round(W * dpr)
      cvs.height = Math.round(H * dpr)
      cvs.style.width = `${W}px`
      cvs.style.height = `${H}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      const rng = mulberry32(Math.round(W * 1000 + H))
      const starCount = Math.min(200, Math.round(W * 0.12))
      stars = []
      for (let i = 0; i < starCount; i++) {
        const y = rng() * H
        const sz = rng()
        const size = sz < 0.15 ? 1.2 + rng() * 0.8
                 : sz < 0.35 ? 0.8 + rng() * 0.4
                 : 0.3 + rng() * 0.5
        const px = rng() * W
        stars.push({
          bx: px, by: y,
          x: px, y,
          vx: 0, vy: 0,
          r: size,
          base: 0.1 + rng() * 0.2,
          amp: size > 1.0 ? 0.5 + rng() * 0.4 : 0.3 + rng() * 0.5,
          freq: 0.6 + rng() * 2.5,
          phase: rng() * Math.PI * 2,
          phase2: rng() * Math.PI * 2,
        })
      }
      if (reduce) drawStatic()
    }

    function drawStatic() {
      const c = ctx!
      c.clearRect(0, 0, W, H)
      const sig = getSignal()
      for (const s of stars) {
        c.fillStyle = `rgba(${sig[0]},${sig[1]},${sig[2]},${(s.base + s.amp * 0.3).toFixed(2)})`
        c.beginPath()
        c.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        c.fill()
      }
    }

    function draw() {
      t += 0.016
      const c = ctx!

      // ══ Physics: mouse push + spring back + repel between stars ══

      // Inter-star repulsion prevents clumping
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const a = stars[i], b = stars[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < 20 && d > 0.01) {
            const force = (1 - d / 20) * 0.03
            const nx = (dx / d) * force
            const ny = (dy / d) * force
            a.vx += nx; a.vy += ny
            b.vx -= nx; b.vy -= ny
          }
        }
      }

      for (const s of stars) {
        // Mouse push (repel)
        if (mouse.active) {
          const dx = s.x - mouse.x, dy = s.y - mouse.y
          const d = Math.hypot(dx, dy)
          if (d < 180 && d > 0.01) {
            const force = (1 - d / 180) * 0.6
            s.vx += (dx / d) * force
            s.vy += (dy / d) * force
          }
        }

        // Spring back to base position
        s.vx += (s.bx - s.x) * 0.04
        s.vy += (s.by - s.y) * 0.04

        // Damping
        s.vx *= 0.82
        s.vy *= 0.82

        s.x += s.vx
        s.y += s.vy
      }

      // ══ Render ══
      c.clearRect(0, 0, W, H)
      const sig = getSignal()
      for (const s of stars) {
        const wave = Math.sin(t * s.freq + s.phase) * 0.6
                    + Math.sin(t * s.freq * 2.7 + s.phase2) * 0.25
                    + Math.sin(t * s.freq * 0.4 + s.phase * 1.5) * 0.15
        const brightness = s.base + s.amp * (wave * 0.5 + 0.5)
        const clamped = Math.max(0.01, Math.min(0.9, brightness))
        c.fillStyle = `rgba(${sig[0]},${sig[1]},${sig[2]},${clamped.toFixed(3)})`
        c.beginPath()
        c.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        c.fill()
      }
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999 }

    const loop = () => {
      if (!reduce) draw()
      raf = requestAnimationFrame(loop)
    }

    resize()
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas.parentElement!)
    const mo = new MutationObserver(() => { if (reduce) drawStatic() })
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