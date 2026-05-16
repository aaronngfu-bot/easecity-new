import { test, expect } from '@playwright/test'

test.describe('API Routes', () => {
  test('health endpoint returns status', async ({ request }) => {
    const response = await request.get('/api/v1/health')
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.status).toBeTruthy()
    expect(data.version).toBe('1.0.0')
    expect(data.services).toHaveProperty('database')
  })

  test('contact API validates input', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: { name: '', email: 'invalid', message: '' },
    })
    expect(response.status()).toBe(400)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  test('contact API rate limits', async ({ request }) => {
    // Send 4 requests rapidly (limit is 3 per minute)
    for (let i = 0; i < 3; i++) {
      await request.post('/api/contact', {
        data: {
          name: 'Test',
          email: 'test@example.com',
          subject: 'Test',
          message: 'This is a test message that is long enough.',
        },
      })
    }

    const response = await request.post('/api/contact', {
      data: {
        name: 'Test',
        email: 'test@example.com',
        subject: 'Test',
        message: 'This is a test message that is long enough.',
      },
    })
    expect(response.status()).toBe(429)
  })

  test('protected API rejects unauthenticated requests', async ({ request }) => {
    const response = await request.get('/api/admin/stats')
    expect(response.status()).toBe(401)
  })

  test('license JWKS returns Ed25519 public key', async ({ request }) => {
    const response = await request.get('/api/v1/license/jwks')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data.keys)).toBe(true)
    expect(body.data.keys.length).toBeGreaterThanOrEqual(1)
    expect(body.data.keys[0].crv).toBe('Ed25519')
    expect(body.data.keys[0].kid).toBeTruthy()
  })

  test('download latest-manifest discovery', async ({ request }) => {
    const response = await request.get('/api/v1/download/latest-manifest')
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.data.manifest_url).toMatch(/^https:\/\//)
    expect(body.data.platform).toBe('windows')
  })

  test('auth logout rejects missing bearer token', async ({ request }) => {
    const response = await request.post('/api/v1/auth/logout')
    expect(response.status()).toBe(401)
    const body = await response.json()
    expect(body.success).toBe(false)
  })
})
