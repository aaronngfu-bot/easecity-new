'use client'

interface RevealSectionProps {
  children: React.ReactNode
  className?: string
}

/**
 * RevealSection — simple fade-in on scroll using IntersectionObserver.
 * No framer-motion needed.
 */
export function RevealSection({ children, className }: RevealSectionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
