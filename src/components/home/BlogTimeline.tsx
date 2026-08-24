'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface BlogPost {
  id: string
  slug: string
  title: string
  title_zh: string | null
  excerpt: string | null
  excerpt_zh: string | null
  image: string | null
  publishedAt: string | Date | null
}

interface UpdateCard {
  date: string
  title: string
  body: string
  slug: string
  image?: string | null
}

/**
 * VLOG rail on the home page — horizontal snap-scroll of update cards, newest
 * on the left, scrollable toward older posts. Each card is a whole-card link
 * to its own `/blog/[slug]` page. Posts are passed in (server-fetched, both
 * languages) so the rail renders immediately with no client fetch / spinner.
 *
 * Desktop drag-to-scroll: pointer is held and the rail is dragged. CSS
 * scroll-snap is disabled synchronously during the drag (snap-mandatory would
 * otherwise fight the thumb back), then re-enabled on release. A real click
 * still navigates; drags suppress the click so cards don't open mid-scroll.
 * Mouseup/mousemove are tracked on `window` so releasing outside the rail
 * always ends the gesture.
 */
export function BlogTimeline({
  posts = [],
  loading = false,
  error = false,
}: {
  posts?: BlogPost[]
  loading?: boolean
  error?: boolean
}) {
  const { language, t } = useLanguage()
  const railRef = useRef<HTMLDivElement | null>(null)
  const dragState = useRef<{ startX: number; startTop: number; scrollLeft: number; active: boolean } | null>(null)

  const startDrag = useCallback((clientX: number, clientY: number) => {
    const rail = railRef.current
    if (!rail) return
    dragState.current = { startX: clientX, startTop: clientY, scrollLeft: rail.scrollLeft, active: false }
    rail.style.scrollSnapType = 'none'
    rail.style.cursor = 'grabbing'
  }, [])

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    const state = dragState.current
    const rail = railRef.current
    if (!state || !rail) return
    const dx = clientX - state.startX
    const dy = clientY - state.startTop
    if (!state.active && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      state.active = true
    }
    if (state.active) {
      rail.scrollLeft = state.scrollLeft - dx
    }
  }, [])

  const endDrag = useCallback(() => {
    if (!dragState.current) return
    dragState.current = null
    const rail = railRef.current
    if (rail) {
      rail.style.scrollSnapType = ''
      rail.style.cursor = ''
    }
  }, [])

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      // Only begin a potential drag from inside the track.
      const rail = railRef.current
      if (!rail || !rail.contains(e.target as Node)) return
      startDrag(e.clientX, e.clientY)
      const onMove = (ev: PointerEvent) => moveDrag(ev.clientX, ev.clientY)
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        endDrag()
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [startDrag, moveDrag, endDrag])

  const stopClickOnDrag = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (dragState.current?.active) e.preventDefault()
    },
    []
  )

  const items: UpdateCard[] = posts.map((p) => ({
    date: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      : '',
    title: language === 'zh' ? p.title_zh || p.title : p.title,
    body: (language === 'zh' ? p.excerpt_zh || p.excerpt : p.excerpt) ?? '',
    slug: p.slug,
    image: p.image,
  }))

  return (
    <div>
      <div className="relative">
        {loading && (
          <div className="flex gap-8 overflow-hidden pb-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-[300px] shrink-0 sm:w-[340px]">
                <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
                  <div className="aspect-[16/9] animate-pulse bg-[var(--bg-elevated)]" />
                  <div className="space-y-2 p-5">
                    <div className="h-3 w-24 animate-pulse rounded bg-[var(--bg-elevated)]" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--bg-elevated)]" />
                    <div className="h-3 w-full animate-pulse rounded bg-[var(--bg-elevated)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="card px-6 py-10 text-center">
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              {error ? t.companyPage.blogError : t.companyPage.blogEmpty}
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            {/* Pier line the hero's horizon hands off to; posts berth beneath it. */}
            <div className="blog-horizon" aria-hidden />
            <div
              ref={railRef}
              className="blog-rail select-none pt-5"
            >
              {items.map((item, i) => (
                <Link
                  key={item.slug}
                  href={`/blog/${item.slug}`}
                  onClick={stopClickOnDrag}
                  draggable={false}
                  className="blog-berth group block w-[300px] max-w-[78vw] shrink-0 snap-start sm:w-[340px]"
                  style={{ ['--i' as string]: i }}
                >
                  <span className="blog-tick" aria-hidden />
                  <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] motion-safe:group-hover:-translate-y-0.5">
                    {item.image && (
                      <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
                        <Image src={item.image} alt={item.title} fill sizes="340px" className="object-cover transition-transform duration-200 ease-out motion-safe:group-hover:scale-[1.03]" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-[var(--signal)]" />
                        <span className="label-mono">{item.date}</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-[var(--text-primary)] transition-colors duration-200 ease-out group-hover:text-[var(--signal)]">
                        {item.title}
                      </h3>
                      {item.body && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--text-secondary)]">{item.body}</p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {!loading && (
        <div className="mt-8 text-center">
          <Link
            href="/blog"
            className="scrub-blog-more inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--signal)] transition-colors hover:text-[var(--signal-light)]"
          >
            {t.companyPage.blogCta}
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}