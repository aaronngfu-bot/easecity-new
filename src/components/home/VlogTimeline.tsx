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

interface StaticItem {
  date: string
  title: string
  body: string
}

interface UpdateCard {
  date: string
  title: string
  body: string
  slug?: string
  image?: string | null
}

/**
 * VLOG rail on the home page — modern horizontal snap-scroll of update cards.
 * Each card is an independent tile that links to its own detail page
 * (`/updates/[slug]`). Prefers live posts from the DB (`/api/vlog?limit=4`);
 * falls back to the static translation list when the API is unreachable so the
 * section never renders empty. Cards render statically (no per-card motion) to
 * avoid the card-grid reveal bug.
 */
export function VlogTimeline({ fallback }: { fallback: StaticItem[] }) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<DbPost[] | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/vlog?limit=4')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d?.success && d.data?.length) setPosts(d.data)
      })
      .catch(() => {
        /* keep static fallback */
      })
    return () => {
      active = false
    }
  }, [])

  const items: UpdateCard[] = posts
    ? posts.map((p) => ({
        date: p.publishedAt
          ? new Date(p.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          : '',
        title: p.title,
        body: p.excerpt ?? '',
        slug: p.slug,
        image: p.image,
      }))
    : fallback.map((f) => ({ ...f }))

  return (
    <div>
      <div className="relative">
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const card = (
              <article className="group flex w-[300px] max-w-[78vw] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] transition hover:border-[var(--signal)] hover:shadow-[var(--shadow-md)] sm:w-[340px]">
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
            )

            return item.slug ? (
              <Link key={item.slug} href={`/updates/${item.slug}`} className="block shrink-0 snap-start">
                {card}
              </Link>
            ) : (
              <div key={item.title} className="shrink-0 snap-start">
                {card}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/updates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--signal)] transition-colors hover:text-[var(--signal-light)]"
        >
          {t.companyPage.vlogCta ?? 'View all updates'}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}