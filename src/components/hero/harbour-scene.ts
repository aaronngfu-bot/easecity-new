/**
 * Shared geometry for the Victoria Harbour hero scene.
 *
 * `HarbourSkyline` draws the sky, city and vessels as SVG; `HarbourWater`
 * draws the animated water underneath as canvas. Both author in the same
 * 1600×760 viewBox space so the water's reflections land directly beneath the
 * lights that cast them.
 *
 * Everything derived here is seeded, so server and client agree.
 */

export const VB_W = 1600
export const VB_H = 760
/** Waterline; also the footing every building sits on. ~43% water / 57% sky. */
export const BASE = 428
/**
 * Push skyline PNG down so visible building feet sit in the water.
 * The keyed art carries transparent foot padding — without this drop a
 * sky-coloured gap opens between the pier and the canvas waterline.
 */
export const SKYLINE_FOOT_DROP = 125
/** Extra sky gradient below the waterline — hides PNG black foot without flat color blocks. */
export const SKY_BLEED = 105
/** Extend gradient above the viewBox top so the sky above the waterline fills in higher. */
export const SKY_LIFT = 120
export const WATER_H = VB_H - BASE

export const VESSEL_HREFS = {
  ferry: '/hero/star-ferry.png',
  junk: '/hero/junk.png',
  cruiser: '/hero/cruiser.png',
} as const

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Tone = 'warm' | 'cool' | 'teal' | 'pink' | 'gold'

export const TONE_VAR: Record<Tone, string> = {
  warm: '--hk-win-warm',
  cool: '--hk-win-cool',
  teal: '--hk-win-teal',
  pink: '--hk-accent-pink',
  gold: '--hk-accent-gold',
}

export type Block = { x: number; w: number; y: number }

export const BLOCKS_FAR: Block[] = [
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

export const BLOCKS_MID: Block[] = [
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

export const BLOCKS_NEAR: Block[] = [
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

export type Win = {
  x: number
  y: number
  tone: Tone
  o: number
  /** Blink duration / delay in seconds; absent for steady windows. */
  d?: number
  t?: number
}

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
          tone: hue > 0.91 ? 'teal' : hue > 0.63 ? 'cool' : 'warm',
          o: (0.34 + rand() * 0.55) * maxOpacity,
          d: blink ? 3.5 + rand() * 6 : undefined,
          t: blink ? rand() * 7 : undefined,
        })
      }
    }
  }
  return out
}

export const WINDOWS_FAR = buildWindows(BLOCKS_FAR, 20240817, 0.34, 0.62)
export const WINDOWS_MID = buildWindows(BLOCKS_MID, 74113, 0.44, 0.82)
export const WINDOWS_NEAR = buildWindows(BLOCKS_NEAR, 990211, 0.52, 1)

/** Neon and floodlighting that the window grid doesn't account for. */
const LANDMARK_LIGHTS: { x: number; tone: Tone; weight: number }[] = [
  { x: 90, tone: 'gold', weight: 0.7 },
  { x: 180, tone: 'gold', weight: 0.9 },
  { x: 196, tone: 'gold', weight: 1.1 },
  { x: 268, tone: 'warm', weight: 0.5 },
  { x: 534, tone: 'cool', weight: 1 },
  { x: 566, tone: 'cool', weight: 1.2 },
  { x: 668, tone: 'pink', weight: 1.1 },
  { x: 781, tone: 'teal', weight: 0.9 },
  { x: 871, tone: 'teal', weight: 0.8 },
  { x: 936, tone: 'warm', weight: 0.6 },
  { x: 1166, tone: 'warm', weight: 1.4 },
  { x: 1190, tone: 'warm', weight: 0.8 },
  { x: 1314, tone: 'pink', weight: 1.2 },
  { x: 1395, tone: 'pink', weight: 1.3 },
  { x: 1520, tone: 'warm', weight: 0.6 },
]

export type LightSource = { x: number; tone: Tone; weight: number }

/**
 * Collapses the window grid into per-column light sources so the water can
 * mirror the skyline instead of scattering unrelated sparkles.
 */
