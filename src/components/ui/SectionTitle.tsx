'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { EASE_OUT } from '@/lib/motion'

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
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className={cn(
        'mb-12 md:mb-16',
        align === 'center' && 'text-center mx-auto',
        align === 'left' && 'text-left',
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'flex items-center gap-2 mb-4',
            align === 'center' && 'justify-center'
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-glow-signal-sm" />
          <p className="label-mono text-signal/80">{eyebrow}</p>
          <span className="h-px w-8 bg-gradient-to-r from-signal/40 to-transparent" />
        </div>
      )}
      <h2 className="type-section font-display text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary">
        {title}
        {titleHighlight && (
          <>
            {' '}
            <span className="text-gradient-signal">{titleHighlight}</span>
          </>
        )}
      </h2>
      {description && (
        <p
          className={cn(
            'mt-5 text-text-secondary text-base md:text-lg leading-relaxed',
            align === 'center' && 'max-w-2xl mx-auto'
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  )
}
