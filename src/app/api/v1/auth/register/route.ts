import bcrypt from 'bcryptjs'
import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { issueEcShareLicense } from '@/lib/ec-share-license'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import {
  PASSWORD_AUTH_EMAIL_LIMIT,
  PASSWORD_AUTH_EMAIL_WINDOW_MS,
  PASSWORD_AUTH_IP_LIMIT,
  PASSWORD_AUTH_IP_WINDOW_MS,
} from '@/lib/rate-limit-policy'
import { nativeRegisterSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const ipLimit = await rateLimit(
    `native-register:ip:${ip}`,
    PASSWORD_AUTH_IP_LIMIT,
    PASSWORD_AUTH_IP_WINDOW_MS
  )

  if (!ipLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many registration attempts.', 429)
  }

  const body = await req.json()
  const data = nativeRegisterSchema.parse(body)
  const emailLimit = await rateLimit(
    `native-register:email:${data.email}`,
    PASSWORD_AUTH_EMAIL_LIMIT,
    PASSWORD_AUTH_EMAIL_WINDOW_MS
  )

  if (!emailLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many registration attempts for this email.', 429)
  }

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  })

  if (existing) {
    return apiError('EMAIL_EXISTS', 'An account with this email already exists.', 409)
  }

  const hashedPassword = await bcrypt.hash(data.password, 12)
  const user = await prisma.user.create({
    data: {
      email: data.email,
      emailVerified: new Date(),
      hashedPassword,
      name: data.name,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
    select: {
      id: true,
      email: true,
    },
  })

  const license = await issueEcShareLicense({
    user,
    deviceFingerprint: data.device_fingerprint,
    startTrialIfEligible: true,
  })

  return apiSuccess(
    {
      user_id: user.id,
      email: user.email,
      license_jwt: license.licenseJwt,
      is_new_user: true,
    },
    201
  )
})
