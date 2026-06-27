'use client'

import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { cn } from '@/lib/utils'

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  /** Apply the subtle scale-down + dim as the section leaves the viewport top. */
  exit?: boolean
}

/**
 * RevealSection — the homepage's shared section-transition language.
 *
 * Entrance is scrubbed against scroll (y / opacity / scale follow the wheel
 * in real time rather than firing once), and as a section leaves the top of
 * the viewport it gently scales down and dims, creating a depth-stack feel
 * between consecutive sections.
 *
 * Intentionally NO `overflow-hidden` here — children may rely on
 * `position: sticky` (e.g. FeatureSteps). The entrance completes while the
 * section is still in the lower half of the viewport, long before any
 * sticky child engages.
 */
export function RevealSection({
  children,
  className,
  exit = true,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.18, 0.82, 1],
    [0, 1, 1, exit ? 0.38 : 1]
  )
  const y = useTransform(scrollYProgress, [0, 0.18], [56, 0])
  const scale = useTransform(
    scrollYProgress,
    [0, 0.18, 0.85, 1],
    [0.975, 1, 1, exit ? 0.985 : 1]
  )

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  )
}
