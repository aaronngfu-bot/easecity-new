import { withErrorHandler, AuthError, NotFoundError } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { verifyAgentToken } from '@/lib/support'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

/**
 * Agent console data. Authenticated by the signed magic-link token — no login.
 * GET ?session=&token=        → session + messages (optionally ?list=1 for the queue)
 * POST { session, token, content, templateId? } → agent reply
 * DELETE ?session=&token=     → close the session
 */

function assertAgent(sessionId: string, token: string) {
  if (!sessionId || !token || !verifyAgentToken(sessionId, token)) throw new AuthError()
}

async function loadSession(sessionId: string) {
  const session = await prisma.supportSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, select: { id: true, role: true, content: true, templateId: true, createdAt: true } },
    },
  })
  if (!session) throw new NotFoundError('Session not found')
  return session
}

const querySchema = z.object({
  session: z.string().min(1).max(64),
  token: z.string().min(10).max(300),
})

export const GET = withErrorHandler(async (req) => {
  const url = new URL(req.url)
  const { session: sessionId, token } = querySchema.parse(Object.fromEntries(url.searchParams))
  assertAgent(sessionId, token)

  if (url.searchParams.get('list') === '1') {
    const sessions = await prisma.supportSession.findMany({
      where: { status: { in: ['waiting', 'active'] } },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true, name: true, email: true, language: true, status: true,
        pageUrl: true, createdAt: true, updatedAt: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1, select: { content: true } },
      },
    })
    return apiSuccess({
      sessions: sessions.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        language: s.language,
        status: s.status,
        pageUrl: s.pageUrl,
        updatedAt: s.updatedAt.toISOString(),
        lastMessage: s.messages[0]?.content ?? '',
      })),
    })
  }

  const session = await loadSession(sessionId)
  await prisma.supportMessage.updateMany({
    where: { sessionId, role: 'visitor' },
    data: { readByAgent: true },
  })
  if (session.status === 'waiting') {
    await prisma.supportSession.update({ where: { id: sessionId }, data: { status: 'active' } })
  }

  return apiSuccess({
    id: session.id,
    name: session.name,
    email: session.email,
    language: session.language,
    status: session.status === 'waiting' ? 'active' : session.status,
    pageUrl: session.pageUrl,
    messages: session.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      templateId: m.templateId,
      createdAt: m.createdAt.toISOString(),
    })),
  })
})

const postSchema = z.object({
  session: z.string().min(1).max(64),
  token: z.string().min(10).max(300),
  content: z.string().min(1).max(4000),
  templateId: z.string().max(40).optional(),
})

export const POST = withErrorHandler(async (req) => {
  const { session: sessionId, token, content, templateId } = postSchema.parse(await req.json())
  assertAgent(sessionId, token)

  const session = await prisma.supportSession.findUnique({ where: { id: sessionId } })
  if (!session) throw new NotFoundError('Session not found')
  if (session.status === 'closed') {
    return apiError('SESSION_CLOSED', 'This conversation has ended.', 409)
  }

  const message = await prisma.supportMessage.create({
    data: { sessionId, role: 'agent', content, templateId: templateId || null },
  })
  await prisma.supportSession.update({
    where: { id: sessionId },
    data: { status: 'active', updatedAt: new Date() },
  })

  return apiSuccess({ id: message.id, createdAt: message.createdAt.toISOString() }, 201)
})

export const DELETE = withErrorHandler(async (req) => {
  const url = new URL(req.url)
  const { session: sessionId, token } = querySchema.parse(Object.fromEntries(url.searchParams))
  assertAgent(sessionId, token)

  await prisma.$transaction([
    prisma.supportMessage.create({
      data: { sessionId, role: 'system', content: '__ended__' },
    }),
    prisma.supportSession.update({ where: { id: sessionId }, data: { status: 'closed' } }),
  ])
  return apiSuccess({ ok: true })
})
