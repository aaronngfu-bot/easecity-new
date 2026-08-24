'use client'

import { useEffect, useRef } from 'react'

/**
 * CityField — 背景星星
 *
 * 星星自然一閃一閃，鼠標經過時產生推動效果。
 *
 * The star field shares the hero with the harbour skyline, so it has to read
 * as the same night sky: colours come from the scene's window palette rather
 * than the brand teal alone, brightness falls off toward the horizon where the
 * skyline's sky gradient takes over, and the whole field goes dark in light
 * mode — that scene is daylit and carries a sun instead.
 */

type Rgb = [number, number, number]

/** Warm starlight with a little brand teal mixed through. */
const STAR_TONES: { rgb: Rgb; weight: number }[] = [
  { rgb: [255, 250, 240], weight: 0.56 },
  { rgb: [255, 214, 138], weight: 0.2 },
  { rgb: [186, 226, 255], weight: 0.12 },
  { rgb: [0, 229, 204], weight: 0.12 },
]

function pickTone(r: number): Rgb {
  let acc = 0
  for (const tone of STAR_TONES) {
    acc += tone.weight
    if (r <= acc) return tone.rgb
  }
  return STAR_TONES[0].rgb
}

export function CityField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    const saveData = Boolean(conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g')
    const mouse = { x: -9999, y: -9999, active: false }
    let W = 0, H = 0, raf = 0, t = 0, dpr = 1
    let night = document.documentElement.classList.contains('dark')
    let visible = false
    let pageVisible = document.visibilityState === 'visible'
    let settling = false
    let listening = false

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
      rgb: Rgb
      /** 1 near the top of the hero, 0 at the horizon. */
      alt: number
      sparkle: boolean
    }
    let stars: Star[] = []

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
      const mobile = W < 720
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)
      cvs.width = Math.round(W * dpr)
      cvs.height = Math.round(H * dpr)
      cvs.style.width = `${W}px`
      cvs.style.height = `${H}px`
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      const rng = mulberry32(Math.round(W * 1000 + H))
      const starCount = saveData || reduce
        ? Math.min(56, Math.round(W * 0.05))
        : mobile
          ? Math.min(90, Math.round(W * 0.07))
          : Math.min(140, Math.round(W * 0.1))
      stars = []
      for (let i = 0; i < starCount; i++) {
        const y = rng() * H
        const sz = rng()
        const size = sz < 0.15 ? 1.2 + rng() * 0.8
                 : sz < 0.35 ? 0.8 + rng() * 0.4
                 : 0.3 + rng() * 0.5
        const px = rng() * W
        // Thin the field out toward the horizon, where the skyline's sky
        // gradient thickens and the city glow washes faint stars out.
        const alt = 1 - Math.min(1, Math.max(0, (y / H - 0.4) / 0.48))
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
          rgb: pickTone(rng()),
          alt,
          sparkle: size > 1.5 && rng() > 0.55,
        })
      }
      if (reduce) drawStatic()
    }

    function paint(s: Star, alpha: number) {
      const c = ctx!
      const a = alpha * s.alt
      if (a < 0.012) return
      const [r, g, b] = s.rgb
      c.fillStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`
      c.beginPath()
      c.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      c.fill()

      if (s.sparkle) {
        const len = s.r * 4.5
        c.strokeStyle = `rgba(${r},${g},${b},${(a * 0.45).toFixed(3)})`
        c.lineWidth = 0.7
        c.beginPath()
        c.moveTo(s.x - len, s.y)
        c.lineTo(s.x + len, s.y)
        c.moveTo(s.x, s.y - len)
        c.lineTo(s.x, s.y + len)
        c.stroke()
      }
    }

    function drawStatic() {
      const c = ctx!
      c.clearRect(0, 0, W, H)
      if (!night) return
      for (const s of stars) paint(s, s.base + s.amp * 0.3)
    }

    function draw() {
      const c = ctx!
      if (!night) {
        c.clearRect(0, 0, W, H)
        return
      }
      t += 0.016

      // Physics only while the pointer is in the field — the n² repulsion
      // is a mouse-interaction aid, not a resting-state cost.
      if (mouse.active) {
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
      }

      const interact = mouse.active
      if (interact) settling = true
      if (interact || settling) {
        let energy = 0
        for (const s of stars) {
          if (interact) {
            const dx = s.x - mouse.x, dy = s.y - mouse.y
            const d = Math.hypot(dx, dy)
            if (d < 180 && d > 0.01) {
              const force = (1 - d / 180) * 0.6
              s.vx += (dx / d) * force
              s.vy += (dy / d) * force
            }
          }

          s.vx += (s.bx - s.x) * 0.04
          s.vy += (s.by - s.y) * 0.04
          s.vx *= 0.82
          s.vy *= 0.82
          s.x += s.vx
          s.y += s.vy
          energy += Math.abs(s.vx) + Math.abs(s.vy)
        }
        if (!interact && energy < 0.02) settling = false
      }

      // ══ Render ══
      c.clearRect(0, 0, W, H)
      for (const s of stars) {
        const wave = Math.sin(t * s.freq + s.phase) * 0.6
                    + Math.sin(t * s.freq * 2.7 + s.phase2) * 0.25
                    + Math.sin(t * s.freq * 0.4 + s.phase * 1.5) * 0.15
        const brightness = s.base + s.amp * (wave * 0.5 + 0.5)
        paint(s, Math.max(0.01, Math.min(0.9, brightness)))
      }
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        mouse.active = false
        mouse.x = -9999
        mouse.y = -9999
        return
      }
      mouse.x = x
      mouse.y = y
      mouse.active = true
    }

    const shouldRun = () => visible && pageVisible && night && !reduce && !saveData

    const setListening = (on: boolean) => {
      if (on === listening) return
      listening = on
      if (on) window.addEventListener('mousemove', onMove, { passive: true })
      else {
        window.removeEventListener('mousemove', onMove)
        mouse.active = false
        mouse.x = -9999
        mouse.y = -9999
      }
    }

    const loop = () => {
      raf = 0
      if (!shouldRun()) return
      draw()
      raf = requestAnimationFrame(loop)
    }

    const kick = () => {
      if (shouldRun()) {
        setListening(true)
        if (!raf) raf = requestAnimationFrame(loop)
        return
      }
      setListening(false)
      if (raf) {
        cancelAnimationFrame(raf)
        raf = 0
      }
      if (!night) ctx.clearRect(0, 0, W, H)
      else if (reduce || saveData) drawStatic()
    }

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas.parentElement!)
    const mo = new MutationObserver(() => {
      night = document.documentElement.classList.contains('dark')
      kick()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      kick()
    }, { rootMargin: '80px' })
    io.observe(canvas)
    const onPageVis = () => {
      pageVisible = document.visibilityState === 'visible'
      kick()
    }
    document.addEventListener('visibilitychange', onPageVis)

    return () => {
      cancelAnimationFrame(raf)
      setListening(false)
      document.removeEventListener('visibilitychange', onPageVis)
      ro.disconnect()
      mo.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}