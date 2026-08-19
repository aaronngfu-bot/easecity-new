'use client'

import { useEffect, useRef } from 'react'

/**
 * BinaryField — an interactive "matrix" hero visual. A field of 0/1 glyph
 * particles forms the "EC" brand mark (brighter, denser at the center) over a
 * sparse grid of dim background glyphs. Moving the mouse pushes nearby
 * particles away; they spring back, brighten and scale up while repelled.
 * Theme-aware (reads --signal / --signal-light), reduced-motion aware,
 * DPR-aware, and fully cleaned up on unmount.
 */
export function BinaryField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctxEl = canvasEl.getContext('2d')
    if (!ctxEl) return
    // Non-null aliases so TS keeps the narrowed types inside closures below.
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = ctxEl

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let signal = '#008f82'
    let signalLight = '#00e5cc'
    let signalRgb: [number, number, number] = [0, 159, 130]
    let lightRgb: [number, number, number] = [0, 229, 204]

    const mouse = { x: -99999, y: -99999, active: false }

    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let t = 0
    let maskW = 0
    let maskH = 0
    type P = {
      bx: number; by: number; x: number; y: number
      vx: number; vy: number
      char: string
      core: boolean
      bright: number
      phase: number
      speed: number
    }
    let particles: P[] = []
    let mask: Uint8ClampedArray | null = null

    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

    function readTheme() {
      const cs = getComputedStyle(document.documentElement)
      const s = cs.getPropertyValue('--signal').trim()
      const sl = cs.getPropertyValue('--signal-light').trim()
      if (s) signal = s
      if (sl) signalLight = sl
      signalRgb = hexToRgb(signal || '#008f82')
      lightRgb = hexToRgb(signalLight || '#00e5cc')
    }

    function buildMask(cw: number, ch: number) {
      const off = document.createElement('canvas')
      off.width = cw
      off.height = ch
      const o = off.getContext('2d')
      if (!o) return
      o.clearRect(0, 0, cw, ch)

      // EC mark as pure geometry (no font dependency). Layout is verified:
      // E (vertical + 3 bars) on the left, solid C (annulus open right) on the
      // right, clearly separated.
      const mn = Math.min(cw, ch)
      const u = Math.max(14, mn * 0.05)
      const hh = mn * 0.3
      const ew = mn * 0.2
      const gap = mn * 0.06
      const cy = ch / 2
      const total = ew + gap + 2 * hh
      const x0 = (cw - total) / 2
      const eLeft = x0
      const cCx = x0 + ew + gap + hh

      o.strokeStyle = '#fff'
      o.fillStyle = '#fff'
      o.lineWidth = u
      o.lineCap = 'round'
      o.lineJoin = 'round'

      // E
      o.beginPath()
      o.moveTo(eLeft, cy - hh)
      o.lineTo(eLeft, cy + hh)
      o.moveTo(eLeft, cy - hh)
      o.lineTo(eLeft + ew, cy - hh)
      o.moveTo(eLeft, cy)
      o.lineTo(eLeft + ew, cy)
      o.moveTo(eLeft, cy + hh)
      o.lineTo(eLeft + ew, cy + hh)
      o.stroke()

      // C — solid annular sector open to the right (gap on the right, arc
      // wraps the left through π)
      const rOut = hh
      const rIn = rOut - u * 0.9
      const a0 = (115 * Math.PI) / 180
      const a1 = (245 * Math.PI) / 180
      const steps = 120
      o.beginPath()
      for (let i = 0; i <= steps; i++) {
        const ang = a0 + ((a1 - a0) * i) / steps
        const px = cCx + rOut * Math.cos(ang)
        const py = cy + rOut * Math.sin(ang)
        if (i === 0) o.moveTo(px, py)
        else o.lineTo(px, py)
      }
      for (let i = steps; i >= 0; i--) {
        const ang = a0 + ((a1 - a0) * i) / steps
        const px = cCx + rIn * Math.cos(ang)
        const py = cy + rIn * Math.sin(ang)
        o.lineTo(px, py)
      }
      o.closePath()
      o.fill()

      mask = o.getImageData(0, 0, cw, ch).data
      maskW = cw
      maskH = ch
    }

    const CELL = 11

    function rebuild() {
      if (!mask) return
      const cols = Math.ceil(W / CELL)
      const rows = Math.ceil(H / CELL)
      particles = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL + CELL / 2
          const y = r * CELL + CELL / 2
          // sample the mask using ITS OWN integer dims (maskW/maskH), not the
          // float W/H — a .5 rounding mismatch here scrambled the EC glyph
          const ix = Math.min(Math.floor(x), maskW - 1)
          const iy = Math.min(Math.floor(y), maskH - 1)
          const idx = (iy * maskW + ix) * 4
          const alpha = mask[idx + 3] ?? 0
          const isCore = alpha > 100
          const isBg = !isCore && Math.random() < 0.12
          if (!isCore && !isBg) continue
          particles.push({
            bx: x, by: y, x, y, vx: 0, vy: 0,
            char: Math.random() > 0.5 ? '1' : '0',
            core: isCore,
            bright: isCore ? 0.8 + Math.random() * 0.2 : 0.18 + Math.random() * 0.14,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 1.6,
          })
        }
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      ctx.font = `${CELL * 0.92}px "JetBrains Mono", "Courier New", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particles) {
        const base = p.core ? lightRgb : signalRgb
        ctx.fillStyle = `rgba(${base[0]},${base[1]},${base[2]},${p.bright})`
        ctx.fillText(p.char, p.x, p.y)
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
      buildMask(Math.round(W), Math.round(H))
      rebuild()
      if (reduceMotion) drawStatic()
    }

    const RADIUS = 130

    function step() {
      t += 0.016
      const m = mouse
      for (const p of particles) {
        const dx = p.x - m.x
        const dy = p.y - m.y
        const dist = Math.hypot(dx, dy)
        if (m.active && dist < RADIUS && dist > 0.01) {
          const force = 1 - dist / RADIUS
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
        if (Math.random() < 0.02) p.char = p.char === '1' ? '0' : '1'
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.font = `${CELL * 0.92}px "JetBrains Mono", "Courier New", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particles) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        const boost = mouse.active && dist < RADIUS ? 1 - dist / RADIUS : 0
        // Core (EC glyph) particles stay bright and steady so the logo is
        // always legible; background particles flicker for the matrix feel.
        const flicker = p.core
          ? 0.9 + Math.sin(t * p.speed + p.phase) * 0.1
          : 0.55 + Math.sin(t * p.speed + p.phase) * 0.4
        const a = Math.min(1, p.bright * flicker + boost * 0.7)
        const base = p.core ? lightRgb : signalRgb
        const rr = Math.round(base[0] + boost * 60)
        const gg = Math.round(base[1] + boost * 60)
        const bb = Math.round(base[2] + boost * 60)
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${a})`
        const sc = 1 + boost * 0.6
        if (sc !== 1) {
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.scale(sc, sc)
          ctx.fillText(p.char, 0, 0)
          ctx.restore()
        } else {
          ctx.fillText(p.char, p.x, p.y)
        }
        // subtle glow pass for core glyph particles
        if (p.core && boost < 0.05) {
          ctx.save()
          ctx.globalAlpha = a * 0.35
          ctx.fillText(p.char, p.x, p.y)
          ctx.restore()
        }
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
      if (reduceMotion) drawStatic()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    let fontsReady = false
    const onFonts = () => {
      if (fontsReady) return
      fontsReady = true
      resize()
    }
    if (document.fonts?.ready) document.fonts.ready.then(onFonts)

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