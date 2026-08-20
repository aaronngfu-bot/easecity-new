import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { BlogPostContent } from '@/components/home/BlogPostContent'

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
    select: { title: true, title_zh: true, excerpt: true, excerpt_zh: true, image: true },
  })
  if (!post) return { title: 'Post not found' }
  // Static metadata uses the English title; the visible post content is a
  // client component (BlogPostContent) that localizes on the fly.
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: post.image ? { images: [post.image] } : undefined,
  }
}

// ISR — pages are pre-rendered from generateStaticParams so visits/prefetches
// are served from the edge cache instead of a per-request server render.
export const revalidate = 300

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await prisma.vlogPost.findFirst({
    where: { slug, published: true, publishedAt: { not: null } },
    select: {
      slug: true,
      title: true,
      title_zh: true,
      excerpt: true,
      excerpt_zh: true,
      image: true,
      content: true,
      content_zh: true,
      publishedAt: true,
    },
  })

  if (!post) notFound()

  return (
    <main className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-3xl py-28 md:py-36">
        <BlogPostContent post={post} />
      </div>
    </main>
  )
}