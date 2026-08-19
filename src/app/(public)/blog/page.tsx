import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { BlogList } from '@/components/updates/BlogList'
import { BlogPageHeader } from '@/components/home/BlogPageHeader'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const lang = cookies().get('easecity-lang')?.value === 'zh' ? 'zh' : 'en'
  return { title: lang === 'zh' ? '部落格' : 'Blog' }
}

export default async function BlogPage() {
  const posts = await prisma.vlogPost.findMany({
    where: { published: true, publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      title_zh: true,
      excerpt: true,
      excerpt_zh: true,
      publishedAt: true,
    },
  })

  return (
    <main className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-3xl py-28 md:py-36">
        <BlogPageHeader />

        <div className="mt-10">
          <BlogList posts={posts} />
        </div>
      </div>
    </main>
  )
}