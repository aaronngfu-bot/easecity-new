import { createPrivateKey, createPublicKey, sign, verify } from 'node:crypto'

import { assertLicenseJwtNotRevoked } from '@/lib/license-jwt-revocation'

export const EC_SHARE_PRODUCT = 'ec_share' as const

export type LicenseTier =
  | 'trial'
  | 'pro'
  | 'business'
  | 'enterprise'
  | 'expired_trial'
  | 'expired'

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing'

export type OrgRole =
  | 'org_owner'
  | 'org_admin'
  | 'org_operator'
  | 'org_viewer'
  | 'org_auditor'

export type LicenseFeature =
  | 'grid'
  | 'focus'
  | 'codec_h265'
  | 'screenshot'
  | 'record'
  | 'share_1'
  | 'share_5'
  | 'share_unlimited'
  | 'audit_30d'
  | 'audit_unlimited'
  | 'sso_saml'
  | 'sso_oidc'
  | 'rbac_basic'
  | 'rbac_full'
  | 'onprem'

export interface LicenseJwtInput {
  userId: string
  email: string
  tier: LicenseTier
  seats: number
  deviceFingerprint: string
  product?: typeof EC_SHARE_PRODUCT
  expiresInSeconds?: number
  features?: LicenseFeature[]
  maxDevices?: number
  trialExpiresAt?: Date | number | null
  subscriptionStatus?: SubscriptionStatus
  cancelAtPeriodEnd?: boolean
  periodEndsAt?: Date | number | null
  orgId?: string | null
  orgRole?: OrgRole | null
}

export interface LicenseJwtPayload {
  sub: string
  email: string
  iss: string
  aud: string
  iat: number
  exp: number
  product: typeof EC_SHARE_PRODUCT
  tier: LicenseTier
  seats: number
  features: LicenseFeature[]
  max_devices: number
  trial_expires_at: number | null
  subscription_status: SubscriptionStatus
  cancel_at_period_end: boolean
  period_ends_at: number | null
  device_fingerprint: string
  org_id: string | null
  org_role: OrgRole | null
}

export interface VerifyLicenseJwtOptions {
  allowExpiredSeconds?: number
}

const DEFAULT_LICENSE_TTL_SECONDS = 24 * 60 * 60
const DEFAULT_KEY_ID = '2026a'
const DEFAULT_ISSUER = 'https://api.easecity.hk'
const DEFAULT_AUDIENCE = 'ec-share-desktop'

const TIER_FEATURES: Record<LicenseTier, LicenseFeature[]> = {
  trial: ['grid', 'focus', 'codec_h265', 'screenshot', 'record', 'share_1'],
  pro: ['grid', 'focus', 'codec_h265', 'screenshot', 'record'],
  business: [
    'grid',
    'focus',
    'codec_h265',
    'screenshot',
    'record',
    'share_5',
    'audit_30d',
    'rbac_basic',
  ],
  enterprise: [
    'grid',
    'focus',
    'codec_h265',
    'screenshot',
    'record',
    'share_unlimited',
    'audit_unlimited',
    'sso_saml',
    'sso_oidc',
    'rbac_full',
    'onprem',
  ],
  expired_trial: [],
  expired: [],
}

const TIER_MAX_DEVICES: Record<LicenseTier, number> = {
  trial: 5,
  pro: 5,
  business: 15,
  enterprise: 999_999,
  expired_trial: 0,
  expired: 0,
}

export function getFeaturesForTier(tier: LicenseTier): LicenseFeature[] {
  return [...TIER_FEATURES[tier]]
}

export function getMaxDevicesForTier(tier: LicenseTier): number {
  return TIER_MAX_DEVICES[tier]
}

export function buildLicenseJwtPayload(input: LicenseJwtInput): LicenseJwtPayload {
  const now = Math.floor(Date.now() / 1000)
  const expiresInSeconds = input.expiresInSeconds ?? DEFAULT_LICENSE_TTL_SECONDS

  return {
    sub: input.userId,
    email: input.email,
    iss: process.env.LICENSE_JWT_ISSUER || DEFAULT_ISSUER,
    aud: process.env.LICENSE_JWT_AUDIENCE || DEFAULT_AUDIENCE,
    iat: now,
    exp: now + expiresInSeconds,
    product: input.product ?? EC_SHARE_PRODUCT,
    tier: input.tier,
    seats: input.seats,
    features: input.features ?? getFeaturesForTier(input.tier),
    max_devices: input.maxDevices ?? getMaxDevicesForTier(input.tier),
    trial_expires_at: toEpochSecondsOrNull(input.trialExpiresAt ?? null),
    subscription_status:
      input.subscriptionStatus ?? (input.tier === 'trial' ? 'trialing' : 'active'),
    cancel_at_period_end: input.cancelAtPeriodEnd ?? false,
    period_ends_at: toEpochSecondsOrNull(input.periodEndsAt ?? null),
    device_fingerprint: input.deviceFingerprint,
    org_id: input.orgId ?? null,
    org_role: input.orgRole ?? null,
  }
}

