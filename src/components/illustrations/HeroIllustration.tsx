'use client'

/**
 * EC-Share hero illustration — a product "device farm" scene: a central
 * monitor running the EC-Share dashboard (sidebar + 3×2 device grid),
 * surrounded by physical Android phones/tablets with "已連線" labels, linked
 * by signal cables, above a full feature strip. Symmetric layout, animated
 * data pulses along cables, breathing connection dots. Pure SVG + CSS vars,
 * theme-aware. Brand teal (--signal) replaces the reference blue.
 */

interface Device {
  x: number
  y: number
  kind: 'phone' | 'tablet'
  wall: [string, string]
}

// Symmetric: 3 devices each side, mirrored.
const DEVICES: Device[] = [
  { x: 122, y: 122, kind: 'phone', wall: ['#38bdf8', '#2563eb'] },
  { x: 112, y: 268, kind: 'tablet', wall: ['#34d399', '#059669'] },
  { x: 122, y: 418, kind: 'phone', wall: ['#f472b6', '#e11d48'] },
  { x: 778, y: 122, kind: 'phone', wall: ['#a78bfa', '#7c3aed'] },
  { x: 788, y: 268, kind: 'tablet', wall: ['#fbbf24', '#f59e0b'] },
  { x: 778, y: 418, kind: 'phone', wall: ['#22d3ee', '#0891b2'] },
]

const GRID_CELLS = [
  ['#38bdf8', '#2563eb'], ['#34d399', '#059669'], ['#f472b6', '#e11d48'],
  ['#a78bfa', '#7c3aed'], ['#fbbf24', '#f59e0b'], ['#22d3ee', '#0891b2'],
]

const FEATURES = [
  { icon: 'grid', label: '多設備查看' },
  { icon: 'cursor', label: '遠端控制' },
  { icon: 'camera', label: '截圖錄影' },
  { icon: 'folder', label: '檔案管理' },
  { icon: 'gear', label: '設備管理' },
]

function phoneDims(w: number, h: number) {
  return { w, h, rx: w * 0.16, screenW: w * 0.8, screenH: h * 0.8, screenRx: w * 0.08 }
}

