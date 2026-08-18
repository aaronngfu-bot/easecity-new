'use client'

/**
 * Hero illustration — abstract "multi-device mirroring" concept.
 * A desktop monitor showing three mirrored Android screens, the center
 * one focused (signal highlight). Pure SVG with CSS variables so it
 * follows dark/light theme automatically.
 */
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 800 360"
      fill="none"
      aria-hidden="true"
      className="mx-auto w-full max-w-3xl"
    >
      {/* Monitor body */}
      <rect
        x="120"
        y="40"
        width="560"
        height="300"
        rx="16"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
        fill="var(--bg-surface)"
      />
      {/* Monitor stand */}
      <rect x="360" y="340" width="80" height="12" rx="4" fill="var(--border-strong)" />
      <rect x="380" y="352" width="40" height="6" rx="3" fill="var(--border-color)" />

      {/* Screen inner */}
      <rect
        x="140"
        y="60"
        width="520"
        height="260"
        rx="10"
        fill="var(--bg-base)"
        stroke="var(--border-color)"
      />

      {/* Three phones */}
      {/* Phone 1 (left) */}
      <g>
        <rect x="185" y="100" width="130" height="190" rx="12" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <rect x="195" y="116" width="110" height="80" rx="4" fill="var(--bg-surface)" stroke="var(--border-color)" />
        <rect x="205" y="206" width="40" height="6" rx="3" fill="var(--border-strong)" />
        <rect x="205" y="220" width="70" height="6" rx="3" fill="var(--border-color)" />
        <rect x="205" y="234" width="55" height="6" rx="3" fill="var(--border-color)" />
      </g>

      {/* Phone 2 (center, focused) */}
      <g>
        <rect x="335" y="84" width="130" height="206" rx="12" fill="var(--bg-elevated)" stroke="var(--signal)" strokeWidth="2" />
        {/* glow ring */}
        <rect x="330" y="79" width="140" height="216" rx="14" stroke="var(--signal)" strokeWidth="0.5" opacity="0.4" />
        <rect x="345" y="100" width="110" height="88" rx="4" fill="var(--bg-surface)" stroke="var(--signal)" strokeWidth="0.8" opacity="0.9" />
        <rect x="355" y="200" width="40" height="6" rx="3" fill="var(--signal)" />
        <rect x="355" y="214" width="70" height="6" rx="3" fill="var(--border-strong)" />
        <rect x="355" y="228" width="55" height="6" rx="3" fill="var(--border-color)" />
        {/* focus indicator dot */}
        <circle cx="400" cy="268" r="4" fill="var(--signal)" />
      </g>

      {/* Phone 3 (right) */}
      <g>
        <rect x="485" y="100" width="130" height="190" rx="12" fill="var(--bg-elevated)" stroke="var(--border-strong)" strokeWidth="1.2" />
        <rect x="495" y="116" width="110" height="80" rx="4" fill="var(--bg-surface)" stroke="var(--border-color)" />
        <rect x="505" y="206" width="40" height="6" rx="3" fill="var(--border-strong)" />
        <rect x="505" y="220" width="70" height="6" rx="3" fill="var(--border-color)" />
        <rect x="505" y="234" width="55" height="6" rx="3" fill="var(--border-color)" />
      </g>

      {/* Connection lines from phones to monitor top */}
      <path d="M250 100 V76" stroke="var(--signal)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d="M400 84 V60" stroke="var(--signal)" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M550 100 V76" stroke="var(--signal)" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />

      {/* Status dots top-right of monitor */}
      <circle cx="640" cy="56" r="4" fill="var(--signal)" />
      <circle cx="656" cy="56" r="4" fill="var(--border-strong)" />
    </svg>
  )
}
