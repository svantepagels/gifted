import { test, expect } from '@playwright/test'
import { LOCALES, isRtl } from './helpers'
import { localeMeta } from '../../lib/i18n/config'

test.describe('header / footer / locale switcher', () => {
  for (const locale of LOCALES) {
    test(`${locale}: <html lang> and <html dir> are correct`, async ({ page }) => {
      const res = await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
      expect(res?.status()).toBe(200)
      const lang = await page.locator('html').getAttribute('lang')
      const dir = await page.locator('html').getAttribute('dir')
      expect(lang).toBe(locale)
      expect(dir).toBe(localeMeta[locale].direction)
    })

    test(`${locale}: header logo + locale switcher visible`, async ({ page }) => {
      await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
      const logo = page.locator('header img[alt="GIFTED"]').first()
      await expect(logo).toBeVisible()
      const switcher = page.locator('[aria-haspopup="listbox"]').first()
      await expect(switcher).toBeVisible()
    })

    test(`${locale}: footer logo visible`, async ({ page }) => {
      await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
      // Footer uses an Image with alt="Gifted" (note: header uses
      // alt="GIFTED" — they're different).
      const footerLogo = page.locator('footer img').first()
      await expect(footerLogo).toBeVisible()
    })
  }

  test('locale switcher actually switches', async ({ page }) => {
    await page.goto('/en-IE/', { waitUntil: 'domcontentloaded' })
    // Wait for hydration so the switcher's onClick handler is attached.
    await page.waitForLoadState('networkidle')
    const switcher = page
      .locator('button[aria-haspopup="listbox"][aria-label^="Language"]')
      .first()
    await switcher.waitFor({ state: 'visible' })
    await switcher.click()
    // The dropdown is a <ul role="listbox"> with <button role="option">.
    // Each option starts with the locale code (e.g. "fi-FI"). Match on
    // role + accessible text containing the code.
    const option = page
      .getByRole('option')
      .filter({ hasText: 'fi-FI' })
      .first()
    await option.waitFor({ state: 'visible', timeout: 5000 })
    await option.click()
    await page.waitForURL(/\/fi-FI(\/|$)/, { timeout: 10000 })
    expect(page.url()).toMatch(/\/fi-FI(\/|$)/)
  })
})

test.describe('RTL layout', () => {
  for (const locale of ['ar-AE', 'ar-SA'] as const) {
    test(`${locale}: html dir=rtl and computed direction is rtl`, async ({ page }) => {
      await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
      const dir = await page.locator('html').getAttribute('dir')
      expect(dir).toBe('rtl')
      const computed = await page.evaluate(
        () => getComputedStyle(document.documentElement).direction
      )
      expect(computed).toBe('rtl')
    })
  }
})

test.describe('mobile horizontal overflow guard', () => {
  test.use({ viewport: { width: 375, height: 812 } })
  for (const locale of LOCALES) {
    test(`${locale}: home page has no horizontal scroll at 375px`, async ({ page }) => {
      await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        return doc.scrollWidth - doc.clientWidth
      })
      // Allow 1px rounding.
      expect(overflow, `${locale} home page horizontal overflow`).toBeLessThanOrEqual(1)
    })
  }
})
