import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { sendOtpEmail } from '@/lib/email/send'
import { requireEcShareLicense } from '@/lib/license-jwt'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { changeEmailRequestSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

const OTP_EXPIRES_IN_MINUTES = 10

export const POST = withErrorHandler(async (req) => {
  let payload: ReturnType<typeof requireEcShareLicense>

  try {
    payload = requireEcShareLicense(req)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or missing license token.', 401)
  }

  const ip = getClientIp(req)
  const { allowed } = await rateLimit(`change-email:${payload.sub}:${ip}`, 5, 60 * 60_000)

  if (!allowed) {
    return apiError('RATE_LIMITED', 'Too many change-email requests.', 429)
  }

  const body = await req.json()
  const data = changeEmailRequestSchema.parse(body)

  const currentUser = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { email: true, status: true },
  })

  if (!currentUser || currentUser.status !== 'ACTIVE') {
    return apiError('UNAUTHORIZED', 'User is not active.', 401)
  }

  if (currentUser.email === data.new_email) {
    return apiError('EMAIL_UNCHANGED', 'New email must be different.', 400)
  }

  const emailOwner = await prisma.user.findUnique({
    where: { email: data.new_email },
    select: { id: true },
  })

  if (emailOwner) {
    return apiError('EMAIL_EXISTS', 'An account with this email already exists.', 409)
  }

  const oneMinuteAgo = new Date(Date.now() - 60_000)
  const recentChallenge = await prisma.emailOtpChallenge.findFirst({
    where: {
      email: data.new_email,
      purpose: 'change_email',
      createdAt: { gt: oneMinuteAgo },
    },
    select: { id: true },
  })

  if (recentChallenge) {
    return apiError('RATE_LIMITED', 'Please wait before requesting another code.', 429)
  }

  const otp = randomInt(0, 1_000_000).toString().padStart(6, '0')
  const otpHash = await bcrypt.hash(otp, 10)
  const challenge = await prisma.emailOtpChallenge.create({
    data: {
      email: data.new_email,
      otpHash,
      deviceFingerprint: payload.device_fingerprint,
      purpose: 'change_email',
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60_000),
    },
    select: { id: true },
  })

  if (process.env.RESEND_API_KEY) {
    try {
      await sendOtpEmail({
        email: data.new_email,
        otp,
        expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
      })
    } catch (error) {
      console.error('[Change Email OTP Error]', error)
      return apiError('EMAIL_DELIVERY_FAILED', 'Could not send change-email code.', 502)
    }
  }

  const response: {
    challenge_id: string
    expires_in_seconds: number
    dev_otp?: string
  } = {
    challenge_id: challenge.id,
    expires_in_seconds: OTP_EXPIRES_IN_MINUTES * 60,
  }

  if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== 'production') {
    response.dev_otp = otp
  }

  return apiSuccess(response)
})
