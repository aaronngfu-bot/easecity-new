'use client'

import { useEffect, useRef } from 'react'

/** Deterministic RNG so the skyline is identical across resizes/rebuilds. */
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

type Kind = 'outline' | 'window' | 'beacon' | 'bg'

type P = {
  kind: Kind
  bx: number; by: number; x: number; y: number
  b0x: number; b0y: number
  fa: number; fs: number; fph: number
  vx: number; vy: number
  ch: string
  role: 0 | 1 | 2 // 0 = dim signal, 1 = bright signal-light, 2 = amber
  bright: number
  phase: number
  speed: number
  ref: boolean // participates in the water reflection
}

/**
 * CityField — a living Hong Kong harbour scene built ENTIRELY from 0/1
 * digits (no dots, no squares, no stars):
 *
 *  - sky: floating digits, denser toward the top
 *  - skyline: digit-outlined towers with varied silhouettes (flat / slant /
 *    dome / tapered crown / setback), amber digit windows, amber '1' beacons
 *  - waterline at ~62% height, then a mirrored reflection of the city in the
 *    water: dimmed, rippled horizontally, fading with depth (Victoria
 *    Harbour at night)
 *
 * Seeded RNG keeps the city stable across resizes. Mouse repels outline/sky
 * digits; windows/beacons stay anchored. Theme-aware (--signal /
 * --signal-light / --amber), DPR-aware, reduced-motion draws one static
 * frame, fully cleaned up on unmount.
 */
