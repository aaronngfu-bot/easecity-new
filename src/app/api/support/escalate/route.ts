import { withErrorHandler } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { prisma } from '@/lib/db'
import { newVisitorToken, escalationEmailHtml } from '@/lib/support'
import { Resend } from 'resend'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const escalateSchema = z.object({
  question: z.string().min(1).max(4000),
  name: z.string().max(120).optional(),
  email: z.string().email().max(255).optional(),
  language: z.enum(['en', 'zh', 'zh-CN']).default('en'),
  pageUrl: z.string().max(500).optional(),
})

/**
 * Visitor escalates from the AI chat to a human agent. Creates the session,
 * stores the visitor's question as its first message, and emails the team a
 * magic link to the support console. The console link also goes to the
 * VISITOR when they left an email — so either side can open the thread later.
 */
export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const { allowed } = await rateLimit(`support-escalate:${ip}`, 5, 60_000)
  if (!allowed) {
    return apiError('RATE_LIMITED', 'Too many requests. Please slow down.', 429)
  }

  const data = escalateSchema.parse(await req.json())
  const visitorToken = newVisitorToken()

  const session = await prisma.supportSession.create({
    data: {
      visitorToken,
      name: data.name || null,
      email: data.email || null,
      language: data.language,
      pageUrl: data.pageUrl || null,
      status: 'waiting',
      messages: {
        create: { role: 'visitor', content: data.question },
      },
    },
  })

  // Notify the team. Failure must not fail the escalation — the session
  // already exists and the console shows waiting sessions.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const fromEmail = process.env.AUTH_EMAIL_FROM || 'EaseCity <onboarding@resend.dev>'
      const to = process.env.SUPPORT_EMAIL_TO || process.env.CONTACT_EMAIL_TO || 'admin@easecity.hk'
      const { subject, html } = escalationEmailHtml({
        sessionId: session.id,
        visitorName: data.name,
        visitorEmail: data.email,
        language: data.language,
        question: data.question,
      })
      const sent = await resend.emails.send({ from: fromEmail, to: [to], subject, html })
      if (sent.error) console.error('[Support] escalation email failed:', sent.error.message)
    } catch (e) {
      console.error('[Support] escalation email error:', e)
    }
  }

  return apiSuccess({ sessionId: session.id, visitorToken, status: session.status }, 201)
})
