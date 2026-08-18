import { withErrorHandler } from '@/lib/api-handler'
import { apiSuccess, apiPaginated } from '@/lib/api-response'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Public VLOG listing — returns published posts only (newest first).
 * Supports ?limit= for pagination via apiPaginated.
 */
export const GET = withErrorHandler(async (req) => {
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const includeBody = url.searchParams.get('full') === '1'

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
        excerpt: true,
        content: includeBody,
        publishedAt: true,
      },
    }),
    prisma.vlogPost.count({ where }),
  ])

  return apiPaginated(
    posts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    })),
    total,
    page,
    limit
  )
})