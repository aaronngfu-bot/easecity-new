import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import {
  EC_SHARE_PRODUCT,
  type LicenseJwtPayload,
  requireEcShareLicense,
} from '@/lib/license-jwt'
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
    `license-heartbeat:ip:${ip}`,
    LICENSE_LIFECYCLE_IP_LIMIT,
    LICENSE_LIFECYCLE_IP_WINDOW_MS
  )

  if (!ipLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many license heartbeats.', 429)
  }

  let payload: LicenseJwtPayload

  try {
    payload = await requireEcShareLicense(req)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or missing license token.', 401)
  }

  const body = await req.json()
  const data = licenseLifecycleSchema.parse(body)
  const deviceLimit = await rateLimit(
    `license-heartbeat:device:${data.device_fingerprint}`,
    LICENSE_LIFECYCLE_DEVICE_LIMIT,
    LICENSE_LIFECYCLE_DEVICE_WINDOW_MS
  )

  if (!deviceLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many license heartbeats for this device.', 429)
  }

  if (
    payload.product !== EC_SHARE_PRODUCT ||
    payload.product !== data.product ||
    payload.device_fingerprint !== data.device_fingerprint
  ) {
    return apiError('LICENSE_MISMATCH', 'License token does not match this device.', 401)
  }

  const lastSeenAt = new Date()
  const result = await prisma.device.updateMany({
    where: {
      product: EC_SHARE_PRODUCT,
      fingerprint: data.device_fingerprint,
      userId: payload.sub,
    },
    data: {
      lastSeenAt,
    },
  })

  if (result.count === 0) {
    return apiError('DEVICE_NOT_FOUND', 'Device is not activated for this account.', 404)
  }

  return apiSuccess({
    product: EC_SHARE_PRODUCT,
    device_fingerprint: data.device_fingerprint,
    last_seen_at: Math.floor(lastSeenAt.getTime() / 1000),
  })
})
