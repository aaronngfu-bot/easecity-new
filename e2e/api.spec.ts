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
    const response = await request.post('/api/payment/create-session', {
      data: { priceId: 'price_test', mode: 'payment' },
    })
    expect(response.status()).toBe(401)
  })
})
