import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/db'
import { BlogList } from '@/components/updates/BlogList'

export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const lang = cookies().get('easecity-lang')?.value === 'zh' ? 'zh' : 'en'
  return { title: lang === 'zh' ? '部落格' : 'Blog' }
}

export default async function BlogPage() {
  const lang = cookies().get('easecity-lang')?.value === 'zh' ? 'zh' : 'en'
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
        <p className="label-mono mb-3 text-[var(--signal)]">BLOG</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
          {lang === 'zh' ? '我們一直在建構的事' : "What we've been building"}
        </h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">
          {lang === 'zh' ? '近期工作、發佈與產品紀錄的可搜尋日誌。' : 'A searchable log of recent work, releases, and product notes.'}
        </p>

        <div className="mt-10">
          <BlogList posts={posts} />
        </div>
      </div>
    </main>
  )
}