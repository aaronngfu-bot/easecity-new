import s from './editorial.module.css'

/**
 * One monoline diagram per capability, drawn on the same 48-unit bed so the six
 * read as a set. Each runs its own closed loop in CSS, offset from its
 * neighbours by the row's `--rd`, so the index has movement in it without a
 * pointer and without six diagrams beating in step.
 */

const TILES = [
  [4, 8],
  [18.5, 8],
  [33, 8],
  [4, 25],
  [18.5, 25],
  [33, 25],
] as const

export function FeatureGlyph({ id }: { id: string }) {
  switch (id) {
    // Devices arriving one after another until the grid is full.
    case 'f1':
      return (
        <svg className={s.glyph} viewBox="0 0 48 48" aria-hidden>
          {TILES.map(([x, y], i) => (
            <rect
              key={`${x}-${y}`}
              className={s.gTile}
              x={x}
              y={y}
              width={11}
              height={15}
              rx={2}
              style={{ ['--gd' as string]: `${(i * 0.19).toFixed(2)}s` }}
            />
          ))}
        </svg>
      )

    // One pane taking the room the others give up.
    case 'f2':
      return (
        <svg className={s.glyph} viewBox="0 0 48 48" aria-hidden>
          <rect className={s.gMinor} x={30} y={9} width={14} height={8} rx={1.5} />
          <rect className={s.gMinor} x={30} y={20} width={14} height={8} rx={1.5} />
          <rect className={s.gMinor} x={30} y={31} width={14} height={8} rx={1.5} />
          <rect className={s.gFocus} x={4} y={9} width={21} height={30} rx={2.5} />
        </svg>
      )

    // Two arrows closing on their targets from opposite directions.
    case 'f3':
      return (
        <svg className={s.glyph} viewBox="0 0 48 48" aria-hidden>
          <rect x={2} y={11} width={14} height={26} rx={2} />
          <rect x={32} y={11} width={14} height={26} rx={2} />
          <g className={s.gArrowA}>
            <path d="M18 19 H29" />
            <path d="M26 16.2 L29 19 L26 21.8" />
          </g>
          <g className={s.gArrowB}>
            <path d="M30 29 H19" />
            <path d="M22 26.2 L19 29 L22 31.8" />
          </g>
        </svg>
      )

    // A session crossing from one desk to the other.
    case 'f4':
      return (
        <svg className={s.glyph} viewBox="0 0 48 48" aria-hidden>
          <rect x={2} y={20} width={17} height={13} rx={1.5} />
          <path d="M10.5 33 V37 M6.5 37 H14.5" />
          <rect x={29} y={20} width={17} height={13} rx={1.5} />
          <path d="M37.5 33 V37 M33.5 37 H41.5" />
          <path className={s.gArc} d="M10.5 17 Q24 4 37.5 17" />
          <circle className={s.gDot} cx={0} cy={0} r={2.4} />
        </svg>
      )

    // A pointer reaching the glass, and the tap landing under it.
    case 'f5':
      return (
        <svg className={s.glyph} viewBox="0 0 48 48" aria-hidden>
          <rect x={13} y={4} width={22} height={40} rx={3.5} />
          <path d="M19.5 8.5 H28.5" />
          <circle className={s.gTap} cx={21} cy={19} r={5.5} />
          <path
            className={s.gCursor}
            d="M24 22 L33.5 28 L28.8 29 L31 33.6 L28.3 34.9 L26.1 30.3 L23.4 33.2 Z"
          />
        </svg>
      )

    // A frame closing on the shot, with the marker lighting once it lands.
    case 'f6':
      return (
        <svg className={s.glyph} viewBox="0 0 48 48" aria-hidden>
          <path className={s.gCorner} d="M5 17 V8 h9" />
          <path className={s.gCorner} d="M34 8 h9 v9" />
          <path className={s.gCorner} d="M43 31 v9 h-9" />
          <path className={s.gCorner} d="M14 40 H5 v-9" />
          <circle className={s.gRec} cx={24} cy={24} r={4} />
        </svg>
      )

    default:
      return null
  }
}
