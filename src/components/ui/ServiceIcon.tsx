'use client'

/** Shared service icon set (SVG, matches the services page). */
export function ServiceIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const common = { strokeWidth: 1.8, stroke: 'currentColor', fill: 'none', width: size, height: size } as const
  switch (icon) {
    case 'code':
      return <svg viewBox="0 0 24 24" {...common}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    case 'web':
      return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" strokeLinecap="round" /></svg>
    case 'design':
      return <svg viewBox="0 0 24 24" {...common}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /></svg>
    case 'consult':
      return <svg viewBox="0 0 24 24" {...common}><path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17h-8v-2.3A7 7 0 0 1 5 9a7 7 0 0 1 7-7Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 21h6" strokeLinecap="round" /></svg>
    case 'ad':
      return <svg viewBox="0 0 24 24" {...common}><path d="M3 11v3a1 1 0 0 0 1 1h2l4 4V6L6 10H4a1 1 0 0 0-1 1Z" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" strokeLinecap="round" /></svg>
    case 'brand':
      return <svg viewBox="0 0 24 24" {...common}><path d="M12 21a9 9 0 1 1 0-18c4.97 0 9 4.03 9 9 0 1.5-1 2-2.5 2H15a2 2 0 0 0-2 2c0 .6-.5 1-1 1h0a3 3 0 0 0 0 4Z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="7.5" cy="11.5" r="0.5" fill="currentColor" /><circle cx="10" cy="7.5" r="0.5" fill="currentColor" /><circle cx="14" cy="7.5" r="0.5" fill="currentColor" /></svg>
    default:
      return null
  }
}