'use client'

import { useEffect, useRef } from 'react'

/**
 * CityPulse — a "living city" particle field for the hero. Nodes drift slowly,
 * draw connecting lines when close (<150px), and ease toward the cursor. Uses
 * CSS vars (--signal / --bright-cyan) so it themes with light/dark. Honors
 * prefers-reduced-motion by drawing a static snapshot.
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
    let W = 0, H = 0, raf = 0
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = []

    const lineColor = () => {
      const s = getComputedStyle(document.documentElement)
      const c = s.getPropertyValue('--signal').trim() || '#00D4AA'
      const rgb = parseInt(c.slice(1), 16)
      return `rgba(${(rgb>>16)&255}, ${(rgb>>8)&255}, ${rgb&255}, 0.18)`
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
      const density = Math.min(300, Math.max(120, Math.round((W*H)/12000)))
      nodes = Array.from({ length: density }, () => ({
        x: Math.random()*W,
        y: Math.random()*H,
        vx: (Math.random()-0.5)*0.35,
        vy: (Math.random()-0.5)*0.35,
        r: Math.random()*2 + 1,
      }))
      if (reduce) drawStatic()
    }

    const drawStatic = () => {
      ctx.clearRect(0,0,W,H)
      const col = getComputedStyle(document.documentElement).getPropertyValue('--bright-cyan').trim() || '#00D4AA'
      ctx.fillStyle = col
      for (const n of nodes) { ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill() }
    }

    const LINK = 150

    const step = () => {
      for (const n of nodes) {
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y
          const d = Math.hypot(dx,dy)
          if (d < 160) { n.vx += (dx/d)*0.04; n.vy += (dy/d)*0.04 }
        }
        n.x += n.vx; n.y += n.vy
        // gentle spring back toward original placement drift
        n.vx *= 0.96; n.vy *= 0.96
        if (n.x<0) n.x=W; if (n.x>W) n.x=0
        if (n.y<0) n.y=H; if (n.y>H) n.y=0
      }
    }

    const draw = () => {
      ctx.clearRect(0,0,W,H)
      const cyan = getComputedStyle(document.documentElement).getPropertyValue('--bright-cyan').trim() || '#00D4AA'
      const lc = lineColor()
      ctx.fillStyle = cyan
      for (const n of nodes) {
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill()
      }
      // connecting lines
      for (let i=0;i<nodes.length;i++) for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i], b=nodes[j]
        const d=Math.hypot(a.x-b.x,a.y-b.y)
        if(d<LINK){ ctx.strokeStyle=lc; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke() }
      }
    }

    const loop = () => { if(!reduce){ step(); draw() } raf=requestAnimationFrame(loop) }

    const onMove = (e: MouseEvent) => { const r=canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top; mouse.active=true }
    const onLeave = () => { mouse.active=false; mouse.x=-9999; mouse.y=-9999 }

    resize(); raf=requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    const ro = new ResizeObserver(()=>resize())
    if (canvas.parentElement) ro.observe(canvas.parentElement)
    const mo = new MutationObserver(()=>{ if(reduce) drawStatic() })
    mo.observe(document.documentElement, { attributes: true, attributeFilter:['class'] })

    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove',onMove); canvas.removeEventListener('mouseleave',onLeave); ro.disconnect(); mo.disconnect() }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}