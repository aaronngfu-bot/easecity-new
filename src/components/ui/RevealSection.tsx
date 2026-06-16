'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMotionEnabled } from '@/lib/motion-context'

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
  exit?: boolean
}

export function RevealSection({
  children,
  className,
  exit = true,
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { motionEnabled } = useMotionEnabled()
  const shouldReduce = !motionEnabled

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

  if (shouldReduce) {
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
