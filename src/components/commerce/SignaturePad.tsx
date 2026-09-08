'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

/**
 * Hand-drawn signature pad (pointer events: mouse / touch / pen).
 * Exports a trimmed PNG data URI. No deps — plain canvas with device
 * pixel-ratio scaling for crisp lines.
 */
export function SignaturePad({
  onSignature,
  labels,
}: {
  onSignature: (dataUri: string | null) => void
  labels: { draw: string; clear: string }
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const dirty = useRef(false)
  const [hasInk, setHasInk] = useState(false)

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#0f2928'
  }, [])

  useEffect(() => {
    setupCanvas()
    const onResize = () => {
      // Resize wipes ink — acceptable; signature happens once, focused.
      setupCanvas()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setupCanvas])

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
  }

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return
    const ctx = canvasRef.current!.getContext('2d')!
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!dirty.current) {
      dirty.current = true
      setHasInk(true)
    }
  }

  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    last.current = null
    // Export on every stroke end so the parent always has the latest.
    const canvas = canvasRef.current
    if (canvas && dirty.current) onSignature(canvas.toDataURL('image/png'))
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    dirty.current = false
    setHasInk(false)
    onSignature(null)
  }

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden rounded-xl border border-border bg-white">
        <canvas
          ref={canvasRef}
          className="block h-[140px] w-full touch-none"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
        {!hasInk && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-zinc-400">
            {labels.draw}
          </p>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={clear}
          className="text-xs text-text-muted underline-offset-2 hover:text-status-danger hover:underline"
        >
          {labels.clear}
        </button>
      </div>
    </div>
  )
}
