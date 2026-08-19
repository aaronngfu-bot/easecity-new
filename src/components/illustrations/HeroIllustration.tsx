'use client'

/**
 * EC-Share hero illustration — a product "device farm" scene.
 * Central monitor runs the EC-Share dashboard (sidebar + 3×2 mirrored device
 * grid). Each surrounding physical phone/tablet shows a full UI (status bar,
 * app icons, home nav, a remote-operate cursor with click ripple) and its
 * monitor tile mirrors the same wallpaper + cursor, conveying "one hub drives
 * many devices". Cables route to the monitor's side edges (never through the
 * stand). Symmetric, animated, theme-aware; brand teal replaces reference blue.
 */

interface Device {
  x: number
  y: number
  kind: 'phone' | 'tablet'
  wall: [string, string]
  apps: string[] // icon accent colors
  cursor: { px: number; py: number } // cursor position (fraction of screen, -1..1)
}

const DEVICES: Device[] = [
  { x: 122, y: 122, kind: 'phone', wall: ['#38bdf8', '#2563eb'], apps: ['#fff', '#0ea5e9', '#f97316', '#22c55e'], cursor: { px: 0.3, py: -0.2 } },
  { x: 112, y: 268, kind: 'tablet', wall: ['#34d399', '#059669'], apps: ['#fff', '#8b5cf6', '#f43f5e', '#facc15', '#38bdf8', '#22c55e'], cursor: { px: -0.35, py: 0.3 } },
  { x: 122, y: 418, kind: 'phone', wall: ['#f472b6', '#e11d48'], apps: ['#fff', '#0ea5e9', '#22c55e', '#facc15'], cursor: { px: -0.25, py: -0.1 } },
  { x: 778, y: 122, kind: 'phone', wall: ['#a78bfa', '#7c3aed'], apps: ['#fff', '#f97316', '#0ea5e9', '#f43f5e'], cursor: { px: 0.1, py: 0.35 } },
  { x: 788, y: 268, kind: 'tablet', wall: ['#fbbf24', '#f59e0b'], apps: ['#fff', '#0ea5e9', '#22c55e', '#f43f5e', '#8b5cf6', '#f97316'], cursor: { px: 0.4, py: -0.3 } },
  { x: 778, y: 418, kind: 'phone', wall: ['#22d3ee', '#0891b2'], apps: ['#fff', '#22c55e', '#8b5cf6', '#f97316'], cursor: { px: -0.1, py: -0.35 } },
]

const FEATURES = [
  { icon: 'grid', label: '多設備查看' },
  { icon: 'cursor', label: '遠端控制' },
  { icon: 'camera', label: '截圖錄影' },
  { icon: 'folder', label: '檔案管理' },
  { icon: 'gear', label: '設備管理' },
]

function deviceFrame(kind: 'phone' | 'tablet') {
  return kind === 'phone'
    ? { w: 52, h: 100, rx: 9, screenPad: 4 }
    : { w: 96, h: 64, rx: 10, screenPad: 4 }
}

/**
 * Render device screen content (status bar, apps, home nav + remote cursor).
 * Shared by physical devices and mirrored monitor tiles so they stay in sync.
 */
function DeviceScreen({
  d,
  w,
  h,
  i,
  fontScale = 1,
}: {
  d: Device
  w: number
  h: number
  i: number
  fontScale?: number
}) {
  const cx = w / 2
  const cy = h / 2
  const cursorX = cx + d.cursor.px * (w / 2 - 4)
  const cursorY = cy + d.cursor.py * (h / 2 - 4)
  // app grid geometry
  const gap = 5
  const nCols = d.kind === 'phone' ? 2 : 3
  const nRows = d.kind === 'phone' ? 2 : 2
  const aw = (w - 14 - (nCols - 1) * gap) / nCols
  const ah = 16 * fontScale
  const gridY = 16 * fontScale + 5
  const apps = d.apps.length >= nCols * nRows ? d.apps.slice(0, nCols * nRows) : d.apps

  return (
    <>
      {/* status bar */}
      <rect x={3} y={3} width={w - 6} height={6 * fontScale} rx={3} fill="rgba(255,255,255,0.22)" />
      <rect x={w - 10} y={4.2} width={6 * fontScale} height={4 * fontScale} rx={1} fill="#fff" opacity="0.85" />
      {/* app icons */}
      {apps.map((c, ai) => {
        const r = Math.floor(ai / nCols)
        const cc = ai % nCols
        const ax = 6 + cc * (aw + gap)
        const ay = gridY + r * (ah + gap)
        return <rect key={`a${ai}`} x={ax} y={ay} width={aw} height={ah} rx={3} fill={c} opacity="0.92" />
      })}
      {/* remote cursor arrow + click ripple */}
      <g className="ec-cursor">
        <path
          d={`M ${cursorX} ${cursorY} l 4 9 l 2.4 -2.4 l 1.8 3.6 l -3 2.4 z`}
          fill="#fff"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="0.6"
        />
      </g>
      <circle cx={cursorX + 3} cy={cursorY + 7} r="3" fill="none" stroke="#fff" strokeWidth="1" className="ec-ripple" />
    </>
  )
}

