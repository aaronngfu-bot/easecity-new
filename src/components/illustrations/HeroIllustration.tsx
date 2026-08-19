'use client'

/**
 * EC-Share hero illustration — a product-style "device farm" scene matching
 * the reference mockup: a central monitor running the EC-Share dashboard
 * (sidebar + 3×2 device grid), surrounded by physical Android phones/tablets
 * with "connected" labels, linked by cables, plus a bottom feature strip.
 * Pure SVG + CSS variables so it follows the theme. Brand teal (--signal)
 * replaces the reference's blue; device wallpapers keep distinct hues.
 */

interface Device {
  x: number
  y: number
  kind: 'phone' | 'tablet'
  wall: [string, string] // gradient stops
}

const DEVICES: Device[] = [
  { x: 128, y: 172, kind: 'phone', wall: ['#38bdf8', '#2563eb'] },
  { x: 770, y: 150, kind: 'tablet', wall: ['#34d399', '#059669'] },
  { x: 140, y: 406, kind: 'phone', wall: ['#f472b6', '#e11d48'] },
  { x: 778, y: 300, kind: 'phone', wall: ['#a78bfa', '#7c3aed'] },
  { x: 755, y: 408, kind: 'tablet', wall: ['#fbbf24', '#f59e0b'] },
]

const GRID_CELLS = [
  ['#38bdf8', '#2563eb'], ['#34d399', '#059669'], ['#f472b6', '#e11d48'],
  ['#a78bfa', '#7c3aed'], ['#fbbf24', '#f59e0b'], ['#22d3ee', '#0891b2'],
]

function phoneBody(w: number, h: number) {
  return { w, h, rx: w * 0.16, screenW: w * 0.8, screenH: h * 0.82, screenRx: w * 0.08 }
}

