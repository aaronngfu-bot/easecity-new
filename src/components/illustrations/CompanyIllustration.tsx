'use client'

/**
 * Company hero illustration — an intuitive "one control hub → many devices"
 * concept. A desktop control surface on the left, four device endpoints on
 * the right, with data pulses flowing along the connections. Pure SVG driven
 * by CSS variables so it follows dark/light theme; animation is CSS-only
 * (no scroll-triggered opacity), so it can never strand text invisible.
 */
export function CompanyIllustration() {
  // endpoints: [x, y, kind]
  const endpoints = [
    { x: 620, y: 70, kind: 'phone' },
    { x: 700, y: 150, kind: 'tablet' },
    { x: 640, y: 240, kind: 'laptop' },
    { x: 620, y: 300, kind: 'phone' },
  ]
  const hub = { x: 210, y: 185 }

  return (
    <svg
      viewBox="0 0 800 360"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full max-w-3xl"
    >
      <defs>
        <linearGradient id="ec-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* ── connections: hub → each endpoint ── */}
      {endpoints.map((e) => (
        <g key={`${e.x}-${e.y}`}>
          <line
            x1={hub.x + 70}
            y1={hub.y}
            x2={e.x}
            y2={e.y}
            stroke="var(--signal)"
            strokeOpacity="0.18"
            strokeWidth="1.4"
          />
          {/* travelling pulse */}
          <circle
            r="3"
            fill="var(--signal)"
            className="ec-pulse"
            style={{ animationDelay: `${e.x % 5 * 0.35}s` }}
          >
            <animateMotion
              dur="2.4s"
              repeatCount="indefinite"
              begin={`${(e.y % 3) * 0.4}s`}
              path={`M ${hub.x + 70} ${hub.y} L ${e.x} ${e.y}`}
            />
          </circle>
        </g>
      ))}

      {/* ── Control hub (desktop) ── */}
      <g>
        <rect x="90" y="120" width="230" height="140" rx="12" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="1.6" />
        <rect x="104" y="134" width="202" height="96" rx="6" fill="var(--bg-base)" stroke="var(--border-color)" />
        {/* screen content: mini device grid */}
        <rect x="112" y="142" width="60" height="80" rx="4" fill="var(--bg-elevated)" stroke="var(--border-color)" />
        <rect x="178" y="142" width="60" height="80" rx="4" fill="var(--bg-elevated)" stroke="var(--signal)" />
        <rect x="244" y="142" width="52" height="80" rx="4" fill="var(--bg-elevated)" stroke="var(--border-color)" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={`row-${i}`} x="118" y={150 + i * 14} width="46" height="5" rx="2.5" fill="var(--border-strong)" opacity="0.5" />
        ))}
        {/* stand */}
        <rect x="180" y="260" width="50" height="10" rx="3" fill="var(--border-strong)" />
        <rect x="195" y="270" width="20" height="8" rx="2" fill="var(--border-color)" />
        {/* signal dot */}
        <circle cx="205" cy="160" r="5" fill="var(--signal)" className="ec-hub-pulse" />
      </g>

      {/* label */}
      <text x="95" y="300" fill="var(--text-faint)" fontSize="11" fontFamily="var(--font-mono), monospace" letterSpacing="2">
        CONTROL HUB
      </text>

      {/* ── Endpoints ── */}
      {endpoints.map((e) => (
        <g key={`node-${e.x}-${e.y}`} transform={`translate(${e.x}, ${e.y})`}>
          <circle r="30" fill="var(--signal-soft)" stroke="var(--border-color)" />
          {e.kind === 'phone' && (
            <rect x="-14" y="-24" width="28" height="48" rx="5" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.2" />
          )}
          {e.kind === 'phone' && (
            <rect x="-9" y="-17" width="18" height="22" rx="2" fill="var(--bg-elevated)" />
          )}
          {e.kind === 'tablet' && (
            <rect x="-24" y="-16" width="48" height="32" rx="5" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.2" />
          )}
          {e.kind === 'tablet' && (
            <rect x="-18" y="-10" width="36" height="20" rx="2" fill="var(--bg-elevated)" />
          )}
          {e.kind === 'laptop' && (
            <>
              <rect x="-24" y="-18" width="48" height="30" rx="4" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.2" />
              <rect x="-30" y="12" width="60" height="5" rx="2.5" fill="var(--border-strong)" />
            </>
          )}
          {e.kind === 'laptop' && (
            <rect x="-18" y="-13" width="36" height="20" rx="2" fill="var(--bg-elevated)" />
          )}
          <circle cx="0" cy="0" r="3.5" fill="var(--signal)" />
        </g>
      ))}

      {/* endpoint label */}
      <text x="632" y="345" fill="var(--text-faint)" fontSize="11" fontFamily="var(--font-mono), monospace" letterSpacing="2">
        REMOTE DEVICES
      </text>

      <style jsx>{`
        .ec-pulse {
          filter: drop-shadow(0 0 3px var(--signal));
        }
        .ec-hub-pulse {
          animation: ec-hub-pulse 2.4s ease-in-out infinite;
          transform-origin: 205px 160px;
        }
        @keyframes ec-hub-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ec-pulse, .ec-hub-pulse { animation: none !important; opacity: 1; }
          .ec-pulse animateMotion { display: none; }
        }
      `}</style>
    </svg>
  )
}