'use client'

import { useEffect, useRef } from 'react'

/**
 * BinaryField — an interactive "matrix" hero visual. 0/1 glyph particles form
 * the EC brand mark (bright, full density) over a sparser background field;
 * the mouse repels nearby particles (spring-back, brighten, scale).
 *
 * The EC mark is defined as a CHARACTER GRID (not canvas drawing + sampling).
 * That was the fix for every prior failure: drawing/sampling produced glyphs
 * that were too thick, too sparse, mis-centered, or invisible at the flicker
 * trough. A fixed grid makes the stroke width, density, and centering fully
 * predictable at ANY canvas size.
 *
 * Theme-aware (--signal / --signal-light), reduced-motion aware, DPR aware,
 * fully cleaned up on unmount.
 */

// EC glyph grid: '#' = letter particle, '.' = empty. 21 cols × 11 rows.
// E = vertical stem + top arm + short mid arm + bottom arm.
// C = thin ring, open to the right (gap around angle 0°).
const GLYPH_ROWS = 11
const E_COLS = 9
const C_COLS = 9
const GAP_COLS = 3
const GLYPH_COLS = E_COLS + GAP_COLS + C_COLS

function buildGlyphGrid(): boolean[][] {
  const grid: boolean[][] = Array.from({ length: GLYPH_ROWS }, () =>
    Array(GLYPH_COLS).fill(false)
  )
  // E (cols 0..8): 2-cell vertical stem, arms 1 row thick. Bottom arm sits one
  // row up (row 9) to align with the C's lower arc, and is 8 wide.
  for (let r = 0; r < GLYPH_ROWS - 1; r++) {
    grid[r][0] = true
    grid[r][1] = true
  }
  for (let c = 0; c < 8; c++) grid[0][c] = true // top arm (8 wide, matches bottom)
  for (let c = 0; c < 6; c++) grid[4][c] = true // short mid arm
  for (let c = 0; c < 8; c++) grid[9][c] = true // bottom arm (one row up)
  // C (cols E_COLS+GAP .. +C_COLS), thin ring open right
  const cStart = E_COLS + GAP_COLS
  const cx = C_COLS / 2
  const cy = (GLYPH_ROWS - 1) / 2
  const rOut = 5.0
  const rIn = 3.6
  const gapDeg = 35
  for (let r = 0; r < GLYPH_ROWS; r++) {
    for (let c = 0; c < C_COLS; c++) {
      const x = c + 0.5 - cx
      const y = r + 0.5 - cy
      const d = Math.hypot(x, y)
      if (d >= rIn && d <= rOut) {
        const ang = (Math.atan2(y, x) * 180) / Math.PI
        if (!(ang >= -gapDeg && ang <= gapDeg)) grid[r][cStart + c] = true
      }
    }
  }
  return grid
}

const GLYPH_GRID = buildGlyphGrid()

