'use client'

import { useRef, useState } from 'react'
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
    case 'gallery':
      return <GalleryScene w={w} h={h} />
    default:
      return null
  }
}

// Gallery: a 2×2 photo album that auto-plays. The album shows, then a single
// enlarged photo fades/scales up over it (with a few white caption lines low
// inside the photo's land region, below the mountains), then back — a closed
// loop driven by CSS, so nothing needs interaction. frame 0 === frame 100.
const GALLERY_PHOTOS: { sky: string; sun: string; land: string }[] = [
  { sky: '#8ecae6', sun: '#ffb703', land: '#219ebc' },
  { sky: '#c7f9cc', sun: '#80ffdb', land: '#48bfe3' },
  { sky: '#ffc8dd', sun: '#ffafcc', land: '#bde0fe' },
  { sky: '#e0b1ff', sun: '#cdb4db', land: '#a2d2ff' },
]

function GalleryScene({ w, h }: { w: number; h: number }) {
  const camera = 6
  const pad = 3
  const albumTop = camera
  const albumH = h - camera - 2
  const tileW = (w - 8) / 2
  const tileH = (albumH - 4) / 2

  const tile = (tx: number, ty: number, tw: number, th: number, p: (typeof GALLERY_PHOTOS)[number]) => (
    <g>
      <rect x={tx} y={ty} width={tw} height={th} rx={2.5} fill={p.sky} />
      <circle cx={tx + tw * 0.5} cy={ty + th * 0.35} r={th * 0.14} fill={p.sun} />
      {/* mountains / land region */}
      <path
        d={`M ${tx} ${ty + th * 0.6} L ${tx + tw * 0.32} ${ty + th * 0.42} L ${tx + tw * 0.6} ${ty + th * 0.6} L ${tx + tw * 0.82} ${ty + th * 0.44} L ${tx + tw} ${ty + th * 0.6} L ${tx + tw} ${ty + th} L ${tx} ${ty + th} Z`}
        fill={p.land}
        opacity={0.85}
      />
    </g>
  )

  const p = GALLERY_PHOTOS[0]
  const photoH = h - camera
  // Caption sits noticeably below the mountaintop, low in the photo's land.
  const captionY = camera + photoH * 0.76
  const capLines = [
    { w: w * 0.6, o: 0.95 },
    { w: w * 0.42, o: 0.72 },
    { w: w * 0.28, o: 0.5 },
  ]

  return (
    <g>
      {/* 2×2 album, auto-fades out while the enlarged photo is shown */}
      <g className="ec-gallery-album">
        {GALLERY_PHOTOS.map((ph, i) => {
          const col = i % 2
          const row = Math.floor(i / 2)
          const tx = pad + col * (tileW + 2)
          const ty = albumTop + row * (tileH + 2)
          return <g key={i}>{tile(tx, ty, tileW, tileH, ph)}</g>
        })}
      </g>
      {/* enlarged single photo, auto-scales over the album */}
      <g className="ec-gallery-photo">
        <rect x={0} y={camera} width={w} height={photoH} rx={4} fill={p.sky} />
        <circle cx={w * 0.5} cy={camera + photoH * 0.32} r={photoH * 0.13} fill={p.sun} />
        {/* land below the mountaintop */}
        <path
          d={`M 0 ${camera + photoH * 0.6} L ${w * 0.3} ${camera + photoH * 0.44} L ${w * 0.58} ${camera + photoH * 0.6} L ${w * 0.8} ${camera + photoH * 0.48} L ${w} ${camera + photoH * 0.6} L ${w} ${camera + photoH} L 0 ${camera + photoH} Z`}
          fill={p.land}
          opacity={0.92}
        />
        {/* caption lines low inside the photo, below the mountains */}
        <g className="ec-gallery-caption">
          {capLines.map((l, i) => (
            <rect
              key={i}
              x={3}
              y={captionY + i * 3.4}
              width={l.w}
              height={1.9}
              rx={0.95}
              fill="#fff"
              opacity={l.o}
            />
          ))}
        </g>
      </g>
    </g>
  )
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
  const rows = pattern

  // Events: 0 idle(ABCD) -> 1 my send(BCDE) -> 2 reply(CDEF) -> 6 loop(=same view).
  // Only 0->1 and 1->2 slide (the two real send actions); `ec-chat-stack` drives
  // the shift, keyed to `--ec-step` so the CSS px offsets match this layout's
  // actual row height instead of the keyframe's 9.5px fallback.

  let pressI = 0
  // Fill area ends at the bottom of a complete bubble, never mid-bubble, so the
  // bubble sitting just above the compose bar is always a whole one (the clip
  // cuts in the gap between bubbles, not through one).
  const fillBottom = camera + Math.floor((composeY - camera - bubbleH) / step) * step + bubbleH
  return (
    <g>
      <defs>
        <clipPath id={`ec-chatclip-${w}-${h}`}>
          {/* Fixed top mask: messages are visible only below camera, so the top
              strip of the phone always holds a constant mask no matter how the
              stack scrolls; the bottom still ends on a complete bubble. */}
          <rect x={0} y={camera} width={w} height={fillBottom - camera} />
        </clipPath>
      </defs>
      {/* Messages only ever render above the compose bar; the keyboard and
          compose row below are never covered by a bubble sliding down. */}
      <g clipPath={`url(#ec-chatclip-${w}-${h})`}>
        <g className="ec-chat-stack">
          {rows.map((r, i) => {
            // Each bubble appears strictly in its own order (A→B→C→D→E→F) and
            // the send (E) / reply (F) bubbles start hidden, so a later-stacked
            // bubble can never appear before an earlier one. id 0-5 = A-F.
            const id = i % 6
            const cls =
              id === 4 ? 'ec-chat-send' : id === 5 ? 'ec-chat-reply' : undefined
            const rise = step
            return (
              <rect
                key={`m${i}`}
                className={cls ? cls : `ec-msg-${id}`}
                x={r.x}
                y={camera + id * step}
                width={r.w}
                height={bubbleH}
                rx={3}
                fill={id === 4 ? 'rgba(255,255,255,0.78)' : '#fff'}
                opacity={cls ? 0 : r.o}
                style={cls ? ({ ['--rise' as string]: `${rise}px` } as React.CSSProperties) : undefined}
              />
            )
          })}
        </g>
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

// News: a BBC-news-app style mobile feed — content only, no top/bottom bars.
// White paper base; a full-bleed hero photo (gradient sky, soft clouds, sun,
// two hill layers) carries a red LIVE pill with a pulsing white dot; under it
// two bold near-black headline bars whose widths vary per story like real
// headlines, a red category tick and a thin gray timestamp; then a compact
// story list split by hairlines, each thumbnail a tiny photo scene, the last
// row running flush into the screen edge so the feed reads as continuing
// below the fold. The hero rotates through three stories (photo crossfade +
// headline swap on one clock) under one continuous Ken Burns zoom, while the
// list rows refresh on staggered offsets. All loops close (frame 0 === 100).
const NEWS_STORIES = [
  // Each story is a distinct photo: palette + sun/cloud composition all vary,
  // so a headline swap visibly changes the picture, not just its tint.
  { skyTop: '#d7f0fb', skyBot: '#8ecae6', sun: '#ffb703', sunX: 0.74, sunY: 0.3, sunR: 0.15, c1: [0.26, 0.24], c2: [0.46, 0.14], hillFar: '#5fb6cc', hillNear: '#2b8fa8', l1: 0.92, l2: 0.58, meta: 26 },
  { skyTop: '#ffe9f3', skyBot: '#f6bfdc', sun: '#fde047', sunX: 0.55, sunY: 0.34, sunR: 0.12, c1: [0.18, 0.18], c2: [0.62, 0.26], hillFar: '#c79ae4', hillNear: '#9a63c9', l1: 0.76, l2: 0.66, meta: 20 },
  { skyTop: '#eaf8ee', skyBot: '#b5e3c6', sun: '#fb923c', sunX: 0.38, sunY: 0.26, sunR: 0.15, c1: [0.55, 0.2], c2: [0.72, 0.3], hillFar: '#66bd8f', hillNear: '#33916a', l1: 0.86, l2: 0.42, meta: 30 },
]
// Compact rows reuse the story palettes so the list reads as "more from the
// same feed"; each thumbnail carries a tiny sky/hill/sun micro scene.
const NEWS_ROWS = [
  { sky: '#d7f0fb', hill: '#5fb6cc', sun: '#ffb703', l1: 0.7, l2: 0.46 },
  { sky: '#ffe9f3', hill: '#c79ae4', sun: '#fde047', l1: 0.58, l2: 0.38 },
  { sky: '#eaf8ee', hill: '#66bd8f', sun: '#fb923c', l1: 0.74, l2: 0.5 },
]

function NewsScene({ w, h }: { w: number; h: number }) {
  const photoH = h * 0.4
  const x = w * 0.04
  const textW = w - x * 2
  const headH = 3.2
  const headY1 = photoH + 3.4
  const headY2 = headY1 + headH + 1.6
  const metaY = headY2 + headH + 2.6
  const metaH = 1.8
  const div1Y = metaY + metaH + 2.4
  const thumb = 7.2
  const row1Y = div1Y + 2.2
  const rowTextX = x + thumb + 2.2
  const rowTextW = w - rowTextX - x
  const div2Y = row1Y + thumb + 1.4
  const row2Y = div2Y + 1.8

  // One hero photo scene per story, sharing geometry so Ken Burns reads as
  // one camera — but each story's sun/cloud composition is its own, so a
  // headline swap visibly changes the picture.
  const scene = (s: (typeof NEWS_STORIES)[number], i: number) => (
    <g className="ec-news-photo">
      <rect x={0} y={0} width={w} height={photoH} fill={`url(#ec-newssky-${i})`} />
      <ellipse cx={w * s.c1[0]} cy={photoH * s.c1[1]} rx={w * 0.1} ry={photoH * 0.075} fill="#fff" opacity={0.5} />
      <ellipse cx={w * s.c2[0]} cy={photoH * s.c2[1]} rx={w * 0.07} ry={photoH * 0.055} fill="#fff" opacity={0.35} />
      <circle cx={w * s.sunX} cy={photoH * s.sunY} r={photoH * s.sunR} fill={s.sun} />
      <path
        d={`M 0 ${photoH * 0.5} L ${w * 0.3} ${photoH * 0.36} L ${w * 0.55} ${photoH * 0.53} L ${w * 0.8} ${photoH * 0.4} L ${w} ${photoH * 0.5} L ${w} ${photoH} L 0 ${photoH} Z`}
        fill={s.hillFar}
        opacity={0.8}
      />
      <path
        d={`M 0 ${photoH * 0.68} L ${w * 0.25} ${photoH * 0.54} L ${w * 0.5} ${photoH * 0.7} L ${w * 0.78} ${photoH * 0.56} L ${w} ${photoH * 0.66} L ${w} ${photoH} L 0 ${photoH} Z`}
        fill={s.hillNear}
      />
    </g>
  )

  return (
    <g>
      <defs>
        {NEWS_STORIES.map((s, i) => (
          <linearGradient key={`sg${i}`} id={`ec-newssky-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.skyTop} />
            <stop offset="100%" stopColor={s.skyBot} />
          </linearGradient>
        ))}
      </defs>

      {/* white paper base — the BBC read: light surface, near-black type */}
      <rect x={0} y={0} width={w} height={h} fill="#f7f8fa" />

      {/* hero photo: three stacked scenes; delays are POSITIVE so each
          story's window lands at scene [3i, 3i+3] and the handover windows
          line up with the headline swap below — photo and text change as one */}
      {NEWS_STORIES.map((s, i) => (
        <g
          key={`p${i}`}
          className={`ec-news-hero${i === 0 ? ' ec-news-lead' : ''}`}
          style={{ animationDelay: `${i * 3}s` }}
          opacity={0}
        >
          {scene(s, i)}
        </g>
      ))}

      {/* red LIVE pill parked on the photo's lower-left corner, dot pulsing */}
      <g className="ec-news-live">
        <rect x={2.2} y={photoH - 5.6} width={9.1} height={3.4} rx={1.1} fill="#bb1919" />
        <circle className="ec-news-live-dot" cx={3.9} cy={photoH - 3.9} r={0.75} fill="#fff" />
        <rect x={5.5} y={photoH - 4.5} width={4.6} height={1.2} rx={0.6} fill="#fff" opacity={0.95} />
      </g>

      {/* headline block: swaps in step with the photo — same delays, same
          window, so picture and text change as one */}
      {NEWS_STORIES.map((s, i) => (
        <g
          key={`h${i}`}
          className={`ec-news-swap${i === 0 ? ' ec-news-lead' : ''}`}
          style={{ animationDelay: `${i * 3}s` }}
          opacity={0}
        >
          <rect x={x} y={headY1} width={textW * s.l1} height={headH} rx={1.4} fill="#34383e" opacity={0.92} />
          <rect x={x} y={headY2} width={textW * s.l2} height={headH} rx={1.4} fill="#34383e" opacity={0.92} />
          {/* meta row: red category tick • small dot • gray timestamp */}
          <rect x={x} y={metaY} width={6.5} height={metaH} rx={0.9} fill="#bb1919" opacity={0.85} />
          <circle cx={x + 8.8} cy={metaY + metaH / 2} r={0.6} fill="#9aa0a6" />
          <rect x={x + 11} y={metaY} width={s.meta} height={metaH} rx={0.9} fill="#6f7378" opacity={0.78} />
        </g>
      ))}

      {/* hairline under the headline block */}
      <rect x={0} y={div1Y} width={w} height={0.5} fill="#191b1e" opacity={0.1} />

      {/* compact story rows — micro-scene thumbnail + two text bars each,
          refreshed on staggered clocks; the last row sits flush against the
          screen edge */}
      {[row1Y, row2Y].map((rowY, r) =>
        NEWS_ROWS.map((rw, i) => (
          <g
            key={`r${r}-${i}`}
            className={`ec-news-swap${i === 0 ? ' ec-news-lead' : ''}`}
            style={{ animationDelay: `${i * -3 - (r === 0 ? 1.2 : 4.5)}s` }}
            opacity={0}
          >
            <rect x={x} y={rowY} width={thumb} height={thumb} rx={1.4} fill={rw.sky} />
            <path
              d={`M ${x} ${rowY + thumb * 0.62} L ${x + thumb * 0.38} ${rowY + thumb * 0.4} L ${x + thumb * 0.68} ${rowY + thumb * 0.6} L ${x + thumb} ${rowY + thumb * 0.48} L ${x + thumb} ${rowY + thumb} L ${x} ${rowY + thumb} Z`}
              fill={rw.hill}
            />
            <circle cx={x + thumb * 0.72} cy={rowY + thumb * 0.26} r={0.9} fill={rw.sun} />
            <rect x={rowTextX} y={rowY + 0.9} width={rowTextW * rw.l1} height={2.5} rx={1.1} fill="#3f444b" opacity={0.88} />
            <rect x={rowTextX} y={rowY + 4.6} width={rowTextW * rw.l2} height={2.5} rx={1.1} fill="#3f444b" opacity={0.5} />
          </g>
        ))
      )}
      <rect x={0} y={div2Y} width={w} height={0.5} fill="#191b1e" opacity={0.1} />
    </g>
  )
}

// Game: a mobile runner, content only — no HUD strip, no energy bar. The
// whole frame is the playfield: dark sky with faint stars, rolling ground,
// a bright square player that hops (squash on land) over a spike driving in
// from the right, and puffs of dust kicking up on landing. Because this is a
// *phone* game, the bottom of the screen carries a translucent thumb-zone:
// a round JUMP button (pressed in step with the hop) and a small pause chip
// floating at the edge — the classic mobile controls read, with a soft
// translucent touch halo on the button whenever it's hit. All closed loops
// (frame 0 === frame 100).
function GameScene({ w, h }: { w: number; h: number }) {
  const groundY = h * 0.62
  const playerR = 3.6
  const playerX = w * 0.3
  const playerY = groundY - playerR - 1
  const obsW = 3.4
  const obsH = 7
  const obsX = w * 0.86
  // thumb-zone controls, bottom-right / bottom-left
  const btnR = 5.4
  const btnX = w - btnR - 3.4
  const btnY = h - btnR - 3.4
  const chipW = 7.4
  const chipH = 3.4

  return (
    <g>
      <defs>
        <linearGradient id="ec-game-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c3242" />
          <stop offset="38%" stopColor="#9c4f43" />
          <stop offset="68%" stopColor="#d06e45" />
          <stop offset="90%" stopColor="#f29a52" />
          <stop offset="100%" stopColor="#ffc470" />
        </linearGradient>
      </defs>
      {/* orange-dusk playfield: warm rose-brown fading to gold at the horizon */}
      <rect x={0} y={0} width={w} height={h} fill="url(#ec-game-sky)" />

      {/* high evening sun, top-right, clear of the play lane */}
      <circle cx={w * 0.76} cy={h * 0.28} r={6.8} fill="#ffb45f" opacity={0.22} />
      <circle cx={w * 0.76} cy={h * 0.28} r={4} fill="#ffd28f" />

      {/* rolling ground with a faint horizon band */}
      <rect x={0} y={groundY} width={w} height={h - groundY} fill="#3a2531" />
      <rect x={0} y={groundY} width={w} height={0.9} fill="rgba(255,190,120,0.65)" />
      <rect x={0} y={groundY + 0.9} width={w} height={2.4} fill="rgba(255,190,120,0.1)" />

      {/* speed dashes on the ground: short ticks drifting left with the world;
          --gd (px) keeps the drift an exact multiple of the tile spacing so
          the loop closes seamlessly */}
      <g className="ec-game-ground" style={{ ['--gd' as string]: `${w * 0.3}px` }}>
        <rect x={w * 0.18} y={groundY + 3.4} width={4} height={0.8} rx={0.4} fill="rgba(255,255,255,0.16)" />
        <rect x={w * 0.48} y={groundY + 4.6} width={4} height={0.8} rx={0.4} fill="rgba(255,255,255,0.13)" />
        <rect x={w * 0.78} y={groundY + 3.8} width={4} height={0.8} rx={0.4} fill="rgba(255,255,255,0.16)" />
      </g>

      {/* incoming spike obstacles — deep violet, reads as "threat" against
          the warm sky and never blends with the teal player. Two spikes share
          one 6s track at opposite phase (-3s): each sweeps across the whole
          lane (entering off-screen right, exiting off-screen left) and the
          loop-boundary teleport happens entirely off-screen, so the runner
          reads as an endless stream of obstacles. The player hops each one
          exactly as it passes underneath. */}
      {[0, 1].map((i) => (
        <rect
          key={`ob${i}`}
          className={`ec-game-obstacle${i === 1 ? ' ec-game-obstacle-b' : ''}`}
          x={w + 4 - obsW / 2}
          y={groundY - obsH}
          width={obsW}
          height={obsH}
          rx={1}
          fill="#6d4a9e"
          style={{ ['--gx' as string]: `${w + 8}px`, animationDelay: i === 1 ? '-3s' : undefined }}
        />
      ))}
      {/* dust puff kicked up at the hop */}
      <g className="ec-game-dust" opacity={0}>
        <circle cx={playerX - 2.4} cy={groundY - 1} r={1.1} fill="rgba(255,255,255,0.35)" />
        <circle cx={playerX - 4.6} cy={groundY - 2} r={0.8} fill="rgba(255,255,255,0.25)" />
      </g>

      {/* player (cool teal rounded square with a white highlight — pops hard
          against the warm orange dusk so the hero reads instantly) */}
      <g className="ec-game-player">
        <rect
          x={playerX - playerR}
          y={playerY - playerR}
          width={playerR * 2}
          height={playerR * 2}
          rx={1.8}
          fill="#2dd4bf"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={0.6}
        />
        <rect x={playerX - playerR * 0.45} y={playerY - playerR * 0.55} width={playerR * 0.7} height={playerR * 0.55} rx={0.5} fill="rgba(255,255,255,0.6)" />
      </g>

      {/* thumb zone: translucent round JUMP button (up arrow) + pause chip */}
      <g className="ec-game-btn">
        <circle cx={btnX} cy={btnY} r={btnR} fill="rgba(255,255,255,0.12)" />
        <circle cx={btnX} cy={btnY} r={btnR} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={0.7} />
        <polygon
          points={`${btnX - 2.6},${btnY + 1.8} ${btnX + 2.6},${btnY + 1.8} ${btnX},${btnY - 2.4}`}
          fill="rgba(255,255,255,0.8)"
        />
      </g>
      {/* touch halo that flashes on the button when the hop happens */}
      <circle className="ec-game-tap" cx={btnX} cy={btnY} r={btnR} fill="none" stroke="#fff" strokeWidth={0.8} opacity={0} />
      <g>
        <rect x={2.6} y={btnY - chipH / 2} width={chipW} height={chipH} rx={1.7} fill="rgba(255,255,255,0.1)" />
        <rect x={2.6 + 1.7} y={btnY - chipH / 2 + 0.9} width={1.1} height={chipH - 1.8} rx={0.5} fill="rgba(255,255,255,0.7)" />
        <rect x={2.6 + 4.0} y={btnY - chipH / 2 + 0.9} width={1.1} height={chipH - 1.8} rx={0.5} fill="rgba(255,255,255,0.7)" />
      </g>
    </g>
  )
}

function heartPath(cx: number, cy: number, r: number) {
  return `M ${cx} ${cy + r * 0.6}
    C ${cx - r * 1.3} ${cy - r * 0.6}, ${cx - r * 0.5} ${cy - r * 1.3}, ${cx} ${cy - r * 0.4}
    C ${cx + r * 0.5} ${cy - r * 1.3}, ${cx + r * 1.3} ${cy - r * 0.6}, ${cx} ${cy + r * 0.6} Z`
}

// Social: an Instagram-style feed — no top/bottom bars, just full-screen
// posts stacked vertically and scrolled down (swipe up → next post). While the
// middle post is parked in view, a like heart pops on it; then scrolling
// continues. All loops close (frame 0 === frame 100).
function SocialScene({ w, h }: { w: number; h: number }) {
  const pad = 2
  const postH = h - pad * 2
  const postW = w - pad * 2
  // a little breathing room at the top of each post so header isn't flush
  const topGap = postH * 0.06
  const headerY = topGap
  const headerH = postH * 0.14
  const captionH = postH * 0.22
  const photoY = headerY + headerH
  const photoH = postH - photoY - captionH
  const posts = [
    { bg: '#f472b6', sun: '#fbbf24', hi: 'rgba(255,255,255,0.3)', name: 0.6, cap: 0.72, avatar: '#ef4444' },
    { bg: '#a78bfa', sun: '#fde047', hi: 'rgba(255,255,255,0.26)', name: 0.48, cap: 0.6, avatar: '#8b5cf6' },
    { bg: '#38bdf8', sun: '#fff7ed', hi: 'rgba(255,255,255,0.28)', name: 0.72, cap: 0.5, avatar: '#0ea5e9' },
  ]
  // IG-style double-tap like: a red heart pops in the middle of the photo.
  const heartR = Math.max(5, h * 0.11)
  const heartCx = w / 2
  const heartCy = photoY + photoH / 2
  return (
    <g>
      {/* stacked posts scroll down the feed */}
      <g className="ec-social-stack" style={{ ['--posth' as string]: `${postH}px` }}>
        {posts.map((p, i) => (
          <g key={i} transform={`translate(0, ${pad + i * postH})`}>
            {/* post card */}
            <rect x={pad} y={0} width={postW} height={postH} rx={3} fill="#ffffff" opacity={0.08} />
            {/* header row: avatar + username, with top breathing room */}
            <circle cx={pad + 5} cy={headerY + headerH / 2} r={3.4} fill="#fff" />
            <circle cx={pad + 5} cy={headerY + headerH / 2} r={2.7} fill={p.avatar} />
            <circle cx={pad + 4.1} cy={headerY + headerH / 2 - 1} r={0.9} fill="#fff" opacity={0.6} />
            <rect x={pad + 10} y={headerY + headerH / 2 - 1.5} width={postW * p.name} height={2.4} rx={1.2} fill="#fff" opacity={0.92} />
            {/* photo */}
            <rect x={pad} y={photoY} width={postW} height={photoH} rx={2.5} fill={p.bg} />
            <circle cx={w * 0.34} cy={photoY + photoH * 0.36} r={photoH * 0.15} fill={p.sun} opacity={0.9} />
            <path
              d={`M ${pad} ${photoY + photoH * 0.66} L ${w * 0.4} ${photoY + photoH * 0.44} L ${w * 0.62} ${photoY + photoH * 0.64} L ${w - pad} ${photoY + photoH * 0.5} L ${w - pad} ${photoY + photoH} L ${pad} ${photoY + photoH} Z`}
              fill={p.hi}
            />
            {/* caption / post content */}
            <rect x={pad + 2} y={photoY + photoH + 3} width={postW * 0.5} height={2} rx={1} fill="#fff" opacity={0.85} />
            <rect x={pad + 2} y={photoY + photoH + 6} width={postW * p.cap} height={2} rx={1} fill="#fff" opacity={0.6} />
            <rect x={pad + 2} y={photoY + photoH + 9} width={postW * 0.38} height={1.8} rx={0.9} fill="#fff" opacity={0.45} />
          </g>
        ))}
      </g>
      {/* red like heart that pops in the middle of the parked post */}
      <path className="ec-social-like" d={heartPath(heartCx, heartCy, heartR)} fill="#ef4444" />
    </g>
  )
}

// Play button and progress bar are both true closed loops on their own —
// frame 0 and frame 100 are the identical resting state — with no content
// duplication needed. A small playback head follows the progress bar, and a
// bottom timestamp line (play icon + duration) anchors it as "a video, playing".
function YoutubeScene({ w, h }: { w: number; h: number }) {
  const barH = 2.4
  const chromeY = h - barH - 4
  const headR = 1.8
  return (
    <g>
      {/* dark base behind any cap between scene and progress bar */}
      <rect x={0} y={0} width={w} height={h} fill="#0f172a" />
      {/* full-bleed dusk → night gradient sky: extends to the bottom so the
          background is continuous; the mountain silhouette sits above it */}
      <rect className="ec-yt-sky" x={0} y={0} width={w} height={h} fill="#fb923c" opacity={0.9} />
      {/* move the sun clear of the centre play button — upper-left sky */}
      <circle className="ec-yt-sun" cx={w * 0.22} cy={h * 0.26} r={h * 0.11} fill="#fde047" />
      {/* the moon climbing in as night arrives */}
      <circle className="ec-yt-moon" cx={w * 0.7} cy={h * 0.22} r={h * 0.08} fill="#e2e8f0" />
      {/* stars appear once it is truly dark */}
      {[
        [0.15, 0.18],
        [0.32, 0.13],
        [0.48, 0.22],
        [0.62, 0.11],
        [0.88, 0.24],
      ].map(([sx, sy], i) => (
        <circle key={i} className="ec-yt-star" cx={w * sx} cy={h * sy} r={0.9} fill="#fff" />
      ))}
      {/* mountain skyline below the horizon — darkens into a silhouette but
          never covered by the sky layer */}
      <g className="ec-yt-mountain">
        <path
          d={`M 0 ${h * 0.52} L ${w * 0.28} ${h * 0.42} L ${w * 0.5} ${h * 0.54} L ${w * 0.72} ${h * 0.44} L ${w} ${h * 0.52} L ${w} ${h} L 0 ${h} Z`}
          fill="#1e3a5f"
        />
        <path
          d={`M 0 ${h * 0.64} L ${w * 0.18} ${h * 0.52} L ${w * 0.4} ${h * 0.62} L ${w * 0.65} ${h * 0.5} L ${w * 0.85} ${h * 0.62} L ${w} ${h * 0.56} L ${w} ${h} L 0 ${h} Z`}
          fill="#12203a"
          opacity={0.85}
        />
      </g>

      {/* play control: a play triangle that "presses" once, then morphs to a pause
          glyph (two bars) to signal it is now playing */}
      <g className="ec-ytplay">
        <g className="ec-yt-playbtn">
          <circle cx={w / 2} cy={h / 2} r={9} fill="rgba(0,0,0,0.45)" />
          <polygon points={`${w / 2 - 3},${h / 2 - 5} ${w / 2 + 5},${h / 2} ${w / 2 - 3},${h / 2 + 5}`} fill="#fff" />
        </g>
        <g className="ec-yt-pausebtn">
          <rect x={w / 2 - 4} y={h / 2 - 4} width={2.4} height={8} rx={0.6} fill="#fff" />
          <rect x={w / 2 + 1.6} y={h / 2 - 4} width={2.4} height={8} rx={0.6} fill="#fff" />
        </g>
      </g>

      {/* single progress bar */}
      <rect x={4} y={chromeY} width={w - 8} height={barH} rx={1.2} fill="rgba(255,255,255,0.25)" />
      <rect className="ec-progress" x={4} y={chromeY} width={w - 8} height={barH} rx={1.2} fill="#ef4444" />
      <circle
        className="ec-progress-head"
        cx={4}
        cy={chromeY + barH / 2}
        r={headR}
        fill="#fff"
        style={{ ['--tw' as string]: `${w - 8}px` }}
      />
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

// Monitor slots. Order inside a row is "phones first, tablets last", so with
// everything connected the two tablets close each row: [chat, game, news] /
// [social, gallery, youtube]. Rows hug their content width and centre
// themselves. On disconnect the REMAINING devices repack to close the gap
// (rows re-form from visible devices only), while the disconnected tile
// stays mounted — parked at its last slot, faded out, animations still
// running — so reconnecting fades it back in phase and slides it smoothly
// to its new slot.
function layoutFixedSlots(
  devices: Device[],
  mon: { x: number; y: number; w: number; h: number },
  sidebar: number
): MonitorCell[] {
  const tileW = (d: Device) => (deviceFrame(d.kind).w - 8) * (d.kind === 'phone' ? 0.78 : 0.66)
  const tileH = (d: Device) => (deviceFrame(d.kind).h - 8) * (d.kind === 'phone' ? 0.78 : 0.66)

  const TIGHT = 4 // small gap between tiles
  const perRow = 3
  const all = devices.slice(0, 6)

  const areaX = mon.x + 16 + sidebar + 8
  const areaW = mon.w - 16 - sidebar - 16
  const areaY = mon.y + 12
  const areaH = mon.h - 24

  // Chunk into rows of ≤3 by device order first, then within each row the
  // tablets trail at the end — so the default full layout reads
  // [chat, game, news] / [social, gallery, youtube] (tablet closing each row).
  const rows: Device[][] = []
  for (let i = 0; i < all.length; i += perRow) {
    const chunk = all.slice(i, i + perRow)
    rows.push([...chunk.filter((d) => d.kind === 'phone'), ...chunk.filter((d) => d.kind === 'tablet')])
  }

  const rowHeights = rows.map((r) => Math.max(1, ...r.map(tileH)))
  const rowWidths = rows.map((r) => r.reduce((s, d) => s + tileW(d), 0) + TIGHT * (r.length - 1))
  const blockH = rowHeights.reduce((s, hh) => s + hh, 0) + TIGHT * (rows.length - 1)
  const gridY = areaY + (areaH - blockH) / 2

  const cells: MonitorCell[] = []
  let ry = gridY
  rows.forEach((r, ri) => {
    let rx = areaX + (areaW - rowWidths[ri]) / 2
    const rowH = rowHeights[ri]
    r.forEach((d) => {
      const kind = d.kind
      const scale = kind === 'phone' ? 0.78 : 0.66
      const frame = deviceFrame(kind)
      const screenW = frame.w - frame.pad * 2
      const screenH = frame.h - frame.pad * 2
      const tw = screenW * scale
      const th = screenH * scale
      cells.push({ d, gx: rx, gy: ry + (rowH - th) / 2, tw, th, scale, screenW, screenH })
      rx += tileW(d) + TIGHT
    })
    ry += rowH + TIGHT
  })

  // Stable device order.
  return cells.sort((a, b) => DEVICES.indexOf(a.d) - DEVICES.indexOf(b.d))
}

function layoutMonitorGrid(
  devices: Device[],
  mon: { x: number; y: number; w: number; h: number },
  sidebar: number
): MonitorCell[] {
  return layoutFixedSlots(devices, mon, sidebar)
}

export function HeroIllustration({ showFeatures = true }: { showFeatures?: boolean }) {
  // Every device starts connected. Clicking one toggles it — the device
  // itself is unaffected (it's the source, still showing its own screen);
  // only the monitor's mirror changes: the remaining tiles repack to close
  // the gap, the disconnected tile fades out at its last slot (its cell
  // stays mounted so its animations keep running and stay in phase with the
  // physical device), and the cable to it disappears. Reconnecting fades it
  // back and slides it into the repacked layout.
  const [connected, setConnected] = useState<boolean[]>(() => DEVICES.map(() => true))
  const toggleDevice = (i: number) => setConnected((prev) => prev.map((v, idx) => (idx === i ? !v : v)))

  const mon = { x: 248, y: 58, w: 404, h: 236 }
  const monCx = mon.x + mon.w / 2
  const sidebar = 36
  const inset = 12

  const visibleDevices = DEVICES.filter((_, i) => connected[i])
  const monitorCells = layoutMonitorGrid(visibleDevices, mon, sidebar)
  const cellFor = (d: Device) => monitorCells.find((c) => c.d === d)

  // A disconnected device has no slot in the repacked layout. Park its cell
  // at the LAST position it held (kept across renders) so it fades out in
  // place, keeps animating, and slides smoothly to its new slot on
  // reconnect. Cells are keyed by device index and never unmount.
  const lastCellsRef = useRef<Record<number, MonitorCell>>({})
  DEVICES.forEach((d, i) => {
    const cell = cellFor(d)
    if (cell) {
      lastCellsRef.current[i] = cell
    } else if (!lastCellsRef.current[i]) {
      // First paint with this device already disconnected: fall back to a
      // sensible parked spot so there is always a position to fade at.
      lastCellsRef.current[i] = { d, gx: mon.x + 40 + (i % 3) * 90, gy: mon.y + 60 + Math.floor(i / 3) * 80, tw: 34, th: 64, scale: 0.78, screenW: 44, screenH: 92 }
    }
  })

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
          // All cables meet the monitor at the same vertical level (its
          // vertical centre), so every line in on one shared height.
          const edgeY = mon.y + mon.h / 2
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

          {DEVICES.map((d, i) => {
            const isOn = connected[i]
            const cell = lastCellsRef.current[i]
            return (
              <g
                key={`cell-${i}`}
                className={`ec-mon-cell${isOn ? '' : ' ec-mon-hidden'}`}
                opacity={isOn ? 1 : 0}
                style={{ pointerEvents: isOn ? 'auto' : 'none' }}
              >
                <rect x={cell.gx - 3} y={cell.gy - 3} width={cell.tw + 6} height={cell.th + 6} rx="6" fill="var(--bg-elevated)" stroke="var(--border-color)" />
                <rect x={cell.gx} y={cell.gy} width={cell.tw} height={cell.th} rx="4" fill={`url(#ec-devwall-${i})`} />
                <g transform={`translate(${cell.gx}, ${cell.gy}) scale(${cell.scale})`}>
                  <DeviceScreen clipId={`ec-mon-${i}`} d={d} w={cell.screenW} h={cell.screenH} />
                </g>
              </g>
            )
          })}

          {visibleDevices.length === 0 && (
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
