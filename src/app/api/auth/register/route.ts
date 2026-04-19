import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { withErrorHandler } from '@/lib/api-handler'
import { apiSuccess, apiError } from '@/lib/api-response'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { prisma } from '@/lib/db'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Please enter a valid email').max(255).trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  turnstileToken: z.string().min(1, 'Human verification required'),
})

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // skip in dev if key not set

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  })
  const data = await res.json() as { success: boolean }
  return data.success
}

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const { allowed } = rateLimit(`register:${ip}`, 5, 15 * 60_000)

  if (!allowed) {
    return apiError('RATE_LIMITED', 'Too many registration attempts. Please try again later.', 429)
  }

  const body = await req.json()
  const data = registerSchema.parse(body)

  // Verify Turnstile token
  const isHuman = await verifyTurnstile(data.turnstileToken, ip)
  if (!isHuman) {
    return apiError('CAPTCHA_FAILED', 'Human verification failed. Please try again.', 400)
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    return apiError('EMAIL_EXISTS', 'An account with this email already exists', 409)
  }

  const hashedPassword = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      hashedPassword,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  })

  return apiSuccess(user, 201)
})
