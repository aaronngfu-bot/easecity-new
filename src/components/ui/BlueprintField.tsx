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
 *   1. Center measurement ruler on the left edge (film strip marks)
 *   2. 12-column hairline grid (near-invisible but gives the page a
 *      felt underlying structure)
 *   3. Slow diagonal light sweep (white/silver, opacity 0.04)
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
          className="absolute top-0 left-0 h-full bg-[linear-gradient(90deg,transparent_0%,rgba(7,16,15,0.03)_50%,transparent_100%)] dark:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.035)_50%,transparent_100%)]"
          style={{
            width: '22vw',
            filter: 'blur(40px)',
            animation: 'lightSweep 44s linear infinite',
            willChange: 'transform',
          }}
        />
      </div>

      {/* Column hairline grid — 12 cols, nearly invisible (theme-aware via currentColor) */}
      <svg
        className="absolute inset-0 w-full h-full text-[#07100f] dark:text-white"
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
            stroke="currentColor"
            strokeWidth="0.04"
            strokeOpacity={i % 6 === 0 ? 0.05 : 0.025}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      {/* Left edge ruler ticks — desktop only（細屏會同內容打架） */}
      <div className="absolute left-0 top-0 bottom-0 w-6 hidden lg:flex flex-col justify-around items-start py-20 pl-3 opacity-30">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className={
              i % 5 === 0
                ? 'h-px w-3 bg-foreground/40'
                : 'h-px w-1.5 bg-foreground/15'
            }
          />
        ))}
      </div>

      {/* Right edge centre meta — desktop only */}
      <div className="absolute right-3 top-1/2 hidden lg:block -translate-y-1/2 rotate-90 origin-center text-[9px] font-mono tracking-[0.4em] text-text-muted/40 uppercase select-none">
        easecity · hk · 22.3°N · 114.2°E
      </div>
    </div>
  )
}
