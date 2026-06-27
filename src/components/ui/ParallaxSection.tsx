'use client'

import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/useIsMobile'

interface ParallaxProps {
  children: React.ReactNode
  speed?: number
  className?: string
  disableOnMobile?: boolean
}

export function ParallaxSection({
  children,
  speed = 0.3,
  className,
  disableOnMobile = true,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const isMobile = useIsMobile()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [speed * 100, speed * -100]
  )

  const disabled = shouldReduceMotion || (disableOnMobile && isMobile)

  if (disabled) {
    return (
      <div ref={ref} className={cn(className)}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
