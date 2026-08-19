'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface DbPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  image: string | null
  publishedAt: string | null
}

interface UpdateCard {
  date: string
  title: string
  body: string
  slug: string
  image?: string | null
}

const LOADING = 'LOADING'
type Stage = typeof LOADING | 'READY' | 'ERROR'

/**
 * VLOG rail on the home page — horizontal snap-scroll of update cards, newest
 * on the left, scrollable toward older posts. Each card is a whole-card link
 * to its own `/updates/[slug]` page. Loads live posts from `/api/vlog?limit=4`;
 * shows an in-place loading/error state while fetching (no static fallback, so
 * the rail never renders stale translated placeholder posts).
 */
export function VlogTimeline() {
  const { language } = useLanguage()
  const [posts, setPosts] = useState<DbPost[] | null>(null)
  const [status, setStatus] = useState<Stage>(LOADING)

  useEffect(() => {
    let active = true
    setStatus(LOADING)
    const params = new URLSearchParams({ limit: '4', lang: language })
    fetch(`/api/vlog?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return
        if (d?.success && Array.isArray(d.data) && d.data.length) {
          setPosts(d.data)
          setStatus('READY')
        } else {
          setStatus('ERROR')
        }
      })
      .catch(() => {
        if (active) setStatus('ERROR')
      })
    return () => {
      active = false
    }
  }, [language])

  const items: UpdateCard[] = (posts ?? []).map((p) => ({
    date: p.publishedAt
      ? new Date(p.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
      : '',
    title: p.title,
    body: p.excerpt ?? '',
    slug: p.slug,
    image: p.image,
  }))

  return (
    <div>
      <div className="relative">
        {status === 'LOADING' && (
          <div className="flex h-64 items-center justify-center text-sm text-[var(--text-muted)]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--signal)] border-t-transparent" />
          </div>
        )}

        {status === 'ERROR' && (
          <div className="flex h-64 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
            Updates are temporarily unavailable — check back soon.
          </div>
        )}

        {status === 'READY' && items.length > 0 && (
          <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-4 pr-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`/updates/${item.slug}`}
                className="group block w-[300px] max-w-[78vw] shrink-0 snap-start sm:w-[340px]"
              >
                <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)]">
                  {item.image && (
                    <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
                      <Image src={item.image} alt={item.title} fill sizes="340px" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-[var(--signal)]" />
                      <span className="label-mono">{item.date}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
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
        )}
      </div>

      {status === 'READY' && items.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] transition-colors hover:text-[var(--signal-light)]"
          >
            View all updates
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  )
}