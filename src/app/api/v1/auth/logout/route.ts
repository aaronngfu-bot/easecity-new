import { NextResponse } from 'next/server'

import { withErrorHandler } from '@/lib/api-handler'
import { apiError } from '@/lib/api-response'
import { getBearerToken, verifyLicenseJwt, type LicenseJwtPayload } from '@/lib/license-jwt'
import { revokeLicenseJwtToken } from '@/lib/license-jwt-revocation'
import { getClientIp, rateLimit } from '@/lib/rate-limit'
import { AUTH_LOGOUT_IP_LIMIT, AUTH_LOGOUT_IP_WINDOW_MS } from '@/lib/rate-limit-policy'

export const dynamic = 'force-dynamic'

export const POST = withErrorHandler(async (req) => {
  const ip = getClientIp(req)
  const ipLimit = await rateLimit(
    `auth-logout:ip:${ip}`,
    AUTH_LOGOUT_IP_LIMIT,
    AUTH_LOGOUT_IP_WINDOW_MS
  )

  if (!ipLimit.allowed) {
    return apiError('RATE_LIMITED', 'Too many logout attempts.', 429)
  }

  const bearerToken = getBearerToken(req)

  if (!bearerToken) {
    return apiError('UNAUTHORIZED', 'Missing license token.', 401)
  }

  let payload: LicenseJwtPayload

  try {
    payload = verifyLicenseJwt(bearerToken)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or expired license token.', 401)
  }

  await revokeLicenseJwtToken(bearerToken, payload.exp)

  return new NextResponse(null, { status: 204 })
})
