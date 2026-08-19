'use client'

/**
 * EC-Share hero illustration — a large "control hub with surrounding
 * devices" composition. A central desktop console shows a 2x3 device grid;
 * six Android devices orbit it with signal streams flowing inward, and the
 * focused device gets a highlight ring. Pure SVG + CSS animation,
 * theme-aware, no scroll-triggered opacity.
 */
export function HeroIllustration() {
  const hub = { x: 450, y: 260 }
  // surrounding devices: [x, y, focused]
  const devices = [
    { x: 130, y: 110, focused: false },
    { x: 450, y: 70, focused: false },
    { x: 770, y: 110, focused: false },
    { x: 130, y: 410, focused: false },
    { x: 770, y: 410, focused: false },
    { x: 450, y: 470, focused: false },
  ]

  return (
    <svg viewBox="0 0 900 560" fill="none" aria-hidden="true" className="mx-auto w-full">
      <defs>
        <linearGradient id="hi-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* ── signal streams: devices → hub ── */}
      {devices.map((d, i) => (
        <g key={`stream-${i}`}>
          <line
            x1={d.x}
            y1={d.y}
            x2={hub.x}
            y2={hub.y}
            stroke="var(--signal)"
            strokeWidth="1"
            strokeOpacity="0.2"
            strokeDasharray="3 5"
          />
          <circle r="2.8" fill="var(--signal)" className="hi-stream">
            <animateMotion
              dur="2.6s"
              repeatCount="indefinite"
              begin={`${(i % 3) * 0.85}s`}
              path={`M ${d.x} ${d.y} L ${hub.x} ${hub.y}`}
            />
          </circle>
        </g>
      ))}

      {/* ── central console ── */}
      <g>
        <rect x="280" y="150" width="340" height="230" rx="16" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="1.8" />
        {/* screen inner */}
        <rect x="300" y="170" width="300" height="180" rx="10" fill="var(--bg-base)" stroke="var(--border-color)" />
        {/* 2x3 device grid on screen */}
        {[0, 1, 2].map((row) =>
          [0, 1].map((col) => (
            <g key={`${row}-${col}`}>
              <rect
                x={312 + col * 146}
                y={182 + row * 56}
                width="130"
                height="48"
                rx="6"
                fill="var(--bg-elevated)"
                stroke={row === 1 && col === 0 ? 'var(--signal)' : 'var(--border-color)'}
                strokeWidth={row === 1 && col === 0 ? 1.6 : 0.8}
              />
              {/* screen content lines */}
              <rect x={320 + col * 146} y={190 + row * 56} width="60" height="5" rx="2.5" fill="var(--border-strong)" opacity="0.5" />
              <rect x={320 + col * 146} y={202 + row * 56} width="44" height="5" rx="2.5" fill="var(--border-color)" opacity="0.5" />
            </g>
          ))
        )}
        {/* console base */}
        <rect x="420" y="380" width="60" height="12" rx="4" fill="var(--border-strong)" />
        <rect x="435" y="392" width="30" height="8" rx="2" fill="var(--border-color)" />
        {/* status dot */}
        <circle cx="330" cy="195" r="4" fill="var(--signal)" className="hi-dot" />
      </g>

      {/* ── surrounding devices ── */}
      {devices.map((d, i) => (
        <g key={`dev-${i}`} transform={`translate(${d.x}, ${d.y})`}>
          <rect x="-26" y="-52" width="52" height="104" rx="10" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.3" />
          <rect x="-18" y="-42" width="36" height="60" rx="4" fill="var(--bg-elevated)" stroke="var(--border-color)" />
          {/* home indicator */}
          <rect x="-10" y="38" width="20" height="4" rx="2" fill="var(--border-strong)" />
          {/* glow for one device */}
          {i === 1 && (
            <rect x="-30" y="-56" width="60" height="112" rx="13" fill="none" stroke="var(--signal)" strokeWidth="1.2" className="hi-focus" />
          )}
        </g>
      ))}

      {/* ── ambient particles ── */}
      {[
        { x: 250, y: 90, d: 0 },
        { x: 650, y: 85, d: 0.7 },
        { x: 90, y: 300, d: 1.4 },
        { x: 810, y: 300, d: 2.1 },
        { x: 250, y: 490, d: 0.4 },
        { x: 650, y: 495, d: 1.1 },
      ].map((p, i) => (
        <circle key={`amb-${i}`} cx={p.x} cy={p.y} r="2" fill="var(--signal)" className="hi-amb" style={{ animationDelay: `${p.d}s` }} />
      ))}

      <style jsx>{`
        .hi-stream { filter: drop-shadow(0 0 4px var(--signal)); }
        .hi-dot { animation: hi-blink 2s ease-in-out infinite; }
        .hi-focus { animation: hi-focus-pulse 2.8s ease-in-out infinite; }
        .hi-amb { animation: hi-amb-pulse 3.4s ease-in-out infinite; }
        @keyframes hi-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes hi-focus-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes hi-amb-pulse {
          0%, 100% { opacity: 0.6; transform: translateY(0); }
          50% { opacity: 0.15; transform: translateY(-6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .hi-stream, .hi-dot, .hi-focus, .hi-amb { animation: none !important; opacity: 0.6; }
          .hi-stream animateMotion { display: none; }
        }
      `}</style>
    </svg>
  )
}