export const LIGHT_SOURCES: LightSource[] = (() => {
  const BUCKET = 15
  const TONES: Tone[] = ['warm', 'cool', 'teal', 'pink', 'gold']
  const count = Math.ceil(VB_W / BUCKET)
  const buckets: number[][] = Array.from({ length: count }, () => [0, 0, 0, 0, 0])

  const add = (x: number, tone: Tone, weight: number) => {
    const key = Math.floor(x / BUCKET)
    if (key < 0 || key >= count) return
    buckets[key][TONES.indexOf(tone)] += weight
  }

  for (const w of WINDOWS_FAR) add(w.x, w.tone, w.o * 0.5)
  for (const w of WINDOWS_MID) add(w.x, w.tone, w.o * 0.8)
  for (const w of WINDOWS_NEAR) add(w.x, w.tone, w.o)
  for (const l of LANDMARK_LIGHTS) add(l.x, l.tone, l.weight)

  const out: LightSource[] = []
  buckets.forEach((slot, key) => {
    let best = 0
    let bestIdx = 0
    let total = 0
    slot.forEach((v, i) => {
      total += v
      if (v > best) {
        best = v
        bestIdx = i
      }
    })
    if (total < 0.08) return
    out.push({
      x: key * BUCKET + BUCKET / 2,
      tone: TONES[bestIdx],
      weight: Math.min(1, total / 2.6),
    })
  })
  return out
})()

/** Hull footprints, so the water can smear each vessel's colours beneath it. */
export type VesselLayout = {
  key: 'ferry' | 'junk' | 'cruiser'
  x: number
  y: number
  w: number
  h: number
  hull: string
  accent: string
  /** PNG bow points left when true. */
  facesLeft: boolean
  /** Pixels above the image bottom where the hull meets the water. */
  draftInset: number
  /** Matches sail animation: +1 drifts right, -1 drifts left. */
  travel: 1 | -1
  bobAmp: number
  bobPeriod: number
  bobOffset: number
  bobSign: 1 | -1
  wakeMode: 'kelvin' | 'compact'
  intensity: number
  spawnGap: number
  maxRx: number
  reflectionDepth: number
  /** Nudge reflection start below hull contact (SVG viewBox px). */
  reflectionDrop: number
  /** Gap below the PNG box so dashes sit in water, never on the hull. */
  wakeSink: number
}

/** Single source of truth — SVG `<image>` boxes and water effects derive from here. */
export const VESSEL_LAYOUT: VesselLayout[] = [
  {
    key: 'ferry',
    x: 293,
    y: 442,
    w: 254,
    h: 120,
    hull: '--hk-ferry',
    accent: '--hk-hull-light',
    facesLeft: false,
    draftInset: 10,
    travel: 1,
    bobAmp: 5,
    bobPeriod: 7,
    bobOffset: 0,
    bobSign: 1,
    wakeMode: 'kelvin',
    intensity: 0.88,
    spawnGap: 0.36,
    maxRx: 54,
    reflectionDepth: 44,
    reflectionDrop: 5,
    wakeSink: 1.2,
  },
  {
    key: 'junk',
    x: 884,
    y: 504,
    w: 196,
    h: 125,
    hull: '--hk-junk',
    accent: '--hk-sail',
    facesLeft: true,
    draftInset: 0,
    travel: -1,
    bobAmp: 6,
    bobPeriod: 10,
    bobOffset: -3,
    bobSign: 1,
    wakeMode: 'kelvin',
    intensity: 0.82,
    spawnGap: 0.42,
    maxRx: 44,
    reflectionDepth: 50,
    reflectionDrop: 2,
    wakeSink: 0.5,
  },
  {
    key: 'cruiser',
    x: 1303,
    y: 542,
    w: 74,
    h: 24,
    hull: '--hk-hull-light',
    accent: '--hk-sail',
    facesLeft: true,
    draftInset: 2,
    travel: 1,
    bobAmp: 4,
    bobPeriod: 5.5,
    bobOffset: -1.8,
    bobSign: -1,
    wakeMode: 'compact',
    intensity: 0.72,
    spawnGap: 0.22,
    maxRx: 14,
    reflectionDepth: 14,
    reflectionDrop: -1,
    wakeSink: 0.4,
  },
]

export function hullWaterY(v: Pick<VesselLayout, 'y' | 'h' | 'draftInset'>) {
  return v.y + v.h - v.draftInset - BASE
}

export function hullContactY(v: Pick<VesselLayout, 'y' | 'h' | 'draftInset'>) {
  return v.y + v.h - v.draftInset
}

