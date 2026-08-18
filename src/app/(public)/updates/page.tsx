import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { Calendar, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export const metadata: Metadata = {
  title: 'Updates',
}

export const revalidate = 60

export default async function VlogPage() {
  const posts = await prisma.vlogPost.findMany({
    where: { published: true, publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <main className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-3xl py-28 md:py-36">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]">
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>

        <p className="label-mono mb-3 text-[var(--signal)]">UPDATES</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
          What we&apos;ve been building
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
          A running log of recent work, releases, and product notes.
        </p>

        <div className="mt-12 space-y-10">
          {posts.length === 0 ? (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-muted)]">
              No updates yet — check back soon.
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)]">
                {post.image && (
                  <div className="relative aspect-[16/7] overflow-hidden bg-[var(--bg-elevated)]">
                    <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
                  </div>
                )}
                <div className="p-6 md:p-8">
                  <div className="mb-3 flex items-center gap-2">
                    <Calendar size={13} className="text-[var(--signal)]" />
                    <span className="label-mono">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-[var(--text-primary)]">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 text-sm text-[var(--text-muted)]">{post.excerpt}</p>}
                  <div className="prose-async mt-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  )
}