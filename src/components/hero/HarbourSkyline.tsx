import type { CSSProperties } from 'react'

/**
 * HarbourSkyline — Victoria Harbour, drawn flat-vector.
 *
 * Composition runs west to east: Convention Centre, Central Plaza, Bank of
 * China, IFC, the Observation Wheel, and the Peak ridge behind. Every colour
 * is a `--hk-*` token so the scene reads as night on the dark theme and dusk
 * on the light one (see globals.css).
 *
 * The sky fades to transparent at the top so the band dissolves into the page
 * background wherever the hero happens to crop it, and so the CityField stars
 * layered underneath stay visible above the horizon glow.
 */

const BASE = 578 // waterline / building footing
const VB_W = 1600
const VB_H = 760

/** Deterministic so server and client render identical markup. */
function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Block = { x: number; w: number; y: number }

const BLOCKS_FAR: Block[] = [
  { x: 8, w: 52, y: 486 },
  { x: 60, w: 48, y: 452 },
  { x: 104, w: 44, y: 470 },
  { x: 236, w: 50, y: 424 },
  { x: 282, w: 40, y: 452 },
  { x: 318, w: 56, y: 400 },
  { x: 370, w: 44, y: 432 },
  { x: 430, w: 58, y: 414 },
  { x: 484, w: 46, y: 444 },
  { x: 618, w: 54, y: 406 },
  { x: 666, w: 44, y: 438 },
  { x: 704, w: 60, y: 388 },
  { x: 888, w: 50, y: 422 },
  { x: 934, w: 56, y: 394 },
  { x: 986, w: 46, y: 430 },
  { x: 1222, w: 56, y: 402 },
  { x: 1340, w: 48, y: 420 },
  { x: 1436, w: 58, y: 388 },
  { x: 1490, w: 50, y: 426 },
  { x: 1536, w: 64, y: 448 },
]

const BLOCKS_MID: Block[] = [
  { x: 190, w: 46, y: 402 },
  { x: 386, w: 40, y: 374 },
  { x: 468, w: 56, y: 362 },
  { x: 700, w: 46, y: 352 },
  { x: 798, w: 52, y: 346 },
  { x: 810, w: 44, y: 368 },
  { x: 856, w: 44, y: 374 },
  { x: 958, w: 60, y: 332 },
  { x: 1026, w: 50, y: 360 },
  { x: 1080, w: 40, y: 322 },
  { x: 1238, w: 54, y: 338 },
  { x: 1296, w: 42, y: 382 },
  { x: 1394, w: 46, y: 358 },
  { x: 1466, w: 56, y: 332 },
  { x: 1528, w: 50, y: 368 },
]

const BLOCKS_NEAR: Block[] = [
  { x: 244, w: 64, y: 358 },
  { x: 300, w: 52, y: 388 },
  { x: 438, w: 56, y: 332 },
  { x: 492, w: 44, y: 396 },
  { x: 596, w: 40, y: 384 },
  { x: 660, w: 50, y: 320 },
  { x: 904, w: 66, y: 302 },
  { x: 1018, w: 56, y: 344 },
  { x: 1356, w: 54, y: 350 },
  { x: 1496, w: 62, y: 318 },
]

type Win = { x: number; y: number; c: string; o: number; d?: number; t?: number }

const WARM = 'var(--hk-win-warm)'
const COOL = 'var(--hk-win-cool)'
const TEAL = 'var(--hk-win-teal)'

function buildWindows(blocks: Block[], seed: number, density: number, maxOpacity: number): Win[] {
  const rand = mulberry32(seed)
  const out: Win[] = []
  const PITCH_X = 13
  const PITCH_Y = 17

  for (const b of blocks) {
    const cols = Math.floor((b.w - 8) / PITCH_X)
    const rows = Math.floor((BASE - b.y - 14) / PITCH_Y)
    if (cols < 1 || rows < 1) continue
    const ox = b.x + (b.w - (cols * PITCH_X - 8)) / 2

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (rand() > density) continue
        const hue = rand()
        const blink = rand() > 0.9
        out.push({
          x: ox + c * PITCH_X,
          y: b.y + 12 + r * PITCH_Y,
          c: hue > 0.91 ? TEAL : hue > 0.63 ? COOL : WARM,
          o: (0.34 + rand() * 0.55) * maxOpacity,
          d: blink ? 3.5 + rand() * 6 : undefined,
          t: blink ? rand() * 7 : undefined,
        })
      }
    }
  }
  return out
}

