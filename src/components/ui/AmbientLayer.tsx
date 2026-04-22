'use client'

/**
 * AmbientLayer — the site's "heartbeat."
 *
 * A global, fixed-position, pointer-event-free layer that sits BEHIND
 * the main content and continuously shows that the system is alive:
 *
 *   1. Aurora mesh — two counter-rotating conic gradient layers tinted
 *      with signal-green and a touch of data-cyan. ~3-8% opacity overall.
 *      No JS; pure CSS animation on pseudo-elements.
 *
 *   2. Signal constellation — an SVG network of anchor nodes connected
 *      by curved paths. Data packets (dashed pulses) continuously drift
 *      along each edge, each at a different rate, so the pattern never
 *      feels looped. Each node gently breathes.
 *
 * Motion stops entirely when the user prefers reduced motion (via
 * `.ambient-motion` wrapper — see globals.css).
 */
export function AmbientLayer() {
  const nodes = [
    { id: 'n1', cx: 8, cy: 18, r: 2.8 },
    { id: 'n2', cx: 32, cy: 62, r: 2.2 },
    { id: 'n3', cx: 58, cy: 26, r: 2.6 },
    { id: 'n4', cx: 82, cy: 70, r: 2.4 },
    { id: 'n5', cx: 92, cy: 15, r: 2.0 },
    { id: 'n6', cx: 18, cy: 85, r: 2.4 },
  ]

  // Curved edges — each is a path between two node centres, bowed slightly.
  const edges = [
    { from: 'n1', to: 'n3', via: { cx: 35, cy: 8 }, speed: 8 },
    { from: 'n3', to: 'n5', via: { cx: 75, cy: 8 }, speed: 11 },
    { from: 'n1', to: 'n2', via: { cx: 22, cy: 38 }, speed: 9 },
    { from: 'n2', to: 'n4', via: { cx: 58, cy: 78 }, speed: 14 },
    { from: 'n3', to: 'n4', via: { cx: 70, cy: 52 }, speed: 12 },
    { from: 'n2', to: 'n6', via: { cx: 20, cy: 80 }, speed: 10 },
  ]

  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]))

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[1] ambient-motion overflow-hidden"
    >
      {/* Aurora gradient mesh */}
      <div className="aurora-mesh" />

      {/* Signal constellation SVG — sized by viewport, coordinates are % */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="ambientNodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22ff88" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#22ff88" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22ff88" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Edges — idle thin lines */}
        {edges.map((e, i) => {
          const from = nodeById[e.from]
          const to = nodeById[e.to]
          if (!from || !to) return null
          const d = `M ${from.cx} ${from.cy} Q ${e.via.cx} ${e.via.cy} ${to.cx} ${to.cy}`
          return (
            <g key={i}>
              {/* idle track */}
              <path
                d={d}
                fill="none"
                stroke="#22ff88"
                strokeWidth="0.08"
                strokeOpacity="0.18"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {/* drifting packet */}
              <path
                d={d}
                fill="none"
                stroke="#22ff88"
                strokeWidth="0.14"
                strokeOpacity="0.55"
                strokeLinecap="round"
                strokeDasharray="0.6 3.2"
                vectorEffect="non-scaling-stroke"
                style={{
                  animation: `signalPacket ${e.speed}s linear infinite`,
                  animationDelay: `${-i * 1.4}s`,
                }}
              />
            </g>
          )
        })}

        {/* Nodes — breathing dots */}
        {nodes.map((n, i) => (
          <g key={n.id}>
            {/* outer glow */}
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r * 2.4}
              fill="url(#ambientNodeGlow)"
              style={{
                transformOrigin: `${n.cx}px ${n.cy}px`,
                animation: `breathe ${3.4 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${-i * 0.5}s`,
              }}
              opacity={0.35}
            />
            {/* core */}
            <circle
              cx={n.cx}
              cy={n.cy}
              r={n.r * 0.25}
              fill="#22ff88"
              opacity={0.7}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
