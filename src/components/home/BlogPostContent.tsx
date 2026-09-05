'use client'

import Image from 'next/image'
import { Calendar } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useLanguage } from '@/context/LanguageContext'

interface BlogPost {
  slug: string
  title: string
  title_zh: string | null
  /** Simplified readings derived server-side from the Traditional fields
   *  (lib/zh-cn) so zh-CN shows real Simplified without a DB column. */
  title_zh_cn?: string | null
  excerpt: string | null
  excerpt_zh: string | null
  excerpt_zh_cn?: string | null
  image: string | null
  content: string
  content_zh: string | null
  /** Derived Simplified body; when absent the client falls back through zh. */
  content_zh_cn?: string | null
  publishedAt: string | Date | null
}

/**
 * Renders a single blog post's text, choosing English, Traditional or derived
 * Simplified Chinese via useLanguage so switching language on the page updates
 * the title/excerpt/body immediately (no server round-trip). The trilingual
 * data is injected from the server parent, so first paint is still
 * server-rendered.
 */
export function BlogPostContent({ post }: { post: BlogPost }) {
  const { language } = useLanguage()
  const title =
    language === 'en' ? post.title : language === 'zh-CN' ? post.title_zh_cn || post.title_zh || post.title : post.title_zh || post.title
  const excerpt =
    language === 'en'
      ? post.excerpt
      : language === 'zh-CN'
        ? post.excerpt_zh_cn || post.excerpt_zh || post.excerpt
        : post.excerpt_zh || post.excerpt
  const content =
    language === 'en' ? post.content : language === 'zh-CN' ? post.content_zh_cn || post.content_zh || post.content : post.content_zh || post.content

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