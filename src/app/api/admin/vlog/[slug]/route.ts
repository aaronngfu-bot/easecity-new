import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withErrorHandler, AuthError, ForbiddenError, NotFoundError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { isAdmin } from '@/lib/permissions'
import { logAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/** Fetch one post for editing (admin — includes drafts + full content). */
export const GET = withErrorHandler(async (_req, context) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const { slug } = await context.params
  const post = await prisma.vlogPost.findUnique({ where: { slug } })
  if (!post) throw new NotFoundError('Post not found')

  return apiSuccess({
    id: post.id,
    slug: post.slug,
    title: post.title,
    title_zh: post.title_zh,
    excerpt: post.excerpt,
    excerpt_zh: post.excerpt_zh,
    content: post.content,
    content_zh: post.content_zh,
    published: post.published,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
  })
})

const vlogPatchSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  title_zh: z.string().max(160).nullable().optional(),
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'lowercase letters, numbers, and hyphens only')
    .optional(),
  excerpt: z.string().max(300).nullable().optional(),
  excerpt_zh: z.string().max(300).nullable().optional(),
  image: z.string().max(2_000_000).nullable().optional(),
  content: z.string().min(1).optional(),
  content_zh: z.string().min(1).nullable().optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
})

export const PATCH = withErrorHandler(async (req, context) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const { slug } = await context.params
  const body = await req.json()
  const data = vlogPatchSchema.parse(body)

  const existing = await prisma.vlogPost.findUnique({ where: { slug } })
  if (!existing) throw new NotFoundError('Post not found')

  // If slug is changing, ensure new slug is free
  if (data.slug && data.slug !== slug) {
    const clash = await prisma.vlogPost.findUnique({ where: { slug: data.slug } })
    if (clash) return apiError('SLUG_EXISTS', 'A post with this slug already exists', 409)
  }

  const update = { ...data }
  delete (update as Record<string, unknown>).publishedAt
  delete (update as Record<string, unknown>).published

  const post = await prisma.vlogPost.update({
    where: { id: existing.id },
    data: {
      ...update,
      ...(data.published !== undefined
        ? {
            published: data.published,
            publishedAt: data.published
              ? existing.publishedAt && !existing.published
                ? new Date()
                : existing.publishedAt
              : null,
          }
        : {}),
      ...(data.publishedAt !== undefined ? { publishedAt: data.publishedAt ? new Date(data.publishedAt) : null } : {}),
    },
  })

  await logAction({
    userId: session.user.id,
    action: 'vlog.update',
    targetType: 'VlogPost',
    targetId: post.id,
    changes: { title: post.title, slug: post.slug, published: post.published },
    request: req,
  })

  return apiSuccess({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    published: post.published,
    publishedAt: post.publishedAt?.toISOString() ?? null,
  })
})

export const DELETE = withErrorHandler(async (req, context) => {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new AuthError()
  if (!isAdmin(session.user.role)) throw new ForbiddenError()

  const { slug } = await context.params
  const existing = await prisma.vlogPost.findUnique({ where: { slug } })
  if (!existing) throw new NotFoundError('Post not found')

  await prisma.vlogPost.delete({ where: { id: existing.id } })

  await logAction({
    userId: session.user.id,
    action: 'vlog.delete',
    targetType: 'VlogPost',
    targetId: existing.id,
    changes: { title: existing.title, slug: existing.slug },
    request: req,
  })

  return apiSuccess({ deleted: true })
})