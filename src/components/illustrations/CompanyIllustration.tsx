'use client'

/**
 * Company hero illustration — a clean "hub + three capability cores" field.
 * One large central hub, three well-spaced labelled cores (Web services /
 * System architecture / AI), a single subtle orbit, and clear radial links.
 * Particles flow along the links only (no scattered noise). Pure SVG + CSS,
 * theme-aware, no scroll-triggered opacity.
 */
export function CompanyIllustration() {
  const center = { x: 285, y: 170 }
  // three cores spaced widely, labelled large enough to read
  const cores = [
    { x: 130, y: 95, label: 'WEB', sub: 'services' },
    { x: 440, y: 95, label: 'SYSTEM', sub: 'architecture' },
    { x: 285, y: 300, label: 'AI', sub: 'intelligence' },
  ]

  // a few particles that flow along the radial links only
  const links = cores.map((c, i) => ({ ...c, i }))

  return (
    <svg viewBox="0 0 570 360" fill="none" aria-hidden="true" className="mx-auto w-full max-w-xl">
      <defs>
        <radialGradient id="ec-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02" />
        </radialGradient>
      </defs>

      {/* single subtle orbit ring */}
      <ellipse cx={center.x} cy={center.y} rx="185" ry="100" stroke="var(--border-color)" strokeWidth="0.8" strokeDasharray="2 7" opacity="0.5" />

      {/* clear radial links: center → cores */}
      {links.map((c) => (
        <line
          key={`${c.label}-link`}
          x1={center.x}
          y1={center.y}
          x2={c.x}
          y2={c.y}
          stroke="var(--signal)"
          strokeWidth="1.4"
          strokeOpacity="0.35"
        />
      ))}

      {/* flowing particles along links */}
      {links.map((c) => (
        <circle key={`${c.label}-pulse`} r="3" fill="var(--signal)" className="ec-flow">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            begin={`${c.i * 1}s`}
            path={`M ${center.x} ${center.y} L ${c.x} ${c.y}`}
          />
        </circle>
      ))}

      {/* central hub — prominent */}
      <circle cx={center.x} cy={center.y} r="62" fill="url(#ec-core)" />
      <circle cx={center.x} cy={center.y} r="40" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="1.4" />
      <circle cx={center.x} cy={center.y} r="13" fill="var(--signal)" className="ec-hub" />
      <text
        x={center.x}
        y={center.y + 34}
        textAnchor="middle"
        fill="var(--text-muted)"
        fontSize="9"
        fontFamily="var(--font-mono), monospace"
        letterSpacing="1.5"
      >
        EASECITY
      </text>

      {/* capability cores — larger, readable labels */}
      {cores.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r="56" fill="url(#ec-core)" stroke="var(--signal)" strokeOpacity="0.4" strokeWidth="1.1" />
          <text
            x={c.x}
            y={c.y - 2}
            textAnchor="middle"
            fill="var(--text-primary)"
            fontSize="19"
            fontWeight="700"
            fontFamily="var(--font-display), system-ui, sans-serif"
            letterSpacing="0.5"
          >
            {c.label}
          </text>
          <text
            x={c.x}
            y={c.y + 18}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="11"
            fontFamily="var(--font-mono), monospace"
          >
            {c.sub}
          </text>
        </g>
      ))}

      {/* EC-Share product tag — placed clear of orbit + cores */}
      <g className="ec-tag">
        <rect x="428" y="248" width="118" height="56" rx="10" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.45" strokeWidth="1" />
        <text x="442" y="272" fill="var(--signal)" fontSize="9" fontWeight="700" fontFamily="var(--font-mono), monospace" letterSpacing="1.2">
          PRODUCT
        </text>
        <text x="442" y="292" fill="var(--text-primary)" fontSize="16" fontWeight="700" fontFamily="var(--font-display), system-ui, sans-serif">
          EC-Share
        </text>
      </g>

      <style jsx>{`
        .ec-flow { filter: drop-shadow(0 0 4px var(--signal)); }
        .ec-hub { animation: ec-hub-pulse 2.6s ease-in-out infinite; transform-origin: ${center.x}px ${center.y}px; }
        .ec-tag { animation: ec-tag-float 4s ease-in-out infinite; }
        @keyframes ec-hub-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes ec-tag-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ec-flow, .ec-hub, .ec-tag { animation: none !important; opacity: 0.8; }
          .ec-flow animateMotion { display: none; }
        }
      `}</style>
    </svg>
  )
}