export function CityField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctxEl = canvasEl.getContext('2d')
    if (!ctxEl) return
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = ctxEl

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let sigRgb: [number, number, number] = [0, 143, 130]
    let lightRgb: [number, number, number] = [0, 229, 204]
    let amberRgb: [number, number, number] = [242, 181, 68]

    const mouse = { x: -99999, y: -99999, active: false }

    let W = 0
    let H = 0
    let raf = 0
    let t = 0
    let cell = 8
    let radiusPx = 130
    let groundY = 0
    let parts: P[] = []

    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

    function readTheme() {
      const cs = getComputedStyle(document.documentElement)
      const s = cs.getPropertyValue('--signal').trim()
      const sl = cs.getPropertyValue('--signal-light').trim()
      const am = cs.getPropertyValue('--amber').trim()
      if (s) sigRgb = hexToRgb(s)
      if (sl) lightRgb = hexToRgb(sl)
      if (am) amberRgb = hexToRgb(am)
    }

    function push(p: Partial<P> & { kind: Kind; x: number; y: number }) {
      parts.push({
        bx: p.x, by: p.y, b0x: p.x, b0y: p.y,
        fa: 0, fs: 0, fph: 0,
        vx: 0, vy: 0,
        ch: '1', role: 1, bright: 0.9,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.0,
        ref: false,
        ...p,
      })
    }

    function build() {
      parts = []
      const rand = mulberry32(20260821)
      const small = W < 640
      // Denser, larger canvas: more columns/rows than before.
      const COLS = small ? 84 : 150
      const ROWS = small ? 42 : 54
      groundY = H * 0.62
      cell = Math.max(3.5, Math.min((W * 0.97) / COLS, (H * 0.56) / ROWS))
      radiusPx = Math.max(90, cell * 12)
      const x0 = (W - COLS * cell) / 2
      const yOf = (r: number) => groundY - (ROWS - 1 - r) * cell
      const X = (c: number) => x0 + c * cell + cell / 2

      // ── back towers: dim silhouettes for depth ──
      const backCount = small ? 6 : 10
      for (let i = 0; i < backCount; i++) {
        const w = 5 + Math.floor(rand() * 6)
        const c0 = Math.floor(rand() * (COLS - w))
        const h = Math.min(ROWS - 5, 20 + Math.floor(rand() * 26))
        const top = ROWS - 1 - h
        for (let cc = c0; cc < c0 + w; cc++) {
          push({ kind: 'outline', x: X(cc), y: yOf(top), role: 0, bright: 0.24, ch: rand() > 0.5 ? '1' : '0', ref: rand() < 0.5 })
        }
        for (let rr = top; rr < ROWS; rr += 2) {
          push({ kind: 'outline', x: X(c0), y: yOf(rr), role: 0, bright: 0.2, ch: '0', ref: rand() < 0.5 })
          push({ kind: 'outline', x: X(c0 + w - 1), y: yOf(rr), role: 0, bright: 0.2, ch: '1', ref: rand() < 0.5 })
        }
      }

      // ── front buildings: varied silhouettes, all rendered as digits ──
      let c = 1
      while (c < COLS - 4) {
        const w = 4 + Math.floor(rand() * 7)
        if (c + w > COLS - 1) break
        const leftness = c / COLS
        // keep the copy column (left ~45%) calmer: shorter towers there
        const maxH = leftness < 0.45 ? (small ? 18 : 28) : ROWS - 8
        const h = Math.min(ROWS - 6, 10 + Math.floor(rand() * (maxH - 10)))
        const top = ROWS - 1 - h

        // per-column roofline; shapes reshape it away from flat
        const roof: number[] = new Array(w).fill(top)
        const roll = rand()
        if (roll < 0.22 && w >= 5) {
          const depth = 2 + Math.floor(rand() * 3)
          const dir = rand() < 0.5
          for (let i = 0; i < w; i++) {
            const u = dir ? i / (w - 1) : 1 - i / (w - 1)
            roof[i] = top + Math.round(u * depth)
          }
        } else if (roll < 0.4 && w >= 5) {
          const dh = 2 + Math.floor(rand() * 2)
          for (let i = 0; i < w; i++) {
            const u = (2 * i) / (w - 1) - 1
            roof[i] = top + dh - Math.round(dh * Math.sqrt(Math.max(0, 1 - u * u)))
          }
        }

        for (let i = 0; i < w; i++) {
          push({ kind: 'outline', x: X(c + i), y: yOf(roof[i]), role: 1, bright: 0.7 + rand() * 0.3, ch: rand() > 0.45 ? '1' : '0', ref: rand() < 0.7 })
        }
        for (let rr = roof[0]; rr < ROWS; rr++) {
          push({ kind: 'outline', x: X(c), y: yOf(rr), role: 1, bright: 0.65 + rand() * 0.3, ch: '1', ref: rand() < 0.7 })
        }
        for (let rr = roof[w - 1]; rr < ROWS; rr++) {
          push({ kind: 'outline', x: X(c + w - 1), y: yOf(rr), role: 1, bright: 0.65 + rand() * 0.3, ch: '0', ref: rand() < 0.7 })
        }

        let hasCrown = false

        // tapered crown on tall flat towers (IFC-style spire silhouette)
        if (roll >= 0.4 && h > 14 && rand() < 0.5) {
          hasCrown = true
          const th = Math.min(3 + Math.floor(rand() * 3), Math.floor(w / 2) - 1)
          for (let k = 1; k <= th; k++) {
            const rr = top - k
            if (rr < 1) break
            const l = c + k
            const rgt = c + w - 1 - k
            if (rgt - l < 2) {
              push({ kind: 'outline', x: X(l), y: yOf(rr), role: 1, bright: 0.8, ch: '1', ref: true })
              push({ kind: 'beacon', x: X(l), y: yOf(rr) - cell * 0.8, role: 2, bright: 0.9, speed: 1.6 + rand() * 1.2, ref: true })
              break
            }
            push({ kind: 'outline', x: X(l), y: yOf(rr), role: 1, bright: 0.7, ch: '1', ref: true })
            push({ kind: 'outline', x: X(rgt), y: yOf(rr), role: 1, bright: 0.7, ch: '0', ref: true })
          }
        }

        // stepped setback block (classic HK tower massing)
        if (roll >= 0.4 && !hasCrown && rand() < 0.4 && w >= 7) {
          const w2 = w - 4
          const c2 = c + 2
          const h2 = 2 + Math.floor(rand() * 3)
          const t2 = top - h2
          if (t2 >= 1) {
            for (let cc = c2; cc < c2 + w2; cc++) {
              push({ kind: 'outline', x: X(cc), y: yOf(t2), role: 1, bright: 0.75, ch: '1', ref: rand() < 0.7 })
            }
            for (let rr = t2; rr < top; rr++) {
              push({ kind: 'outline', x: X(c2), y: yOf(rr), role: 1, bright: 0.7, ch: '0', ref: rand() < 0.7 })
              push({ kind: 'outline', x: X(c2 + w2 - 1), y: yOf(rr), role: 1, bright: 0.7, ch: '1', ref: rand() < 0.7 })
            }
          }
        }

        // antenna + blinking '1' beacon (skip when a crown tops it)
        if (!hasCrown && h > 14 && rand() < 0.6) {
          const ac = c + Math.floor(w / 2)
          const ah = 2 + Math.floor(rand() * 3)
          const at = top - ah
          if (at >= 1) {
            for (let rr = at; rr < top; rr++) {
              push({ kind: 'outline', x: X(ac), y: yOf(rr), role: 1, bright: 0.55, ch: '1', ref: rand() < 0.7 })
            }
            push({ kind: 'beacon', x: X(ac), y: yOf(at) - cell * 0.6, role: 2, bright: 0.9, speed: 1.6 + rand() * 1.2, ref: true })
          }
        }

        // amber digit windows — follow the roofline
        for (let i = 1; i < w - 1; i++) {
          for (let rr = roof[i] + 2; rr < ROWS - 1; rr += 2) {
            if (rand() < 0.55) {
              push({ kind: 'window', x: X(c + i), y: yOf(rr), role: 2, bright: 0.4 + rand() * 0.5, speed: 0.35 + rand() * 0.7, ch: rand() > 0.5 ? '1' : '0', ref: rand() < 0.5 })
            }
          }
        }

        // tight gaps — towers nearly touch, like a real HK street wall
        c += w + (rand() < 0.25 ? 1 : 0)
      }

      // ── waterline ──
      for (let cc = 0; cc < COLS; cc += 2) {
        push({ kind: 'outline', x: X(cc), y: groundY + cell * 0.4, role: 0, bright: 0.22, ch: '1' })
      }

      // ── sky: floating digits, denser toward the top ──
      const bgCell = small ? 26 : 28
      const cols = Math.ceil(W / bgCell)
      const rows = Math.ceil((H * 0.6) / bgCell)
      let bgCount = 0
      const maxBg = small ? 260 : 560
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (bgCount >= maxBg) break
          const px = cc * bgCell + bgCell / 2
          const py = r * bgCell + bgCell / 2
          const skyBias = 1 - (py / (H * 0.6)) * 0.8
          if (Math.random() > 0.55 * skyBias) continue
          bgCount++
          push({
            kind: 'bg', x: px, y: py,
            fa: 10 + Math.random() * 22,
            fs: 0.1 + Math.random() * 0.25,
            fph: Math.random() * Math.PI * 2,
            role: Math.random() > 0.5 ? 1 : 0,
            bright: 0.25 + Math.random() * 0.4,
            ch: Math.random() > 0.5 ? '1' : '0',
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
      if (reduceMotion) drawStatic()
    }

    function rgbFor(role: 0 | 1 | 2): [number, number, number] {
      return role === 2 ? amberRgb : role === 1 ? lightRgb : sigRgb
    }

    /** One digit, optionally with its water reflection. */
    function drawDigit(p: P, rr: number, gg: number, bb: number, alpha: number, withReflection: boolean) {
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${Math.min(1, alpha)})`
      ctx.fillText(p.ch, p.x, p.y)
      if (!withReflection || !p.ref) return
      const my = 2 * groundY - p.y
      if (my > H) return
      const depth = (my - groundY) / Math.max(1, H - groundY)
      const ra = alpha * 0.42 * (1 - depth * 0.85)
      if (ra < 0.02) return
      const xo = Math.sin(t * 1.3 + my * 0.055) * (1.2 + depth * 3.2)
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${ra})`
      ctx.fillText(p.ch, p.x + xo, my)
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cell * 0.9}px "JetBrains Mono", "Courier New", monospace`
      for (const p of parts) {
        const [rr, gg, bb] = rgbFor(p.role)
        if (p.kind === 'window') {
          drawDigit(p, rr, gg, bb, p.bright * 0.8, true)
        } else if (p.kind === 'beacon') {
          drawDigit(p, rr, gg, bb, 0.9, true)
        } else {
          drawDigit(p, rr, gg, bb, p.bright, p.kind !== 'bg')
        }
      }
    }

    function step() {
      t += 0.016
      const m = mouse
      for (const p of parts) {
        if (p.fa > 0) {
          p.bx = p.b0x + Math.sin(t * p.fs + p.fph) * p.fa
          p.by = p.b0y + Math.cos(t * p.fs * 0.83 + p.fph * 1.7) * p.fa * 0.75
        }
        if (p.kind === 'window' || p.kind === 'beacon') continue // anchored
        const dx = p.x - m.x
        const dy = p.y - m.y
        const dist = Math.hypot(dx, dy)
        if (m.active && dist < radiusPx && dist > 0.01) {
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
        if (p.kind === 'bg' && Math.random() < 0.02) p.ch = p.ch === '1' ? '0' : '1'
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cell * 0.9}px "JetBrains Mono", "Courier New", monospace`
      for (const p of parts) {
        const [rr, gg, bb] = rgbFor(p.role)
        if (p.kind === 'window') {
          // lights breathing: some windows go dark for part of the cycle
          const a = p.bright * Math.max(0.06, 0.15 + 0.85 * Math.sin(t * p.speed + p.phase))
          drawDigit(p, rr, gg, bb, a, true)
        } else if (p.kind === 'beacon') {
          const pulse = 0.5 + 0.5 * Math.sin(t * p.speed + p.phase)
          drawDigit(p, rr, gg, bb, 0.35 + 0.6 * pulse, true)
        } else {
          const a = p.kind === 'bg'
            ? Math.min(1, p.bright * (0.55 + Math.sin(t * p.speed + p.phase) * 0.4))
            : p.bright
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          const mb = mouse.active && dist < radiusPx ? 1 - dist / radiusPx : 0
          const cr = Math.round(rr + mb * 60)
          const cg = Math.round(gg + mb * 60)
          const cb = Math.round(bb + mb * 60)
          drawDigit(p, cr, cg, cb, a + mb * 0.4, p.kind !== 'bg')
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
