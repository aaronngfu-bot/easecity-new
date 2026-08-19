import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Calendar, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = await prisma.vlogPost.findMany({
    where: { published: true, publishedAt: { not: null } },
    select: { slug: true },
  })
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.vlogPost.findFirst({
    where: { slug, published: true, publishedAt: { not: null } },
    select: { title: true, excerpt: true, image: true },
  })
  if (!post) return { title: 'Update not found' }
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.image ? { images: [post.image] } : undefined,
  }
}

export const revalidate = 60

export default async function VlogDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.vlogPost.findFirst({
    where: { slug, published: true, publishedAt: { not: null } },
  })

  if (!post) notFound()

  return (
    <main className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-3xl py-28 md:py-36">
        <Link
          href="/updates"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--signal)]"
        >
          <ArrowLeft size={15} />
          Updates
        </Link>

        <article>
          {post.image && (
            <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)]">
              <Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover" />
            </div>
          )}

          <div className="mt-6 flex items-center gap-2">
            <Calendar size={13} className="text-[var(--signal)]" />
            <span className="label-mono">
              {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </span>
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-3 text-base text-[var(--text-muted)]">{post.excerpt}</p>}

          <div className="prose-async mt-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </main>
  )
}