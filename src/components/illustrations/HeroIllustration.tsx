'use client'

/**
 * EC-Share hero illustration — a symmetric "control hub surrounded by
 * devices" composition. Six Android devices arranged evenly (two per side,
 * none clipped), a large readable central console with a 2x3 grid, and
 * signal streams flowing inward with a highlighted active path. Pure SVG +
 * CSS, theme-aware, no scroll-triggered opacity.
 */
export function HeroIllustration() {
  const hub = { x: 450, y: 240 }
  // six devices, symmetric: 2 top, 2 mid-sides, 2 bottom — with safe margins
  const devices = [
    { x: 200, y: 78, active: false },
    { x: 700, y: 78, active: false },
    { x: 120, y: 235, active: false },
    { x: 780, y: 235, active: false },
    { x: 200, y: 385, active: false },
    { x: 700, y: 385, active: false },
  ]
  // highlight the top-right device as the "active" stream
  devices[1].active = true

  return (
    <svg viewBox="0 0 900 520" fill="none" aria-hidden="true" className="mx-auto w-full">
      <defs>
        <linearGradient id="hi-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.03" />
        </linearGradient>
        <radialGradient id="hi-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ambient backdrop glow — stronger, centered on console */}
      <ellipse cx={hub.x} cy={hub.y} rx="250" ry="200" fill="url(#hi-bg)" />

      {/* signal streams: devices → hub, active one solid + bold */}
      {devices.map((d, i) => (
        <g key={`stream-${i}`}>
          <line
            x1={d.x}
            y1={d.y}
            x2={hub.x}
            y2={hub.y}
            stroke={d.active ? 'var(--signal)' : 'var(--border-strong)'}
            strokeWidth={d.active ? 2 : 1}
            strokeOpacity={d.active ? 0.85 : 0.28}
            strokeDasharray={d.active ? undefined : '4 6'}
          />
          <circle r={d.active ? 3.4 : 2.4} fill="var(--signal)" className={d.active ? 'hi-stream-active' : 'hi-stream'}>
            <animateMotion
              dur={d.active ? '2s' : '3.2s'}
              repeatCount="indefinite"
              begin={`${(i % 4) * 0.7}s`}
              path={`M ${d.x} ${d.y} L ${hub.x} ${hub.y}`}
            />
          </circle>
        </g>
      ))}

      {/* central console — large + readable grid */}
      <g>
        <rect x="300" y="130" width="300" height="240" rx="16" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="1.8" />
        {/* screen inner */}
        <rect x="318" y="150" width="264" height="184" rx="10" fill="var(--bg-base)" stroke="var(--border-color)" />
        {/* 2x3 grid, larger cells with a visible phone glyph */}
        {[0, 1, 2].map((row) =>
          [0, 1].map((col) => {
            const focused = row === 1 && col === 0
            const x = 330 + col * 124
            const y = 162 + row * 57
            return (
              <g key={`${row}-${col}`}>
                <rect
                  x={x}
                  y={y}
                  width="112"
                  height="48"
                  rx="7"
                  fill="var(--bg-elevated)"
                  stroke={focused ? 'var(--signal)' : 'var(--border-color)'}
                  strokeWidth={focused ? 1.8 : 0.9}
                />
                {/* mini phone: status bar + app dots */}
                <rect x={x + 10} y={y + 9} width="60" height="6" rx="3" fill={focused ? 'var(--signal)' : 'var(--border-strong)'} opacity="0.7" />
                {[0, 1, 2].map((r2) =>
                  [0, 1].map((c2) => (
                    <rect key={`${r2}-${c2}`} x={x + 10 + c2 * 14} y={y + 22 + r2 * 12} width="9" height="9" rx="2.5" fill={focused ? 'var(--signal)' : 'var(--border-color)'} opacity="0.75" />
                  ))
                )}
              </g>
            )
          })
        )}
        {/* console stand */}
        <rect x="420" y="370" width="60" height="14" rx="4" fill="var(--border-strong)" />
        <rect x="436" y="384" width="28" height="8" rx="2" fill="var(--border-color)" />
        {/* status dot */}
        <circle cx="336" cy="170" r="4" fill="var(--signal)" className="hi-dot" />
      </g>

      {/* surrounding devices — symmetric, none clipped */}
      {devices.map((d, i) => (
        <g key={`dev-${i}`} transform={`translate(${d.x}, ${d.y})`}>
          <rect x="-24" y="-46" width="48" height="92" rx="9" fill="var(--bg-surface)" stroke={d.active ? 'var(--signal)' : 'var(--border-strong)'} strokeWidth={d.active ? 1.6 : 1.1} />
          <rect x="-16" y="-37" width="32" height="54" rx="4" fill="var(--bg-elevated)" stroke="var(--border-color)" />
          {/* screen hint */}
          <rect x="-10" y="-30" width="20" height="3" rx="1.5" fill="var(--border-strong)" opacity="0.7" />
          <rect x="-10" y="-22" width="14" height="3" rx="1.5" fill="var(--border-color)" opacity="0.6" />
          {/* home indicator */}
          <rect x="-8" y="34" width="16" height="3.5" rx="1.75" fill="var(--border-strong)" />
          {/* active ring */}
          {d.active && <rect x="-28" y="-50" width="56" height="100" rx="12" fill="none" stroke="var(--signal)" strokeWidth="1.2" className="hi-focus" />}
        </g>
      ))}

      <style jsx>{`
        .hi-stream { opacity: 0.75; }
        .hi-stream-active { filter: drop-shadow(0 0 5px var(--signal)); }
        .hi-dot { animation: hi-blink 2s ease-in-out infinite; }
        .hi-focus { animation: hi-focus-pulse 2.8s ease-in-out infinite; }
        @keyframes hi-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes hi-focus-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hi-stream, .hi-stream-active, .hi-dot, .hi-focus { animation: none !important; opacity: 0.7; }
          .hi-stream animateMotion, .hi-stream-active animateMotion { display: none; }
        }
      `}</style>
    </svg>
  )
}