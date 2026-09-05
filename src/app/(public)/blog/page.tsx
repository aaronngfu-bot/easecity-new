import type { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { BlogList } from '@/components/updates/BlogList'
import { BlogPageHeader } from '@/components/home/BlogPageHeader'
import { zhCn } from '@/lib/zh-cn'

// ISR — the list is static (BlogList + BlogPageHeader are client components
// that localize on the client), so no per-request server render / DB query.
export const revalidate = 300

export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  const posts = await prisma.vlogPost.findMany({
    where: { published: true, publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      title_zh: true,
      title_zh_cn: true,
      excerpt: true,
      excerpt_zh: true,
      excerpt_zh_cn: true,
      publishedAt: true,
    },
  })

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)]">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
      <div className="container-max relative z-10 max-w-3xl pt-2 pb-24 md:pb-32">
        <BlogPageHeader />

        <div className="mt-10">
          {/* title_zh_cn/excerpt_zh_cn are the Simplified readings derived from
              the Traditional fields server-side (lib/zh-cn), so the client can
              switch all three Chinese/English variants with no round-trip. */}
          <BlogList
            posts={posts.map((p) => ({
              ...p,
              title_zh_cn: p.title_zh_cn || zhCn.convert(p.title_zh || p.title),
              excerpt_zh_cn: p.excerpt_zh_cn || (p.excerpt_zh || p.excerpt ? zhCn.convert(p.excerpt_zh || p.excerpt || '') : null),
            }))}
          />
        </div>
      </div>
    </div>
  )
}