import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=Welcome back')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('register page renders', async ({ page }) => {
    await page.goto('/register')
    await expect(page.locator('text=Create an account')).toBeVisible()
    await expect(page.locator('#name')).toBeVisible()
    await expect(page.locator('#email')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
  })

  test('can navigate between login and register', async ({ page }) => {
    await page.goto('/login')
    await page.click('a[href="/register"]')
    await expect(page).toHaveURL('/register')

    await page.click('a[href="/login"]')
    await expect(page).toHaveURL('/login')
  })

  test('dashboard redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('admin redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login/)
  })
})
