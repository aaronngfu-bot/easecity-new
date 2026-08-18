import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError, NotFoundError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/permissions'
import { logAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const vlogSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().max(300).optional().nullable(),
  image: z.string().max(2_000_000).optional().nullable(),
  content: z.string().min(1),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
})

/** List all posts (admin — includes drafts). */
export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const posts = await prisma.vlogPost.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      published: true,
      publishedAt: true,
      updatedAt: true,
    },
  })

  return apiSuccess(posts.map((p) => ({ ...p, publishedAt: p.publishedAt?.toISOString() ?? null, updatedAt: p.updatedAt.toISOString() })))
})

/** Create a post. */
export const POST = withErrorHandler(async (req) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const body = await req.json()
  const data = vlogSchema.parse(body)

  const existing = await prisma.vlogPost.findUnique({ where: { slug: data.slug } })
  if (existing) return apiError('SLUG_EXISTS', 'A post with this slug already exists', 409)

  const post = await prisma.vlogPost.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || null,
      image: data.image || null,
      content: data.content,
      published: data.published ?? false,
      publishedAt: data.published ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : null,
    },
  })

  await logAction({
    userId: session.user.id,
    action: 'vlog.create',
    targetType: 'VlogPost',
    targetId: post.id,
    changes: { title: post.title, slug: post.slug },
    request: req,
  })

  return apiSuccess(post, 201)
})