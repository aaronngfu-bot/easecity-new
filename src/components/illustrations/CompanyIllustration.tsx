'use client'

/**
 * Company hero illustration — a "service stack" concept.
 * Three layers from the ground up: System architecture → Web services → AI,
 * with particles flowing upward to convey "we build the layers".
 * Pure SVG + CSS animation (no scroll-triggered opacity), theme-aware.
 */
export function CompanyIllustration() {
  const layers = [
    { y: 232, h: 72, label: 'SYSTEM ARCHITECTURE', sub: 'Low-latency · API-first · resilient' },
    { y: 150, h: 72, label: 'WEB SERVICES', sub: 'Platforms · billing · dashboards' },
    { y: 68, h: 72, label: 'AI', sub: 'Prediction · automation · insight' },
  ]

  return (
    <svg
      viewBox="0 0 760 360"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full"
    >
      <defs>
        <linearGradient id="ec-layer" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* ── grounded baseline ── */}
      <line x1="60" y1="316" x2="700" y2="316" stroke="var(--border-color)" strokeWidth="1.5" />

      {/* ── three layers ── */}
      {layers.map((l, i) => (
        <g key={l.label}>
          <rect
            x="120"
            y={l.y}
            width="380"
            height={l.h}
            rx="12"
            fill="var(--bg-surface)"
            stroke={i === 0 ? 'var(--signal)' : 'var(--border-strong)'}
            strokeWidth={i === 0 ? 1.6 : 1}
            opacity={1 - i * 0.12}
          />
          {/* layer label */}
          <text
            x="150"
            y={l.y + 30}
            fill={i === 0 ? 'var(--signal)' : 'var(--text-primary)'}
            fontSize="15"
            fontWeight="700"
            fontFamily="var(--font-display), system-ui, sans-serif"
            letterSpacing="0.5"
          >
            {l.label}
          </text>
          <text
            x="150"
            y={l.y + 52}
            fill="var(--text-muted)"
            fontSize="11"
            fontFamily="var(--font-mono), monospace"
          >
            {l.sub}
          </text>

          {/* right-side status dots per layer */}
          {[0, 1, 2].map((d) => (
            <circle key={`${l.label}-${d}`} cx={470 + d * 18} cy={l.y + 36} r="3" fill="var(--signal)" opacity={0.8 - d * 0.25} className="ec-pulse-dot" style={{ animationDelay: `${(i + d) * 0.4}s` }} />
          ))}
        </g>
      ))}

      {/* ── upward particles connecting layers ── */}
      {[
        { x: 160, begin: 0 },
        { x: 240, begin: 0.8 },
        { x: 320, begin: 1.6 },
      ].map((p) => (
        <circle key={`p-${p.x}`} r="3" fill="var(--signal)" className="ec-rise">
          <animateMotion
            dur="3.2s"
            repeatCount="indefinite"
            begin={`${p.begin}s`}
            path={`M ${p.x} 300 L ${p.x} 60`}
          />
        </circle>
      ))}

      {/* ── right annotation: product tag ── */}
      <g>
        <rect x="540" y="150" width="160" height="108" rx="12" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.4" strokeWidth="1" />
        <text x="560" y="180" fill="var(--signal)" fontSize="11" fontWeight="700" fontFamily="var(--font-mono), monospace" letterSpacing="1.5">
          OUR PRODUCT
        </text>
        <text x="560" y="204" fill="var(--text-primary)" fontSize="16" fontWeight="700" fontFamily="var(--font-display), system-ui, sans-serif">
          EC-Share
        </text>
        <text x="560" y="226" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono), monospace">
          Android mirroring
        </text>
        <text x="560" y="244" fill="var(--text-muted)" fontSize="11" fontFamily="var(--font-mono), monospace">
          for device teams
        </text>
      </g>
      {/* connector from stack to product */}
      <line x1="500" y1="204" x2="540" y2="204" stroke="var(--signal)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />

      <style jsx>{`
        .ec-rise {
          filter: drop-shadow(0 0 4px var(--signal));
        }
        .ec-pulse-dot {
          animation: ec-dot-pulse 2.6s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes ec-dot-pulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 0.25; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ec-rise, .ec-pulse-dot { animation: none !important; opacity: 0.7; }
          .ec-rise animateMotion { display: none; }
        }
      `}</style>
    </svg>
  )
}