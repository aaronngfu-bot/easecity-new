'use client'

import { useState } from 'react'
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
      return <ChatScene w={w} h={h} />
    case 'news':
      return <NewsScene w={w} h={h} />
    case 'game':
      return <GameScene w={w} h={h} />
    case 'social':
      return <SocialScene w={w} h={h} />
    case 'youtube':
      return <YoutubeScene w={w} h={h} />
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
      return (
        <g>
          <g className="ec-gallery-album">
            {drawTile(3, albumY, tileW, tileH, tilePhotos[0])}
            {drawTile(5 + tileW, albumY, tileW, tileH, tilePhotos[1])}
            {drawTile(3, albumY + 2 + tileH, tileW, tileH, tilePhotos[2])}
            {drawTile(5 + tileW, albumY + 2 + tileH, tileW, tileH, tilePhotos[3])}
          </g>
          <g className="ec-gallery-photo">{drawTile(3, albumY, w - 6, albumH, photo)}</g>
        </g>
      )
    }
    default:
      return null
  }
}


// Event-driven chat: the stack only shifts when a "send" or "reply" event
// fires (frame 0->1 my send, 1->2 reply, 2->6 seamless loop back). Between
// events it stays still — no unrolling scroll. A fixed clip masks the top rows.
// `rows` repeats `pattern` twice, so the stack's frame-100 position (shifted
// up by exactly one pattern's worth of rows) shows the same six bubbles as
// frame 0 — the loop is seamless without ever resetting mid-cycle.
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
  // Only 0->1 and 1->2 slide (the two real send actions); `ec-chat-stack` drives
  // the shift, keyed to `--ec-step` so the CSS px offsets match this layout's
  // actual row height instead of the keyframe's 9.5px fallback.

  let pressI = 0
  return (
    <g>
      <g className="ec-chat-stack" style={{ ['--ec-step' as string]: `${step}px` }}>
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
      <rect className="ec-typed" x={5} y={composeY + 2} width={w - 22} height={composeH - 4} rx={2} fill="#fff" opacity="0.9" />
      <g className="ec-send-btn">
        <circle cx={sendX} cy={sendY} r={3.6} fill="rgba(255,255,255,0.88)" />
        <polygon
          points={`${sendX - 1.3},${sendY - 1.8} ${sendX + 2},${sendY} ${sendX - 1.3},${sendY + 1.8}`}
          fill="rgba(0,0,0,0.45)"
        />
      </g>

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

// News: one bold tag swatch cycling through three colours (three overlapping
// rects, each visible for its own third of the loop via staggered
// `animation-delay`, see globals.css) beside two plain headline bars that
// never move. At the size this actually renders, a colour swap alone reads
// as "a new story arrived" far more clearly than scrolling rows of text did.
function NewsScene({ w, h }: { w: number; h: number }) {
  const camera = 10
  const thumbSize = Math.min(h - camera - 6, w * 0.42)
  const thumbY = camera + (h - camera - thumbSize) / 2
  const thumbX = 4
  const textX = thumbX + thumbSize + 6
  const textW = w - textX - 3
  const colors = ['#38bdf8', '#fbbf24', '#34d399']
  return (
    <g>
      {colors.map((c, i) => (
        <rect
          key={c}
          className={`ec-news-thumb ec-news-thumb-${i}`}
          x={thumbX}
          y={thumbY}
          width={thumbSize}
          height={thumbSize}
          rx={3}
          fill={c}
        />
      ))}
      <rect x={textX} y={thumbY + thumbSize * 0.16} width={textW * 0.82} height={3} rx={1.5} fill="#fff" opacity={0.92} />
      <rect x={textX} y={thumbY + thumbSize * 0.5} width={textW * 0.58} height={2.4} rx={1.2} fill="rgba(255,255,255,0.55)" />
    </g>
  )
}

// Game: three score stars fill in sequence — the universal "combo counter" —
// while a single gem bounces on its own separate, faster clock underneath, so
// there is always something obviously alive on screen even mid-way through
// the slower star cycle.
function starPoints(cx: number, cy: number, rOuter: number, rInner: number) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const a = (Math.PI / 5) * i - Math.PI / 2
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}
function GameScene({ w, h }: { w: number; h: number }) {
  const camera = 10
  const starY = camera + 7
  const starR = 3
  const gemCy = camera + (h - camera) / 2 + 5
  return (
    <g>
      <rect x={3} y={camera - 4} width={w - 6} height={h - camera + 2} rx={4} fill="rgba(0,0,0,0.16)" />
      {[0.28, 0.5, 0.72].map((f, i) => (
        <polygon
          key={i}
          className={`ec-game-star ec-game-star-${i}`}
          points={starPoints(w * f, starY, starR, starR * 0.42)}
        />
      ))}
      <g transform={`translate(${w / 2}, ${gemCy})`}>
        <g className="ec-game-gem">
          <rect x={-4.5} y={-4.5} width={9} height={9} rx={1.4} fill="#fbbf24" transform="rotate(45)" />
        </g>
      </g>
    </g>
  )
}

