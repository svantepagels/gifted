import { defineConfig, devices } from '@playwright/test'

/**
 * Production-targeting Playwright config.
 *
 * Runs against the live deployed URL (no local dev server). Used by the
 * CODER agent to verify rewritten E2E tests work end-to-end on real
 * production data.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['browse.spec.ts', 'product-detail.spec.ts', 'checkout-flow.spec.ts'],
  fullyParallel: true,
  retries: 1,
  workers: 4,
  reporter: 'list',
  use: {
    baseURL: process.env.PROD_URL || 'https://gifted-project-blue.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
})