export function HeroIllustration() {
  // central monitor geometry
  const mon = { x: 268, y: 96, w: 364, h: 268 }

  const features = [
    { icon: 'grid', label: '多設備查看' },
    { icon: 'cursor', label: '遠端控制' },
    { icon: 'camera', label: '截圖錄影' },
    { icon: 'folder', label: '檔案管理' },
    { icon: 'gear', label: '設備管理' },
  ]

  return (
    <svg viewBox="0 0 900 560" fill="none" aria-hidden="true" className="mx-auto w-full">
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
      <ellipse cx={mon.x + mon.w / 2} cy={mon.y + mon.h / 2} rx="260" ry="200" fill="url(#ec-monitor-bg)" />

      {/* ── cables: each device → monitor edge ── */}
      {DEVICES.map((d, i) => {
        const from = { x: d.x, y: d.y }
        const to = {
          x: mon.x + mon.w / 2,
          y: mon.y + mon.h / 2,
        }
        const mx = (from.x + to.x) / 2
        return (
          <path
            key={`cable-${i}`}
            d={`M ${from.x} ${from.y} Q ${mx} ${from.y + 20} ${to.x} ${to.y}`}
            stroke="var(--signal)"
            strokeWidth="1.8"
            strokeOpacity="0.55"
            fill="none"
          />
        )
      })}

      {/* ── central monitor ── */}
      <g>
        {/* monitor body */}
        <rect x={mon.x} y={mon.y} width={mon.w} height={mon.h} rx="14" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
        {/* screen */}
        <rect x={mon.x + 10} y={mon.y + 10} width={mon.w - 20} height={mon.h - 20} rx="8" fill="var(--bg-base)" stroke="var(--border-color)" />
        {/* sidebar */}
        <rect x={mon.x + 18} y={mon.y + 18} width="44" height={mon.h - 36} rx="6" fill="var(--bg-elevated)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`sb${i}`} x={mon.x + 30} y={mon.y + 30 + i * 34} width="20" height="12" rx="3" fill={i === 0 ? 'var(--signal)' : 'var(--border-strong)'} opacity={i === 0 ? 0.9 : 0.5} />
        ))}
        {/* status text in sidebar bottom */}
        <rect x={mon.x + 26} y={mon.y + mon.h - 40} width="28" height="6" rx="3" fill="var(--signal)" opacity="0.6" />

        {/* 3×2 device grid in main area */}
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => {
            const idx = row * 3 + col
            const gw = 82
            const gh = 64
            const gx = mon.x + 74 + col * (gw + 8)
            const gy = mon.y + 26 + row * (gh + 10)
            return (
              <g key={`cell-${idx}`}>
                <rect x={gx} y={gy} width={gw} height={gh} rx="7" fill="var(--bg-elevated)" stroke="var(--border-color)" />
                {/* wallpaper */}
                <rect x={gx + 5} y={gy + 5} width={gw - 10} height={gh - 16} rx="4" fill={`url(#ec-wall-${idx})`} opacity="0.85" />
                {/* clock */}
                <rect x={gx + 10} y={gy + 10} width="20" height="5" rx="2.5" fill="#fff" opacity="0.85" />
                {/* tool dots */}
                <circle cx={gx + 12} cy={gy + gh - 6} r="1.8" fill="var(--signal)" />
                <circle cx={gx + 20} cy={gy + gh - 6} r="1.8" fill="var(--border-strong)" />
                <circle cx={gx + 28} cy={gy + gh - 6} r="1.8" fill="var(--border-strong)" />
              </g>
            )
          })
        )}

        {/* monitor stand */}
        <rect x={mon.x + mon.w / 2 - 30} y={mon.y + mon.h} width="60" height="14" rx="4" fill="var(--border-strong)" />
        <rect x={mon.x + mon.w / 2 - 12} y={mon.y + mon.h + 14} width="24" height="8" rx="2" fill="var(--border-color)" />
      </g>

      {/* ── surrounding physical devices ── */}
      {DEVICES.map((d, i) => {
        const dims = d.kind === 'phone' ? phoneBody(50, 100) : phoneBody(96, 62)
        return (
          <g key={`dev-${i}`} transform={`translate(${d.x}, ${d.y})`}>
            {/* body */}
            <rect x={-dims.w / 2} y={-dims.h / 2} width={dims.w} height={dims.h} rx={dims.rx} fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.3" />
            {/* screen */}
            <rect x={-dims.screenW / 2} y={-dims.screenH / 2} width={dims.screenW} height={dims.screenH} rx={dims.screenRx} fill={`url(#ec-devwall-${i})`} />
            {/* clock */}
            <rect x={-dims.screenW / 2 + 6} y={-dims.screenH / 2 + 8} width="16" height="4" rx="2" fill="#fff" opacity="0.85" />
            {/* home indicator (phone only) */}
            {d.kind === 'phone' && <rect x={-8} y={dims.h / 2 - 10} width="16" height="3" rx="1.5" fill="var(--border-strong)" />}
            {/* connected label */}
            <g transform={`translate(${d.kind === 'phone' ? dims.w / 2 - 2 : dims.w / 2 - 2}, ${-dims.h / 2 - 14})`}>
              <rect x="-40" y="-11" width="82" height="22" rx="11" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.5" />
              <circle cx="-28" cy="0" r="3" fill="var(--signal)" className="hi-dot" />
              <text x="-22" y="3.5" fontSize="10" fill="var(--text-primary)" fontFamily="var(--font-mono), monospace">已連線</text>
            </g>
          </g>
        )
      })}

      {/* ── bottom feature strip ── */}
      <g transform="translate(0, 514)">
        <rect x="150" y="0" width="600" height="58" rx="12" fill="var(--bg-surface)" stroke="var(--border-color)" />
        {features.map((f, i) => {
          const fx = 150 + 18 + i * 116
          return (
            <g key={`feat-${i}`} transform={`translate(${fx}, 11)`}>
              <circle cx="15" cy="15" r="14" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.4" />
              <FeatureIcon icon={f.icon} x={15} y={15} />
              <text x="38" y="20" fontSize="13" fill="var(--text-primary)" fontFamily="var(--font-body), sans-serif">{f.label}</text>
            </g>
          )
        })}
      </g>

      <style jsx>{`
        .hi-dot { animation: hi-blink 2s ease-in-out infinite; }
        @keyframes hi-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hi-dot { animation: none !important; opacity: 0.7; }
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
      return <g stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill}><rect x={c - 7} y={cy - 7} width="6" height="6" rx="1.5" /><rect x={c + 1} y={cy - 7} width="6" height="6" rx="1.5" /><rect x={c - 7} y={cy + 1} width="6" height="6" rx="1.5" /><rect x={c + 1} y={cy + 1} width="6" height="6" rx="1.5" /></g>
    case 'cursor':
      return <path d={`M ${c - 6} ${cy - 6} L ${c + 4} ${cy + 4} M ${c - 2} ${cy - 6} L ${c - 6} ${cy - 2} M ${c + 2} ${cy + 4} L ${c + 6} ${cy + 6}`} stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill} strokeLinecap={s.strokeLinecap} strokeLinejoin={s.strokeLinejoin} />
    case 'camera':
      return <g stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill}><rect x={c - 8} y={cy - 5} width="16" height="11" rx="2.5" /><circle cx={c} cy={cy + 0.5} r="3" /></g>
    case 'folder':
      return <path d={`M ${c - 8} ${cy - 4} h3 l2 3 h11 v7 a2 2 0 0 1 -2 2 h-14 a2 2 0 0 1 -2 -2 z`} stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill} strokeLinecap={s.strokeLinecap} strokeLinejoin={s.strokeLinejoin} />
    case 'gear':
      return <g stroke={s.stroke} strokeWidth={s.strokeWidth} fill={s.fill}><circle cx={c} cy={cy} r="3.5" /><path d={`M ${c} ${cy - 7} v-1 M ${c} ${cy + 7} v1 M ${c - 7} ${cy} h-1 M ${c + 7} ${cy} h1`} strokeLinecap={s.strokeLinecap} /></g>
    default:
      return null
  }
}