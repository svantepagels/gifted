import { defineConfig, devices } from '@playwright/test';

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
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
    {
      // Pixel 5 is chromium-based, so the project name accurately matches
      // the engine. Previously this used 'iPhone 12' which forced webkit
      // and broke runs in environments without the webkit browser binary.
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
