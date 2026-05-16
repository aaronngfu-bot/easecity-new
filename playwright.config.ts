import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    env: {
      RESEND_API_KEY: '',
      UPSTASH_REDIS_REST_URL: '',
      UPSTASH_REDIS_REST_TOKEN: '',
      // Deterministic Ed25519 key so JWKS responds in CI/playwright (do not use in production).
      LICENSE_JWT_PRIVATE_KEY_PEM: `-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIOGkq094zzBH3vxT+MXaCATnt1TwWhTEFhhHC85YYJYr
-----END PRIVATE KEY-----
`,
      LICENSE_JWT_KEY_ID: '2026a',
    },
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
