import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { sendOtpEmail } from '@/lib/email/send'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { requestOtpSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

const OTP_EXPIRES_IN_MINUTES = 10

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const { allowed } = await rateLimit(`otp-request:ip:${ip}`, 20, 60 * 60_000)

  if (!allowed) {
    return apiError('RATE_LIMITED', 'Too many OTP requests. Please try again later.', 429)
  }

  const body = await req.json()
  const data = requestOtpSchema.parse(body)
  const emailRateLimit = await rateLimit(
    `otp-request:email:${data.email}`,
    5,
    60 * 60_000
  )

  if (!emailRateLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many OTP requests for this email.', 429)
  }

  const oneMinuteAgo = new Date(Date.now() - 60_000)
  const recentChallenge = await prisma.emailOtpChallenge.findFirst({
    where: {
      email: data.email,
      purpose: 'login',
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
      email: data.email,
      otpHash,
      deviceFingerprint: data.device_fingerprint,
      purpose: 'login',
      expiresAt: new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60_000),
    },
    select: {
      id: true,
    },
  })

  if (process.env.RESEND_API_KEY) {
    try {
      await sendOtpEmail({
        email: data.email,
        otp,
        expiresInMinutes: OTP_EXPIRES_IN_MINUTES,
      })
    } catch (error) {
      console.error('[OTP Email Error]', error)
      return apiError('EMAIL_DELIVERY_FAILED', 'Could not send login code.', 502)
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
