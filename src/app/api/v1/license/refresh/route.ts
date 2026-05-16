import { withErrorHandler } from '@/lib/api-handler'
import { apiError, apiSuccess } from '@/lib/api-response'
import { prisma } from '@/lib/db'
import { issueEcShareLicense } from '@/lib/ec-share-license'
import {
  EC_SHARE_PRODUCT,
  getBearerToken,
  verifyLicenseJwtWithRevocationCheck,
  type LicenseJwtPayload,
} from '@/lib/license-jwt'
import { licenseRefreshSchema } from '@/lib/validations/ec-share'

export const dynamic = 'force-dynamic'

const LICENSE_REFRESH_GRACE_SECONDS = 44 * 24 * 60 * 60

export const POST = withErrorHandler(async (req) => {
  const bearerToken = getBearerToken(req)

  if (!bearerToken) {
    return apiError('UNAUTHORIZED', 'Missing license token.', 401)
  }

  let payload: LicenseJwtPayload

  try {
    payload = await verifyLicenseJwtWithRevocationCheck(bearerToken, {
      allowExpiredSeconds: LICENSE_REFRESH_GRACE_SECONDS,
    })
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or expired license token.', 401)
  }

  const body = await req.json()
  const data = licenseRefreshSchema.parse(body)

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
  })
})
