import { test, expect } from '@playwright/test'

/**
 * Regression test for the expanded country selector.
 *
 * Asserts:
 *   1. The selector exposes more than 20 countries (proving we are no
 *      longer rendering the legacy 10-entry hardcoded list).
 *   2. At least three launch-locale countries (FI, IE, AU) are present.
 *   3. The list is sorted alphabetically by visible country name.
 *
 * The list is generated at build time from the live Reloadly catalog;
 * a sandbox build with a small catalog can still fail (1) — when that
 * happens, run `npm run build` against `RELOADLY_ENVIRONMENT=production`
 * (or rerun locally with the production credentials in `.env.local`)
 * before merging. The PR body should record the actual catalog size.
 */

const REQUIRED_LAUNCH_LOCALE_COUNTRIES = ['FI', 'IE', 'AU'] as const
const MIN_COUNTRY_COUNT = 20

test.describe('Country selector — expanded list', () => {
  test('shows more than 20 countries including launch-locale countries', async ({
    page,
  }) => {
    // Header (and therefore <CountrySelector>) is mounted on every page.
    // Use a launch-locale URL to avoid the i18n middleware redirect.
    await page.goto('/en-IE')

    const trigger = page.getByTestId('country-selector-trigger')
    await expect(trigger).toBeVisible()
    await trigger.click()

    const dropdown = page.getByTestId('country-selector-dropdown')
    await expect(dropdown).toBeVisible()

    const items = page
      .getByTestId('country-list')
      .locator('[data-country-code]')
    const count = await items.count()
    expect(
      count,
      `Expected more than ${MIN_COUNTRY_COUNT} countries in the selector, got ${count}. ` +
        `If running against the sandbox catalog this can be expected — verify with the production build.`
    ).toBeGreaterThan(MIN_COUNTRY_COUNT)

    for (const code of REQUIRED_LAUNCH_LOCALE_COUNTRIES) {
      const item = page.locator(`[data-country-code="${code}"]`)
      await expect(
        item,
        `Launch-locale country ${code} missing from selector`
      ).toBeVisible()
    }
  })

  test('countries are sorted alphabetically by name', async ({ page }) => {
    await page.goto('/en-IE')
    await page.getByTestId('country-selector-trigger').click()
    await expect(page.getByTestId('country-selector-dropdown')).toBeVisible()

    // First text-line in each row is the country name (text-body-md).
    const names = await page
      .getByTestId('country-list')
      .locator('[data-country-code] .text-body-md')
      .allTextContents()

    expect(names.length).toBeGreaterThan(0)

    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en'))
    expect(names).toEqual(sorted)
  })
})
