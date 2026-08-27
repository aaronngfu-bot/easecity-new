'use client'

/**
 * Shared service icon set. Each one names the thing we actually deliver rather
 * than the category it files under: the previous set reached for the generic
 * metaphor every time — a globe for web work, a lightbulb for consulting, a
 * palette for brand — which meant four of the six could have swapped places
 * without anyone noticing. These stay on a 24-unit bed, monoline, and are
 * drawn to survive 18px: nothing thinner than a full unit, no detail that
 * closes up when the stroke lands on a half pixel.
 */
export function ServiceIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const common = {
    viewBox: '0 0 24 24',
    strokeWidth: 1.6,
    stroke: 'currentColor',
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    width: size,
    height: size,
  } as const

  switch (icon) {
    // System development — a rack, not angle brackets. What we ship here is
    // running infrastructure, and the status lamps say it is up.
    case 'code':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="7" rx="1.8" />
          <rect x="3" y="13" width="18" height="7" rx="1.8" />
          <path d="M14 7.5h4M14 16.5h4" />
          <circle cx="7" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="7" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      )

    // Web platforms — a browser window with a dashboard inside it. The globe
    // said "the internet"; the work is the application, not the medium.
    case 'web':
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="19" height="16" rx="2" />
          <path d="M2.5 8.5h19" />
          <path d="M9.5 8.5V20" />
          <path d="M12.5 12.5h6M12.5 16h3.5" />
        </svg>
      )

    // UI/UX — an artboard with a theme split down it. Half dark, half light,
    // which is the through-line of the practice: one system, both modes.
    case 'design':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M12 3v18" />
          <path d="M12 3h6.5A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5H12z" fill="currentColor" stroke="none" />
        </svg>
      )

    // Consulting — a bubble, because the engagement is a conversation. Squared
    // rather than round: the chat widget's button is a round lucide bubble that
    // sits in the corner of every page, and two round bubbles on one screen
    // would read as two ways to open the same chat.
    case 'consult':
      return (
        <svg {...common}>
          <rect x="2.5" y="4" width="19" height="13" rx="3" />
          <path d="M7 17v3.6L10.9 17" />
        </svg>
      )

    // Advertising — a target with the shot already in it. Performance work is
    // aim plus proof, and a megaphone only carried the announcing half.
    case 'ad':
      return (
        <svg {...common}>
          <circle cx="11" cy="13" r="8" />
          <circle cx="11" cy="13" r="3.5" />
          <circle cx="11" cy="13" r="1" fill="currentColor" stroke="none" />
          <path d="M13.5 10.5 21 3M17.5 3H21v3.5" />
        </svg>
      )

    // Brand — a mark plus the swatches behind it. Identity here is delivered
    // as a system your team can hold, which is what the stack says.
    case 'brand':
      return (
        <svg {...common}>
          <path d="M9 3h9.5A2.5 2.5 0 0 1 21 5.5V15" />
          <path d="M6 6h9.5A2.5 2.5 0 0 1 18 8.5V18" />
          <rect x="3" y="9" width="12" height="12" rx="2.2" />
          <path d="M7 17.5 9.5 13l2.5 4.5z" fill="currentColor" stroke="none" />
        </svg>
      )

    default:
      return null
  }
}
