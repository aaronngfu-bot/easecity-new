'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Calendar, Search } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { isZh } from '@/i18n/translations'

interface PostListItem {
  id: string
  slug: string
  title: string
  title_zh: string | null
  excerpt: string | null
  excerpt_zh: string | null
  publishedAt: string | Date | null
}

/**
 * Searchable list of all published blog posts — a compact table-like layout
 * with no cover images, used to find past posts by keyword (searches both
 * the English and Chinese fields). Each row links to its own page.
 */
export function BlogList({ posts }: { posts: PostListItem[] }) {
  const { language } = useLanguage()
  const [q, setQ] = useState('')

  const localized = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        title: isZh(language) && p.title_zh ? p.title_zh : p.title,
        excerpt: isZh(language) && p.excerpt_zh ? p.excerpt_zh : p.excerpt,
      })),
    [posts, language]
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return localized
    return localized.filter(
      (p) => p.title.toLowerCase().includes(needle) || (p.excerpt ?? '').toLowerCase().includes(needle)
    )
  }, [q, localized])

  return (
    <div>
      <label className="relative block">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search posts…"
          className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--signal)]"
        />
      </label>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
          {posts.length === 0 ? 'No posts yet — check back soon.' : 'No posts match your search.'}
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-[var(--border-color)] overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
          {filtered.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex items-start justify-between gap-4 px-6 py-5 transition-colors hover:bg-[var(--bg-elevated)]"
              >
                <div className="min-w-0">
                  <h2 className="font-display text-base font-semibold text-[var(--text-primary)] transition-colors group-hover:text-[var(--signal)]">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">{post.excerpt}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <Calendar size={13} className="text-[var(--signal)]" />
                  <span className="label-mono whitespace-nowrap">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                      : ''}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}