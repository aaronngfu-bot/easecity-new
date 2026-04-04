import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/easecity/)
    await expect(page.locator('text=easecity')).toBeVisible()
  })

  test('navigate to about page', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/about"]')
    await expect(page).toHaveURL('/about')
  })

  test('navigate to services page', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/services"]')
    await expect(page).toHaveURL('/services')
  })

  test('navigate to contact page', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/contact"]')
    await expect(page).toHaveURL('/contact')
  })

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page.locator('text=Page Not Found')).toBeVisible()
  })
})

test.describe('SEO', () => {
  test('sitemap.xml is accessible', async ({ request }) => {
    const response = await request.get('/sitemap.xml')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('<urlset')
  })

  test('robots.txt is accessible', async ({ request }) => {
    const response = await request.get('/robots.txt')
    expect(response.status()).toBe(200)
    const body = await response.text()
    expect(body).toContain('User-agent')
    expect(body).toContain('Disallow: /admin/')
  })
})
