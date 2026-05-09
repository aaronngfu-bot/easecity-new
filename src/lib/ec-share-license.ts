import type { User } from '@prisma/client'
import { prisma } from '@/lib/db'
import {
  EC_SHARE_PRODUCT,
  LicenseJwtInput,
  LicenseTier,
  OrgRole,
  SubscriptionStatus,
  signLicenseJwt,
} from '@/lib/license-jwt'

const TRIAL_DAYS = 14

interface IssueLicenseParams {
  user: Pick<User, 'id' | 'email'>
  deviceFingerprint: string
  startTrialIfEligible?: boolean
}

interface IssueLicenseResult {
  licenseJwt: string
  expiresAt: number
  nextRefreshAt: number
  input: LicenseJwtInput
}

interface ResolvedEntitlement {
  tier: LicenseTier
  seats: number
  subscriptionStatus: SubscriptionStatus
  trialExpiresAt: Date | null
  periodEndsAt: Date | null
  cancelAtPeriodEnd: boolean
  orgId: string | null
  orgRole: OrgRole | null
}

export async function issueEcShareLicense(
  params: IssueLicenseParams
): Promise<IssueLicenseResult> {
  const entitlement = await resolveEntitlement(params)

  await prisma.device.upsert({
    where: {
      product_fingerprint: {
        product: EC_SHARE_PRODUCT,
        fingerprint: params.deviceFingerprint,
      },
    },
    create: {
      product: EC_SHARE_PRODUCT,
      fingerprint: params.deviceFingerprint,
      userId: params.user.id,
      lastSeenAt: new Date(),
    },
    update: {
      userId: params.user.id,
      lastSeenAt: new Date(),
    },
  })

  const input: LicenseJwtInput = {
    userId: params.user.id,
    email: params.user.email,
    deviceFingerprint: params.deviceFingerprint,
    product: EC_SHARE_PRODUCT,
    tier: entitlement.tier,
    seats: entitlement.seats,
    subscriptionStatus: entitlement.subscriptionStatus,
    cancelAtPeriodEnd: entitlement.cancelAtPeriodEnd,
    trialExpiresAt: entitlement.trialExpiresAt,
    periodEndsAt: entitlement.periodEndsAt,
    orgId: entitlement.orgId,
    orgRole: entitlement.orgRole,
  }

  const licenseJwt = signLicenseJwt(input)
  const now = Math.floor(Date.now() / 1000)

  return {
    licenseJwt,
    expiresAt: now + 24 * 60 * 60,
    nextRefreshAt: now + 24 * 60 * 60,
    input,
  }
}

async function resolveEntitlement(
  params: IssueLicenseParams
): Promise<ResolvedEntitlement> {
  const now = new Date()

  const userSubscription = await prisma.subscription.findFirst({
    where: {
      userId: params.user.id,
      product: EC_SHARE_PRODUCT,
      status: { in: ['active', 'trialing', 'past_due'] },
    },
    orderBy: { updatedAt: 'desc' },
  })

  if (userSubscription) {
    return {
      tier: userSubscription.tier as LicenseTier,
      seats: userSubscription.seats,
      subscriptionStatus: userSubscription.status as SubscriptionStatus,
      trialExpiresAt: userSubscription.trialEnd,
      periodEndsAt: userSubscription.currentPeriodEnd,
      cancelAtPeriodEnd: userSubscription.cancelAtPeriodEnd,
      orgId: null,
      orgRole: null,
    }
  }

  const orgMembership = await prisma.orgMember.findFirst({
    where: { userId: params.user.id },
    include: {
      organization: {
        include: {
          subscriptions: {
            where: {
              product: EC_SHARE_PRODUCT,
              status: { in: ['active', 'trialing', 'past_due'] },
            },
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  const orgSubscription = orgMembership?.organization.subscriptions[0]

  if (orgSubscription) {
    return {
      tier: orgSubscription.tier as LicenseTier,
      seats: orgSubscription.seats,
      subscriptionStatus: orgSubscription.status as SubscriptionStatus,
      trialExpiresAt: orgSubscription.trialEnd,
      periodEndsAt: orgSubscription.currentPeriodEnd,
      cancelAtPeriodEnd: orgSubscription.cancelAtPeriodEnd,
      orgId: orgMembership.orgId,
      orgRole: orgMembership.role as OrgRole,
    }
  }

  const activeTrial = await prisma.trial.findFirst({
    where: {
      userId: params.user.id,
      product: EC_SHARE_PRODUCT,
      expiresAt: { gt: now },
    },
    orderBy: { expiresAt: 'desc' },
  })

  if (activeTrial) {
    return trialEntitlement(activeTrial.expiresAt)
  }

  const priorTrial = await prisma.trial.findFirst({
    where: {
      product: EC_SHARE_PRODUCT,
      OR: [
        { userId: params.user.id },
        { deviceFingerprint: params.deviceFingerprint },
      ],
    },
    orderBy: { startedAt: 'desc' },
  })

  if (!priorTrial && params.startTrialIfEligible) {
    const expiresAt = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)

    await prisma.trial.create({
      data: {
        product: EC_SHARE_PRODUCT,
        userId: params.user.id,
        deviceFingerprint: params.deviceFingerprint,
        startedAt: now,
        expiresAt,
      },
    })

    return trialEntitlement(expiresAt)
  }

  return {
    tier: priorTrial ? 'expired_trial' : 'expired',
    seats: 0,
    subscriptionStatus: 'canceled',
    trialExpiresAt: priorTrial?.expiresAt ?? null,
    periodEndsAt: null,
    cancelAtPeriodEnd: false,
    orgId: null,
    orgRole: null,
  }
}

function trialEntitlement(expiresAt: Date): ResolvedEntitlement {
  return {
    tier: 'trial',
    seats: 1,
    subscriptionStatus: 'trialing',
    trialExpiresAt: expiresAt,
    periodEndsAt: expiresAt,
    cancelAtPeriodEnd: false,
    orgId: null,
    orgRole: null,
  }
}
