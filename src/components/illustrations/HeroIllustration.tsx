'use client'

import { LayoutGrid, MousePointer2, Camera, FolderOpen, Settings } from 'lucide-react'

/**
 * EC-Share product scene: one hub, six devices.
 * Monitor tiles match each outer device's orientation (phone portrait,
 * tablet landscape). Every screen animation is a closed loop: frame 0 === frame 100.
 */

type Activity = 'chat' | 'news' | 'game' | 'social' | 'youtube' | 'gallery'
type Kind = 'phone' | 'tablet'

interface Device {
  x: number
  y: number
  kind: Kind
  wall: [string, string]
  activity: Activity
}

const DEVICES: Device[] = [
  { x: 96, y: 118, kind: 'phone', wall: ['#38bdf8', '#2563eb'], activity: 'chat' },
  { x: 86, y: 268, kind: 'tablet', wall: ['#34d399', '#059669'], activity: 'news' },
  { x: 96, y: 418, kind: 'phone', wall: ['#f472b6', '#e11d48'], activity: 'game' },
  { x: 804, y: 118, kind: 'phone', wall: ['#a78bfa', '#7c3aed'], activity: 'social' },
  { x: 814, y: 268, kind: 'tablet', wall: ['#fbbf24', '#f59e0b'], activity: 'youtube' },
  { x: 804, y: 418, kind: 'phone', wall: ['#22d3ee', '#0891b2'], activity: 'gallery' },
]

const FEATURES = [
  { icon: LayoutGrid, label: '多設備查看' },
  { icon: MousePointer2, label: '遠端控制' },
  { icon: Camera, label: '截圖錄影' },
  { icon: FolderOpen, label: '檔案管理' },
  { icon: Settings, label: '設備管理' },
]

function deviceFrame(kind: Kind) {
  return kind === 'phone'
    ? { w: 52, h: 100, rx: 9, pad: 4 }
    : { w: 108, h: 72, rx: 10, pad: 4 }
}

function ActivityContent({
  activity,
  w,
  h,
}: {
  activity: Activity
  w: number
  h: number
}) {

  switch (activity) {
    case 'chat':
      return null
    case 'news':
      return null
    case 'game':
      return null
    case 'social':
      return null
    case 'youtube':
      return null
case 'gallery': {
      const camera = 10
      const albumY = camera
      const albumH = h - camera - 4
      const tileW = (w - 10) / 2
      const tileH = (albumH - 6) / 2
      // Each tile reads as a real photo (sky + field bands); the opened single
      // photo reuses the first tile's art, scaled up — not a blank slab.
      const tilePhotos = [
        { sky: '#8ecae6', sun: '#ffb703', land: '#219ebc' },
        { sky: '#c7f9cc', sun: '#80ffdb', land: '#48bfe3' },
        { sky: '#ffc8dd', sun: '#ffafcc', land: '#bde0fe' },
        { sky: '#e0b1ff', sun: '#cdb4db', land: '#a2d2ff' },
      ]
      const photo = tilePhotos[0]
      const drawTile = (tx: number, ty: number, tw: number, th: number, p: (typeof tilePhotos)[number]) => (
        <g>
          <rect x={tx} y={ty} width={tw} height={th} rx={2} fill={p.sky} />
          <circle cx={tx + tw * 0.5} cy={ty + th * 0.35} r={th * 0.14} fill={p.sun} />
          <rect x={tx} y={ty + th * 0.62} width={tw} height={th * 0.38} fill={p.land} />
          <path d={`M ${tx} ${ty + th * 0.62} L ${tx + tw * 0.5} ${ty + th * 0.4} L ${tx + tw} ${ty + th * 0.62} Z`} fill="rgba(255,255,255,0.28)" />
        </g>
      )
      const photoH = albumH
      return (
        <g>
          <g className="ec-gallery-album">
            {drawTile(3, albumY, tileW, tileH, tilePhotos[0])}
            {drawTile(5 + tileW, albumY, tileW, tileH, tilePhotos[1])}
            {drawTile(3, albumY + 2 + tileH, tileW, tileH, tilePhotos[2])}
            {drawTile(5 + tileW, albumY + 2 + tileH, tileW, tileH, tilePhotos[3])}
          </g>
          <g className="ec-gallery-photo">
            {drawTile(3, albumY, w - 6, photoH, photo)}
            {/* info lines flush to the bottom edge — no backdrop, overlayed on photo */}
            <rect x={8} y={albumY + photoH - 20} width={w * 0.55} height={2.2} rx={1} fill="rgba(255,255,255,0.9)" />
            <rect x={8} y={albumY + photoH - 15} width={w * 0.4} height={2} rx={1} fill="rgba(255,255,255,0.6)" />
            <rect x={8} y={albumY + photoH - 11} width={w * 0.25} height={1.6} rx={1} fill="rgba(255,255,255,0.4)" />
          </g>
        </g>
      )
    }    default:
      return null
  }
}


