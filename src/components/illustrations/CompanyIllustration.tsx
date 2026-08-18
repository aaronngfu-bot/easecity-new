'use client'

/**
 * Company hero illustration — "connecting people and devices" concept.
 * A central hub node connected to surrounding device/person nodes via
 * dashed lines, with a subtle pulse animation on the hub.
 * Pure SVG with CSS variables, follows dark/light theme.
 */
export function CompanyIllustration() {
  return (
    <svg
      viewBox="0 0 800 320"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full max-w-3xl"
    >
      {/* Connection lines (dashed, from hub to nodes) */}
      <g stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="4 4" opacity="0.7">
        <path d="M400 160 L160 60" />
        <path d="M400 160 L640 60" />
        <path d="M400 160 L160 260" />
        <path d="M400 160 L640 260" />
        <path d="M400 160 L400 30" />
        <path d="M400 160 L400 290" />
      </g>

      {/* Central hub */}
      <circle cx="400" cy="160" r="40" fill="var(--signal-soft)" stroke="var(--signal)" strokeWidth="1.5" className="hub-pulse" />
      <circle cx="400" cy="160" r="14" fill="var(--signal)" />
      {/* hub icon — link/connection */}
      <path d="M394 160l4 4 8-8" stroke="var(--bg-base)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Node 1 (top) — monitor */}
      <g>
        <rect x="368" y="10" width="64" height="44" rx="6" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <rect x="392" y="54" width="16" height="6" rx="2" fill="var(--border-strong)" />
      </g>

      {/* Node 2 (top-left) — phone */}
      <g>
        <rect x="128" y="30" width="48" height="72" rx="6" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <rect x="136" y="40" width="32" height="30" rx="3" fill="var(--bg-surface)" stroke="var(--border-color)" />
      </g>

      {/* Node 3 (top-right) — phone */}
      <g>
        <rect x="608" y="30" width="48" height="72" rx="6" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <rect x="616" y="40" width="32" height="30" rx="3" fill="var(--bg-surface)" stroke="var(--border-color)" />
      </g>

      {/* Node 4 (bottom-left) — person/avatar */}
      <g>
        <circle cx="160" cy="260" r="16" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <path d="M144 284c0-9 7-16 16-16s16 7 16 16" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
      </g>

      {/* Node 5 (bottom-right) — person/avatar */}
      <g>
        <circle cx="640" cy="260" r="16" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <path d="M624 284c0-9 7-16 16-16s16 7 16 16" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
      </g>

      {/* Node 6 (bottom) — device */}
      <g>
        <rect x="372" y="280" width="56" height="30" rx="5" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <circle cx="400" cy="295" r="4" fill="var(--signal)" />
      </g>

      {/* Floating status dots on lines */}
      <circle cx="320" cy="110" r="3" fill="var(--signal)" className="dot-float" />
      <circle cx="480" cy="210" r="3" fill="var(--signal)" className="dot-float" style={{ animationDelay: '1.2s' }} />
      <circle cx="280" cy="210" r="3" fill="var(--signal)" className="dot-float" style={{ animationDelay: '2.1s' }} />
    </svg>
  )
}