/** Wake anchor in vessel-local coords — hull bottom meets water. */
export function wakeLocalY(v: Pick<VesselLayout, 'h' | 'draftInset' | 'wakeSink'>) {
  return v.h - v.draftInset + v.wakeSink
}

export function sternXLocal(v: Pick<VesselLayout, 'w' | 'facesLeft'>) {
  return v.facesLeft ? v.w - 6 : 6
}

export const VESSELS: {
  x0: number
  x1: number
  hull: string
  accent: string
  /** Hull-water contact in SVG viewBox y. */
  contactY: number
  depth: number
  reflectionDrop: number
}[] = VESSEL_LAYOUT.map((v) => ({
  x0: v.x,
  x1: v.x + v.w,
  hull: v.hull,
  accent: v.accent,
  contactY: hullContactY(v),
  depth: v.reflectionDepth,
  reflectionDrop: v.reflectionDrop,
}))

/** Where the moon or sun hangs; the water glint tracks it. */
export const CELESTIAL_X = 1385
export const CELESTIAL_Y = 58
export const CELESTIAL_R = 30

export type SkylineVariant = {
  href: string
  width: number
  height: number
  /** Lowest opaque scanline in native pixels — used to align feet at the waterline. */
  footRow: number
}

/** Per-variant foot alignment so light/dark skylines register at the same waterline. */
export function skylineImageY(
  v: Pick<SkylineVariant, 'width' | 'height' | 'footRow'>,
  boxH: number,
) {
  const scale = VB_W / v.width
  const footInset = (v.height - v.footRow) * scale
  return BASE + SKYLINE_FOOT_DROP - boxH + footInset
}

/** Backdrop ridge — traced from `public/hero/hk-mountain.png` (foot on y=240). */
export const MOUNTAIN_ART = {
  width: 1024,
  height: 240,
  footRow: 239,
} as const

/** Ridge outline — smooth cubic spline traced from `hk-mountain.png`. */
export const MOUNTAIN_PATH_D =
  'M 0 240 L 0 163 C 10.7 156.7, 42.7 133.2, 64 125 C 85.3 116.8, 106.7 119.2, 128 114 C 149.3 108.8, 170.7 102, 192 94 C 213.3 86, 234.7 68.8, 256 66 C 277.3 63.2, 298.7 76.5, 320 77 C 341.3 77.5, 362.7 71.2, 384 69 C 405.3 66.8, 426.7 65.5, 448 64 C 469.3 62.5, 490.7 58.3, 512 60 C 533.3 61.7, 554.7 70, 576 74 C 597.3 78, 618.7 86.5, 640 84 C 661.3 81.5, 682.7 67.3, 704 59 C 725.3 50.7, 746.7 43.3, 768 34 C 789.3 24.7, 810.7 12, 832 6 C 853.3 2, 874.7 0, 896 7 C 912 18, 928 33, 944 51 C 960 69, 984 86, 1016 101 L 1024 107 L 1024 240 L 0 240 Z'

type RidgePt = { x: number; y: number }

/** Upper-ridge cubic segments (mountain-art coords), left → right. */
const RIDGE_CURVES: { c1: RidgePt; c2: RidgePt; end: RidgePt }[] = [
  { c1: { x: 10.7, y: 156.7 }, c2: { x: 42.7, y: 133.2 }, end: { x: 64, y: 125 } },
  { c1: { x: 85.3, y: 116.8 }, c2: { x: 106.7, y: 119.2 }, end: { x: 128, y: 114 } },
  { c1: { x: 149.3, y: 108.8 }, c2: { x: 170.7, y: 102 }, end: { x: 192, y: 94 } },
  { c1: { x: 213.3, y: 86 }, c2: { x: 234.7, y: 68.8 }, end: { x: 256, y: 66 } },
  { c1: { x: 277.3, y: 63.2 }, c2: { x: 298.7, y: 76.5 }, end: { x: 320, y: 77 } },
  { c1: { x: 341.3, y: 77.5 }, c2: { x: 362.7, y: 71.2 }, end: { x: 384, y: 69 } },
  { c1: { x: 405.3, y: 66.8 }, c2: { x: 426.7, y: 65.5 }, end: { x: 448, y: 64 } },
  { c1: { x: 469.3, y: 62.5 }, c2: { x: 490.7, y: 58.3 }, end: { x: 512, y: 60 } },
  { c1: { x: 533.3, y: 61.7 }, c2: { x: 554.7, y: 70 }, end: { x: 576, y: 74 } },
  { c1: { x: 597.3, y: 78 }, c2: { x: 618.7, y: 86.5 }, end: { x: 640, y: 84 } },
  { c1: { x: 661.3, y: 81.5 }, c2: { x: 682.7, y: 67.3 }, end: { x: 704, y: 59 } },
  { c1: { x: 725.3, y: 50.7 }, c2: { x: 746.7, y: 43.3 }, end: { x: 768, y: 34 } },
  { c1: { x: 789.3, y: 24.7 }, c2: { x: 810.7, y: 12 }, end: { x: 832, y: 6 } },
  { c1: { x: 853.3, y: 2 }, c2: { x: 874.7, y: 0 }, end: { x: 896, y: 7 } },
  { c1: { x: 912, y: 18 }, c2: { x: 928, y: 33 }, end: { x: 944, y: 51 } },
  { c1: { x: 960, y: 69 }, c2: { x: 984, y: 86 }, end: { x: 1016, y: 101 } },
]

