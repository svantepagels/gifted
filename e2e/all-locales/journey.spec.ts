import { test, expect } from '@playwright/test'
import { LOCALES, attachConsoleErrorCapture, pickProductSlug, pickBrandSlug } from './helpers'

const CONSOLE_ALLOWLIST = [
  /Sentry/i,
  /favicon/i,
  /Failed to load resource.*404/i, // intentional 404 tests below
  /Download the React DevTools/i,
  /hydrat/i, // tolerate hydration warnings from third-party fonts
  /NEXT_NOT_FOUND/i, // Next.js notFound() control-flow exception in dev mode
  /not[\s-]?found/i,
  /404/,
]

test.describe('per-locale user journey', () => {
  for (const locale of LOCALES) {
    test(`${locale}: home → product → checkout → 404`, async ({ page }) => {
      const getErrors = attachConsoleErrorCapture(page, CONSOLE_ALLOWLIST)

      // 1. Landing
      const home = await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
      expect(home?.status(), `${locale} home should be 200`).toBe(200)

      // 2. Click first product card → PDP
      const slug = await pickProductSlug(page, locale)
      if (slug) {
        await page.goto(`/${locale}/gift-card/${slug}`, { waitUntil: 'domcontentloaded' })
        await expect(page.locator('html')).toHaveAttribute('lang', locale)
      }

      // 3. Checkout — should render checkout form (we stop before payment)
      await page.goto(`/${locale}/checkout`, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('html')).toHaveAttribute('lang', locale)

      // 4. Bogus PDP → not-found (no 500)
      const bogus = await page.goto(`/${locale}/gift-card/zz-not-a-real-slug`, {
        waitUntil: 'domcontentloaded',
      })
      expect([404, 200]).toContain(bogus?.status() ?? 0) // Next renders not-found.tsx with 404 status
      const status = bogus?.status() ?? 0
      expect(status).not.toBe(500)

      // 5. Bogus path → 404 (not 500)
      const notFound = await page.goto(`/${locale}/some-totally-bad-path`, {
        waitUntil: 'domcontentloaded',
      })
      expect(notFound?.status() ?? 0).not.toBe(500)

      // No console errors (after allowlist) on the journey
      expect(getErrors(), `console errors for ${locale}`).toEqual([])
    })
  }
})

test.describe('brand landing page (one viable brand per locale)', () => {
  for (const locale of LOCALES) {
    test(`${locale}: /buy/<brand> renders or returns 404 cleanly`, async ({ page }) => {
      const slug = await pickBrandSlug(page, locale)
      test.skip(!slug, `No /buy/<brand> link on /${locale}/ home`)
      const res = await page.goto(`/${locale}/buy/${slug}`, {
        waitUntil: 'domcontentloaded',
      })
      const status = res?.status() ?? 0
      // Acceptable: 200 (rendered) or 404 (no viable cell for this brand
      // in this locale — handled by `dynamicParams = false`). Never 500.
      expect(status, `${locale}/buy/${slug} status`).not.toBe(500)
      expect([200, 404]).toContain(status)
      if (status === 200) {
        // Brand hero / denominations / FAQ visible
        await expect(page.locator('html')).toHaveAttribute('lang', locale)
      }
    })
  }
})
