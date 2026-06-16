'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMotionEnabled } from '@/lib/motion-context'

export function MotionToggle({ className }: { className?: string }) {
  const { motionEnabled, toggleMotion } = useMotionEnabled()

  return (
    <button
      onClick={toggleMotion}
      aria-pressed={motionEnabled}
      aria-label={motionEnabled ? '關閉動畫效果' : '開啟動畫效果'}
      title={motionEnabled ? '動畫:開' : '動畫:關'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border bg-bg-void transition-colors duration-200',
        motionEnabled
          ? 'border-signal/30 text-signal hover:border-signal/50'
          : 'border-border text-text-muted hover:border-border-accent hover:text-text-secondary',
        className
      )}
    >
      <Sparkles size={15} className="transition-transform duration-200" />
    </button>
  )
}
