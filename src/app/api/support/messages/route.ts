import { withErrorHandler, NotFoundError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { prisma } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const getSchema = z.object({
  token: z.string().min(10).max(120),
  after: z.string().max(64).optional(),
})

const postSchema = z.object({
  token: z.string().min(10).max(120),
  content: z.string().min(1).max(4000),
})

/**
 * Visitor-side message channel, authenticated by the visitorToken the widget
 * holds. GET returns messages after `after` (polling); POST appends a visitor
 * message and marks the session active; DELETE ends the conversation.
 */
export const GET = withErrorHandler(async (req) => {
  const url = new URL(req.url)
  const { token, after } = getSchema.parse(Object.fromEntries(url.searchParams))

  const session = await prisma.supportSession.findUnique({ where: { visitorToken: token } })
  if (!session) throw new NotFoundError('Support session not found')

  const messages = await prisma.supportMessage.findMany({
    where: { sessionId: session.id, ...(after ? { createdAt: { gt: new Date(after) } } : {}) },
    orderBy: { createdAt: 'asc' },
    select: { id: true, role: true, content: true, createdAt: true },
  })

  if (messages.length > 0) {
    await prisma.supportMessage.updateMany({
      where: { sessionId: session.id, role: { in: ['agent', 'system'] } },
      data: { readByVisitor: true },
    })
  }

  return apiSuccess({
    status: session.status,
    messages: messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    })),
  })
})

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const { allowed } = await rateLimit(`support-msg:${ip}`, 15, 60_000)
  if (!allowed) return apiError('RATE_LIMITED', 'Too many messages. Please slow down.', 429)

  const { token, content } = postSchema.parse(await req.json())
  const session = await prisma.supportSession.findUnique({ where: { visitorToken: token } })
  if (!session) throw new NotFoundError('Support session not found')
  if (session.status === 'closed') {
    return apiError('SESSION_CLOSED', 'This conversation has ended.', 409)
  }

  const message = await prisma.supportMessage.create({
    data: { sessionId: session.id, role: 'visitor', content },
  })

  // A new visitor message means someone still needs a human.
  if (session.status === 'waiting') {
    await prisma.supportSession.update({
      where: { id: session.id },
      data: { status: 'waiting', updatedAt: new Date() },
    })
  } else {
    await prisma.supportSession.update({
      where: { id: session.id },
      data: { updatedAt: new Date() },
    })
  }

  return apiSuccess({ id: message.id, createdAt: message.createdAt.toISOString() }, 201)
})

export const DELETE = withErrorHandler(async (req) => {
  const url = new URL(req.url)
  const { token } = getSchema.parse(Object.fromEntries(url.searchParams))
  const session = await prisma.supportSession.findUnique({ where: { visitorToken: token } })
  if (!session) throw new NotFoundError('Support session not found')

  await prisma.$transaction([
    prisma.supportMessage.create({
      data: { sessionId: session.id, role: 'system', content: '__ended__' },
    }),
    prisma.supportSession.update({ where: { id: session.id }, data: { status: 'closed' } }),
  ])

  return apiSuccess({ ok: true })
})
