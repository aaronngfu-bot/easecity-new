import { HomeContent } from '@/components/home/HomeContent'
import { prisma } from '@/lib/db'

export const revalidate = 60

export default async function HomePage() {
  // Server-fetched bilingual blog posts so the rail renders on first paint
  // without a client fetch. Passed to HomeContent (client) which reads the
  // current language for all copy — so language switches update live.
  const blogPosts = await prisma.vlogPost.findMany({
    where: { published: true, publishedAt: { not: null } },
    orderBy: { publishedAt: 'desc' },
    take: 4,
    select: {
      id: true,
      slug: true,
      title: true,
      title_zh: true,
      excerpt: true,
      excerpt_zh: true,
      image: true,
      publishedAt: true,
    },
  })

  return <HomeContent blogPosts={blogPosts} />
}