// Event-driven chat: the stack only shifts when a "send" or "reply" event
// fires (frame 0->1 my send, 1->2 reply, 2->6 seamless loop back). Between
// events it stays still — no unrolling scroll. A fixed clip masks the top rows.
function ChatScene({ w, h }: { w: number; h: number }) {
  const camera = 10
  const bubbleH = Math.max(6, Math.min(8, h * 0.085))
  const gap = 1.5
  const step = bubbleH + gap
  const kbH = Math.max(14, h * 0.2)
  const kbTop = h - kbH - 2
  const composeH = bubbleH
  const composeY = kbTop - composeH - 3
  const keyW = (w - 8) / 4
  const keyH = (kbH - 2) / 2
  const sendX = w - 8
  const sendY = composeY + composeH / 2
  const leftX = 3
  const leftW = w * 0.6
  const rightW = w * 0.56
  const rightX = w - 3 - rightW
  const pressKeys = new Set(['0-1', '0-2', '1-0', '1-2'])
  const pattern = [
    { x: rightX, w: rightW, o: 0.55 }, // A
    { x: leftX, w: leftW, o: 0.88 }, // B
    { x: rightX, w: rightW, o: 0.5 }, // C
    { x: leftX, w: w * 0.5, o: 0.88 }, // D
    { x: rightX, w: rightW, o: 0.78 }, // E — my send
    { x: leftX, w: leftW * 0.9, o: 0.88 }, // F — reply
  ]
  const rows = [...pattern, ...pattern]

  // Events: 0 idle(ABCD) -> 1 my send(BCDE) -> 2 reply(CDEF) -> 6 loop(=same view).
  // Only 0->1 and 1->2 slide (the two real send actions). 2->6 and 6->0 flip
  // instantly because they show the same repeated pattern — so no stray glide.
  // Animation disabled — chat stays static at frame 0 (A B C D).
  const dpY = 0
  const transitioning = false

  let pressI = 0
  return (
    <g>
      <g style={{ transform: `translateY(${dpY}px)`, transition: transitioning ? 'transform 700ms cubic-bezier(0.25, 0.5, 0.35, 1)' : 'none' }}>
        {rows.map((r, i) => (
          <rect
            key={`m${i}`}
            x={r.x}
            y={camera + i * step}
            width={r.w}
            height={bubbleH}
            rx={3}
            fill={i === 4 || i === 10 ? 'rgba(255,255,255,0.78)' : '#fff'}
            opacity={r.o}
          />
        ))}
      </g>

      <rect x={3} y={composeY} width={w - 16} height={composeH} rx={3} fill="rgba(255,255,255,0.2)" />
      <rect x={5} y={composeY + 2} width={w - 22} height={composeH - 4} rx={2} fill="#fff" opacity="0.9" />
      <circle cx={sendX} cy={sendY} r={3.6} fill="rgba(255,255,255,0.88)" />
      <polygon
        points={`${sendX - 1.3},${sendY - 1.8} ${sendX + 2},${sendY} ${sendX - 1.3},${sendY + 1.8}`}
        fill="rgba(0,0,0,0.45)"
      />

      <g>
        {[0, 1].map((r) =>
          [0, 1, 2, 3].map((c) => {
            const cls = pressKeys.has(`${r}-${c}`) ? `ec-key-press ec-key-${++pressI}` : undefined
            return (
              <rect
                key={`k${r}${c}`}
                className={cls}
                x={3 + c * keyW}
                y={kbTop + r * keyH}
                width={keyW - 1.4}
                height={keyH - 1.4}
                rx={1.1}
                fill="rgba(0,0,0,0.28)"
              />
            )
          })
        )}
      </g>
    </g>
  )
}

