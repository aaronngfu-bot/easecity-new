import { test, expect } from '@playwright/test'

test.describe('Contact Form', () => {
  test('form renders all fields', async ({ page }) => {
    await page.goto('/contact')

    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#company')).toBeVisible()
    await expect(page.locator('#subject')).toBeVisible()
    await expect(page.locator('#message')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('form validates required fields', async ({ page }) => {
    await page.goto('/contact')

    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // HTML5 validation should prevent submission
    const nameInput = page.locator('#name')
    const validationMessage = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    )
    expect(validationMessage).toBeTruthy()
  })

  test('form submits successfully', async ({ page }) => {
    await page.goto('/contact')

    await page.fill('#name', 'Test User')
    await page.fill('#email', 'test@example.com')
    await page.fill('#company', 'Test Corp')
    await page.fill('#message', 'This is a test message for the contact form.')

    await page.click('button[type="submit"]')

    // Wait for success state
    await expect(page.locator('text=success').first()).toBeVisible({
      timeout: 10000,
    })
  })
})
