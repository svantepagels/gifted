/**
 * Tester-agent Playwright config: runs e2e/ux-fold-fix.spec.ts against the
 * deployed Vercel preview, no local dev server required.
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: /ux-(fold-fix|user-flow)\.spec\.ts/,
  fullyParallel: true,
  retries: 1,
  workers: 4,
  reporter: 'list',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