export function BinaryField({
  className = '',
  glyphCenterX = 0.5,
  glyphCenterY = 0.5,
  minCell = 7,
  bgCell,
  bgDensity = 1,
  maxBg = Infinity,
  maxMarkWidth = 0.78,
}: {
  className?: string
  /** Horizontal anchor of the EC glyph as a fraction of canvas width (0.5 = centered). */
  glyphCenterX?: number
  /** Vertical anchor of the EC glyph as a fraction of canvas height (0.5 = centered). */
  glyphCenterY?: number
  /** Floor for the glyph cell size (raises stroke weight / spacing at big sizes). */
  minCell?: number
  /** Independent grid spacing for background particles (defaults to glyph cell). */
  bgCell?: number
  /** Multiplier on background particle density (0..1+). */
  bgDensity?: number
  /** Hard cap on background particle count (perf guard for full-bleed canvases). */
  maxBg?: number
  /** Max mark width as a fraction of canvas width (0.78 = near-full, hero uses ~0.45). */
  maxMarkWidth?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const ctxEl = canvasEl.getContext('2d')
    if (!ctxEl) return
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
    let cell = 14
    let radiusPx = 140
    let bgSpacingPx = 14
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

    // Center of the glyph block, in glyph-grid units.
    const glyphCenterCol = GLYPH_COLS / 2

    function rebuild() {
      // cell = glyph size in px, fit so the mark is ~66% of the smaller canvas
      // dimension and never exceeds maxMarkWidth of the width.
      const scale = Math.min((H * 0.66) / GLYPH_ROWS, (W * maxMarkWidth) / GLYPH_COLS)
      cell = Math.max(minCell, scale)
      const markW = GLYPH_COLS * cell
      const markH = GLYPH_ROWS * cell
      // Glyph horizontal anchor is configurable (0.5 = centered; hero uses a
      // right bias so the mark sits beside the text column).
      const x0 = W * glyphCenterX - markW / 2 + markW * 0.06
      const y0 = H * glyphCenterY - markH / 2
      radiusPx = Math.max(90, cell * 10)
      bgSpacingPx = bgCell ?? cell

      particles = []

      // letter particles — full density inside the glyph
      for (let r = 0; r < GLYPH_ROWS; r++) {
        for (let c = 0; c < GLYPH_COLS; c++) {
          if (!GLYPH_GRID[r][c]) continue
          particles.push({
            bx: x0 + c * cell + cell / 2,
            by: y0 + r * cell + cell / 2,
            x: x0 + c * cell + cell / 2,
            y: y0 + r * cell + cell / 2,
            vx: 0, vy: 0,
            char: '1',
            core: true,
            bright: 0.85 + Math.random() * 0.15,
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.0,
          })
        }
      }

      // background field — density falls off with distance from the glyph center
      const gcx = x0 + glyphCenterCol * cell
      const gcy = y0 + (GLYPH_ROWS / 2) * cell
      const bgCellPx = bgSpacingPx
      const cols = Math.ceil(W / bgCellPx)
      const rows = Math.ceil(H / bgCellPx)
      const maxDist = Math.hypot(W, H) / 2
      let bgCount = 0
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (bgCount >= maxBg) break
          const px = c * bgCellPx + bgCellPx / 2
          const py = r * bgCellPx + bgCellPx / 2
          // skip if inside a glyph letter cell (letter particles own that space)
          const gx = (px - x0) / cell
          const gy = (py - y0) / cell
          if (gx >= -0.5 && gx < GLYPH_COLS + 0.5 && gy >= -0.5 && gy < GLYPH_ROWS + 0.5) {
            if (gx >= 0 && gx < GLYPH_COLS && gy >= 0 && gy < GLYPH_ROWS && GLYPH_GRID[Math.floor(gy)][Math.floor(gx)]) {
              continue
            }
          }
          const dist = Math.hypot(px - gcx, py - gcy)
          const density = Math.max(0.28, 0.8 * (1 - dist / maxDist)) * bgDensity
          if (Math.random() > density) continue
          bgCount++
          particles.push({
            bx: px, by: py, x: px, y: py, vx: 0, vy: 0,
            char: Math.random() > 0.5 ? '1' : '0',
            core: false,
            bright: 0.35 + Math.random() * 0.45,
            phase: Math.random() * Math.PI * 2,
            speed: 0.6 + Math.random() * 1.6,
          })
        }
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H)
      ctx.font = `${cell * 0.9}px "JetBrains Mono", "Courier New", monospace`
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
      rebuild()
      if (reduceMotion) drawStatic()
    }

    function step() {
      t += 0.016
      const m = mouse
      for (const p of particles) {
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
        if (!p.core && Math.random() < 0.02) p.char = p.char === '1' ? '0' : '1'
        else if (p.core && Math.random() < 0.015) p.char = p.char === '1' ? '0' : '1'
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.font = `${cell * 0.9}px "JetBrains Mono", "Courier New", monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const p of particles) {
        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.hypot(dx, dy)
        const boost = mouse.active && dist < radiusPx ? 1 - dist / radiusPx : 0
        // Core glyph particles are drawn at constant full brightness so the logo
        // is always legible; only background particles flicker.
        const a = p.core
          ? p.bright
          : Math.min(1, p.bright * (0.55 + Math.sin(t * p.speed + p.phase) * 0.4) + boost * 0.5)
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