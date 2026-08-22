'use client'

import { useEffect, useRef } from 'react'

/**
 * CityPulse — ambient particle field with persistent wave motion.
 *
 * - Nodes drift and connect via faint lines (<150px).
 * - Inter-node repulsion prevents clumping into dots.
 * - Mouse creates a soft glow pool that brightens nearby nodes.
 * - Large slow wave circles add continuous background motion.
 * - Honors prefers-reduced-motion (static snapshot).
 */
export function CityPulse({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const mouse = { x: -9999, y: -9999, active: false }
    let W = 0, H = 0, raf = 0, t = 0
    let nodes: { x: number; y: number; vx: number; vy: number; r: number; baseR: number }[] = []
    let waves: { x: number; y: number; vx: number; vy: number; r: number; phase: number; speed: number }[] = []

    const signalColor = () => {
      const s = getComputedStyle(document.documentElement)
      const c = s.getPropertyValue('--signal').trim() || '#00D4AA'
      return c
    }
    const parseRgb = (hex: string) => {
      const h = hex.replace('#', '')
      const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number, number, number]
    }

    const resize = () => {
      const parent = canvas.parentElement!
      const rect = parent.getBoundingClientRect()
      W = Math.max(1, rect.width)
      H = Math.max(1, rect.height)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const density = Math.min(300, Math.max(120, Math.round((W * H) / 12000)))
      nodes = Array.from({ length: density }, () => {
        const r = Math.random() * 2 + 1
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r,
          baseR: r,
        }
      })

      // Background wave circles — large, faint, drift slowly
      waves = Array.from({ length: 4 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.min(W, H) * (0.2 + Math.random() * 0.35),
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
      }))

      if (reduce) drawStatic()
    }

    const LINK = 150
    const REPEL = 28 // min px between node centres

    const step = () => {
      t += 0.016

      // Wave circles drift
      for (const w of waves) {
        w.x += w.vx
        w.y += w.vy
        if (w.x < -w.r) w.x = W + w.r
        if (w.x > W + w.r) w.x = -w.r
        if (w.y < -w.r) w.y = H + w.r
        if (w.y > H + w.r) w.y = -w.r
      }

      // Nodes: drift + inter-node repulsion
      for (const n of nodes) {
        // Mouse: gentle attraction toward cursor (soft gather, no repel)
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y
          const d = Math.hypot(dx, dy)
          if (d < 200) {
            const force = (1 - d / 200) * 0.015
            n.vx += (dx / d) * force
            n.vy += (dy / d) * force
          }
        }
        n.x += n.vx
        n.y += n.vy
        n.vx *= 0.96
        n.vy *= 0.96
        if (n.x < 0) n.x = W
        if (n.x > W) n.x = 0
        if (n.y < 0) n.y = H
        if (n.y > H) n.y = 0
      }

      // Inter-node repulsion (prevents clumping)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < REPEL && d > 0.01) {
            const force = (1 - d / REPEL) * 0.06
            const nx = (dx / d) * force
            const ny = (dy / d) * force
            a.vx += nx
            a.vy += ny
            b.vx -= nx
            b.vy -= ny
          }
        }
      }
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, W, H)
      const col = getComputedStyle(document.documentElement).getPropertyValue('--bright-cyan').trim() || '#00D4AA'
      ctx.fillStyle = col
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      const s = getComputedStyle(document.documentElement)
      const hex = s.getPropertyValue('--signal').trim() || '#00D4AA'
      const [r, g, b] = parseRgb(hex)
      const cyan = s.getPropertyValue('--bright-cyan').trim() || hex

      // ── 1. Background wave circles ──
      for (const w of waves) {
        const pulse = 0.6 + 0.4 * Math.sin(t * w.speed + w.phase)
        const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, w.r)
        grad.addColorStop(0, `rgba(${r},${g},${b},${(0.04 * pulse).toFixed(3)})`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── 2. Connecting lines ──
      const lc = `rgba(${r},${g},${b},0.13)`
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK) {
            // Brighter near mouse
            let ao = 1
            if (mouse.active) {
              const ma = Math.hypot(a.x - mouse.x, a.y - mouse.y)
              const mb = Math.hypot(b.x - mouse.x, b.y - mouse.y)
              ao = Math.min(ma, mb) < 200 ? 1 + (1 - Math.min(ma, mb) / 200) * 1.5 : 1
            }
            ctx.strokeStyle = `rgba(${r},${g},${b},${(0.13 * ao).toFixed(3)})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // ── 3. Mouse glow ──
      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180)
        grad.addColorStop(0, `rgba(${r},${g},${b},0.12)`)
        grad.addColorStop(0.5, `rgba(${r},${g},${b},0.04)`)
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── 4. Nodes ──
      for (const n of nodes) {
        let size = n.baseR
        let bright = 1
        if (mouse.active) {
          const d = Math.hypot(n.x - mouse.x, n.y - mouse.y)
          if (d < 200) {
            const f = 1 - d / 200
            size = n.baseR + f * 3.5
            bright = 1 + f * 1.2
          }
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${(0.7 * bright).toFixed(3)})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = () => {
      if (!reduce) { step(); draw() }
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => {
      mouse.active = false
      mouse.x = -9999
      mouse.y = -9999
    }

    resize()
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    const ro = new ResizeObserver(() => resize())
    if (canvas.parentElement) ro.observe(canvas.parentElement)
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