'use client'

/**
 * EC-Share hero illustration — a product "device farm" scene.
 * Central monitor runs the EC-Share dashboard (sidebar + 3×2 mirrored device
 * grid). Each surrounding physical phone/tablet shows an in-progress operation
 * (browsing files, chat, video, browser, gallery, settings) with a remote
 * cursor; the monitor tile mirrors the same activity so the "one hub drives
 * many devices" story reads instantly. Cables route to the monitor's side
 * edges. Symmetric, animated, theme-aware; brand teal replaces reference blue.
 */

type Activity = 'files' | 'chat' | 'video' | 'browser' | 'gallery' | 'settings'

interface Device {
  x: number
  y: number
  kind: 'phone' | 'tablet'
  wall: [string, string]
  activity: Activity
  label: string // operation label shown above the device
  cursor: { px: number; py: number }
}

const DEVICES: Device[] = [
  { x: 122, y: 122, kind: 'phone', wall: ['#38bdf8', '#2563eb'], activity: 'browser', label: '瀏覽網頁', cursor: { px: 0.15, py: -0.25 } },
  { x: 112, y: 268, kind: 'tablet', wall: ['#34d399', '#059669'], activity: 'files', label: '瀏覽文件', cursor: { px: -0.3, py: 0.2 } },
  { x: 122, y: 418, kind: 'phone', wall: ['#f472b6', '#e11d48'], activity: 'chat', label: '聊天中', cursor: { px: 0.25, py: 0.3 } },
  { x: 778, y: 122, kind: 'phone', wall: ['#a78bfa', '#7c3aed'], activity: 'video', label: '播放中', cursor: { px: 0, py: 0 } },
  { x: 788, y: 268, kind: 'tablet', wall: ['#fbbf24', '#f59e0b'], activity: 'gallery', label: '查看相簿', cursor: { px: 0.3, py: -0.3 } },
  { x: 778, y: 418, kind: 'phone', wall: ['#22d3ee', '#0891b2'], activity: 'settings', label: '調整設定', cursor: { px: -0.2, py: -0.2 } },
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

/** The "in-progress operation" rendered inside a device screen. */
function ActivityContent({ activity, w, h, s = 1 }: { activity: Activity; w: number; h: number; s?: number }) {
  const cx = w / 2
  const cy = h / 2
  switch (activity) {
    case 'files':
      // file list rows: icon square + two text lines × 3
      return (
        <>
          {[0, 1, 2].map((r) => {
            const y = 10 * s + r * 16 * s
            return (
              <g key={`f${r}`}>
                <rect x={4} y={y} width={9 * s} height={9 * s} rx={2} fill="rgba(255,255,255,0.35)" />
                <rect x={15 * s + 3} y={y + 0.5} width={w - 22 * s} height={3 * s} rx={1.5} fill="#fff" opacity="0.85" />
                <rect x={15 * s + 3} y={y + 5 * s} width={w - 30 * s} height={2.5 * s} rx={1.25} fill="#fff" opacity="0.5" />
              </g>
            )
          })}
        </>
      )
    case 'chat':
      return (
        <>
          <rect x={4} y={8 * s} width={w * 0.6} height={9 * s} rx={4 * s} fill="#fff" opacity="0.85" />
          <rect x={w - 4 - w * 0.55} y={20 * s} width={w * 0.55} height={9 * s} rx={4 * s} fill="rgba(255,255,255,0.5)" />
          <rect x={4} y={32 * s} width={w * 0.55} height={9 * s} rx={4 * s} fill="#fff" opacity="0.85" />
          <rect x={4} y={h - 9 * s - 2} width={w - 20 * s} height={7 * s} rx={3.5 * s} fill="rgba(255,255,255,0.3)" />
        </>
      )
    case 'video':
      return (
        <>
          <rect x={2} y={6 * s} width={w - 4} height={h - 18 * s} rx={3} fill="rgba(0,0,0,0.35)" />
          <polygon points={`${cx - 4 * s},${cy - 7 * s} ${cx + 7 * s},${cy} ${cx - 4 * s},${cy + 7 * s}`} fill="#fff" opacity="0.95" />
          <rect x={4} y={h - 8 * s} width={w - 8} height={3 * s} rx={1.5} fill="rgba(255,255,255,0.35)" />
          <rect x={4} y={h - 8 * s} width={(w - 8) * 0.55} height={3 * s} rx={1.5} fill="#fff" opacity="0.85" />
        </>
      )
    case 'browser':
      return (
        <>
          <rect x={3} y={5 * s} width={w - 6} height={9 * s} rx={4.5 * s} fill="rgba(255,255,255,0.25)" />
          <rect x={7 * s} y={7.5 * s} width={w - 10 * s} height={4 * s} rx={2} fill="#fff" opacity="0.55" />
          <rect x={3} y={18 * s} width={(w - 6) * 0.7} height={10 * s} rx={2} fill="#fff" opacity="0.12" />
          {[0, 1, 2, 3].map((r) => (
            <rect key={`l${r}`} x={3} y={31 * s + r * 8 * s} width={w - 6} height={3 * s} rx={1.5} fill="#fff" opacity="0.4" />
          ))}
        </>
      )
    case 'gallery':
      return (
        <>
          {[0, 1, 2].map((r) =>
            [0, 1].map((c) => (
              <rect
                key={`g${r}-${c}`}
                x={3 + c * (w / 2 - 1)}
                y={6 * s + r * (h / 3 - 1)}
                width={w / 2 - 5}
                height={h / 3 - 5}
                rx={2}
                fill="rgba(255,255,255,0.35)"
              />
            ))
          )}
        </>
      )
    case 'settings':
      return (
        <>
          {[0, 1, 2, 3].map((r) => {
            const y = 8 * s + r * 13 * s
            return (
              <g key={`s${r}`}>
                <circle cx={8 * s} cy={y + 4.5 * s} r={4.5 * s} fill="rgba(255,255,255,0.3)" />
                <rect x={16 * s} y={y + 1} width={w - 36 * s} height={3 * s} rx={1.5} fill="#fff" opacity="0.7" />
                <rect x={w - 18 * s} y={y} width={16 * s} height={9 * s} rx={4.5 * s} fill="rgba(255,255,255,0.4)" />
                <circle cx={w - 10 * s} cy={y + 4.5 * s} r={3.2 * s} fill="#fff" />
              </g>
            )
          })}
        </>
      )
    default:
      return null
  }
}

function DeviceScreen({ d, w, h, s = 1 }: { d: Device; w: number; h: number; s?: number }) {
  const cx = w / 2
  const cy = h / 2
  const cursorX = cx + d.cursor.px * (w / 2 - 4)
  const cursorY = cy + d.cursor.py * (h / 2 - 4)

  return (
    <>
      {/* status bar */}
      <rect x={0} y={0} width={w} height={6 * s} fill="rgba(255,255,255,0.22)" />
      <rect x={w - 8} y={1.5} width={5 * s} height={3.2 * s} rx={1} fill="#fff" opacity="0.85" />
      {/* in-progress operation */}
      <ActivityContent activity={d.activity} w={w} h={h} s={s} />
      {/* remote cursor + click ripple */}
      <g className="ec-cursor">
        <path
          d={`M ${cursorX} ${cursorY} l 4 9 l 2.4 -2.4 l 1.8 3.6 l -3 2.4 z`}
          fill="#fff"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="0.6"
        />
      </g>
      <circle cx={cursorX + 3} cy={cursorY + 7} r="3" fill="none" stroke="#fff" strokeWidth="1" className="ec-ripple" transform-origin={`${cursorX + 3}px ${cursorY + 7}px`} />
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
              <rect x={gx + 4} y={gy + 4} width={gw - 8} height={gh - 14} rx="4" fill={`url(#ec-devwall-${idx})`} opacity="0.9" />
              <g transform={`translate(${gx + 4}, ${gy + 4})`}>
                <DeviceScreen d={d} w={gw - 8} h={gh - 14} s={0.6} />
              </g>
              <circle cx={gx + 3} cy={gy + gh - 6} r="1.6" fill="var(--signal)" />
              <circle cx={gx + 10} cy={gy + gh - 6} r="1.6" fill="var(--border-strong)" />
              <circle cx={gx + 17} cy={gy + gh - 6} r="1.6" fill="var(--border-strong)" />
            </g>
          )
        })}
        {/* full stand: neck + base (under the cables) */}
        <rect x={monCx - 15} y={mon.y + mon.h} width="30" height="24" rx="4" fill="var(--border-strong)" />
        <rect x={monCx - 54} y={mon.y + mon.h + 22} width="108" height="12" rx="6" fill="var(--border-strong)" />
        <rect x={monCx - 54} y={mon.y + mon.h + 32} width="108" height="5" rx="2.5" fill="var(--border-color)" opacity="0.7" />
      </g>

      {/* ── cables: device side → monitor side edge ── */}
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
            <rect x={-f.w / 2} y={-f.h / 2} width={f.w} height={f.h} rx={f.rx} fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.4" />
            {d.kind === 'phone' && (
              <>
                <rect x={f.w / 2} y={-10} width="2" height="10" rx="1" fill="var(--border-strong)" />
                <rect x={f.w / 2} y={4} width="2" height="6" rx="1" fill="var(--border-strong)" />
              </>
            )}
            <rect x={-f.w / 2 + f.screenPad} y={-f.h / 2 + f.screenPad} width={f.w - f.screenPad * 2} height={f.h - f.screenPad * 2} rx={f.rx * 0.6} fill={`url(#ec-devwall-${i})`} />
            <circle cx={0} cy={-f.h / 2 + f.screenPad + 6} r="2.2" fill="rgba(0,0,0,0.5)" />
            <g transform={`translate(${-f.w / 2 + f.screenPad}, ${-f.h / 2 + f.screenPad})`}>
              <DeviceScreen d={d} w={f.w - f.screenPad * 2} h={f.h - f.screenPad * 2} s={0.9} />
            </g>
            {d.kind === 'phone' && <rect x={-7} y={f.h / 2 - 10} width="14" height="3" rx="1.5" fill="var(--border-strong)" />}
            {/* operation label */}
            <g transform={`translate(0, ${-f.h / 2 - 18})`}>
              <circle cx="-36" cy="0" r="3" fill="var(--signal)" className="ec-dot" />
              <rect x="-30" y="-10" width="66" height="20" rx="10" fill="var(--signal-soft)" stroke="var(--signal)" strokeOpacity="0.5" />
              <text x="-22" y="3.5" fontSize="10" fill="var(--text-primary)" fontFamily="var(--font-mono), monospace">{d.label}</text>
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
              <FeatureIcon icon={f.icon} x={17} y={16} />
              <text x="42" y="22" fontSize="13" fill="var(--text-primary)" fontFamily="var(--font-body), sans-serif">{f.label}</text>
            </g>
          )
        })}
      </g>

      <style jsx>{`
        .ec-pulse { filter: drop-shadow(0 0 4px var(--signal)); }
        .ec-dot { animation: ec-blink 2s ease-in-out infinite; }
        .ec-cursor { animation: ec-cursor-nudge 2.8s ease-in-out infinite; }
        .ec-ripple { animation: ec-ripple 2.8s ease-in-out infinite; }
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
  const c = x
  const cy = y
  const stroke = 'var(--signal)'
  switch (icon) {
    case 'grid':
      return (
        <g stroke={stroke} strokeWidth="1.7" fill="none" strokeLinecap="round">
          <rect x={c - 8} y={cy - 8} width="7" height="7" rx="1.5" />
          <rect x={c + 1} y={cy - 8} width="7" height="7" rx="1.5" />
          <rect x={c - 8} y={cy + 1} width="7" height="7" rx="1.5" />
          <rect x={c + 1} y={cy + 1} width="7" height="7" rx="1.5" />
        </g>
      )
    case 'cursor':
      // solid mouse pointer arrow
      return <path d={`M ${c - 5} ${cy - 6} l 0 12 l 3.2 -3.2 l 2.4 5.2 l 2.4 -1.4 l -2.4 -5 l 3.6 0 z`} fill={stroke} />
    case 'camera':
      return (
        <g stroke={stroke} strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x={c - 9} y={cy - 6} width="18" height="12" rx="2.5" />
          <circle cx={c} cy={cy} r="3.2" />
          <path d={`M ${c - 9} ${cy - 4} l 3 -1.5 l 1.5 2.5`} />
        </g>
      )
    case 'folder':
      return (
        <path
          d={`M ${c - 9} ${cy - 6} h 18 a2 2 0 0 1 2 2 v 8 a2 2 0 0 1 -2 2 h -22 a2 2 0 0 1 -2 -2 v -6 a2 2 0 0 1 2 -2 h 4 z`}
          stroke={stroke}
          strokeWidth="1.7"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    case 'gear':
      return (
        <g stroke={stroke} strokeWidth="1.7" fill="none" strokeLinecap="round">
          <circle cx={c} cy={cy} r="3.5" />
          <path d={`M ${c} ${cy - 6} v-1.5 M ${c} ${cy + 6} v1.5 M ${c - 6} ${cy} h-1.5 M ${c + 6} ${cy} h1.5 M ${c - 4.4} ${cy - 4.4} l-1 -1 M ${c + 4.4} ${cy + 4.4} l1 1 M ${c - 4.4} ${cy + 4.4} l-1 1 M ${c + 4.4} ${cy - 4.4} l1 -1`} />
        </g>
      )
    default:
      return null
  }
}