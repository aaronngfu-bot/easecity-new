'use client'

/**
 * Company hero illustration — a large, ambient "connected nodes" field.
 * Abstract particles orbit and stream between three labelled capability
 * cores (Web services / System architecture / AI), with a central EaseCity
 * hub. Pure SVG + CSS animation, theme-aware, no scroll-triggered opacity.
 */
export function CompanyIllustration() {
  const cores = [
    { x: 190, y: 120, r: 54, label: 'WEB', sub: 'services' },
    { x: 380, y: 120, r: 54, label: 'SYSTEM', sub: 'architecture' },
    { x: 285, y: 260, r: 54, label: 'AI', sub: 'intelligence' },
  ]
  const center = { x: 285, y: 178 }

  // orbit ring particle positions (angle in degrees)
  const orbit = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2
    const rx = 150
    const ry = 72
    return {
      x: center.x + Math.cos(a) * rx,
      y: center.y + Math.sin(a) * ry,
      delay: (i % 6) * 0.5,
    }
  })

  return (
    <svg viewBox="0 0 570 360" fill="none" aria-hidden="true" className="mx-auto w-full max-w-xl">
      <defs>
        <radialGradient id="ec-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02" />
        </radialGradient>
        <linearGradient id="ec-link" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* ── elliptical orbit guides ── */}
      <ellipse cx={center.x} cy={center.y} rx="150" ry="72" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="2 6" opacity="0.6" />
      <ellipse cx={center.x} cy={center.y} rx="105" ry="50" stroke="var(--border-color)" strokeWidth="0.6" strokeDasharray="1 5" opacity="0.4" />

      {/* ── links: center → cores ── */}
      {cores.map((c) => (
        <line
          key={`${c.label}-link`}
          x1={center.x}
          y1={center.y}
          x2={c.x}
          y2={c.y}
          stroke="var(--signal)"
          strokeWidth="1"
          strokeOpacity="0.25"
        />
      ))}

      {/* ── travelling particles along core links ── */}
      {cores.map((c, i) => (
        <circle key={`${c.label}-pulse`} r="2.5" fill="var(--signal)" className="ec-flow">
          <animateMotion
            dur="2.8s"
            repeatCount="indefinite"
            begin={`${i * 0.9}s`}
            path={`M ${center.x} ${center.y} L ${c.x} ${c.y}`}
          />
        </circle>
      ))}

      {/* ── orbit particles ── */}
      {orbit.map((p, i) => (
        <circle
          key={`orbit-${i}`}
          cx={p.x}
          cy={p.y}
          r={i % 5 === 0 ? 2.5 : 1.5}
          fill="var(--signal)"
          opacity={0.5}
          className="ec-orb"
          style={{ animationDelay: `${p.delay}s` }}
        />
      ))}

      {/* ── central hub ── */}
      <circle cx={center.x} cy={center.y} r="46" fill="url(#ec-core)" />
      <circle cx={center.x} cy={center.y} r="30" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="1.2" />
      <circle cx={center.x} cy={center.y} r="10" fill="var(--signal)" className="ec-hub" />

      {/* ── capability cores ── */}
      {cores.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r={c.r} fill="url(#ec-core)" stroke="var(--signal)" strokeOpacity="0.35" strokeWidth="1" />
          <text
            x={c.x}
            y={c.y - 4}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="15"
            fontWeight="700"
            fontFamily="var(--font-display), system-ui, sans-serif"
            letterSpacing="0.5"
          >
            {c.label}
          </text>
          <text
            x={c.x}
            y={c.y + 16}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="var(--font-mono), monospace"
          >
            {c.sub}
          </text>
        </g>
      ))}

      {/* ── EC-Share product tag, floating ── */}
      <g className="ec-tag">
        <rect x="450" y="270" width="108" height="52" rx="10" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.4" />
        <text x="464" y="292" fill="var(--signal)" fontSize="9" fontWeight="700" fontFamily="var(--font-mono), monospace" letterSpacing="1.2">
          PRODUCT
        </text>
        <text x="464" y="310" fill="var(--text-primary)" fontSize="15" fontWeight="700" fontFamily="var(--font-display), system-ui, sans-serif">
          EC-Share
        </text>
      </g>

      <style jsx>{`
        .ec-flow { filter: drop-shadow(0 0 4px var(--signal)); }
        .ec-hub { animation: ec-hub-pulse 2.6s ease-in-out infinite; transform-origin: ${center.x}px ${center.y}px; }
        .ec-orb { animation: ec-orb-pulse 3s ease-in-out infinite; }
        .ec-tag { animation: ec-tag-float 4s ease-in-out infinite; }
        @keyframes ec-hub-pulse {
          0%, 100% { opacity: 1; r: 10px; }
          50% { opacity: 0.55; r: 12px; }
        }
        @keyframes ec-orb-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.15; }
        }
        @keyframes ec-tag-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ec-flow, .ec-hub, .ec-orb, .ec-tag { animation: none !important; opacity: 0.6; }
          .ec-flow animateMotion { display: none; }
        }
      `}</style>
    </svg>
  )
}