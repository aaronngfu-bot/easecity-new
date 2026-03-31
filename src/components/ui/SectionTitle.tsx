'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  titleHighlight?: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionTitle({
  eyebrow,
  title,
  titleHighlight,
  description,
  align = 'center',
  className,
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' && 'text-center mx-auto',
        align === 'left' && 'text-left',
        className
      )}
    >
      {eyebrow && (
        <p className="text-accent-cyan text-sm font-mono tracking-widest uppercase mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight">
        {title}{' '}
        {titleHighlight && (
          <span className="text-gradient-cyan">{titleHighlight}</span>
        )}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-4 text-text-secondary text-base md:text-lg leading-relaxed',
            align === 'center' && 'max-w-2xl mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  )
}
