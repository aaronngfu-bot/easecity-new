import s from './editorial.module.css'

/**
 * One drawing per install step, on the same 48-unit bed as the capability
 * glyphs. Four columns of numeral and prose read as a form to fill in; each
 * step showing what actually happens gives the sequence a hand in it. Every
 * loop closes on its own first frame and is offset by the column's `--rd`.
 */

const PANES = [
  [25, 13],
  [35.5, 13],
  [25, 21],
  [35.5, 21],
] as const

export function StepGlyph({ id }: { id: string }) {
  switch (id) {
    // The download arriving, and the tray taking it.
    case 'w1':
      return (
        <svg className={s.stepGlyph} viewBox="0 0 48 48" aria-hidden>
          <path className={s.wTray} d="M8 32 v8 h32 v-8" />
          <g className={s.wDrop}>
            <path d="M24 7 V24" />
            <path d="M17.5 18 L24 24.5 L30.5 18" />
          </g>
        </svg>
      )

    // The cable finding the port, and the port taking hold.
    case 'w2':
      return (
        <svg className={s.stepGlyph} viewBox="0 0 48 48" aria-hidden>
          <rect x={3} y={13} width={13} height={22} rx={2.5} />
          {/* Sat high enough that the cable met its bottom corner rather than
              its port. Both devices now stand on the same line and the run is
              level with both their centres. */}
          <rect x={30} y={18} width={16} height={12} rx={1.5} />
          <path d="M38 30 V35 M33.5 35 H42.5" />
          <path className={s.wLink} d="M16 24 H30" />
          {/* A ring, not a disc. Filled with the section's own background it
              interrupts the bezel it sits on and masks the last of the cable,
              so it reads as a socket the cable runs into. As a solid dot it
              ate a notch out of the frame line and sat half inside the
              screen, which read as a blob stuck on the edge. */}
          <circle className={s.wPort} cx={30} cy={24} r={2.4} />
        </svg>
      )

    // The phone's screen arriving on the desktop, pane by pane.
    case 'w3':
      return (
        <svg className={s.stepGlyph} viewBox="0 0 48 48" aria-hidden>
          <rect x={3} y={12} width={13} height={23} rx={2.5} />
          <rect x={21} y={9} width={25} height={21} rx={2} />
          <path d="M33.5 30 V35 M29 35 H38" />
          {PANES.map(([x, y], i) => (
            <rect
              key={`${x}-${y}`}
              className={s.wPane}
              x={x}
              y={y}
              width={7.5}
              height={5.5}
              rx={1}
              style={{ ['--gd' as string]: `${(i * 0.22).toFixed(2)}s` }}
            />
          ))}
        </svg>
      )

    // A hand on the glass, and the session going out to the room.
    case 'w4':
      return (
        <svg className={s.stepGlyph} viewBox="0 0 48 48" aria-hidden>
          <rect x={8} y={8} width={19} height={32} rx={3} />
          <circle className={s.wTouch} cx={17.5} cy={21} r={5} />
          <path
            className={s.wHand}
            d="M20 24 L29 29.5 L24.6 30.5 L26.7 34.8 L24.1 36 L22 31.7 L19.5 34.4 Z"
          />
          <path className={s.wWave} style={{ ['--gd' as string]: '0s' }} d="M32 18 a9 9 0 0 1 0 13" />
          <path className={s.wWave} style={{ ['--gd' as string]: '0.34s' }} d="M37 13 a16 16 0 0 1 0 23" />
        </svg>
      )

    default:
      return null
  }
}
