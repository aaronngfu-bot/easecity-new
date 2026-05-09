import bcrypt from 'bcryptjs'
import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { issueEcShareLicense } from '@/lib/ec-share-license'
import { prisma } from '@/lib/db'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import {
  OTP_VERIFY_EMAIL_LIMIT,
  OTP_VERIFY_EMAIL_WINDOW_MS,
  OTP_VERIFY_IP_LIMIT,
  OTP_VERIFY_IP_WINDOW_MS,
} from '@/lib/rate-limit-policy'
import { verifyOtpSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

const MAX_OTP_ATTEMPTS = 5

export const POST = withErrorHandler(async (req) => {
  const body = await req.json()
  const data = verifyOtpSchema.parse(body)

  const ip = getClientIp(req)
  const ipLimit = await rateLimit(`otp-verify:ip:${ip}`, OTP_VERIFY_IP_LIMIT, OTP_VERIFY_IP_WINDOW_MS)
  if (!ipLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many verification attempts. Please try again later.', 429)
  }

  const challenge = await prisma.emailOtpChallenge.findUnique({
    where: { id: data.challenge_id },
  })

  if (!challenge || challenge.verifiedAt || challenge.purpose !== 'login') {
    return apiError('INVALID_CHALLENGE', 'Invalid or expired login challenge.', 400)
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    return apiError('EXPIRED_CHALLENGE', 'Login code has expired.', 400)
  }

  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    return apiError('TOO_MANY_ATTEMPTS', 'Too many incorrect login attempts.', 429)
  }

  const emailLimit = await rateLimit(
    `otp-verify:email:${challenge.email}`,
    OTP_VERIFY_EMAIL_LIMIT,
    OTP_VERIFY_EMAIL_WINDOW_MS
  )
  if (!emailLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many verification attempts for this email.', 429)
  }

  const isValid = await bcrypt.compare(data.otp, challenge.otpHash)

  if (!isValid) {
    await prisma.emailOtpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    })

    return apiError('INVALID_OTP', 'Invalid login code.', 400)
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: challenge.email },
    select: { id: true },
  })
  const isNewUser = !existingUser

  const user = await prisma.user.upsert({
    where: { email: challenge.email },
    create: {
      email: challenge.email,
      emailVerified: new Date(),
      role: 'MEMBER',
      status: 'ACTIVE',
    },
    update: {
      emailVerified: new Date(),
    },
    select: {
      id: true,
      email: true,
      status: true,
    },
  })

  if (user.status !== 'ACTIVE') {
    return apiError('ACCOUNT_DISABLED', 'This account cannot sign in.', 403)
  }

  await prisma.emailOtpChallenge.update({
    where: { id: challenge.id },
    data: { verifiedAt: new Date() },
  })

  const license = await issueEcShareLicense({
    user,
    deviceFingerprint: challenge.deviceFingerprint,
    startTrialIfEligible: true,
  })

  return apiSuccess({
    user_id: user.id,
    email: user.email,
    license_jwt: license.licenseJwt,
    is_new_user: isNewUser,
  })
})
