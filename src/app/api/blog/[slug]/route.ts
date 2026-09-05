import { withErrorHandler, NotFoundError } from '@/lib/api-handler'
import { apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { zhCn } from '@/lib/zh-cn'
import type { Language } from '@/i18n/translations'

export const dynamic = 'force-dynamic'

/**
 * Public single post by slug — markdown content included. Supports
 * ?lang=en|zh|zh-CN to select the title/excerpt/content locale, falling back
 * to English when a locale field is missing; zh-CN is derived from the
 * Traditional Chinese fields via OpenCC (see lib/zh-cn).
 */
export const GET = withErrorHandler(async (_req, context) => {
  const { slug } = await context.params
  const post = await prisma.vlogPost.findFirst({
    where: { slug, published: true, publishedAt: { not: null } },
  })

  if (!post) throw new NotFoundError('Post not found')

  const rawLang = new URL(_req.url).searchParams.get('lang')
  const lang: Language = rawLang === 'zh' || rawLang === 'zh-CN' ? rawLang : 'en'

  return apiSuccess({
    id: post.id,
    slug: post.slug,
    title: zhCn.title(lang, post.title, post.title_zh, post.title_zh_cn),
    excerpt: zhCn.excerpt(lang, post.excerpt, post.excerpt_zh, post.excerpt_zh_cn),
    image: post.image,
    content: zhCn.content(lang, post.content, post.content_zh, post.content_zh_cn),
    publishedAt: post.publishedAt?.toISOString() ?? null,
  })
})