export function signLicenseJwt(input: LicenseJwtInput): string {
  return signJwt(buildLicenseJwtPayload(input))
}

export function verifyLicenseJwt(
  token: string,
  options: VerifyLicenseJwtOptions = {}
): LicenseJwtPayload {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')

  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Invalid license token')
  }

  const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf8')) as {
    alg?: string
    typ?: string
  }

  if (header.alg !== 'EdDSA' || header.typ !== 'JWT') {
    throw new Error('Invalid license token header')
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`
  const isValid = verify(
    null,
    Buffer.from(signingInput),
    createPublicKey(createPrivateKey(getPrivateKeyPem())),
    base64UrlDecode(encodedSignature)
  )

  if (!isValid) {
    throw new Error('Invalid license token signature')
  }

  const payload = JSON.parse(
    base64UrlDecode(encodedPayload).toString('utf8')
  ) as LicenseJwtPayload
  assertLicensePayload(payload)

  const now = Math.floor(Date.now() / 1000)
  const allowedExpiry = options.allowExpiredSeconds ?? 0

  if (payload.exp + allowedExpiry < now) {
    throw new Error('License token expired')
  }

  const expectedIssuer = process.env.LICENSE_JWT_ISSUER || DEFAULT_ISSUER
  const expectedAudience = process.env.LICENSE_JWT_AUDIENCE || DEFAULT_AUDIENCE

  if (payload.iss !== expectedIssuer || payload.aud !== expectedAudience) {
    throw new Error('Invalid license token claims')
  }

  return payload
}

export function getLicensePublicKeyPem(): string {
  const privateKeyPem = getPrivateKeyPem()
  return createPublicKey(createPrivateKey(privateKeyPem)).export({
    type: 'spki',
    format: 'pem',
  }) as string
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization')
  const prefix = 'Bearer '

  if (!header?.startsWith(prefix)) {
    return null
  }

  const token = header.slice(prefix.length).trim()
  return token.length > 0 ? token : null
}

export async function requireEcShareLicense(
  request: Request
): Promise<LicenseJwtPayload> {
  const bearerToken = getBearerToken(request)

  if (!bearerToken) {
    throw new Error('Missing license token')
  }

  const payload = verifyLicenseJwt(bearerToken)

  if (payload.product !== EC_SHARE_PRODUCT) {
    throw new Error('Invalid license product')
  }

  await assertLicenseJwtNotRevoked(bearerToken)

  return payload
}

export async function verifyLicenseJwtWithRevocationCheck(
  token: string,
  options: VerifyLicenseJwtOptions = {}
): Promise<LicenseJwtPayload> {
  const payload = verifyLicenseJwt(token, options)
  await assertLicenseJwtNotRevoked(token)
  return payload
}

function signJwt(payload: LicenseJwtPayload): string {
  const header = {
    alg: 'EdDSA',
    typ: 'JWT',
    kid: process.env.LICENSE_JWT_KEY_ID || DEFAULT_KEY_ID,
  }
  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const privateKey = createPrivateKey(getPrivateKeyPem())
  const signature = sign(null, Buffer.from(signingInput), privateKey)

  return `${signingInput}.${base64UrlEncode(signature)}`
}

function getPrivateKeyPem(): string {
  const value = process.env.LICENSE_JWT_PRIVATE_KEY_PEM

  if (!value) {
    throw new Error('LICENSE_JWT_PRIVATE_KEY_PEM is not configured')
  }

  return value.replace(/\\n/g, '\n')
}

function toEpochSecondsOrNull(value: Date | number | null): number | null {
  if (value === null) {
    return null
  }

  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000)
  }

  return Math.floor(value)
}

function base64UrlEncode(value: string | Buffer): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value)
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function base64UrlDecode(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '='
  )
  return Buffer.from(padded, 'base64')
}

function assertLicensePayload(payload: LicenseJwtPayload): void {
  if (
    typeof payload.sub !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.iss !== 'string' ||
    typeof payload.aud !== 'string' ||
    typeof payload.iat !== 'number' ||
    typeof payload.exp !== 'number' ||
    payload.product !== EC_SHARE_PRODUCT ||
    typeof payload.tier !== 'string' ||
    typeof payload.seats !== 'number' ||
    !Array.isArray(payload.features) ||
    typeof payload.max_devices !== 'number' ||
    typeof payload.device_fingerprint !== 'string'
  ) {
    throw new Error('Invalid license token payload')
  }
}
