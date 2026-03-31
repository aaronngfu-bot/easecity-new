'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: 'cyan' | 'purple' | 'none'
  delay?: number
  hover?: boolean
}

export function GlowCard({
  children,
  className,
  glowColor = 'cyan',
  delay = 0,
  hover = true,
}: GlowCardProps) {
  const glowStyles = {
    cyan: 'hover:border-accent-cyan/40 hover:shadow-glow-cyan',
    purple: 'hover:border-accent-purple/40 hover:shadow-glow-purple',
    none: '',
  }

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
        'relative rounded-2xl bg-bg-surface border border-border p-6 transition-all duration-300',
        hover && 'cursor-default',
        hover && glowStyles[glowColor],
        className
      )}
    >
      {children}
    </motion.div>
  )
}