const WINDOWS_FAR = buildWindows(BLOCKS_FAR, 20240817, 0.34, 0.62)
const WINDOWS_MID = buildWindows(BLOCKS_MID, 74113, 0.44, 0.82)
const WINDOWS_NEAR = buildWindows(BLOCKS_NEAR, 990211, 0.52, 1)

function Windows({ wins }: { wins: Win[] }) {
  return (
    <>
      {wins.map((w, i) =>
        w.d ? (
          <rect
            key={i}
            className="hk-blink"
            x={w.x}
            y={w.y}
            width={5}
            height={7}
            fill={w.c}
            style={{ '--o': w.o, '--d': `${w.d}s`, '--t': `${w.t}s` } as CSSProperties}
          />
        ) : (
          <rect key={i} x={w.x} y={w.y} width={5} height={7} fill={w.c} opacity={w.o} />
        ),
      )}
    </>
  )
}

function Blocks({ blocks, fill }: { blocks: Block[]; fill: string }) {
  return (
    <>
      {blocks.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={b.w} height={BASE - b.y} fill={fill} />
      ))}
    </>
  )
}

/* ── Water: horizontal light streaks, denser and brighter near the shore ── */
const RIPPLES = (() => {
  const rand = mulberry32(551207)
  const out: { x: number; y: number; w: number; c: string; o: number }[] = []
  for (let i = 0; i < 150; i++) {
    const fall = Math.pow(rand(), 1.6)
    const y = BASE + 8 + fall * 168
    const hue = rand()
    out.push({
      x: rand() * VB_W,
      y,
      w: 7 + rand() * 42,
      c: hue > 0.88 ? 'var(--hk-accent-pink)' : hue > 0.7 ? TEAL : hue > 0.44 ? COOL : WARM,
      o: Math.max(0.07, (0.55 - fall * 0.42) * (0.5 + rand() * 0.8)),
    })
  }
  return out
})()

/* ── Sky: a handful of bright stars east of the hero copy ── */
const STARS = (() => {
  const rand = mulberry32(310892)
  const out: { x: number; y: number; r: number; o: number }[] = []
  for (let i = 0; i < 34; i++) {
    const x = 560 + rand() * 1020
    const y = 24 + rand() * 300
    out.push({ x, y, r: 1 + rand() * 1.7, o: 0.3 + rand() * 0.5 })
  }
  return out
})()

const WHEEL_CX = 1395
const WHEEL_CY = 528
const WHEEL_R = 43

