import { withErrorHandler, NotFoundError } from '@/lib/api-handler'
import { apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** Public single post by slug — markdown content included. */
export const GET = withErrorHandler(async (_req, context) => {
  const { slug } = await context.params
  const post = await prisma.vlogPost.findFirst({
    where: { slug, published: true, publishedAt: { not: null } },
  })

  if (!post) throw new NotFoundError('Post not found')

  return apiSuccess({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    image: post.image,
    content: post.content,
    publishedAt: post.publishedAt?.toISOString() ?? null,
  })
})