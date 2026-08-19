import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
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
  const lang = cookies().get('easecity-lang')?.value === 'zh' ? 'zh' : 'en'
  return {
    title: lang === 'zh' ? post.title_zh || post.title : post.title,
    description: lang === 'zh' ? post.excerpt_zh || post.excerpt || undefined : post.excerpt || undefined,
    openGraph: post.image ? { images: [post.image] } : undefined,
  }
}

export const dynamic = 'force-dynamic'

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