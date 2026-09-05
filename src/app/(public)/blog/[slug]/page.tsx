import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { BlogPostContent } from '@/components/home/BlogPostContent'
import { zhCn } from '@/lib/zh-cn'

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

  // Derive the Simplified readings server-side (lib/zh-cn) so the client
  // component can switch all three languages with no round-trip and zh-CN
  // never depends on OpenCC in the browser bundle.
  const trilingual = {
    ...post,
    title_zh_cn: zhCn.convert(post.title_zh || post.title),
    excerpt_zh_cn: post.excerpt_zh || post.excerpt ? zhCn.convert(post.excerpt_zh || post.excerpt || '') : null,
    content_zh_cn: zhCn.convert(post.content_zh || post.content),
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-3xl pt-2 pb-24 md:pb-32">
        <BlogPostContent post={trilingual} />
      </div>
    </div>
  )
}