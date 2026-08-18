'use client'

/**
 * EaseCity brand mark — the "signal" motif (central node + four directional
 * satellites). Inline SVG driven by CSS variables so it follows light/dark
 * theme automatically: `var(--signal)` for the core/ticks, `var(--text-primary)`
 * for the satellite nodes. Transparent background — safe on any surface.
 */
export function BrandMark({
  className = '',
  size = 32,
}: {
  className?: string
  size?: number
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* rounded square frame */}
      <rect
        x="3.5"
        y="3.5"
        width="25"
        height="25"
        rx="7"
        stroke="var(--signal)"
        strokeOpacity="0.55"
        strokeWidth="1.6"
      />
      {/* four satellite nodes */}
      <circle cx="16" cy="8.2" r="1.9" fill="var(--text-primary)" fillOpacity="0.8" />
      <circle cx="23.8" cy="16" r="1.9" fill="var(--text-primary)" fillOpacity="0.8" />
      <circle cx="16" cy="23.8" r="1.9" fill="var(--text-primary)" fillOpacity="0.8" />
      <circle cx="8.2" cy="16" r="1.9" fill="var(--text-primary)" fillOpacity="0.8" />
      {/* connecting ticks */}
      <path
        d="M16 11v3M19 16h-3M16 21v-3M13 16h3"
        stroke="var(--signal)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {/* central node */}
      <circle cx="16" cy="16" r="3.2" fill="var(--signal)" />
    </svg>
  )
}