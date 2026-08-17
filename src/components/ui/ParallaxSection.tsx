'use client'

import { cn } from '@/lib/utils'

interface ParallaxProps {
  children: React.ReactNode
  className?: string
  speed?: number
  disableOnMobile?: boolean
}

/**
 * ParallaxSection — simplified, no parallax (just a passthrough).
 * The previous framer-motion scroll-driven parallax was over-engineered.
 */
export function ParallaxSection({ children, className }: ParallaxProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  )
}