function cubicAt(t: number, a: number, b: number, c: number, d: number) {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

function buildRidgeYLut() {
  const lut = new Array<number>(MOUNTAIN_ART.width + 1).fill(MOUNTAIN_ART.height)
  let p0: RidgePt = { x: 0, y: 163 }

  const stamp = (x: number, y: number) => {
    const xi = Math.round(x)
    if (xi < 0 || xi > MOUNTAIN_ART.width) return
    lut[xi] = Math.min(lut[xi], y)
  }

  for (const seg of RIDGE_CURVES) {
    for (let i = 0; i <= 96; i++) {
      const t = i / 96
      stamp(
        cubicAt(t, p0.x, seg.c1.x, seg.c2.x, seg.end.x),
        cubicAt(t, p0.y, seg.c1.y, seg.c2.y, seg.end.y),
      )
    }
    p0 = seg.end
  }

  // Closing ridge line to the right edge.
  for (let x = Math.round(p0.x); x <= MOUNTAIN_ART.width; x++) {
    const t = (x - p0.x) / (MOUNTAIN_ART.width - p0.x)
    stamp(x, p0.y + t * (107 - p0.y))
  }

  return lut
}

const RIDGE_Y_LUT = buildRidgeYLut()

/** Ridge elevation at x (mountain-art coords). Lower y = higher peak. */
export function ridgeYAt(x: number) {
  const xi = Math.max(0, Math.min(MOUNTAIN_ART.width, Math.round(x)))
  return RIDGE_Y_LUT[xi]
}

/** How far building bases sink below the ridge line (mountain-art px). */
export const RIDGE_BED_DEPTH = 8
/** Mask must extend above viewBox — summit blocks peak ~20px above y=0. */
export const RIDGE_MASK_PAD_TOP = 48
/** Blocks shorter than this (mountain-art px) are omitted. */
export const RIDGE_MIN_HEIGHT = 13

/** Shorter than natural aspect — keeps the ridge behind mid-rise buildings. */
export const MOUNTAIN_HEIGHT_RATIO = 0.88
/** Raise mountain waterline above hull contact (viewBox px). */
export const MOUNTAIN_FOOT_LIFT = 30

/** A lit window punch — position relative to block top-left. */
export type RidgeGlint = {
  x: number
  y: number
  w: number
  h: number
}

export type RidgeBlockSpec = {
  /** Offset from cluster / solo anchor. */
  dx: number
  w: number
  h: number
  /** Omitted = solid silhouette, no fenestration. */
  glints?: RidgeGlint[]
}

/** Clusters (dense) and solo blocks (sparse) in mountain-art coordinates. */
export type RidgeStructureSpec = {
  footX: number
  blocks: RidgeBlockSpec[]
}

export const RIDGE_STRUCTURES: RidgeStructureSpec[] = [
  /* Left foothill — loose pair */
  {
    footX: 168,
    blocks: [
      { dx: -6, w: 9, h: 12 },
      { dx: 7, w: 8, h: 10, glints: [{ x: 2.5, y: 2.5, w: 2, h: 4 }] },
    ],
  },
  /* Left ridge peak — village cluster */
  {
    footX: 256,
    blocks: [
      { dx: -24, w: 11, h: 14 },
      { dx: -10, w: 13, h: 18, glints: [{ x: 4, y: 4, w: 2.5, h: 4.5 }] },
      { dx: 6, w: 15, h: 22, glints: [{ x: 5, y: 5, w: 3, h: 5 }] },
      { dx: 22, w: 10, h: 13 },
    ],
  },
  /* Sparse mid-slope */
  { footX: 330, blocks: [{ dx: 0, w: 8, h: 11 }] },
  { footX: 368, blocks: [{ dx: 0, w: 7, h: 9, glints: [{ x: 2, y: 2, w: 2, h: 3.5 }] }] },
  /* Central crest — terrace cluster */
  {
    footX: 448,
    blocks: [
      { dx: -16, w: 12, h: 16 },
      { dx: -2, w: 14, h: 20, glints: [{ x: 4, y: 4, w: 2.5, h: 4.5 }] },
      { dx: 14, w: 11, h: 15, glints: [{ x: 3, y: 3, w: 2.5, h: 4 }] },
    ],
  },
  /* Sparse saddle */
  { footX: 520, blocks: [{ dx: 0, w: 9, h: 12, glints: [{ x: 3, y: 3, w: 2, h: 4 }] }] },
  /* Lower saddle — single cottage */
  { footX: 608, blocks: [{ dx: 0, w: 8, h: 10 }] },
  /* Rising shoulder — small group */
  {
    footX: 704,
    blocks: [
      { dx: -12, w: 11, h: 15 },
      { dx: 2, w: 13, h: 19, glints: [{ x: 4, y: 4, w: 2.5, h: 4.5 }] },
      { dx: 16, w: 9, h: 12 },
    ],
  },
  /* Secondary peak approach */
  {
    footX: 780,
    blocks: [
      { dx: -8, w: 10, h: 14, glints: [{ x: 3, y: 3, w: 2, h: 4 }] },
      { dx: 8, w: 12, h: 17 },
    ],
  },
  /* Main summit — dense cluster, tallest blocks */
  {
    footX: 878,
    blocks: [
      { dx: -32, w: 13, h: 20 },
      { dx: -16, w: 15, h: 26, glints: [{ x: 5, y: 6, w: 3, h: 5 }] },
      { dx: 2, w: 18, h: 34, glints: [{ x: 5, y: 7, w: 3.5, h: 5.5 }, { x: 11, y: 17, w: 3, h: 5 }] },
      { dx: 22, w: 14, h: 24, glints: [{ x: 4, y: 5, w: 3, h: 5 }] },
      { dx: 38, w: 11, h: 18 },
      { dx: 52, w: 9, h: 14, glints: [{ x: 2.5, y: 3, w: 2, h: 4 }] },
    ],
  },
  /* Right descent — sparse */
  { footX: 948, blocks: [{ dx: 0, w: 8, h: 11, glints: [{ x: 2.5, y: 2.5, w: 2, h: 4 }] }] },
  /* Far right knoll */
  {
    footX: 1002,
    blocks: [
      { dx: -7, w: 9, h: 12 },
      { dx: 6, w: 8, h: 10, glints: [{ x: 2, y: 2, w: 2, h: 3.5 }] },
    ],
  },
]

/** Ridge blocks/clusters below `RIDGE_MIN_HEIGHT` are skipped. */
export function visibleRidgeStructures(): RidgeStructureSpec[] {
  return RIDGE_STRUCTURES.map((s) => ({
    ...s,
    blocks: s.blocks.filter((b) => b.h >= RIDGE_MIN_HEIGHT),
  })).filter((s) => s.blocks.length > 0)
}

/** Foot anchored near ferry hull contact; same scroll parallax family as buildings. */
export function mountainLayout() {
  const ferry = VESSEL_LAYOUT.find((v) => v.key === 'ferry')!
  const height = Math.ceil(
    VB_W * (MOUNTAIN_ART.height / MOUNTAIN_ART.width) * MOUNTAIN_HEIGHT_RATIO,
  )
  const footY = hullContactY(ferry) - MOUNTAIN_FOOT_LIFT
  return {
    x: 0,
    y: footY - height,
    width: VB_W,
    height,
  }
}
