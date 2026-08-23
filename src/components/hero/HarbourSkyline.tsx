import { HarbourWater } from './HarbourWater'
import {
  CELESTIAL_R,
  CELESTIAL_X,
  CELESTIAL_Y,
  BASE,
  SKY_BLEED,
  SKY_LIFT,
  VESSEL_HREFS,
  VESSEL_LAYOUT,
  MOUNTAIN_ART,
  MOUNTAIN_PATH_D,
  mountainLayout,
  ridgeYAt,
  RIDGE_BED_DEPTH,
  RIDGE_MASK_PAD_TOP,
  visibleRidgeStructures,
  type RidgeBlockSpec,
  skylineImageY,
  VB_H,
  VB_W,
} from './harbour-scene'

/**
 * HarbourSkyline - Victoria Harbour hero backdrop.
 *
 * Buildings are a keyed PNG composited into the SVG at the waterline; sky,
 * animated water, and vessels stay as before.
 *
 * `className` must position the wrapper - `.hk-scene` sizes itself by aspect
 * ratio but deliberately declares no `position` of its own.
 */

/* Beam-on vessel art — keyed off its backdrop, sized to the traced hull spans. */
const VESSEL_ART = Object.fromEntries(
  VESSEL_LAYOUT.map((v) => [
    v.key,
    { href: VESSEL_HREFS[v.key], x: v.x, y: v.y, width: v.w, height: v.h },
  ]),
) as Record<
  (typeof VESSEL_LAYOUT)[number]['key'],
  { href: string; x: number; y: number; width: number; height: number }
>

/** Buildings art - native pixels after dekey (MaxWidth 3840, aligned foot). */
const SKYLINE_ART = {
  light: {
    href: '/hero/hk-skyline-light.png',
    width: 3840,
    height: 1612,
    footRow: 1603,
  },
  dark: {
    href: '/hero/hk-skyline-dark.png',
    width: 5504,
    height: 2310,
    footRow: 2283,
  },
  /** viewBox y where building footing meets the water. */
  waterline: BASE,
} as const

/** Aspect-fitted height at hero width - `meet` fills 1600vb wide (not height-limited). */
const SKYLINE_BOX_H = Math.ceil(
  VB_W *
    Math.max(
      SKYLINE_ART.light.height / SKYLINE_ART.light.width,
      SKYLINE_ART.dark.height / SKYLINE_ART.dark.width,
    ),
)

const MOUNTAIN_BOX = mountainLayout()
const RIDGE_VISIBLE = visibleRidgeStructures()

function ridgeBlockLayout(footX: number, dx: number, w: number, h: number) {
  const cx = footX + dx
  const bedY = ridgeYAt(cx) + RIDGE_BED_DEPTH
  const x = cx - w / 2
  const y = bedY - h
  return { x, y, cx, bedY }
}

function RidgeBlockBody({ footX, dx, w, h }: RidgeBlockSpec & { footX: number }) {
  const { x, y } = ridgeBlockLayout(footX, dx, w, h)
  return <rect x={x} y={y} width={w} height={h} className="hk-ridge-block" rx="0.6" />
}

function RidgeWindowMaskHoles({ footX, dx, w, h, glints }: RidgeBlockSpec & { footX: number }) {
  const { x, y } = ridgeBlockLayout(footX, dx, w, h)
  if (!glints?.length) return null

  return (
    <>
      {glints.map((g, i) => (
        <rect
          key={i}
          x={x + g.x}
          y={y + g.y}
          width={g.w}
          height={g.h}
          fill="#000"
          rx="0.3"
        />
      ))}
    </>
  )
}

function RidgeBlockGlints({ footX, dx, w, h, glints }: RidgeBlockSpec & { footX: number }) {
  const { x, y } = ridgeBlockLayout(footX, dx, w, h)
  if (!glints?.length) return null

  return (
    <>
      {glints.map((g, i) => (
        <rect
          key={i}
          x={x + g.x}
          y={y + g.y}
          width={g.w}
          height={g.h}
          className="hk-ridge-glint-night"
          style={{ animationDelay: `${-(i % 4) * 0.9}s` }}
          rx="0.3"
        />
      ))}
    </>
  )
}

/** A fluffy cumulus cloud - overlapping circles on a flat base.
 *  Outer layer carries the drift animation class; inner layer holds the
 *  positional translate+scale so CSS transform (animation) never clobbers it. */