export function HeroIllustration() {
  const mon = { x: 268, y: 96, w: 364, h: 256 }
  const monCx = mon.x + mon.w / 2

  return (
    <svg viewBox="0 0 900 620" fill="none" aria-hidden="true" className="mx-auto w-full">
      <defs>
        <linearGradient id="ec-monitor-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.02" />
        </linearGradient>
        {DEVICES.map((d, i) => (
          <linearGradient key={`dw${i}`} id={`ec-devwall-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={d.wall[0]} />
            <stop offset="100%" stopColor={d.wall[1]} />
          </linearGradient>
        ))}
      </defs>

      {/* ambient glow behind monitor */}
      <ellipse cx={monCx} cy={mon.y + mon.h / 2} rx="245" ry="185" fill="url(#ec-monitor-bg)" />

      {/* ── central monitor ── */}
      <g>
        <rect x={mon.x} y={mon.y} width={mon.w} height={mon.h} rx="14" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <rect x={mon.x + 10} y={mon.y + 10} width={mon.w - 20} height={mon.h - 20} rx="8" fill="var(--bg-base)" stroke="var(--border-color)" />
        {/* sidebar */}
        <rect x={mon.x + 18} y={mon.y + 18} width="42" height={mon.h - 36} rx="6" fill="var(--bg-elevated)" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={`sb${i}`} x={mon.x + 29} y={mon.y + 30 + i * 31} width="20" height="11" rx="3" fill={i === 0 ? 'var(--signal)' : 'var(--border-strong)'} opacity={i === 0 ? 0.9 : 0.5} />
        ))}
        {/* mirrored 3×2 device grid */}
        {DEVICES.map((d, idx) => {
          const row = Math.floor(idx / 3)
          const col = idx % 3
          const gw = 78
          const gh = 60
          const gx = mon.x + 72 + col * (gw + 5)
          const gy = mon.y + 28 + row * (gh + 7)
          return (
            <g key={`cell-${idx}`}>
              <rect x={gx} y={gy} width={gw} height={gh} rx="7" fill="var(--bg-elevated)" stroke="var(--border-color)" />
              {/* mirrored wallpaper + screen content */}
              <rect x={gx + 4} y={gy + 4} width={gw - 8} height={gh - 14} rx="4" fill={`url(#ec-devwall-${idx})`} opacity="0.9" />
              <g transform={`translate(${gx + 4}, ${gy + 4})`}>
                <DeviceScreen d={d} w={gw - 8} h={gh - 14} i={idx} fontScale={0.7} />
              </g>
              {/* color-coded corner dot matching the physical device */}
              <circle cx={gx + gw - 6} cy={gy + 6} r="3" fill={d.wall[0]} stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" />
              {/* tool dots */}
              <circle cx={gx + 3} cy={gy + gh - 6} r="1.6" fill="var(--signal)" />
              <circle cx={gx + 10} cy={gy + gh - 6} r="1.6" fill="var(--border-strong)" />
              <circle cx={gx + 17} cy={gy + gh - 6} r="1.6" fill="var(--border-strong)" />
            </g>
          )
        })}
        {/* full stand: neck + base (drawn under the cables) */}
        <rect x={monCx - 15} y={mon.y + mon.h} width="30" height="24" rx="4" fill="var(--border-strong)" />
        <rect x={monCx - 54} y={mon.y + mon.h + 22} width="108" height="12" rx="6" fill="var(--border-strong)" />
        <rect x={monCx - 54} y={mon.y + mon.h + 32} width="108" height="5" rx="2.5" fill="var(--border-color)" opacity="0.7" />
      </g>

      {/* ── cables: device side → monitor side edge (avoid the stand) ── */}
      {DEVICES.map((d, i) => {
        const left = d.x < 450
        const edgeX = left ? mon.x : mon.x + mon.w
        const edgeY = mon.y + 60 + (i % 3) * 70
        const midX = (d.x + edgeX) / 2
        return (
          <g key={`cable-${i}`}>
            <path
              d={`M ${d.x} ${d.y} C ${midX} ${d.y + 8}, ${midX} ${edgeY - 8}, ${edgeX} ${edgeY}`}
              stroke="var(--signal)"
              strokeWidth="1.5"
              strokeOpacity="0.38"
              fill="none"
            />
            <circle r="2.4" fill="var(--signal)" className="ec-pulse">
              <animateMotion
                dur={`${2.4 + (i % 3) * 0.6}s`}
                repeatCount="indefinite"
                begin={`${(i % 4) * 0.5}s`}
                path={`M ${d.x} ${d.y} C ${midX} ${d.y + 8}, ${midX} ${edgeY - 8}, ${edgeX} ${edgeY}`}
              />
            </circle>
          </g>
        )
      })}

      {/* ── surrounding physical devices ── */}
      {DEVICES.map((d, i) => {
        const f = deviceFrame(d.kind)
        return (
          <g key={`dev-${i}`} transform={`translate(${d.x}, ${d.y})`}>
            {/* body */}
            <rect x={-f.w / 2} y={-f.h / 2} width={f.w} height={f.h} rx={f.rx} fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.4" />
            {/* side buttons */}
            {d.kind === 'phone' && (
              <>
                <rect x={f.w / 2} y={-10} width="2" height="10" rx="1" fill="var(--border-strong)" />
                <rect x={f.w / 2} y={4} width="2" height="6" rx="1" fill="var(--border-strong)" />
              </>
            )}
            {/* screen */}
            <rect x={-f.w / 2 + f.screenPad} y={-f.h / 2 + f.screenPad} width={f.w - f.screenPad * 2} height={f.h - f.screenPad * 2} rx={f.rx * 0.6} fill={`url(#ec-devwall-${i})`} />
            {/* punch-hole camera */}
            <circle cx={0} cy={-f.h / 2 + f.screenPad + 6} r="2.2" fill="rgba(0,0,0,0.5)" />
            {/* screen content */}
            <g transform={`translate(${-f.w / 2 + f.screenPad}, ${-f.h / 2 + f.screenPad})`}>
              <DeviceScreen d={d} w={f.w - f.screenPad * 2} h={f.h - f.screenPad * 2} i={i} fontScale={0.85} />
            </g>
            {/* home indicator (phone) */}
            {d.kind === 'phone' && <rect x={-7} y={f.h / 2 - 10} width="14" height="3" rx="1.5" fill="var(--border-strong)" />}
            {/* connected label */}
            <g transform={`translate(0, ${-f.h / 2 - 16})`}>
              <rect x="-34" y="-11" width="68" height="22" rx="11" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.5" />
              <circle cx="-22" cy="0" r="3" fill="var(--signal)" className="ec-dot" />
              <text x="-15" y="3.5" fontSize="10" fill="var(--text-primary)" fontFamily="var(--font-mono), monospace">已連線</text>
            </g>
            {/* color-coded index dot matching the monitor tile */}
            <circle cx={-f.w / 2 - 10} cy={0} r="4" fill={d.wall[0]} stroke="var(--border-strong)" strokeWidth="1" />
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
        .ec-cursor { animation: ec-cursor-nudge 2.8s ease-in-out infinite; }
        .ec-ripple { animation: ec-ripple 2.8s ease-in-out infinite; transform-origin: center; }
        @keyframes ec-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @keyframes ec-cursor-nudge {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(1.5px, 1.5px); }
        }
        @keyframes ec-ripple {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          40% { opacity: 0.9; transform: scale(1); }
          60% { opacity: 0.4; transform: scale(1.3); }
          80% { opacity: 0; transform: scale(1.6); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ec-dot, .ec-cursor, .ec-ripple { animation: none !important; opacity: 0.7; }
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