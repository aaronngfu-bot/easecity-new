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
  size: number
}

/**
 * CityField — a living city skyline built from binary particles.
 *
 * The skyline is generated procedurally on a column grid (seeded, so stable):
 * dim back towers for depth, bright digit-outlined front buildings whose
 * height is biased lower under the copy column, warm amber windows that
 * flicker like real lights, blinking beacons on antennas, a ground line, and
 * a sparse field of floating digits in the sky. Mouse repels outline/sky
 * particles; windows and beacons stay anchored to their buildings.
 *
 * Theme-aware (--signal / --signal-light / --amber), DPR-aware, honors
 * prefers-reduced-motion with a static frame, fully cleaned up on unmount.
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
        size: 1,
        ...p,
      })
    }

    function build() {
      parts = []
      const rand = mulberry32(20260820)
      const small = W < 640
      // Dense, tall, narrow towers — a Hong Kong skyline, not a suburb.
      const COLS = small ? 76 : 132
      const ROWS = small ? 40 : 50
      cell = Math.max(4, Math.min((W * 0.96) / COLS, (H * 0.55) / ROWS))
      radiusPx = Math.max(90, cell * 12)
      const x0 = (W - COLS * cell) / 2
      const ground = H - Math.max(12, H * 0.045)
      const yOf = (r: number) => ground - (ROWS - 1 - r) * cell
      const X = (c: number) => x0 + c * cell + cell / 2

      // ── back towers: dim silhouettes for depth ──
      const backCount = small ? 5 : 9
      for (let i = 0; i < backCount; i++) {
        const w = 5 + Math.floor(rand() * 6)
        const c0 = Math.floor(rand() * (COLS - w))
        const h = Math.min(ROWS - 5, 20 + Math.floor(rand() * 24))
        const top = ROWS - 1 - h
        for (let cc = c0; cc < c0 + w; cc++) {
          push({ kind: 'outline', x: X(cc), y: yOf(top), role: 0, bright: 0.26, ch: rand() > 0.5 ? '1' : '0' })
        }
        for (let rr = top; rr < ROWS; rr += 2) {
          push({ kind: 'outline', x: X(c0), y: yOf(rr), role: 0, bright: 0.22, ch: '0' })
          push({ kind: 'outline', x: X(c0 + w - 1), y: yOf(rr), role: 0, bright: 0.22, ch: '1' })
        }
      }

      // ── front buildings: bright digit outlines + amber windows ──
      let c = 1
      while (c < COLS - 4) {
        const w = 4 + Math.floor(rand() * 7)
        if (c + w > COLS - 1) break
        const leftness = c / COLS
        // keep the copy column (left ~45%) calmer: shorter towers there
        const maxH = leftness < 0.45 ? (small ? 18 : 26) : ROWS - 8
        const h = Math.min(ROWS - 6, 10 + Math.floor(rand() * (maxH - 10)))
        const top = ROWS - 1 - h

        for (let cc = c; cc < c + w; cc++) {
          push({ kind: 'outline', x: X(cc), y: yOf(top), role: 1, bright: 0.7 + rand() * 0.3, ch: rand() > 0.45 ? '1' : '0' })
        }
        for (let rr = top; rr < ROWS; rr++) {
          push({ kind: 'outline', x: X(c), y: yOf(rr), role: 1, bright: 0.65 + rand() * 0.3, ch: '1' })
          push({ kind: 'outline', x: X(c + w - 1), y: yOf(rr), role: 1, bright: 0.65 + rand() * 0.3, ch: '0' })
        }

        // stepped penthouse block
        if (rand() < 0.35 && w >= 7) {
          const w2 = w - 4
          const c2 = c + 2
          const h2 = 2 + Math.floor(rand() * 3)
          const t2 = top - h2
          if (t2 >= 1) {
            for (let cc = c2; cc < c2 + w2; cc++) {
              push({ kind: 'outline', x: X(cc), y: yOf(t2), role: 1, bright: 0.75, ch: '1' })
            }
            for (let rr = t2; rr < top; rr++) {
              push({ kind: 'outline', x: X(c2), y: yOf(rr), role: 1, bright: 0.7, ch: '0' })
              push({ kind: 'outline', x: X(c2 + w2 - 1), y: yOf(rr), role: 1, bright: 0.7, ch: '1' })
            }
          }
        }

        // antenna + blinking beacon
        if (h > 14 && rand() < 0.6) {
          const ac = c + Math.floor(w / 2)
          const ah = 2 + Math.floor(rand() * 3)
          const at = top - ah
          if (at >= 1) {
            for (let rr = at; rr < top; rr++) {
              push({ kind: 'outline', x: X(ac), y: yOf(rr), role: 1, bright: 0.55, ch: '1' })
            }
            push({ kind: 'beacon', x: X(ac), y: yOf(at) - cell * 0.6, role: 2, bright: 0.9, speed: 1.6 + rand() * 1.2 })
          }
        }

        // amber windows — dense grid inside the tower (HK towers glow)
        for (let rr = top + 2; rr < ROWS - 1; rr += 2) {
          for (let cc = c + 1; cc <= c + w - 2; cc += 2) {
            if (rand() < 0.58) {
              push({ kind: 'window', x: X(cc), y: yOf(rr), role: 2, bright: 0.45 + rand() * 0.5, speed: 0.35 + rand() * 0.7 })
            }
          }
        }

        // tight gaps — towers nearly touch, like a real HK street wall
        c += w + (rand() < 0.25 ? 1 : 0)
      }

      // ── ground line ──
      for (let cc = 0; cc < COLS; cc += 2) {
        push({ kind: 'outline', x: X(cc), y: ground + cell * 0.5, role: 0, bright: 0.2, ch: '1' })
      }

      // ── sky: sparse floating digits, thinner near the skyline ──
      const bgCell = small ? 30 : 34
      const cols = Math.ceil(W / bgCell)
      const rows = Math.ceil(H / bgCell)
      let bgCount = 0
      const maxBg = small ? 200 : 420
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (bgCount >= maxBg) break
          const px = cc * bgCell + bgCell / 2
          const py = r * bgCell + bgCell / 2
          const skyBias = 1 - (py / H) * 0.85
          if (Math.random() > 0.5 * skyBias) continue
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

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cell * 0.9}px "JetBrains Mono", "Courier New", monospace`
      for (const p of parts) {
        const [rr, gg, bb] = rgbFor(p.role)
        if (p.kind === 'window') {
          const s = Math.max(1.5, cell * 0.34)
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${p.bright * 0.8})`
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
        } else if (p.kind === 'beacon') {
          ctx.fillStyle = `rgba(${rr},${gg},${bb},0.9)`
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill()
        } else {
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${p.bright})`
          ctx.fillText(p.ch, p.x, p.y)
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
          const s = Math.max(1.5, cell * 0.34)
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${Math.min(1, a)})`
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s)
        } else if (p.kind === 'beacon') {
          const pulse = 0.5 + 0.5 * Math.sin(t * p.speed + p.phase)
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.18 * pulse})`
          ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.35 + 0.6 * pulse})`
          ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill()
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
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, a + mb * 0.4)})`
          ctx.fillText(p.ch, p.x, p.y)
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
