import { createHash } from 'node:crypto'

import { getUpstashRedis } from '@/lib/rate-limit'

const REVOKE_KEY_PREFIX = 'jwtrev:v1:'

function sha256Hex(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

/**
 * Adds the raw JWT to an Upstash Redis deny-list until its natural exp.
 * No-op when Redis is not configured (local single-instance dev).
 */
export async function revokeLicenseJwtToken(
  token: string,
  expiresAtUnix: number
): Promise<void> {
  const redis = getUpstashRedis()
  if (!redis) {
    return
  }

  const ttlSec = Math.max(1, expiresAtUnix - Math.floor(Date.now() / 1000))
  await redis.set(`${REVOKE_KEY_PREFIX}${sha256Hex(token)}`, '1', { ex: ttlSec })
}

export async function isLicenseJwtRevoked(token: string): Promise<boolean> {
  const redis = getUpstashRedis()
  if (!redis) {
    return false
  }

  const v = await redis.get(`${REVOKE_KEY_PREFIX}${sha256Hex(token)}`)
  return v !== null && v !== undefined
}

export async function assertLicenseJwtNotRevoked(token: string): Promise<void> {
  if (await isLicenseJwtRevoked(token)) {
    throw new Error('License token revoked')
  }
}
