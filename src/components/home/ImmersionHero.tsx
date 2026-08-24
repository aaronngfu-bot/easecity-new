'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { CityField } from '@/components/hero/CityField'
import { HarbourSkyline } from '@/components/hero/HarbourSkyline'
import { ScrollPin } from '@/components/ui/ScrollPin'

/**
 * ImmersionHero — first-screen scroll theater.
 * The panel pins for ~2 viewports. `--p` scrubs the harbour against the copy:
 * copy lifts and wipes out, while every scene layer settles toward the
 * waterline in proportion to its height above it. Vessels and water are the
 * pivot and never move, so the sink reads as one camera settling rather than
 * layers sliding past each other.
 * Haze and the horizon rule sit over the scene (outside the wipe mask) so the
 * harbour dissolves into atmosphere and hands a horizon line to the blog rail.
 */

function MagneticCta({
  onClick,
  children,
  className = '',
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  const wrapRef = useRef<HTMLSpanElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const btn = btnRef.current
    if (!wrap || !btn) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const STRENGTH = 0.22
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      btn.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`
    }
    const onLeave = () => {
      btn.style.transform = 'translate(0px, 0px)'
    }
    wrap.addEventListener('mousemove', onMove)
    wrap.addEventListener('mouseleave', onLeave)
    return () => {
      wrap.removeEventListener('mousemove', onMove)
      wrap.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <span ref={wrapRef} className="inline-flex w-auto">
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        className={`inline-flex w-auto items-center justify-center gap-2 transition-transform duration-200 ease-out will-change-transform ${className}`}
      >
        {children}
      </button>
    </span>
  )
}

export function ImmersionHero({ onStartProject }: { onStartProject?: () => void }) {
  const { t } = useLanguage()
  const c = t.companyPage

  const titleChars = (text: string, baseDelay: number) =>
    Array.from(text).map((ch, i) => (
      <span
        key={`${text}-${i}`}
        className="hero-char"
        style={{ animationDelay: `${baseDelay + i * 0.028}s` }}
        aria-hidden="true"
      >
        {ch === ' ' ? '\u00A0' : ch}
      </span>
    ))

  return (
    // The track must outrun the viewport or ScrollPin resolves `--p` to 1 on
    // load, which fades the copy out and drags the skyline off its footing.
    <ScrollPin className="bg-[var(--bg-base)]" trackClassName="h-[155vh] md:h-[175vh]">
      <div className="hero-stage">
      <div className="hero-scene-mask" aria-hidden>
        <div className="hero-enter-sky pointer-events-none absolute inset-0 z-0">
          <CityField className="hero-pin-sky h-full w-full" />
        </div>
        <div className="hero-enter-city pointer-events-none absolute inset-x-0 bottom-0 z-[1] w-full">
          <HarbourSkyline className="hero-pin-city w-full" />
        </div>
      </div>

      <div className="hero-scene-haze z-[2]" aria-hidden />
      <div className="hero-scene-horizon z-[3]" aria-hidden />

      <div className="hero-pin-copy container-max relative z-10 flex h-full items-start">
        <div className="hero-copy-inner max-w-2xl text-left">
          <h1 className="hero-title font-display font-bold text-[var(--text-primary)]">
            <span className="sr-only">{c.heroTitleNew}</span>
            <span aria-hidden="true">
              {titleChars(c.heroTitleA, 0.3)}
              <br />
              <span className="text-[var(--signal)]">{titleChars(c.heroTitleB, 0.3 + Array.from(c.heroTitleA).length * 0.028 + 0.15)}</span>
            </span>
          </h1>

          <p className="hero-rise hero-lede max-w-xl text-[var(--text-secondary)]" style={{ animationDelay: '1.35s' }}>
            {c.heroSubtitleNew}
          </p>

          <div className="hero-rise hero-actions flex flex-col items-start gap-3 sm:flex-row sm:items-center" style={{ animationDelay: '1.55s' }}>
            <MagneticCta
              onClick={onStartProject}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--amber)] px-8 py-3.5 text-sm font-semibold text-[var(--amber-ink)] shadow-[0_0_0_0_rgba(0,229,204,0)] hover:shadow-[0_8px_30px_-6px_rgba(0,229,204,0.5)]"
            >
              {c.heroCtaPrimary}
            </MagneticCta>
            <Link
              href="/services"
              className="btn-secondary group inline-flex min-h-11 items-center justify-center px-7 py-3.5 text-sm"
            >
              {c.heroCtaSecondary}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      <a
        href="#latest"
        aria-label={c.heroScroll}
        className="hero-pin-cue hero-scroll-cue-wrap px-6 py-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--signal)]"
      >
        <span className="hero-rise flex flex-col items-center gap-1.5" style={{ animationDelay: '1.9s' }}>
          <span className="label-mono text-[10px] uppercase tracking-[0.2em]">{c.heroScroll}</span>
          <span className="scroll-cue" aria-hidden>
            <span className="scroll-cue-dot" />
          </span>
          <ChevronDown size={13} className="opacity-60" aria-hidden />
        </span>
      </a>
      </div>
    </ScrollPin>
  )
}