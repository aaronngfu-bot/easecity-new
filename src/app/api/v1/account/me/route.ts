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

export const dynamic = 'force-dynamic'

export const GET = withErrorHandler(async (req) => {
  const bearerToken = getBearerToken(req)

  if (!bearerToken) {
    return apiError('UNAUTHORIZED', 'Missing license token.', 401)
  }

  let payload: LicenseJwtPayload

  try {
    payload = await verifyLicenseJwtWithRevocationCheck(bearerToken)
  } catch {
    return apiError('UNAUTHORIZED', 'Invalid or expired license token.', 401)
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

  const [license, subscription, trial, devices] = await Promise.all([
    issueEcShareLicense({
      user,
      deviceFingerprint: payload.device_fingerprint,
    }),
    prisma.subscription.findFirst({
      where: {
        product: EC_SHARE_PRODUCT,
        OR: [{ userId: user.id }, { orgId: payload.org_id ?? undefined }],
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.trial.findFirst({
      where: {
        userId: user.id,
        product: EC_SHARE_PRODUCT,
      },
      orderBy: { startedAt: 'desc' },
    }),
    prisma.device.findMany({
      where: {
        userId: user.id,
        product: EC_SHARE_PRODUCT,
      },
      orderBy: { lastSeenAt: 'desc' },
    }),
  ])

  return apiSuccess({
    user_id: user.id,
    email: user.email,
    tier: license.input.tier,
    seats: license.input.seats,
    subscription: subscription
      ? {
          stripe_subscription_id: subscription.stripeSubscriptionId,
          status: subscription.status,
          cancel_at_period_end: subscription.cancelAtPeriodEnd,
          current_period_end: toEpochSecondsOrNull(subscription.currentPeriodEnd),
        }
      : null,
    trial: trial
      ? {
          started_at: toEpochSecondsOrNull(trial.startedAt),
          expires_at: toEpochSecondsOrNull(trial.expiresAt),
        }
      : null,
    devices: devices.map((device) => ({
      fingerprint: device.fingerprint,
      nickname: device.nickname,
      last_seen_at: toEpochSecondsOrNull(device.lastSeenAt),
    })),
  })
})

function toEpochSecondsOrNull(value: Date | null): number | null {
  return value ? Math.floor(value.getTime() / 1000) : null
}