function Cloud({
  className,
  x,
  y,
  scale = 1,
}: {
  className?: string
  x: number
  y: number
  scale?: number
}) {
  return (
    <g className={className}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <circle cx="18" cy="24" r="14" />
        <circle cx="40" cy="12" r="18" />
        <circle cx="66" cy="20" r="15" />
        <circle cx="88" cy="26" r="11" />
        <rect x="8" y="22" width="90" height="12" rx="6" />
      </g>
    </g>
  )
}

export function HarbourSkyline({ className = '' }: { className?: string }) {
  return (
    <div className={`hk-scene ${className}`}>
      <HarbourWater className="hk-scene-water hk-parallax-water hk-enter-water" />

      <svg
        className="hk-scene-city"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMax meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id="hk-sky"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1={-SKY_LIFT}
            x2="0"
            y2={BASE + SKY_BLEED}
          >
            <stop offset="0%" stopColor="var(--hk-sky-far)" stopOpacity="0" />
            <stop offset="22%" stopColor="var(--hk-sky-far)" stopOpacity="0.42" />
            <stop offset="48%" stopColor="var(--hk-sky-far)" stopOpacity="0.88" />
            <stop offset="76%" stopColor="var(--hk-sky-far)" />
            <stop offset="100%" stopColor="var(--hk-sky-near)" />
          </linearGradient>

          <radialGradient id="hk-moon-glow">
            <stop offset="0%" stopColor="var(--hk-moon)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--hk-moon)" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="hk-sun-corona">
            <stop offset="0%" stopColor="var(--hk-sun)" stopOpacity="0.45" />
            <stop offset="40%" stopColor="var(--hk-sun)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--hk-sun)" stopOpacity="0" />
          </radialGradient>

          <mask id="hk-moon-mask">
            <circle cx={CELESTIAL_X} cy={CELESTIAL_Y} r={CELESTIAL_R} fill="#fff" />
            <circle cx={CELESTIAL_X + 14} cy={CELESTIAL_Y - 12} r={CELESTIAL_R - 4} fill="#000" />
          </mask>
        </defs>

        {/* == Sky — gradient lifted above viewBox; bleeds below waterline. */}
        <g className="hk-parallax-sky">
          <rect
            x="0"
            y={-SKY_LIFT}
            width={VB_W}
            height={SKYLINE_ART.waterline + SKY_BLEED + SKY_LIFT}
            fill="url(#hk-sky)"
          />
        </g>

        {/* == Mountains — same box model as skyline <image>, behind buildings. */}
        <g className="hk-parallax-mountains">
          <g className="hk-enter-mountains" transform={`translate(${MOUNTAIN_BOX.x} ${MOUNTAIN_BOX.y})`}>
            <svg
              width={MOUNTAIN_BOX.width}
              height={MOUNTAIN_BOX.height}
              viewBox={`0 0 ${MOUNTAIN_ART.width} ${MOUNTAIN_ART.height}`}
              preserveAspectRatio="none"
              overflow="visible"
              aria-hidden="true"
            >
              <defs>
                <mask
                  id="hk-ridge-window-mask"
                  maskUnits="userSpaceOnUse"
                  maskContentUnits="userSpaceOnUse"
                >
                  <rect
                    x="0"
                    y={-RIDGE_MASK_PAD_TOP}
                    width={MOUNTAIN_ART.width}
                    height={MOUNTAIN_ART.height + RIDGE_MASK_PAD_TOP}
                    fill="#fff"
                  />
                  {RIDGE_VISIBLE.map((s, i) => (
                    <g key={i}>
                      {s.blocks.map((block, j) => (
                        <RidgeWindowMaskHoles key={j} footX={s.footX} {...block} />
                      ))}
                    </g>
                  ))}
                </mask>
              </defs>
              <g className="hk-mountain-stack">
                <g className="hk-ridge-buildings" mask="url(#hk-ridge-window-mask)">
                  {RIDGE_VISIBLE.map((s, i) => (
                    <g key={i} className="hk-ridge-structure">
                      {s.blocks.map((block, j) => (
                        <RidgeBlockBody key={j} footX={s.footX} {...block} />
                      ))}
                    </g>
                  ))}
                </g>
                <path d={MOUNTAIN_PATH_D} className="hk-mountain-art" />
              </g>
              <g className="hk-ridge-glints-night">
                {RIDGE_VISIBLE.map((s, i) => (
                  <g key={i} className="hk-ridge-structure">
                    {s.blocks.map((block, j) => (
                      <RidgeBlockGlints key={j} footX={s.footX} {...block} />
                    ))}
                  </g>
                ))}
              </g>
            </svg>
          </g>
        </g>

        {/* Moon after dark, sun by day - toggled in globals.css off `.dark`. */}
        <g className="hk-parallax-celestial">
          <g className="hk-enter-celestial">
            <g className="hk-night hk-celestial-float">
              <circle className="hk-moon-halo" cx={CELESTIAL_X} cy={CELESTIAL_Y} r="76" fill="url(#hk-moon-glow)" />
              <circle
                cx={CELESTIAL_X}
                cy={CELESTIAL_Y}
                r={CELESTIAL_R}
                fill="var(--hk-moon)"
                mask="url(#hk-moon-mask)"
              />
            </g>

            <g className="hk-day hk-celestial-float">
              <circle className="hk-sun-halo" cx={CELESTIAL_X} cy={CELESTIAL_Y} r="96" fill="url(#hk-sun-corona)" />
              <circle cx={CELESTIAL_X} cy={CELESTIAL_Y} r={CELESTIAL_R} fill="var(--hk-sun)" />
            </g>
          </g>
        </g>

        {/* Clouds - fluffy cumulus, drifting at their own pace */}
        <g className="hk-parallax-clouds">
          <g className="hk-enter-clouds hk-clouds">
            <Cloud className="hk-cloud hk-cloud-a" x={560} y={68} scale={1.1} />
            <Cloud className="hk-cloud hk-cloud-b" x={940} y={102} scale={0.8} />
            <Cloud className="hk-cloud hk-cloud-c" x={1310} y={118} scale={1.4} />
          </g>
        </g>

        {/* == City - illustration replaces vector buildings only == */}
        <g className="hk-parallax-buildings">
          <g className="hk-enter-buildings">
            <g>
            <image
              href={SKYLINE_ART.light.href}
              x="0"
              y={skylineImageY(SKYLINE_ART.light, SKYLINE_BOX_H)}
              width={VB_W}
              height={SKYLINE_BOX_H}
              className="hk-skyline-art hk-skyline-light"
              preserveAspectRatio="xMidYMax meet"
            />
            <image
              href={SKYLINE_ART.dark.href}
              x="0"
              y={skylineImageY(SKYLINE_ART.dark, SKYLINE_BOX_H)}
              width={VB_W}
              height={SKYLINE_BOX_H}
              className="hk-skyline-art hk-skyline-dark"
              preserveAspectRatio="xMidYMax meet"
            />
            </g>
          </g>
        </g>

        {/* == Vessels == */}
        <g className="hk-parallax-vessel hk-parallax-vessel-a">
          <g className="hk-enter-vessel hk-enter-vessel-a">
            <g className="hk-vessel-sail">
            <g className="hk-bob">
            <g transform={`translate(${VESSEL_LAYOUT[0].x} ${VESSEL_LAYOUT[0].y})`}>
            <image
              href={VESSEL_ART.ferry.href}
              x={0}
              y={0}
              width={VESSEL_ART.ferry.width}
              height={VESSEL_ART.ferry.height}
              className="hk-vessel-art"
            />
            </g>
            </g>
            </g>
          </g>
        </g>

        <g className="hk-parallax-vessel hk-parallax-vessel-b">
          <g className="hk-enter-vessel hk-enter-vessel-b">
            <g className="hk-vessel-sail-b">
            <g className="hk-bob-b">
            <g transform={`translate(${VESSEL_LAYOUT[1].x} ${VESSEL_LAYOUT[1].y})`}>
            <image
              href={VESSEL_ART.junk.href}
              x={0}
              y={0}
              width={VESSEL_ART.junk.width}
              height={VESSEL_ART.junk.height}
              className="hk-vessel-art"
            />
            </g>
            </g>
            </g>
          </g>
        </g>

        <g className="hk-parallax-vessel hk-parallax-vessel-c">
          <g className="hk-enter-vessel hk-enter-vessel-c">
            <g className="hk-vessel-sail-c">
            <g className="hk-bob-c">
            <g transform={`translate(${VESSEL_LAYOUT[2].x} ${VESSEL_LAYOUT[2].y})`}>
            <image
              href={VESSEL_ART.cruiser.href}
              x={0}
              y={0}
              width={VESSEL_ART.cruiser.width}
              height={VESSEL_ART.cruiser.height}
              className="hk-vessel-art"
            />
            </g>
            </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  )
}