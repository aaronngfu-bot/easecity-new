'use client'

/**
 * Company hero illustration — "connecting people and devices" concept.
 * A central hub connected to six evenly-spaced nodes (devices + people)
 * arranged in a hexagon. Pure SVG with CSS variables, follows theme.
 */
export function CompanyIllustration() {
  // Hexagon node positions around center (400, 160), radius ~115
  const nodes = [
    { x: 400, y: 45, type: 'monitor' },
    { x: 500, y: 102, type: 'phone' },
    { x: 500, y: 218, type: 'person' },
    { x: 400, y: 275, type: 'device' },
    { x: 300, y: 218, type: 'person' },
    { x: 300, y: 102, type: 'phone' },
  ]

  const cx = 400
  const cy = 160

  return (
    <svg
      viewBox="0 0 800 320"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full max-w-3xl"
    >
      {/* Outer hexagon edges (node-to-node, faint) */}
      <g stroke="var(--border-color)" strokeWidth="0.8" opacity="0.6">
        {nodes.map((n, i) => {
          const next = nodes[(i + 1) % nodes.length]
          return (
            <line key={`edge-${i}`} x1={n.x} y1={n.y} x2={next.x} y2={next.y} />
          )
        })}
      </g>

      {/* Connection lines */}
      <g stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 4" opacity="0.7">
        {nodes.map((n) => (
          <line key={`${n.x}-${n.y}`} x1={cx} y1={cy} x2={n.x} y2={n.y} />
        ))}
      </g>

      {/* Central hub glow */}
      <circle cx={cx} cy={cy} r="58" fill="var(--signal)" opacity="0.08" />
      <circle cx={cx} cy={cy} r="42" fill="var(--signal-soft)" stroke="var(--signal)" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="16" fill="var(--signal)" />
      <path
        d="M392 160l5 5 11-11"
        stroke="var(--bg-base)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nodes */}
      {nodes.map((n) => (
        <g key={`node-${n.x}-${n.y}`} transform={`translate(${n.x}, ${n.y})`}>
          {n.type === 'monitor' && (
            <>
              <rect x="-34" y="-26" width="68" height="44" rx="6" fill="var(--bg-elevated)" stroke="var(--text-faint)" strokeWidth="1.2" />
              <rect x="-9" y="18" width="18" height="7" rx="2" fill="var(--text-faint)" />
            </>
          )}
          {n.type === 'phone' && (
            <>
              <rect x="-24" y="-36" width="48" height="72" rx="7" fill="var(--bg-elevated)" stroke="var(--text-faint)" strokeWidth="1.2" />
              <rect x="-16" y="-26" width="32" height="30" rx="3" fill="var(--bg-surface)" stroke="var(--border-color)" />
            </>
          )}
          {n.type === 'device' && (
            <>
              <rect x="-30" y="-18" width="60" height="36" rx="6" fill="var(--bg-elevated)" stroke="var(--text-faint)" strokeWidth="1.2" />
              <circle cx="0" cy="0" r="4" fill="var(--signal)" />
            </>
          )}
          {n.type === 'person' && (
            <>
              <circle cx="0" cy="-12" r="16" fill="var(--bg-elevated)" stroke="var(--text-faint)" strokeWidth="1.2" />
              <path d="M-16 22c0-9 7-16 16-16s16 7 16 16" fill="var(--bg-elevated)" stroke="var(--text-faint)" strokeWidth="1.2" />
            </>
          )}
        </g>
      ))}

      {/* Floating status dots on lines */}
      <circle cx="440" cy="105" r="3" fill="var(--signal)" className="dot-float" />
      <circle cx="360" cy="215" r="3" fill="var(--signal)" className="dot-float" style={{ animationDelay: '1.2s' }} />
      <circle cx="460" cy="205" r="3" fill="var(--signal)" className="dot-float" style={{ animationDelay: '2.1s' }} />
    </svg>
  )
}
