'use client'

import Image from 'next/image'
import { Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLanguage } from '@/context/LanguageContext'
import { isZh } from '@/i18n/translations'

interface BlogPost {
  slug: string
  title: string
  title_zh: string | null
  excerpt: string | null
  excerpt_zh: string | null
  image: string | null
  content: string
  content_zh: string | null
  publishedAt: string | Date | null
}

/**
 * Renders a single blog post's text, choosing English or Chinese via
 * useLanguage so switching language on the page updates the title/excerpt/body
 * immediately (no server round-trip). The bilingual data is injected from the
 * server parent, so first paint is still server-rendered.
 */
export function BlogPostContent({ post }: { post: BlogPost }) {
  const { language } = useLanguage()
  const title = isZh(language) ? post.title_zh || post.title : post.title
  const excerpt = isZh(language) ? post.excerpt_zh || post.excerpt : post.excerpt
  const content = isZh(language) ? post.content_zh || post.content : post.content

  return (
    <article>
      {post.image && (
        <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <Image src={post.image} alt={title} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
        </div>
      )}

      <div className="mt-6 flex items-center gap-2">
        <Calendar size={13} className="text-[var(--signal)]" />
        <span className="label-mono">
          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
        </span>
      </div>

      <h1 className="type-section mt-3 font-display text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        {title}
      </h1>
      {excerpt && <p className="mt-3 text-base text-[var(--text-muted)]">{excerpt}</p>}

      <div className="prose-async mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </article>
  )
}