function DeviceScreen({
  clipId,
  d,
  w,
  h,
}: {
  clipId: string
  d: Device
  w: number
  h: number
}) {
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={w} height={h} rx={2.5} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <ActivityContent activity={d.activity} w={w} h={h} />
      </g>
    </>
  )
}

export function HeroIllustration({ showFeatures = true }: { showFeatures?: boolean }) {
  const mon = { x: 248, y: 58, w: 404, h: 236 }
  const monCx = mon.x + mon.w / 2
  const sidebar = 36
  const inset = 12
  const gapX = 10
  const gapY = 12

  return (
    <div className="relative mx-auto w-full max-w-[72rem] overflow-hidden">
      <svg viewBox="0 0 900 500" fill="none" aria-hidden="true" className="block w-full [aspect-ratio:900/500]">
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

        <ellipse className="prod-hub" cx={monCx} cy={mon.y + mon.h / 2} rx="220" ry="170" fill="url(#ec-monitor-bg)" />

        {DEVICES.map((d, i) => {
          const left = d.x < 450
          const edgeX = left ? mon.x + 8 : mon.x + mon.w - 8
          const edgeY = mon.y + 70 + (i % 3) * 48
          const midX = (d.x + edgeX) / 2
          return (
            <g key={`cable-${i}`} className={left ? 'prod-wing-l' : 'prod-wing-r'}>
              <path
                d={`M ${d.x} ${d.y} C ${midX} ${d.y}, ${midX} ${edgeY}, ${edgeX} ${edgeY}`}
                stroke="var(--signal)"
                strokeWidth="1.4"
                strokeOpacity="0.32"
                fill="none"
              />
            </g>
          )
        })}

        <g className="prod-hub">
          <rect x={mon.x} y={mon.y} width={mon.w} height={mon.h} rx="14" fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.5" />
          <rect x={mon.x + inset} y={mon.y + inset} width={mon.w - inset * 2} height={mon.h - inset * 2} rx="8" fill="var(--bg-base)" stroke="var(--border-color)" />
          <rect x={mon.x + 16} y={mon.y + 16} width={sidebar} height={mon.h - 32} rx="6" fill="var(--bg-elevated)" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={`sb${i}`}
              x={mon.x + 24}
              y={mon.y + 28 + i * 28}
              width="20"
              height="10"
              rx="3"
              fill={i === 0 ? 'var(--signal)' : 'var(--border-strong)'}
              opacity={i === 0 ? 0.9 : 0.5}
            />
          ))}

          {DEVICES.map((d, idx) => {
            // Reorder each row as [portrait, portrait, landscape] so the monitor shows
            // two phones then one tablet per row.
            const row = Math.floor(idx / 3)
            const rowDevices = DEVICES.slice(row * 3, row * 3 + 3)
            const ordered = [
              ...rowDevices.filter((x) => x.kind === 'phone'),
              ...rowDevices.filter((x) => x.kind === 'tablet'),
            ]
            const dRow = ordered[idx % 3]
            const dIdx = DEVICES.indexOf(dRow)
            const frame = deviceFrame(dRow.kind)
            const screenW = frame.w - frame.pad * 2
            const screenH = frame.h - frame.pad * 2
            const scale = dRow.kind === 'phone' ? 0.78 : 0.7
            const tw = screenW * scale
            const th = screenH * scale
            const col = idx % 3
            const colW = [
              (deviceFrame('phone').w - 8) * 0.78,
              (deviceFrame('phone').w - 8) * 0.78,
              (deviceFrame('tablet').w - 8) * 0.7,
            ]
            const gridW = colW[0] + colW[1] + colW[2] + gapX * 2
            const areaX = mon.x + 16 + sidebar + 10
            const areaW = mon.w - 16 - sidebar - 22
            const gridX = areaX + (areaW - gridW) / 2
            const colX = [0, colW[0] + gapX, colW[0] + colW[1] + gapX * 2]
            const rowH = (deviceFrame('phone').h - 8) * 0.78
            const gridH = rowH * 2 + gapY
            const areaY = mon.y + 22
            const areaH = mon.h - 44
            const gridY = areaY + (areaH - gridH) / 2
            const gx = gridX + colX[col] + (colW[col] - tw) / 2
            const gy = gridY + row * (rowH + gapY) + (rowH - th) / 2

            return (
              <g key={`cell-${idx}`}>
                <rect x={gx - 3} y={gy - 3} width={tw + 6} height={th + 6} rx="6" fill="var(--bg-elevated)" stroke="var(--border-color)" />
                <rect x={gx} y={gy} width={tw} height={th} rx="4" fill={`url(#ec-devwall-${dIdx})`} />
                <g transform={`translate(${gx}, ${gy}) scale(${scale})`}>
                  <DeviceScreen clipId={`ec-mon-${idx}`} d={dRow} w={screenW} h={screenH} />
                </g>
              </g>
            )
          })}

          <path
            d={`M ${monCx - 10} ${mon.y + mon.h}
                L ${monCx + 10} ${mon.y + mon.h}
                L ${monCx + 18} ${mon.y + mon.h + 22}
                L ${monCx + 48} ${mon.y + mon.h + 34}
                L ${monCx - 48} ${mon.y + mon.h + 34}
                L ${monCx - 18} ${mon.y + mon.h + 22} Z`}
            fill="var(--border-strong)"
          />
        </g>

        {DEVICES.map((d, i) => {
          const f = deviceFrame(d.kind)
          const sw = f.w - f.pad * 2
          const sh = f.h - f.pad * 2
          return (
            <g key={`dev-${i}`} transform={`translate(${d.x}, ${d.y})`}>
              <g className={`ec-device ${d.x < 450 ? 'prod-wing-l' : 'prod-wing-r'}`}>
              <rect x={-f.w / 2} y={-f.h / 2} width={f.w} height={f.h} rx={f.rx} fill="var(--bg-surface)" stroke="var(--border-strong)" strokeWidth="1.4" />
              {d.kind === 'phone' && (
                <>
                  <rect x={f.w / 2} y={-10} width="2" height="10" rx="1" fill="var(--border-strong)" />
                  <rect x={f.w / 2} y={4} width="2" height="6" rx="1" fill="var(--border-strong)" />
                </>
              )}
              <rect
                x={-sw / 2}
                y={-sh / 2}
                width={sw}
                height={sh}
                rx={f.rx * 0.55}
                fill={`url(#ec-devwall-${i})`}
              />
              <g transform={`translate(${-sw / 2}, ${-sh / 2})`}>
                <DeviceScreen clipId={`ec-dev-${i}`} d={d} w={sw} h={sh} />
              </g>
              <circle className="ec-camera" cx={0} cy={-f.h / 2 + f.pad + 2.4} r="2.2" />
              </g>
            </g>
          )
        })}
      </svg>

      {showFeatures && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] px-3.5 py-3 transition-colors hover:border-[var(--signal)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--signal-soft)] text-[var(--signal)]">
                <f.icon size={15} strokeWidth={1.8} />
              </span>
              <span className="text-sm font-medium text-[var(--text-primary)]">{f.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
