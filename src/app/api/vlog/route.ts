import { withErrorHandler } from '@/lib/api-handler'
import { apiSuccess, apiPaginated } from '@/lib/api-response'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Public VLOG listing — returns published posts only (newest first).
 * Supports ?limit= for pagination via apiPaginated and ?lang=zh to select
 * the Chinese title/excerpt (falls back to English when a locale field is
 * missing).
 */
export const GET = withErrorHandler(async (req) => {
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const includeBody = url.searchParams.get('full') === '1'
  const lang = url.searchParams.get('lang') === 'zh' ? 'zh' : 'en'

  const where = { published: true, publishedAt: { not: null } }
  const [posts, total] = await Promise.all([
    prisma.vlogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        title_zh: true,
        excerpt: true,
        excerpt_zh: true,
        image: true,
        content: includeBody,
        content_zh: includeBody,
        publishedAt: true,
      },
    }),
    prisma.vlogPost.count({ where }),
  ])

  return apiPaginated(
    posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title_zh || p.title,
      excerpt: lang === 'zh' ? p.excerpt_zh || p.excerpt : p.excerpt,
      image: p.image,
      content: includeBody ? (lang === 'zh' ? p.content_zh || p.content : p.content) : undefined,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    })),
    total,
    page,
    limit
  )
})