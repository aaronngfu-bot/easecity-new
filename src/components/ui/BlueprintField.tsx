'use client'

/**
 * BlueprintField — the site's quiet "precision instrument" backdrop.
 *
 * REPLACES the earlier AmbientLayer (aurora + green constellation).
 * The green glow was a SaaS cliché. This layer is monochrome
 * silver/white on graphite — Bauhaus / Swiss precision aesthetic,
 * inspired by architectural drafting and film viewfinders.
 *
 * Zero signal-green. Signal is reserved for live status indicators.
 *
 * Composition:
 *   1. Four corner crosshair viewfinders (film-camera framing)
 *   2. Center measurement ruler on the left edge (film strip marks)
 *   3. 12-column hairline grid (near-invisible but gives the page a
 *      felt underlying structure)
 *   4. Slow diagonal light sweep (white/silver, opacity 0.04)
 *
 * All motion pauses under `prefers-reduced-motion: reduce`.
 */
export function BlueprintField() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] ambient-motion overflow-hidden"
    >
      {/* Diagonal light sweep — the only moving element */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full"
          style={{
            width: '22vw',
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.035) 50%, transparent 100%)',
            filter: 'blur(40px)',
            animation: 'lightSweep 44s linear infinite',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Column hairline grid — 12 cols, nearly invisible */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {Array.from({ length: 13 }).map((_, i) => (
          <line
            key={i}
            x1={(i * 100) / 12}
            y1={0}
            x2={(i * 100) / 12}
            y2={100}
            stroke="#ffffff"
            strokeWidth="0.04"
            strokeOpacity={i % 6 === 0 ? 0.05 : 0.025}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Corner crosshair viewfinders */}
      <Viewfinder pos="tl" />
      <Viewfinder pos="tr" />
      <Viewfinder pos="bl" />
      <Viewfinder pos="br" />

      {/* Left edge ruler ticks */}
      <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-around items-start py-20 pl-3 opacity-30">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={
              i % 5 === 0
                ? 'h-px w-3 bg-text-primary/40'
                : 'h-px w-1.5 bg-text-primary/15'
            }
          />
        ))}
      </div>

      {/* Right edge centre meta */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 origin-center text-[9px] font-mono tracking-[0.4em] text-text-muted/40 uppercase select-none">
        easecity · hk · 22.3°N · 114.2°E
      </div>
    </div>
  )
}

/** A film-camera viewfinder crosshair in one of four corners. */
function Viewfinder({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  const corner: Record<typeof pos, string> = {
    tl: 'top-6 left-6',
    tr: 'top-6 right-6',
    bl: 'bottom-6 left-6',
    br: 'bottom-6 right-6',
  }

  // Rotate crosshair so the "L" opens away from its corner
  const rotation: Record<typeof pos, string> = {
    tl: 'rotate-0',
    tr: 'rotate-90',
    bl: '-rotate-90',
    br: 'rotate-180',
  }

  return (
    <div
      className={`absolute ${corner[pos]} w-7 h-7 ${rotation[pos]}`}
      style={{ animation: 'crosshairBreath 4.8s ease-in-out infinite' }}
    >
      <svg viewBox="0 0 28 28" className="w-full h-full">
        {/* L-shape crosshair */}
        <path
          d="M 0 2 L 0 0 L 14 0"
          stroke="#fafafa"
          strokeWidth="1"
          strokeOpacity="0.55"
          fill="none"
        />
        <path
          d="M 0 14 L 0 0"
          stroke="#fafafa"
          strokeWidth="1"
          strokeOpacity="0.55"
          fill="none"
        />
        {/* Inner tick */}
        <circle cx="2" cy="2" r="0.8" fill="#fafafa" fillOpacity="0.6" />
      </svg>
    </div>
  )
}
