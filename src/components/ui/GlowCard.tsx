'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function GlowCard({
  children,
  className,
  delay = 0,
  hover = true,
}: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className={cn(
        'glass-panel p-6',
        hover && 'glass-panel-interactive cursor-default',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