export function HarbourSkyline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMax meet"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="hk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--hk-sky-far)" stopOpacity="0" />
          <stop offset="38%" stopColor="var(--hk-sky-far)" stopOpacity="0.85" />
          <stop offset="100%" stopColor="var(--hk-sky-near)" />
        </linearGradient>

        <radialGradient id="hk-horizon" cx="0.5" cy="1" r="0.72">
          <stop offset="0%" stopColor="var(--hk-win-teal)" stopOpacity="0.22" />
          <stop offset="60%" stopColor="var(--hk-win-teal)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--hk-win-teal)" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="hk-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--hk-water)" />
          <stop offset="100%" stopColor="var(--hk-water-deep)" />
        </linearGradient>

        <radialGradient id="hk-moon-glow">
          <stop offset="0%" stopColor="var(--hk-moon)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--hk-moon)" stopOpacity="0" />
        </radialGradient>

        <mask id="hk-moon-mask">
          <circle cx="1385" cy="112" r="30" fill="#fff" />
          <circle cx="1399" cy="100" r="26" fill="#000" />
        </mask>

        {/* Radiating ribs of the Convention Centre shell roofs */}
        <clipPath id="hk-hkcec-a">
          <path d="M18 578V546c28-48 124-66 218-42l10 74z" />
        </clipPath>
        <clipPath id="hk-hkcec-b">
          <path d="M104 578v-24c26-42 112-56 190-34l8 58z" />
        </clipPath>
      </defs>

      {/* ══ Sky ══ */}
      <rect x="0" y="0" width={VB_W} height={BASE} fill="url(#hk-sky)" />
      <ellipse cx="1120" cy={BASE} rx="640" ry="230" fill="url(#hk-horizon)" />

      <g fill="var(--hk-win-cool)">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} opacity={s.o} />
        ))}
      </g>

      {/* Moon */}
      <circle cx="1385" cy="112" r="72" fill="url(#hk-moon-glow)" />
      <circle cx="1385" cy="112" r="30" fill="var(--hk-moon)" mask="url(#hk-moon-mask)" />

      {/* Clouds */}
      <g fill="var(--hk-cloud)" opacity="0.7">
        <path d="M596 160c0-13 11-23 25-23 6 0 12 2 16 6 5-11 16-19 29-19 17 0 31 13 32 30h14c11 0 20 8 20 18s-9 18-20 18H616c-11 0-20-8-20-18 0-5 2-9 5-12z" />
        <path d="M962 226c0-11 9-19 21-19 5 0 10 2 14 5 4-9 14-16 25-16 15 0 27 11 28 25h11c9 0 17 7 17 16s-8 16-17 16H978c-9 0-17-7-17-16z" />
        <path d="M1448 196c0-9 8-17 18-17 4 0 8 1 11 4 4-8 12-14 22-14 13 0 24 10 25 22h9c8 0 15 6 15 14s-7 14-15 14h-70c-8 0-15-6-15-14z" opacity="0.75" />
      </g>

      {/* ══ Victoria Peak ridge ══ */}
      <path
        fill="var(--hk-ridge-far)"
        d="M0 578V498c92-50 174-62 256-32 78 29 128 4 190-22 82-34 162-6 252 6 92 12 172-22 252-38 102-21 182-33 262-66 68-28 108-60 150-68 50-10 112 38 174 82 40 29 62 49 84 66v152z"
      />
      <path
        fill="var(--hk-ridge-near)"
        d="M0 578V532c74-34 148-40 220-16 70 23 122 6 180-14 76-26 150-4 236 8 88 12 164-16 240-30 96-18 172-28 248-56 64-24 100-52 140-58 48-8 106 32 164 70 38 25 58 42 78 56v86z"
      />

      {/* Peak transmission mast */}
      <g stroke="var(--hk-bldg-edge)" strokeWidth="2" opacity="0.75">
        <line x1="1352" y1="292" x2="1352" y2="236" />
        <line x1="1344" y1="292" x2="1352" y2="262" />
        <line x1="1360" y1="292" x2="1352" y2="262" />
        <line x1="1346" y1="272" x2="1358" y2="272" />
      </g>
      <circle className="hk-beacon" cx="1352" cy="232" r="2.6" fill="var(--hk-accent-pink)" />

      {/* ══ City ══ */}
      <Blocks blocks={BLOCKS_FAR} fill="var(--hk-bldg-1)" />
      <Windows wins={WINDOWS_FAR} />

      <Blocks blocks={BLOCKS_MID} fill="var(--hk-bldg-2)" />
      <Windows wins={WINDOWS_MID} />

      {/* Central Plaza — gold pyramid crown */}
      <g>
        <path d="M160 578 166 372h60l6 206z" fill="var(--hk-bldg-3)" />
        <path d="M166 372h60l-30-50z" fill="var(--hk-accent-gold)" />
        <rect x="194" y="292" width="4" height="32" fill="var(--hk-accent-gold)" />
        <circle className="hk-beacon" cx="196" cy="288" r="3.2" fill="var(--hk-accent-gold)" />
        <g fill="var(--hk-win-warm)" opacity="0.55">
          <rect x="172" y="386" width="4" height="180" />
          <rect x="194" y="386" width="4" height="180" />
          <rect x="216" y="386" width="4" height="180" />
        </g>
      </g>

      {/* Bank of China Tower — triangular prisms, X-braced */}
      <g>
        <path d="M516 578V404l40-60v234z" fill="var(--hk-bldg-2)" />
        <path d="M556 578V344l40 60v174z" fill="var(--hk-bldg-1)" />
        <g stroke="var(--hk-win-cool)" strokeWidth="1.6" fill="none" opacity="0.6">
          <path d="M516 404h80M516 462h80M516 520h80" />
          <path d="M516 462 556 404l40 58M516 520l40-58 40 58M516 578l40-58 40 58" />
          <path d="M556 344 516 404M556 344l40 60" />
          <path d="M556 578V344" />
        </g>
        <g stroke="var(--hk-bldg-edge)" strokeWidth="2">
          <line x1="548" y1="352" x2="548" y2="294" />
          <line x1="564" y1="352" x2="564" y2="286" />
        </g>
        <circle className="hk-beacon" cx="564" cy="282" r="2.6" fill="var(--hk-accent-pink)" />
      </g>

      {/* Cheung Kong Center — crowned in red */}
      <g>
        <rect x="633" y="356" width="70" height={BASE - 356} fill="var(--hk-bldg-3)" />
        <rect x="633" y="356" width="70" height="12" fill="var(--hk-accent-pink)" />
        <g stroke="var(--hk-accent-pink)" strokeWidth="1.2" opacity="0.45">
          <path d="M633 400h70M633 448h70M633 496h70M633 544h70" />
        </g>
      </g>

      {/* Lippo Centre — outlined slab with a notched crown */}
      <g>
        <path
          d="M750 578V400h18v-17h27v17h18v178z"
          fill="var(--hk-bldg-1)"
          stroke="var(--hk-win-cool)"
          strokeWidth="1.8"
          strokeOpacity="0.7"
        />
        <g fill="var(--hk-win-teal)" opacity="0.6">
          <rect x="758" y="412" width="3" height="152" />
          <rect x="780" y="412" width="3" height="152" />
          <rect x="802" y="412" width="3" height="152" />
        </g>
      </g>

      {/* Slim tower, teal-lit spine */}
      <g>
        <rect
          x="852"
          y="392"
          width="39"
          height={BASE - 392}
          fill="var(--hk-bldg-1)"
          stroke="var(--hk-win-teal)"
          strokeWidth="1.6"
          strokeOpacity="0.65"
        />
        <rect x="869" y="392" width="5" height={BASE - 392} fill="var(--hk-win-teal)" opacity="0.4" />
      </g>

      <Blocks blocks={BLOCKS_NEAR} fill="var(--hk-bldg-3)" />
      <Windows wins={WINDOWS_NEAR} />

      {/* Two IFC — tapered shaft, finned crown */}
      <g>
        <path d="M1119 578 1129 212h74l10 366z" fill="var(--hk-bldg-3)" />
        <path d="M1131 214c5-34 17-58 35-66 18 8 30 32 35 66z" fill="var(--hk-bldg-2)" />
        <g stroke="var(--hk-bldg-edge)" strokeWidth="2.5" strokeLinecap="round">
          <line x1="1142" y1="178" x2="1142" y2="164" />
          <line x1="1153" y1="164" x2="1153" y2="148" />
          <line x1="1166" y1="152" x2="1166" y2="130" />
          <line x1="1179" y1="164" x2="1179" y2="148" />
          <line x1="1190" y1="178" x2="1190" y2="164" />
        </g>
        <circle className="hk-beacon" cx="1166" cy="126" r="3" fill="var(--hk-accent-pink)" />
        {/* Setbacks */}
        <g fill="var(--hk-bldg-1)" opacity="0.55">
          <rect x="1122" y="300" width="88" height="6" />
          <rect x="1120" y="400" width="92" height="6" />
          <rect x="1119" y="490" width="94" height="6" />
        </g>
        {/* Vertical ribs */}
        <g stroke="var(--hk-bldg-edge)" strokeWidth="1" opacity="0.28">
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={1134 + i * 11} y1="216" x2={1132 + i * 11.6} y2={BASE} />
          ))}
        </g>
        <g fill={WARM}>
          {Array.from({ length: 44 }, (_, i) => {
            const row = Math.floor(i / 4)
            const col = i % 4
            return (
              <rect
                key={i}
                x={1136 + col * 18}
                y={228 + row * 30}
                width={6}
                height={9}
                opacity={0.35 + ((i * 37) % 11) / 20}
              />
            )
          })}
        </g>
      </g>

      {/* The Center — banded neon */}
      <g>
        <rect x="1281" y="360" width="66" height={BASE - 360} fill="var(--hk-bldg-2)" />
        <rect x="1291" y="344" width="46" height="16" fill="var(--hk-bldg-3)" />
        <g opacity="0.7">
          {Array.from({ length: 9 }, (_, i) => (
            <rect
              key={i}
              x="1281"
              y={368 + i * 23}
              width="66"
              height="5"
              fill={i % 3 === 0 ? 'var(--hk-accent-pink)' : i % 3 === 1 ? TEAL : COOL}
            />
          ))}
        </g>
      </g>

      {/* Observation Wheel */}
      <g>
        <g stroke="var(--hk-bldg-edge)" strokeWidth="3">
          <line x1={WHEEL_CX} y1={WHEEL_CY} x2={WHEEL_CX - 22} y2={BASE} />
          <line x1={WHEEL_CX} y1={WHEEL_CY} x2={WHEEL_CX + 22} y2={BASE} />
        </g>
        <g className="hk-wheel">
          <circle
            cx={WHEEL_CX}
            cy={WHEEL_CY}
            r={WHEEL_R}
            fill="none"
            stroke="var(--hk-accent-pink)"
            strokeWidth="2.2"
          />
          <circle
            cx={WHEEL_CX}
            cy={WHEEL_CY}
            r={WHEEL_R - 9}
            fill="none"
            stroke="var(--hk-accent-pink)"
            strokeWidth="1"
            opacity="0.5"
          />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2
            const sx = WHEEL_CX + Math.cos(a) * WHEEL_R
            const sy = WHEEL_CY + Math.sin(a) * WHEEL_R
            return (
              <g key={i}>
                <line
                  x1={WHEEL_CX}
                  y1={WHEEL_CY}
                  x2={sx}
                  y2={sy}
                  stroke="var(--hk-win-cool)"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
                <circle cx={sx} cy={sy} r="2.6" fill="var(--hk-win-cool)" opacity="0.85" />
              </g>
            )
          })}
          <circle cx={WHEEL_CX} cy={WHEEL_CY} r="6" fill="var(--hk-bldg-edge)" />
        </g>
      </g>

      {/* Hong Kong Convention & Exhibition Centre — shell roofs */}
      <g>
        <path d="M18 578V546c28-48 124-66 218-42l10 74z" fill="var(--hk-bldg-2)" />
        <g clipPath="url(#hk-hkcec-a)" stroke="var(--hk-accent-gold)" strokeWidth="1.6" opacity="0.55">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1={130 + i * 4} y1="700" x2={10 + i * 30} y2="480" />
          ))}
        </g>
        <path d="M104 578v-24c26-42 112-56 190-34l8 58z" fill="var(--hk-bldg-3)" />
        <g clipPath="url(#hk-hkcec-b)" stroke="var(--hk-accent-gold)" strokeWidth="1.6" opacity="0.6">
          {Array.from({ length: 8 }, (_, i) => (
            <line key={i} x1={200 + i * 3} y1="700" x2={96 + i * 28} y2="496" />
          ))}
        </g>
        <rect x="0" y="556" width="360" height="22" fill="var(--hk-bldg-1)" />
        <g fill={WARM} opacity="0.7">
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={8 + i * 16} y="562" width="7" height="6" />
          ))}
        </g>
      </g>

      {/* ══ Promenade ══ */}
      <rect x="0" y="570" width={VB_W} height="8" fill="var(--hk-bldg-edge)" opacity="0.22" />
      <g fill={WARM} opacity="0.55">
        {Array.from({ length: 40 }, (_, i) => (
          <circle key={i} cx={20 + i * 40} cy="572" r="1.8" />
        ))}
      </g>

      {/* ══ Water ══ */}
      <rect x="0" y={BASE} width={VB_W} height={VB_H - BASE} fill="url(#hk-water)" />
      <g>
        {RIPPLES.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height="2.6" rx="1.3" fill={r.c} opacity={r.o} />
        ))}
      </g>

      {/* ══ Vessels ══ */}

      {/* Star Ferry */}
      <g className="hk-bob">
        <rect x="322" y="548" width="196" height="24" fill="var(--hk-hull-light)" />
        <rect x="336" y="536" width="120" height="14" fill="var(--hk-hull-light)" opacity="0.9" />
        <path d="M304 572h230l-14 26H318z" fill="var(--hk-ferry)" />
        <rect x="304" y="572" width="230" height="5" fill="var(--hk-hull)" opacity="0.5" />
        <g fill="var(--hk-hull)" opacity="0.6">
          {Array.from({ length: 13 }, (_, i) => (
            <rect key={i} x={330 + i * 14} y="554" width="8" height="9" />
          ))}
        </g>
        <g stroke="var(--hk-hull-light)" strokeWidth="2.4">
          <line x1="358" y1="536" x2="358" y2="512" />
          <line x1="470" y1="548" x2="470" y2="518" />
        </g>
        <circle className="hk-beacon" cx="358" cy="509" r="2.4" fill="var(--hk-win-warm)" />
      </g>

      {/* Aqua Luna — red-sailed junk */}
      <g className="hk-bob-b">
        <g fill="var(--hk-sail)">
          <path d="M968 570V462c40 8 68 34 80 66 5 14 5 29 2 42z" />
          <path d="M1058 570V486c30 10 48 34 52 62 2 8 2 16 1 22z" opacity="0.92" />
          <path d="M930 570v-72c-24 10-38 30-42 52-1 7-1 14 0 20z" opacity="0.85" />
        </g>
        <g stroke="var(--hk-hull)" strokeWidth="1.4" opacity="0.45">
          <path d="M968 486h68M968 508h78M968 530h82M968 552h84" />
          <path d="M1058 508h48M1058 530h52M1058 552h53" />
        </g>
        <g stroke="var(--hk-hull)" strokeWidth="2.6">
          <line x1="966" y1="570" x2="966" y2="450" />
          <line x1="1056" y1="570" x2="1056" y2="476" />
          <line x1="932" y1="570" x2="932" y2="490" />
        </g>
        <path d="M896 570h214l-18 30H912z" fill="var(--hk-hull)" />
        <path d="M888 570c8-6 14-8 22-8v8z" fill="var(--hk-hull)" />
        <g fill="var(--hk-win-warm)" opacity="0.8">
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={918 + i * 24} y="576" width="9" height="6" />
          ))}
        </g>
      </g>

      {/* Cruiser */}
      <g className="hk-bob-c">
        <path d="M1288 582h104l-12 18h-80z" fill="var(--hk-hull-light)" />
        <path d="M1310 570h44l10 12h-62z" fill="var(--hk-hull-light)" opacity="0.9" />
        <rect x="1288" y="582" width="104" height="4" fill="var(--hk-sail)" opacity="0.8" />
        <line x1="1352" y1="570" x2="1352" y2="554" stroke="var(--hk-hull-light)" strokeWidth="2" />
      </g>
    </svg>
  )
}
