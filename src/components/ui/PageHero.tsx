'use client'

import { cn } from '@/lib/utils'

interface PageHeroProps {
  serial?: string
  sectionCode?: string
  eyebrow: string
  heading: string
  headingHighlight: string
  description: string
  meta?: { label: string; value: string }[]
  align?: 'left' | 'center'
  showStatusBadge?: boolean
  variant?: 'default' | 'embedded'
}

export function PageHero({
  eyebrow,
  heading,
  headingHighlight,
  description,
  meta,
  align = 'left',
  variant = 'default',
}: PageHeroProps) {
  const isEmbedded = variant === 'embedded'

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        isEmbedded ? 'border-t border-[var(--border-color)] pb-12 pt-20 md:pb-16 md:pt-24' : 'pb-20 pt-32 md:pb-24 md:pt-40'
      )}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 42% at 72% 0%, var(--signal-soft), transparent 58%)',
        }}
      />
      <div className={cn('pointer-events-none absolute inset-0 bg-grid', isEmbedded ? 'opacity-20' : 'opacity-30')} />

      <div className="container-max relative z-10">
        <div className={cn('max-w-4xl', align === 'center' && 'mx-auto text-center')}>
          <div className={cn('mb-8 flex items-center gap-3 md:mb-10', align === 'center' && 'justify-center')}>
            <span className="badge">{eyebrow}</span>
          </div>

          <h1 className={cn(
            'font-display font-semibold text-[var(--text-primary)]',
            isEmbedded ? 'mb-6 text-3xl md:mb-7 md:text-4xl' : 'mb-7 text-4xl md:mb-9 md:text-6xl'
          )}>
            {heading}
            <br />
            <span className="text-[var(--signal)]">{headingHighlight}</span>
          </h1>

          <p className={cn(
            'max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg',
            align === 'center' && 'mx-auto'
          )}>
            {description}
          </p>

          {meta && meta.length > 0 && (
            <div className={cn(
              'mt-10 flex flex-wrap items-stretch gap-0 border-y border-[var(--border-color)] md:mt-14',
              align === 'center' && 'justify-center'
            )}>
              {meta.map((item, i) => (
                <div
                  key={item.label}
                  className={cn(
                    'flex flex-col py-4 pr-8 md:py-5 md:pr-12',
                    i > 0 && 'border-l border-[var(--border-color)] pl-8 md:pl-12'
                  )}
                >
                  <span className="label-mono mb-2">{item.label}</span>
                  <span className="font-mono text-sm tabular-nums text-[var(--text-primary)] md:text-base">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--signal)]/20 to-transparent" />
    </section>
  )
}
