import s from './atelier.module.css'

/**
 * Three monoline diagrams for the quote steps, on the same 48-unit bed as the
 * product page's capability glyphs so the two pages draw in one hand.
 *
 * All three share one ink frame — x 9→39, y 8→40 — rather than each shape
 * being drawn to fit its own idea of the bed. Stacked in a column the eye reads
 * the left edges and the top edges against the numerals beside them, so a
 * shape that starts a few units further out or a few units lower than its
 * neighbours reads as misplaced even though every `svg` box is identical.
 * `.stepGlyph`'s negative top margin is set against y = 8 to put that frame's
 * top on the numeral's cap height; moving the frame means moving the margin.
 *
 * Everything that moves is drawn with `pathLength={1}`, so a single normalised
 * keyframe set (`qDraw`) serves strokes of any length and nothing is ever
 * scaled. The outer shape of each glyph stays put and only its contents
 * animate, so a step is always legible even at the quiet end of its cycle, and
 * every stroke both enters and leaves by the dash offset — no opacity track,
 * which is what the loop used to hitch on.
 */

export function QuoteGlyph({ step }: { step: number }) {
  switch (step) {
    // A note arriving: the lines write themselves in, one after another.
    case 0:
      return (
        <svg className={s.stepGlyph} viewBox="0 0 48 48" aria-hidden>
          <path d="M12 8 h24 a3 3 0 0 1 3 3 v18 a3 3 0 0 1 -3 3 H21 l-6 8 v-8 H12 a3 3 0 0 1 -3 -3 V11 a3 3 0 0 1 3 -3 z" />
          <path className={s.qDraw} pathLength={1} d="M14 14 h20" style={{ ['--gd' as string]: '0s' }} />
          <path className={s.qDraw} pathLength={1} d="M14 20 h15" style={{ ['--gd' as string]: '0.2s' }} />
          <path className={s.qDraw} pathLength={1} d="M14 26 h10" style={{ ['--gd' as string]: '0.4s' }} />
        </svg>
      )

    // The work getting named, then measured end to end.
    case 1:
      return (
        <svg className={s.stepGlyph} viewBox="0 0 48 48" aria-hidden>
          <path d="M11.5 8 H36.5 a2.5 2.5 0 0 1 2.5 2.5 V28.5 a2.5 2.5 0 0 1 -2.5 2.5 H11.5 a2.5 2.5 0 0 1 -2.5 -2.5 V10.5 a2.5 2.5 0 0 1 2.5 -2.5 z" />
          <path className={s.qDraw} pathLength={1} d="M15 16 h18" style={{ ['--gd' as string]: '0s' }} />
          <path className={s.qDraw} pathLength={1} d="M15 23 h11" style={{ ['--gd' as string]: '0.2s' }} />
          <path className={s.qDraw} pathLength={1} d="M9 37 H39" style={{ ['--gd' as string]: '0.5s' }} />
          <path className={s.qDraw} pathLength={1} d="M9 34 v6 M39 34 v6" style={{ ['--gd' as string]: '0.78s' }} />
        </svg>
      )

    // The proposal filling in, then the mark that says it is signed off.
    // The sheet stops at y 38 so the seal, whose fill masks whatever it covers,
    // takes the whole bottom-right corner instead of leaving it poking out.
    case 2:
      return (
        <svg className={s.stepGlyph} viewBox="0 0 48 48" aria-hidden>
          <path d="M11 8 h12 l7 7 v21 a2 2 0 0 1 -2 2 H11 a2 2 0 0 1 -2 -2 V10 a2 2 0 0 1 2 -2 z" />
          <path d="M23 8 v7 h7" />
          <path className={s.qDraw} pathLength={1} d="M14 21 h12" style={{ ['--gd' as string]: '0s' }} />
          <path className={s.qDraw} pathLength={1} d="M14 27 h12" style={{ ['--gd' as string]: '0.18s' }} />
          <path className={s.qDraw} pathLength={1} d="M14 33 h7" style={{ ['--gd' as string]: '0.36s' }} />
          <g className={s.qStamp}>
            <circle className={s.qSeal} cx={32} cy={33} r={7} />
            <path className={s.qTick} pathLength={1} d="M28.5 33 l2.6 2.6 l5.3 -6.1" />
          </g>
        </svg>
      )

    default:
      return null
  }
}