function heartPath(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy + r * 0.6}
    C ${cx - r * 1.3} ${cy - r * 0.6}, ${cx - r * 0.5} ${cy - r * 1.3}, ${cx} ${cy - r * 0.4}
    C ${cx + r * 0.5} ${cy - r * 1.3}, ${cx + r * 1.3} ${cy - r * 0.6}, ${cx} ${cy + r * 0.6} Z`
}

// Social: one still photo — no scrolling feed of avatars and caption lines,
// which was three different sizes of near-invisible detail at once. The
// double-tap "like" burst (a heart pop plus an expanding ring behind it) is
// the whole motif, repeating on its own — instantly readable as "social".
function SocialScene({ w, h }: { w: number; h: number }) {
  const camera = 10
  const photoY = camera
  const photoH = h - camera - 14
  const heartCy = photoY + photoH * 0.44
  return (
    <g>
      <rect x={3} y={photoY} width={w - 6} height={photoH} rx={3} fill="#a78bfa" opacity={0.32} />
      <circle cx={w * 0.32} cy={photoY + photoH * 0.4} r={photoH * 0.17} fill="#a78bfa" opacity={0.65} />
      <path
        d={`M 3 ${photoY + photoH * 0.72} L ${w * 0.42} ${photoY + photoH * 0.46} L ${w - 3} ${photoY + photoH * 0.72} Z`}
        fill="rgba(255,255,255,0.2)"
      />
      <rect x={3} y={h - 9} width={w * 0.42} height={2.4} rx={1.2} fill="#fff" opacity={0.85} />
      <circle className="ec-like-ring" cx={w / 2} cy={heartCy} r={h * 0.13} fill="none" stroke="#fff" strokeWidth="1.4" />
      <path className="ec-like" d={heartPath(w / 2, heartCy, h * 0.14)} fill="#fff" />
    </g>
  )
}

// Play button and progress bar are both true closed loops on their own —
// frame 0 and frame 100 are the identical resting state — with no content
// duplication needed.
function YoutubeScene({ w, h }: { w: number; h: number }) {
  const barH = 2.4
  const chromeY = h - barH - 5
  return (
    <g>
      <rect x={0} y={0} width={w} height={h} fill="#0f172a" />
      <rect x={0} y={h * 0.35} width={w} height={h * 0.65} fill="#1d4ed8" opacity={0.5} />
      <circle cx={w * 0.28} cy={h * 0.4} r={h * 0.22} fill="#fbbf24" opacity={0.85} />
      <path d={`M 0 ${h * 0.58} L ${w * 0.45} ${h * 0.32} L ${w} ${h * 0.55} L ${w} ${h} L 0 ${h} Z`} fill="#0ea5e9" opacity={0.55} />

      <g className="ec-ytplay">
        <circle cx={w / 2} cy={h / 2} r={9} fill="rgba(0,0,0,0.45)" />
        <polygon points={`${w / 2 - 3},${h / 2 - 5} ${w / 2 + 5},${h / 2} ${w / 2 - 3},${h / 2 + 5}`} fill="#fff" />
      </g>

      <rect x={4} y={chromeY} width={w - 8} height={barH} rx={1.2} fill="rgba(255,255,255,0.25)" />
      <rect className="ec-progress" x={4} y={chromeY} width={w - 8} height={barH} rx={1.2} fill="#ef4444" />
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

interface MonitorCell {
  d: Device
  gx: number
  gy: number
  tw: number
  th: number
  scale: number
  screenW: number
  screenH: number
}

// Lays out however many devices are still connected — up to three per row,
// phones before tablets within a row (so two portraits and a landscape read
// as one rhythm when that combination occurs), rows and each row's own
// columns centred independently. Unplugging a device doesn't leave a hole:
// the remaining tiles close up and re-centre, same as the outer count shrinking.
function layoutMonitorGrid(
  devices: Device[],
  mon: { x: number; y: number; w: number; h: number },
  sidebar: number,
  gapX: number,
  gapY: number
): MonitorCell[] {
  const rows: Device[][] = []
  for (let i = 0; i < devices.length; i += 3) rows.push(devices.slice(i, i + 3))
  const orderedRows = rows.map((row) => [
    ...row.filter((d) => d.kind === 'phone'),
    ...row.filter((d) => d.kind === 'tablet'),
  ])

  const colWidthFor = (kind: Kind) => (deviceFrame(kind).w - 8) * (kind === 'phone' ? 0.78 : 0.7)
  const rowH = (deviceFrame('phone').h - 8) * 0.78

  const areaX = mon.x + 16 + sidebar + 10
  const areaW = mon.w - 16 - sidebar - 22
  const areaY = mon.y + 22
  const areaH = mon.h - 44
  const gridH = orderedRows.length > 0 ? rowH * orderedRows.length + gapY * (orderedRows.length - 1) : 0
  const gridStartY = areaY + (areaH - gridH) / 2

  const cells: MonitorCell[] = []
  orderedRows.forEach((row, rowIdx) => {
    const colWidths = row.map((d) => colWidthFor(d.kind))
    const gridW = colWidths.reduce((sum, w) => sum + w, 0) + gapX * Math.max(0, row.length - 1)
    let colX = areaX + (areaW - gridW) / 2
    row.forEach((d, colIdx) => {
      const scale = d.kind === 'phone' ? 0.78 : 0.7
      const frame = deviceFrame(d.kind)
      const screenW = frame.w - frame.pad * 2
      const screenH = frame.h - frame.pad * 2
      const tw = screenW * scale
      const th = screenH * scale
      const gy = gridStartY + rowIdx * (rowH + gapY) + (rowH - th) / 2
      const gx = colX + (colWidths[colIdx] - tw) / 2
      cells.push({ d, gx, gy, tw, th, scale, screenW, screenH })
      colX += colWidths[colIdx] + gapX
    })
  })
  return cells
}

export function HeroIllustration({ showFeatures = true }: { showFeatures?: boolean }) {
  // Every device starts connected. Clicking one toggles it — the device
  // itself is unaffected (it's the source, still showing its own screen);
  // only the monitor's mirror changes: that tile leaves the grid entirely
  // rather than sitting there blank, so the remaining tiles close the gap,
  // and the cable to it disappears.
  const [connected, setConnected] = useState<boolean[]>(() => DEVICES.map(() => true))
  const toggleDevice = (i: number) => setConnected((prev) => prev.map((v, idx) => (idx === i ? !v : v)))

  const mon = { x: 248, y: 58, w: 404, h: 236 }
  const monCx = mon.x + mon.w / 2
  const sidebar = 36
  const inset = 12
  const gapX = 10
  const gapY = 12

  const visibleDevices = DEVICES.filter((_, i) => connected[i])
  const monitorCells = layoutMonitorGrid(visibleDevices, mon, sidebar, gapX, gapY)
  const cellFor = (d: Device) => monitorCells.find((c) => c.d === d)

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

        {visibleDevices.map((d) => {
          const i = DEVICES.indexOf(d)
          const cell = cellFor(d)
          if (!cell) return null
          const left = d.x < 450
          const edgeX = left ? mon.x + 8 : mon.x + mon.w - 8
          const edgeY = cell.gy + cell.th / 2
          const midX = (d.x + edgeX) / 2
          return (
            <g key={`cable-${i}`} className={left ? 'prod-wing-l' : 'prod-wing-r'}>
              <path
                d={`M ${d.x} ${d.y} C ${midX} ${d.y}, ${midX} ${edgeY}, ${edgeX} ${edgeY}`}
                stroke="var(--signal)"
                strokeWidth="1.4"
                strokeOpacity="0.32"
                fill="none"
                className="ec-cable"
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

          {monitorCells.map((cell) => {
            const dIdx = DEVICES.indexOf(cell.d)
            return (
              <g key={`cell-${dIdx}`} className="ec-mon-cell">
                <rect x={cell.gx - 3} y={cell.gy - 3} width={cell.tw + 6} height={cell.th + 6} rx="6" fill="var(--bg-elevated)" stroke="var(--border-color)" />
                <rect x={cell.gx} y={cell.gy} width={cell.tw} height={cell.th} rx="4" fill={`url(#ec-devwall-${dIdx})`} />
                <g transform={`translate(${cell.gx}, ${cell.gy}) scale(${cell.scale})`}>
                  <DeviceScreen clipId={`ec-mon-${dIdx}`} d={cell.d} w={cell.screenW} h={cell.screenH} />
                </g>
              </g>
            )
          })}

          {monitorCells.length === 0 && (
            <g opacity="0.55">
              <circle cx={monCx} cy={mon.y + mon.h / 2} r="17" fill="none" stroke="var(--border-strong)" strokeWidth="1.4" />
              <path
                d={`M ${monCx - 7} ${mon.y + mon.h / 2 - 7} L ${monCx + 7} ${mon.y + mon.h / 2 + 7} M ${monCx + 7} ${mon.y + mon.h / 2 - 7} L ${monCx - 7} ${mon.y + mon.h / 2 + 7}`}
                stroke="var(--border-strong)"
                strokeWidth="1.6"
              />
            </g>
          )}

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
              {/* The device is the source, not a mirror — disconnecting it from the
                  monitor doesn't turn its own screen off, so nothing here reads
                  `connected[i]`. Only the cable to it and its tile on the monitor
                  (both driven by `visibleDevices` above) go away. */}
              <g
                className={`ec-device ${d.x < 450 ? 'prod-wing-l' : 'prod-wing-r'}`}
                onClick={() => toggleDevice(i)}
              >
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
