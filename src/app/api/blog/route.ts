import { withErrorHandler } from '@/lib/api-handler'
import { apiSuccess, apiPaginated } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { zhCn } from '@/lib/zh-cn'
import type { Language } from '@/i18n/translations'

export const dynamic = 'force-dynamic'

/**
 * Public blog listing — returns published posts only (newest first).
 * Supports ?limit= for pagination via apiPaginated and ?lang=en|zh|zh-CN to
 * select the title/excerpt locale (falls back to English when a locale field
 * is missing; zh-CN is derived from the Traditional Chinese fields via
 * OpenCC — see lib/zh-cn).
 */
export const GET = withErrorHandler(async (req) => {
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1)
  const includeBody = url.searchParams.get('full') === '1'
  const rawLang = url.searchParams.get('lang')
  const lang: Language = rawLang === 'zh' || rawLang === 'zh-CN' ? rawLang : 'en'

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
        title_zh_cn: true,
        excerpt: true,
        excerpt_zh: true,
        excerpt_zh_cn: true,
        image: true,
        content: includeBody,
        content_zh: includeBody,
        content_zh_cn: includeBody,
        publishedAt: true,
      },
    }),
    prisma.vlogPost.count({ where }),
  ])

  return apiPaginated(
    posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: zhCn.title(lang, p.title, p.title_zh, p.title_zh_cn),
      excerpt: zhCn.excerpt(lang, p.excerpt, p.excerpt_zh, p.excerpt_zh_cn),
      image: p.image,
      content: includeBody ? zhCn.content(lang, p.content, p.content_zh, p.content_zh_cn) : undefined,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    })),
    total,
    page,
    limit
  )
})
