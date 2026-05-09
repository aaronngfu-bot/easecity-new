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
import { nativeLoginSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const ipLimit = await rateLimit(
    `native-login:ip:${ip}`,
    PASSWORD_AUTH_IP_LIMIT,
    PASSWORD_AUTH_IP_WINDOW_MS
  )

  if (!ipLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many login attempts.', 429)
  }

  const body = await req.json()
  const data = nativeLoginSchema.parse(body)
  const emailLimit = await rateLimit(
    `native-login:email:${data.email}`,
    PASSWORD_AUTH_EMAIL_LIMIT,
    PASSWORD_AUTH_EMAIL_WINDOW_MS
  )

  if (!emailLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many login attempts for this email.', 429)
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      email: true,
      hashedPassword: true,
      status: true,
    },
  })

  if (!user || !user.hashedPassword) {
    return invalidCredentials()
  }

  const isValid = await bcrypt.compare(data.password, user.hashedPassword)

  if (!isValid) {
    return invalidCredentials()
  }

  if (user.status !== 'ACTIVE') {
    return apiError('ACCOUNT_DISABLED', 'This account cannot sign in.', 403)
  }

  const license = await issueEcShareLicense({
    user,
    deviceFingerprint: data.device_fingerprint,
    startTrialIfEligible: true,
  })

  return apiSuccess({
    user_id: user.id,
    email: user.email,
    license_jwt: license.licenseJwt,
    is_new_user: false,
  })
})

function invalidCredentials() {
  return apiError('INVALID_CREDENTIALS', 'Invalid email or password.', 401)
}
