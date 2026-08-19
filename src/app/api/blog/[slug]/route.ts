import { withErrorHandler, NotFoundError } from '@/lib/api-handler'
import { apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * Public single post by slug — markdown content included. Supports ?lang=zh
 * to select the Chinese title/excerpt/content, falling back to English when a
 * locale field is missing.
 */
export const GET = withErrorHandler(async (_req, context) => {
  const { slug } = await context.params
  const post = await prisma.vlogPost.findFirst({
    where: { slug, published: true, publishedAt: { not: null } },
  })

  if (!post) throw new NotFoundError('Post not found')

  const lang = new URL(_req.url).searchParams.get('lang') === 'zh' ? 'zh' : 'en'

  return apiSuccess({
    id: post.id,
    slug: post.slug,
    title: lang === 'zh' ? post.title_zh || post.title : post.title,
    excerpt: lang === 'zh' ? post.excerpt_zh || post.excerpt : post.excerpt,
    image: post.image,
    content: lang === 'zh' ? post.content_zh || post.content : post.content,
    publishedAt: post.publishedAt?.toISOString() ?? null,
  })
})