export function HeroIllustration() {
  // central monitor (with full stand)
  const mon = { x: 268, y: 96, w: 364, h: 256 }
  const monCx = mon.x + mon.w / 2
  const monCy = mon.y + mon.h / 2

  return (
    <svg viewBox="0 0 900 620" fill="none" aria-hidden="true" className="mx-auto w-full">
      <defs>
        <linearGradient id="ec-monitor-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02" />
        </linearGradient>
        {GRID_CELLS.map((c, i) => (
          <linearGradient key={`gc${i}`} id={`ec-wall-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c[0]} />
            <stop offset="100%" stopColor={c[1]} />
          </linearGradient>
        ))}
        {DEVICES.map((d, i) => (
          <linearGradient key={`dw${i}`} id={`ec-devwall-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={d.wall[0]} />
            <stop offset="100%" stopColor={d.wall[1]} />
          </linearGradient>
        ))}
      </defs>

      {/* ambient glow behind monitor */}
      <ellipse cx={monCx} cy={monCy} rx="250" ry="190" fill="url(#ec-monitor-bg)" />

      {/* ── cables + animated pulses: device → monitor ── */}
      {DEVICES.map((d, i) => {
        // connect from device edge toward monitor center
        const fromX = d.x
        const fromY = d.y
        const midX = (fromX + monCx) / 2
        const midY = (fromY + monCy) / 2
        return (
          <g key={`cable-${i}`}>
            <path
              d={`M ${fromX} ${fromY} Q ${midX} ${midY - 14} ${monCx} ${monCy}`}
              stroke="var(--signal)"
              strokeWidth="1.6"
              strokeOpacity="0.4"
              fill="none"
            />
            <circle r="2.6" fill="var(--signal)" className="ec-pulse">
              <animateMotion
                dur={`${2.4 + (i % 3) * 0.6}s`}
                repeatCount="indefinite"
                begin={`${(i % 4) * 0.5}s`}
                path={`M ${fromX} ${fromY} Q ${midX} ${midY - 14} ${monCx} ${monCy}`}
              />
            </circle>
          </g>
        )
      })}

      {/* ── central monitor ── */}
      <g>
        <rect x={mon.x} y={mon.y} width={mon.w} height={mon.h} rx="14" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <rect x={mon.x + 10} y={mon.y + 10} width={mon.w - 20} height={mon.h - 20} rx="8" fill="var(--bg-base)" stroke="var(--border-color)" />
        {/* sidebar */}
        <rect x={mon.x + 18} y={mon.y + 18} width="44" height={mon.h - 36} rx="6" fill="var(--bg-elevated)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`sb${i}`} x={mon.x + 30} y={mon.y + 32 + i * 32} width="20" height="12" rx="3" fill={i === 0 ? 'var(--signal)' : 'var(--border-strong)'} opacity={i === 0 ? 0.9 : 0.5} />
        ))}
        {/* 3×2 device grid */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const idx = row * 3 + col
            const gw = 80
            const gh = 62
            const gx = mon.x + 74 + col * (gw + 6)
            const gy = mon.y + 30 + row * (gh + 8)
            return (
              <g key={`cell-${idx}`}>
                <rect x={gx} y={gy} width={gw} height={gh} rx="7" fill="var(--bg-elevated)" stroke="var(--border-color)" />
                <rect x={gx + 5} y={gy + 5} width={gw - 10} height={gh - 16} rx="4" fill={`url(#ec-wall-${idx})`} opacity="0.85" />
                <rect x={gx + 10} y={gy + 10} width="18" height="5" rx="2.5" fill="#fff" opacity="0.85" />
                <circle cx={gx + 12} cy={gy + gh - 6} r="1.8" fill="var(--signal)" />
                <circle cx={gx + 20} cy={gy + gh - 6} r="1.8" fill="var(--border-strong)" />
                <circle cx={gx + 28} cy={gy + gh - 6} r="1.8" fill="var(--border-strong)" />
              </g>
            )
          })
        )}
        {/* full stand: neck + base */}
        <rect x={monCx - 16} y={mon.y + mon.h} width="32" height="26" rx="4" fill="var(--border-strong)" />
        <rect x={monCx - 52} y={mon.y + mon.h + 24} width="104" height="12" rx="6" fill="var(--border-strong)" />
        <rect x={monCx - 52} y={mon.y + mon.h + 34} width="104" height="5" rx="2.5" fill="var(--border-color)" opacity="0.7" />
      </g>

      {/* ── surrounding physical devices ── */}
      {DEVICES.map((d, i) => {
        const dims = d.kind === 'phone' ? phoneDims(50, 96) : phoneDims(92, 60)
        const labelAbove = d.kind === 'phone'
        return (
          <g key={`dev-${i}`} transform={`translate(${d.x}, ${d.y})`}>
            <rect x={-dims.w / 2} y={-dims.h / 2} width={dims.w} height={dims.h} rx={dims.rx} fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.3" />
            <rect x={-dims.screenW / 2} y={-dims.screenH / 2} width={dims.screenW} height={dims.screenH} rx={dims.screenRx} fill={`url(#ec-devwall-${i})`} />
            <rect x={-dims.screenW / 2 + 6} y={-dims.screenH / 2 + 8} width="16" height="4" rx="2" fill="#fff" opacity="0.85" />
            {d.kind === 'phone' && <rect x={-8} y={dims.h / 2 - 10} width="16" height="3" rx="1.5" fill="var(--border-strong)" />}
            {/* connected label — fixed above device center */}
            <g transform={`translate(0, ${-dims.h / 2 - 16})`}>
              <rect x="-34" y="-11" width="68" height="22" rx="11" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.5" />
              <circle cx="-22" cy="0" r="3" fill="var(--signal)" className="ec-dot" />
              <text x="-16" y="3.5" fontSize="10" fill="var(--text-primary)" fontFamily="var(--font-mono), monospace">已連線</text>
            </g>
          </g>
        )
      })}

      {/* ── bottom feature strip ── */}
      <g transform="translate(0, 548)">
        <rect x="150" y="0" width="600" height="60" rx="12" fill="var(--bg-surface)" stroke="var(--border-color)" />
        {FEATURES.map((f, i) => {
          const fx = 150 + 16 + i * 116
          return (
            <g key={`feat-${i}`} transform={`translate(${fx}, 12)`}>
              <circle cx="17" cy="17" r="15" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.4" />
              <FeatureIcon icon={f.icon} x={17} y={17} />
              <text x="42" y="22" fontSize="13" fill="var(--text-primary)" fontFamily="var(--font-body), sans-serif">{f.label}</text>
            </g>
          )
        })}
      </g>

      <style jsx>{`
        .ec-pulse { filter: drop-shadow(0 0 4px var(--signal)); }
        .ec-dot { animation: ec-blink 2s ease-in-out infinite; }
        @keyframes ec-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ec-dot { animation: none !important; opacity: 0.7; }
          .ec-pulse animateMotion { display: none; }
        }
      `}</style>
    </svg>
  )
}

function FeatureIcon({ icon, x, y }: { icon: string; x: number; y: number }) {
  const s = { stroke: 'var(--signal)', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const c = x
  const cy = y
  switch (icon) {
    case 'grid':
      return <g stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill}><rect x={c - 8} y={cy - 8} width="7" height="7" rx="1.5" /><rect x={c + 1} y={cy - 8} width="7" height="7" rx="1.5" /><rect x={c - 8} y={cy + 1} width="7" height="7" rx="1.5" /><rect x={c + 1} y={cy + 1} width="7" height="7" rx="1.5" /></g>
    case 'cursor':
      return <path d={`M ${c - 7} ${cy - 7} L ${c + 5} ${cy + 5} M ${c - 3} ${cy - 7} L ${c - 7} ${cy - 3} M ${c + 2} ${cy + 5} L ${c + 7} ${cy + 7}`} stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill} strokeLinecap={s.strokeLinecap} strokeLinejoin={s.strokeLinejoin} />
    case 'camera':
      return <g stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill}><rect x={c - 9} y={cy - 6} width="18" height="12" rx="2.5" /><circle cx={c} cy={cy} r="3.2" /></g>
    case 'folder':
      return <path d={`M ${c - 9} ${cy - 5} h3 l2 3 h12 v8 a2 2 0 0 1 -2 2 h-15 a2 2 0 0 1 -2 -2 z`} stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill} strokeLinecap={s.strokeLinecap} strokeLinejoin={s.strokeLinejoin} />
    case 'gear':
      return <g stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill}><circle cx={c} cy={cy} r="4" /><path d={`M ${c} ${cy - 8} v-1.5 M ${c} ${cy + 8} v1.5 M ${c - 8} ${cy} h-1.5 M ${c + 8} ${cy} h1.5`} strokeLinecap={s.strokeLinecap} /></g>
    default:
      return null
  }
}