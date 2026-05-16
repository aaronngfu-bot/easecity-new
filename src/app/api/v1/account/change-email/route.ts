import bcrypt from 'bcryptjs'
import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { issueEcShareLicense } from '@/lib/ec-share-license'
import { type LicenseJwtPayload, requireEcShareLicense } from '@/lib/license-jwt'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import {
  OTP_VERIFY_EMAIL_LIMIT,
  OTP_VERIFY_EMAIL_WINDOW_MS,
  OTP_VERIFY_IP_LIMIT,
  OTP_VERIFY_IP_WINDOW_MS,
} from '@/lib/rate-limit-policy'
import { changeEmailConfirmSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

const MAX_OTP_ATTEMPTS = 5

export const POST = withErrorHandler(async (req) => {
  let payload: LicenseJwtPayload

  try {
    payload = await requireEcShareLicense(req)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or missing license token.', 401)
  }

  const body = await req.json()
  const data = changeEmailConfirmSchema.parse(body)

  const ip = getClientIp(req)
  const ipLimit = await rateLimit(
    `change-email-verify:ip:${ip}`,
    OTP_VERIFY_IP_LIMIT,
    OTP_VERIFY_IP_WINDOW_MS
  )
  if (!ipLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many verification attempts. Please try again later.', 429)
  }

  const challenge = await prisma.emailOtpChallenge.findUnique({
    where: { id: data.challenge_id },
  })

  if (
    !challenge ||
    challenge.verifiedAt ||
    challenge.purpose !== 'change_email' ||
    challenge.email !== data.new_email
  ) {
    return apiError('INVALID_CHALLENGE', 'Invalid or expired change-email challenge.', 400)
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    return apiError('EXPIRED_CHALLENGE', 'Change-email code has expired.', 400)
  }

  if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
    return apiError('TOO_MANY_ATTEMPTS', 'Too many incorrect change-email attempts.', 429)
  }

  const emailLimit = await rateLimit(
    `change-email-verify:email:${challenge.email}`,
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

    return apiError('INVALID_OTP', 'Invalid change-email code.', 400)
  }

  const emailOwner = await prisma.user.findUnique({
    where: { email: data.new_email },
    select: { id: true },
  })

  if (emailOwner && emailOwner.id !== payload.sub) {
    return apiError('EMAIL_EXISTS', 'An account with this email already exists.', 409)
  }

  const user = await prisma.user.update({
    where: { id: payload.sub },
    data: {
      email: data.new_email,
      emailVerified: new Date(),
    },
    select: {
      id: true,
      email: true,
      status: true,
    },
  })

  if (user.status !== 'ACTIVE') {
    return apiError('UNAUTHORIZED', 'User is not active.', 401)
  }

  await prisma.emailOtpChallenge.update({
    where: { id: challenge.id },
    data: { verifiedAt: new Date() },
  })

  const license = await issueEcShareLicense({
    user,
    deviceFingerprint: payload.device_fingerprint,
  })

  return apiSuccess({
    user_id: user.id,
    email: user.email,
    license_jwt: license.licenseJwt,
  })
})
