'use client'
import { CanvasRevealEffect } from './CanvasRevealEffect'

export function LoginBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0">
        <CanvasRevealEffect
          animationSpeed={3}
          containerClassName="bg-black"
          colors={[[255, 255, 255], [255, 255, 255]]}
          dotSize={6}
          reverse={false}
        />
      </div>
      {/* 中央徑向暗角 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,0,0,1)_0%,_transparent_100%)]" />
      {/* 頂部漸層淡出 */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-black to-transparent" />
    </div>
  )
}
