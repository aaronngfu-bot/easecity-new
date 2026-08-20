'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

/**
 * ImmersionHero — full-viewport first screen.
 *
 * Composition: a full-bleed binary-code city (the reference artwork, recolored
 * to the brand teal, with a water reflection in the lower third) fills the
 * section. One image per theme (dark navy / light grey). Copy layers over a
 * soft scrim so it stays legible. Title characters stagger in (CSS-only), the
 * primary CTA is magnetic, and a scroll cue runs along the bottom edge.
 */

/** Primary CTA that leans toward the cursor within a small radius. */
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
    <span ref={wrapRef} className="inline-flex">
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2 transition-transform duration-200 ease-out will-change-transform ${className}`}
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
    <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[var(--bg-base)]">
        {/* Full-bleed binary city (reference art, recolored to brand teal) */}
        <div aria-hidden className="absolute inset-0">
          <img src="/images/hero-city-light.png" alt="" className="h-full w-full object-cover object-center dark:hidden" />
          <img src="/images/hero-city-dark.png" alt="" className="hidden h-full w-full object-cover object-center dark:block" />
        </div>

        {/* Legibility scrim behind the copy column */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_18%_50%,var(--bg-base)_8%,transparent_70%)] lg:bg-[radial-gradient(ellipse_55%_90%_at_12%_50%,var(--bg-base)_20%,transparent_72%)]"
        />
        {/* Bottom fade so the hero melts into the next section */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--bg-base)] to-transparent" />

        {/* Copy */}
        <div className="container-max relative z-10 flex flex-1 items-center pt-28 md:pt-32">
          <div className="max-w-2xl pb-24 text-left lg:-mt-24">
            <p className="hero-rise label-mono mb-7 flex items-center gap-2.5 text-[var(--signal)]" style={{ animationDelay: '0.15s' }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--amber)] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--amber)]" />
              </span>
              {c.heroEyebrowNew}
            </p>

            <h1 className="font-display text-[2.75rem] font-bold leading-[1.02] tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl">
              {/* Screen readers get the whole sentence; the stagger is decorative */}
              <span className="sr-only">{c.heroTitleNew}</span>
              <span aria-hidden="true">
                {titleChars(c.heroTitleA, 0.3)}
                <br />
                <span className="text-[var(--signal)]">{titleChars(c.heroTitleB, 0.3 + Array.from(c.heroTitleA).length * 0.028 + 0.15)}</span>
              </span>
            </h1>

            <p className="hero-rise mt-7 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg" style={{ animationDelay: '1.35s' }}>
              {c.heroSubtitleNew}
            </p>

            <div className="hero-rise mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center" style={{ animationDelay: '1.55s' }}>
              <MagneticCta
                onClick={onStartProject}
                className="rounded-lg bg-[var(--amber)] px-8 py-3.5 text-sm font-semibold text-[var(--amber-ink)] shadow-[0_0_0_0_rgba(0,229,204,0)] hover:shadow-[0_8px_30px_-6px_rgba(0,229,204,0.5)]"
              >
                {c.heroCtaPrimary}
                <ArrowRight size={15} />
              </MagneticCta>
              <Link
                href="/services"
                className="btn-secondary group px-7 py-3.5 text-sm"
              >
                {c.heroCtaSecondary}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll cue — points into the first content section.
            Centering lives on this anchor; the entrance animation lives on the
            inner span so its transform never clobbers -translate-x-1/2. */}
        <a
          href="#latest"
          aria-label={c.heroScroll}
          className="hero-scroll-cue-wrap absolute bottom-7 left-1/2 z-10 -translate-x-1/2 px-6 py-2 text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]"
        >
          <span className="hero-rise flex flex-col items-center gap-2" style={{ animationDelay: '1.9s' }}>
            <span className="label-mono">{c.heroScroll}</span>
            <span className="scroll-cue" aria-hidden>
              <span className="scroll-cue-dot" />
            </span>
            <ChevronDown size={13} className="opacity-60" />
          </span>
        </a>
    </section>
  )
}
