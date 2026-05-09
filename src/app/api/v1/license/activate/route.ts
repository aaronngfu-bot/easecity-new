import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { issueEcShareLicense } from '@/lib/ec-share-license'
import { EC_SHARE_PRODUCT, requireEcShareLicense } from '@/lib/license-jwt'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import {
  LICENSE_LIFECYCLE_DEVICE_LIMIT,
  LICENSE_LIFECYCLE_DEVICE_WINDOW_MS,
  LICENSE_LIFECYCLE_IP_LIMIT,
  LICENSE_LIFECYCLE_IP_WINDOW_MS,
} from '@/lib/rate-limit-policy'
import { licenseLifecycleSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const ipLimit = await rateLimit(
    `license-activate:ip:${ip}`,
    LICENSE_LIFECYCLE_IP_LIMIT,
    LICENSE_LIFECYCLE_IP_WINDOW_MS
  )

  if (!ipLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many license activation attempts.', 429)
  }

  let payload: ReturnType<typeof requireEcShareLicense>

  try {
    payload = requireEcShareLicense(req)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or missing license token.', 401)
  }

  const body = await req.json()
  const data = licenseLifecycleSchema.parse(body)
  const deviceLimit = await rateLimit(
    `license-activate:device:${data.device_fingerprint}`,
    LICENSE_LIFECYCLE_DEVICE_LIMIT,
    LICENSE_LIFECYCLE_DEVICE_WINDOW_MS
  )

  if (!deviceLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many license activation attempts for this device.', 429)
  }

  if (
    payload.product !== EC_SHARE_PRODUCT ||
    payload.product !== data.product ||
    payload.device_fingerprint !== data.device_fingerprint
  ) {
    return apiError('LICENSE_MISMATCH', 'License token does not match this device.', 401)
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      status: true,
    },
  })

  if (!user || user.status !== 'ACTIVE') {
    return apiError('UNAUTHORIZED', 'User is not active.', 401)
  }

  const license = await issueEcShareLicense({
    user,
    deviceFingerprint: data.device_fingerprint,
  })

  return apiSuccess({
    license_jwt: license.licenseJwt,
    product: EC_SHARE_PRODUCT,
    expires_at: license.expiresAt,
    next_refresh_at: license.nextRefreshAt,
    activated: true,
  })
})
