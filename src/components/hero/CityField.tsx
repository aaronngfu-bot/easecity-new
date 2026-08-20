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

type P = {
  bx: number; by: number; x: number; y: number
  b0x: number; b0y: number
  fa: number; fs: number; fph: number
  vx: number; vy: number
  ch: string
  bright: number
  phase: number
  speed: number
  yellow: boolean // yellow vs teal
}

type Light = { x: number; y: number; bld: number; ch: string; phase: number; speed: number; base: number }

type Bld = { x: number; y: number; w: number; h: number; ox: number; oy: number; vx: number; vy: number }

/**
 * CityField — a golden Hong Kong harbour skyline drawn entirely in 0/1
 * digits, in the style of the reference artwork:
 *
 *  - dense window-grid towers (interiors filled with digit windows)
 *  - landmark silhouettes: Bank-of-China X-brace tower, rounded-top IFC,
 *    spired plaza tower, convention-centre arcs, and a ferris wheel
 *  - a mountain-ridge line of digits strung across the sky
 *  - waterline low (78% height, below the hero buttons) with a dense,
 *    rippled, depth-faded mirror reflection (strip-based drawImage)
 *
 * The static city is pre-rendered to an offscreen canvas once per build
 * (theme-aware); per-frame work is only sky digits, beacons and the
 * reflection strips. Seeded RNG keeps the city stable. Mouse repels sky
 * digits only. Reduced motion draws one static frame.
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

    const off = document.createElement('canvas')
    const octxMaybe = off.getContext('2d')
    if (!octxMaybe) return
    const octx: CanvasRenderingContext2D = octxMaybe

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let gold: [number, number, number] = [242, 181, 68]
    let goldLight: [number, number, number] = [250, 214, 140]
    let teal: [number, number, number] = [0, 143, 130]
    let tealLight: [number, number, number] = [0, 229, 204]
    let yellow: [number, number, number] = [255, 215, 0]

    const mouse = { x: -99999, y: -99999, active: false }

    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let t = 0
    let cell = 7
    let groundY = 0
    let radiusPx = 130
    let sky: P[] = []
    let beacons: P[] = []
    let lights: Light[] = []
    let buildings: Bld[] = []
    let waterlineRect: { x: number; y: number; w: number; h: number } | null = null

    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    }

    function readTheme() {
      const cs = getComputedStyle(document.documentElement)
      const am = cs.getPropertyValue('--amber').trim()
      const sl = cs.getPropertyValue('--signal-light').trim()
      const s = cs.getPropertyValue('--signal').trim()
      if (am) {
        gold = hexToRgb(am)
        // lighter tint of the accent for bright outlines (blend toward white)
        goldLight = [
          Math.round(gold[0] + (255 - gold[0]) * 0.35),
          Math.round(gold[1] + (255 - gold[1]) * 0.35),
          Math.round(gold[2] + (255 - gold[2]) * 0.35),
        ]
      }
      if (sl) tealLight = hexToRgb(sl)
      if (s) teal = hexToRgb(s)
    }

    const rgba = (c: [number, number, number], a: number) =>
      `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`

    /** Static city → offscreen canvas. */
    function buildCity() {
      const g = octx
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      g.clearRect(0, 0, W, H)
      g.textAlign = 'center'
      g.textBaseline = 'middle'
      g.font = `${cell * 0.92}px "JetBrains Mono", "Courier New", monospace`

      const rand = mulberry32(20260822)
      const small = W < 640
      const COLS = small ? 90 : 160
      const ROWS = small ? 34 : 44
      const cityTop = H * 0.2
      cell = Math.max(3.5, Math.min((W * 0.97) / COLS, (groundY - cityTop) / ROWS))
      const x0 = (W - COLS * cell) / 2
      const yOf = (r: number) => groundY - (ROWS - 1 - r) * cell
      const X = (c: number) => x0 + c * cell + cell / 2
      const d = (ch: string, x: number, y: number, col: [number, number, number], a: number) => {
        g.fillStyle = rgba(col, a)
        g.fillText(ch, x, y)
      }
      const bit = () => (rand() > 0.5 ? '1' : '0')

      // ── single surface plane: solid filled, consistent buildings ──
      {
        let c = 1
        while (c < COLS - 3) {
          const w = 5 + Math.floor(rand() * 3)
          if (c + w > COLS - 1) break
          const leftness = c / COLS
          // height profile: short left → tall right, tallest peak centre-right
          let maxH: number
          if (leftness < 0.28) maxH = small ? 11 : 15
          else if (leftness < 0.38) maxH = small ? 16 : 23
          else if (leftness < 0.55) maxH = small ? 14 : 19
          else if (leftness < 0.72) maxH = ROWS - 1
          else maxH = small ? 18 : 25
          const h = Math.min(ROWS - 1, 6 + Math.floor(rand() * (maxH - 6)))
          const top = ROWS - 1 - h
          // roof: mostly flat, occasional simple step (no domes/spires)
          const roof: number[] = new Array(w).fill(top)
          if (rand() < 0.2 && w >= 6) {
            const depth = 1 + Math.floor(rand() * 2)
            const dir = rand() < 0.5
            for (let i = 0; i < w; i++) {
              const u = dir ? i / (w - 1) : 1 - i / (w - 1)
              roof[i] = top + Math.round(u * depth)
            }
          }
          // record building bbox (for spring bounce)
          const bldIdx = buildings.length
          buildings.push({ x: X(c) - cell, y: yOf(top) - cell, w: (w + 1) * cell, h: groundY - yOf(top) + cell, ox: 0, oy: 0, vx: 0, vy: 0 })
          // bright outline
          for (let i = 0; i < w; i++) d(bit(), X(c + i), yOf(roof[i]), goldLight, 0.85)
          for (let rr = roof[0]; rr < ROWS; rr++) d('1', X(c), yOf(rr), goldLight, 0.8)
          for (let rr = roof[w - 1]; rr < ROWS; rr++) d('0', X(c + w - 1), yOf(rr), goldLight, 0.8)
          // solid interior fill + twinkle window lights
          for (let i = 1; i < w - 1; i++) {
            for (let rr = roof[i] + 1; rr < ROWS - 1; rr++) {
              d(bit(), X(c + i), yOf(rr), gold, 0.58)
              if (rand() < 0.13) {
                lights.push({ x: X(c + i), y: yOf(rr), bld: bldIdx, ch: '1', phase: rand() * 6, speed: 0.7 + rand() * 2.2, base: 0.6 + rand() * 0.4 })
              }
            }
          }
          c += w + 1
        }
      }

      // ── landmarks: drawn over cleared gaps (no double density) ──
      const colAt = (fx: number) => Math.round((fx * W - x0) / cell)
      const clearSpan = (c0: number, c1: number, topRow: number) => {
        const x = X(c0) - cell
        const y = yOf(topRow) - cell
        const w = (c1 - c0 + 3) * cell
        const h = groundY - yOf(topRow) + cell * 2
        g.clearRect(x, y, w, h)
        buildings.push({ x, y, w, h, ox: 0, oy: 0, vx: 0, vy: 0 })
      }

      // Convention & Exhibition Centre — low arcs (far left)
      {
        clearSpan(colAt(0.03), colAt(0.17), ROWS - 6)
        const arcs: [number, number, number][] = [[0.06, 0.04, 0.04], [0.13, 0.045, 0.03]]
        for (const [cx, hw, hh] of arcs) {
          const steps = Math.floor((hw * 2 * W) / cell)
          for (let i = 0; i <= steps; i++) {
            const u = (2 * i) / steps - 1
            const x = (cx - hw) * W + u * hw * W + hw * W
            const y = groundY - cell * 2 - hh * H * Math.sqrt(Math.max(0, 1 - u * u))
            d(bit(), x, y, goldLight, 0.85)
          }
          for (let rr = 1; rr <= 3; rr++) {
            for (let i = 0; i <= steps; i += 1) {
              const u = (2 * i) / steps - 1
              if (rand() < 0.7) d(bit(), (cx - hw) * W + (u + 1) * hw * W, groundY - cell * rr, gold, 0.5)
            }
          }
        }
      }

      // Bank of China tower — X bracing over a cleared column
      {
        const cB = colAt(0.2)
        const w = 7
        const h = Math.min(ROWS - 2, small ? 24 : 34)
        const top = ROWS - 1 - h
        clearSpan(cB - 4, cB + 4, top - 5)
        for (let i = 0; i < w; i++) d(bit(), X(cB + i), yOf(top), goldLight, 0.9)
        for (let rr = top; rr < ROWS; rr++) {
          d('1', X(cB), yOf(rr), goldLight, 0.8)
          d('0', X(cB + w - 1), yOf(rr), goldLight, 0.8)
        }
        for (let seg = 0; seg * 6 < h; seg++) {
          const r0 = top + seg * 6
          for (let k = 0; k <= 6 && r0 + k < ROWS; k++) {
            const u = k / 6
            const l = Math.round(u * (w - 1))
            d('1', X(cB + l), yOf(r0 + k), gold, 0.7)
            d('0', X(cB + w - 1 - l), yOf(r0 + k), gold, 0.7)
          }
        }
        for (let k = 1; k <= 4; k++) {
          d('1', X(cB + 1), yOf(top - k), goldLight, 0.8)
          d('1', X(cB + w - 2), yOf(top - k), goldLight, 0.8)
        }
      }

      // IFC — tallest flat-topped tower
      {
        const cI = colAt(0.68)
        const w = 8
        const top = 1
        clearSpan(cI - 4, cI + 4, top - 2)
        for (let i = 0; i < w; i++) d(bit(), X(cI + i), yOf(top), goldLight, 0.95)
        for (let rr = top; rr < ROWS; rr++) {
          d('1', X(cI), yOf(rr), goldLight, 0.85)
          d('0', X(cI + w - 1), yOf(rr), goldLight, 0.85)
        }
        for (let i = 1; i < w - 1; i++) {
          for (let rr = top + 3; rr < ROWS - 1; rr++) {
            if (rand() < 0.9) d(bit(), X(cI + i), yOf(rr), gold, 0.5 + rand() * 0.4)
          }
        }
      }

      // Central Plaza — stepped pyramid top + spire
      {
        const cP = colAt(0.88)
        const w = 7
        const h = Math.min(ROWS - 6, small ? 20 : 28)
        const top = ROWS - 1 - h
        clearSpan(cP - 4, cP + 4, top - 8)
        for (let i = 0; i < w; i++) d(bit(), X(cP + i), yOf(top), goldLight, 0.9)
        for (let rr = top; rr < ROWS; rr++) {
          d('1', X(cP), yOf(rr), goldLight, 0.8)
          d('0', X(cP + w - 1), yOf(rr), goldLight, 0.8)
        }
        for (let i = 1; i < w - 1; i++) {
          for (let rr = top + 1; rr < ROWS - 1; rr++) {
            if (rand() < 0.85) d(bit(), X(cP + i), yOf(rr), gold, 0.5 + rand() * 0.4)
          }
        }
        for (let k = 1; k <= 3; k++) {
          d('1', X(cP + k), yOf(top - 1), goldLight, 0.85)
          d('1', X(cP + w - 1 - k), yOf(top - 1), goldLight, 0.85)
        }
        for (let k = 2; k <= 6; k++) d('1', X(cP + 3), yOf(top - k), goldLight, 0.8)
      }

      // Hong Kong Observation Wheel
      {
        const wx = 0.565 * W
        const r = Math.min(H * 0.085, cell * 9)
        const wy = groundY - r - cell * 2
        clearSpan(colAt(0.565 - 0.05) - 1, colAt(0.565 + 0.05) + 1, ROWS - 10)
        const circ = Math.floor((2 * Math.PI * r) / (cell * 0.9))
        for (let i = 0; i < circ; i++) {
          const a = (i / circ) * Math.PI * 2
          d(bit(), wx + Math.cos(a) * r, wy + Math.sin(a) * r, goldLight, 0.85)
        }
        for (let s = 0; s < 8; s++) {
          const a = (s / 8) * Math.PI * 2
          const steps = Math.floor(r / cell)
          for (let k = 1; k < steps; k++) {
            d(k % 2 ? '0' : '1', wx + Math.cos(a) * k * cell, wy + Math.sin(a) * k * cell, gold, 0.55)
          }
        }
        d('1', wx, wy, goldLight, 0.95)
        d('1', wx - cell, wy + r + cell, gold, 0.7)
        d('1', wx + cell, wy + r + cell, gold, 0.7)
      }

      // ── waterline: dense dashed digit row ──
      waterlineRect = { x: x0 - cell, y: groundY - cell, w: COLS * cell + cell * 2, h: cell * 2 }
      for (let cc = 0; cc < COLS; cc++) {
        if (rand() < 0.8) d(bit(), X(cc), groundY + cell * 0.4, gold, 0.5)
      }
    }

    function buildSky() {
      sky = []
      beacons = beacons.filter(() => false)
      lights = []
      buildings = []
      waterlineRect = null
      const rand = mulberry32(777)
      const small = W < 640
      const bgCell = small ? 26 : 28
      const cols = Math.ceil(W / bgCell)
      const rows = Math.ceil((H * 0.55) / bgCell)
      let count = 0
      const max = small ? 240 : 520
      for (let r = 0; r < rows; r++) {
        for (let cc = 0; cc < cols; cc++) {
          if (count >= max) break
          const px = cc * bgCell + bgCell / 2
          const py = r * bgCell + bgCell / 2
          const skyBias = 1 - (py / (H * 0.55)) * 0.8
          if (rand() > 0.55 * skyBias) continue
          count++
          const isYellow = rand() < 0.45
          sky.push({
            bx: px, by: py, b0x: px, b0y: py,
            fa: 10 + rand() * 22, fs: 0.1 + rand() * 0.25, fph: rand() * Math.PI * 2,
            vx: 0, vy: 0, x: px, y: py,
            ch: rand() > 0.5 ? '1' : '0',
            bright: isYellow ? 0.62 + rand() * 0.28 : 0.25 + rand() * 0.3,
            phase: rand() * Math.PI * 2,
            speed: 0.5 + rand() * 1.2,
            yellow: isYellow,
          })
        }
      }
      // beacons are (re)created inside buildCity
      buildCity()
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
      off.width = canvas.width
      off.height = canvas.height
      groundY = H * 0.78
      radiusPx = 120
      beacons = []
      lights = []
      buildings = []
      waterlineRect = null
      buildSky()
      if (reduceMotion) drawStatic()
    }

    function drawReflection() {
      const STRIP = 4
      for (let sy = Math.floor(groundY) + 2; sy < H; sy += STRIP) {
        const depth = (sy - groundY) / Math.max(1, H - groundY)
        const srcY = groundY - (sy - groundY) - STRIP
        if (srcY < 0) break
        const a = 0.5 * (1 - depth * 0.85)
        if (a < 0.02) break
        const xo = Math.sin(t * 1.2 + sy * 0.05) * (1 + depth * 4)
        ctx.globalAlpha = a
        ctx.drawImage(
          off,
          0, srcY * dpr, W * dpr, STRIP * dpr,
          xo, sy, W, STRIP
        )
      }
      ctx.globalAlpha = 1
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cell * 0.92}px "JetBrains Mono", "Courier New", monospace`
      for (const p of sky) {
        const col = p.yellow ? yellow : teal
        ctx.fillStyle = rgba(col, p.bright)
        ctx.fillText(p.ch, p.x, p.y)
      }
      ctx.drawImage(off, 0, 0, W, H)
      for (const l of lights) {
        ctx.fillStyle = rgba(goldLight, 0.8 * l.base)
        ctx.fillText(l.ch, l.x, l.y)
      }
      drawReflection()
      for (const b of beacons) {
        ctx.fillStyle = rgba(goldLight, 0.9)
        ctx.fillText(b.ch, b.x, b.y)
      }
    }

    function step() {
      t += 0.016
      const m = mouse
      for (const p of sky) {
        p.bx = p.b0x + Math.sin(t * p.fs + p.fph) * p.fa
        p.by = p.b0y + Math.cos(t * p.fs * 0.83 + p.fph * 1.7) * p.fa * 0.75
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
        if (Math.random() < 0.02) p.ch = p.ch === '1' ? '0' : '1'
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${cell * 0.92}px "JetBrains Mono", "Courier New", monospace`
      // sky digits
      for (const p of sky) {
        const col = p.yellow ? yellow : teal
        const a = p.yellow
          ? Math.min(1, 0.82 + 0.12 * Math.sin(t * p.speed * 0.7 + p.phase))
          : Math.min(1, p.bright * (0.55 + Math.sin(t * p.speed + p.phase) * 0.4))
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        const mb = mouse.active && dist < radiusPx ? 1 - dist / radiusPx : 0
        ctx.fillStyle = rgba(col, a + mb * 0.4)
        ctx.fillText(p.ch, p.x, p.y)
      }
      // buildings (each springs independently from the cursor)
      for (const b of buildings) {
        ctx.drawImage(off, b.x * dpr, b.y * dpr, b.w * dpr, b.h * dpr, b.x + b.ox, b.y + b.oy, b.w, b.h)
      }
      // waterline (static)
      if (waterlineRect) {
        const wr = waterlineRect
        ctx.drawImage(off, wr.x * dpr, wr.y * dpr, wr.w * dpr, wr.h * dpr, wr.x, wr.y, wr.w, wr.h)
      }
      // twinkle window lights (follow their building's offset)
      for (const l of lights) {
        const b = buildings[l.bld]
        const pulse = 0.5 + 0.5 * Math.sin(t * l.speed + l.phase)
        ctx.fillStyle = rgba(goldLight, (0.25 + 0.65 * pulse) * l.base)
        ctx.fillText(l.ch, l.x + (b ? b.ox : 0), l.y + (b ? b.oy : 0))
      }
      // water
      drawReflection()
      // reflected twinkle (rippled, depth-faded, follows building offset)
      for (const l of lights) {
        const b = buildings[l.bld]
        const lx = l.x + (b ? b.ox : 0)
        const ly = l.y + (b ? b.oy : 0)
        const above = groundY - ly
        if (above <= 0) continue
        const ry = 2 * groundY - ly
        if (ry >= H) continue
        const depth = above / Math.max(1, groundY)
        const fade = 0.5 * (1 - depth * 0.7)
        const xo = Math.sin(t * 1.2 + ly * 0.05) * depth * 5
        const pulse = 0.5 + 0.5 * Math.sin(t * l.speed + l.phase)
        const a = (0.25 + 0.65 * pulse) * l.base * fade
        if (a < 0.02) continue
        ctx.fillStyle = rgba(goldLight, a)
        ctx.fillText(l.ch, lx + xo, ry)
      }
      // pulsing beacons
      for (const b of beacons) {
        const pulse = 0.5 + 0.5 * Math.sin(t * b.speed + b.phase)
        ctx.fillStyle = rgba(goldLight, 0.35 + 0.6 * pulse)
        ctx.fillText(b.ch, b.x, b.y)
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
      beacons = []
      lights = []
      buildings = []
      waterlineRect = null
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
