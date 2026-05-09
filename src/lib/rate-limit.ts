import { Redis } from '@upstash/redis'

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetIn: number
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanupMemory() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  rateLimitMap.forEach((value, key) => {
    if (now > value.resetTime) rateLimitMap.delete(key)
  })
}

function rateLimitMemory(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  cleanupMemory()

  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetIn: windowMs }
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    }
  }

  record.count++
  return {
    allowed: true,
    remaining: limit - record.count,
    resetIn: record.resetTime - now,
  }
}

let redisClient: Redis | null | undefined

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    redisClient = null
    return null
  }
  redisClient = new Redis({ url, token })
  return redisClient
}

/**
 * Fixed window aligned to Unix time (same limit behavior across server instances).
 */
async function rateLimitUpstash(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const redis = getRedis()
  if (!redis) {
    return rateLimitMemory(identifier, limit, windowMs)
  }

  const now = Date.now()
  const windowStart = Math.floor(now / windowMs) * windowMs
  const key = `rl:v1:${identifier}:${windowStart}`
  const count = await redis.incr(key)
  if (count === 1) {
    const ttlMs = windowStart + windowMs - now + 500
    await redis.pexpire(key, Math.max(1000, ttlMs))
  }

  const resetIn = Math.max(0, windowStart + windowMs - now)

  if (count > limit) {
    return { allowed: false, remaining: 0, resetIn }
  }
  return { allowed: true, remaining: limit - count, resetIn }
}

/**
 * Returns whether an action is allowed under a fixed window.
 * Uses Upstash Redis when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
 * are set; otherwise an in-memory map (single-instance / dev only).
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (getRedis()) {
    return rateLimitUpstash(identifier, limit, windowMs)
  }
  return rateLimitMemory(identifier, limit, windowMs)
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real
  return '127.0.0.1'
}
