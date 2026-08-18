'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
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

/**
 * VLOG timeline on the home page. Prefers live posts from the DB
 * (`/api/vlog?limit=4`); falls back to the static translation list when
 * the API is unreachable (build-time / offline) so the section never renders empty.
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

  const items: { date: string; title: string; body: string; slug?: string; image?: string | null }[] = posts
    ? posts.map((p) => ({
        date: p.publishedAt
          ? new Date(p.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
          : '',
        title: p.title,
        body: p.excerpt ?? '',
        slug: p.slug,
        image: p.image,
      }))
    : fallback

  return (
    <div>
      <ol className="relative space-y-6 border-l border-[var(--border-color)] pl-6">
        {items.map((item) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            <span className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-[var(--signal)] ring-4 ring-[var(--bg-base)]" />
            {item.image && (
              <div className="mb-3 overflow-hidden rounded-lg border border-[var(--border-color)]">
                <div className="relative aspect-[16/7] overflow-hidden">
                  <Image src={item.image} alt={item.title} fill sizes="(max-width: 768px) 100vw, 640px" className="object-cover" />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[var(--signal)]" />
              <span className="label-mono">{item.date}</span>
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold text-[var(--text-primary)]">
              {item.title}
            </h3>
            {item.body && (
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{item.body}</p>
            )}
          </motion.li>
        ))}
      </ol>

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