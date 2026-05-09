import { test, expect, Page } from '@playwright/test'

/**
 * Product Detail Page E2E tests.
 *
 * Updated 2026-05-07 to match the current Reloadly-backed catalog and the
 * desktop UX rebuild (`ux/desktop-fold-fix`):
 *
 * - Product slugs follow `{brand}-{country}-{productId}` (e.g.
 *   `amazon-us-1234`); we discover the first slug on the homepage at
 *   runtime so tests don't break when the catalog rotates.
 * - PDP uses TWO patterns depending on `denominationType`:
 *     RANGE → "ENTER AMOUNT" (numeric input)
 *     FIXED → "SELECT AMOUNT" (denomination button grid)
 *   Tests handle both.
 * - Delivery method toggle: "DELIVERY METHOD" label, "For me" / "Send as
 *   gift" buttons.
 * - CTA copy: "Continue to Checkout" (was "Continue as Guest").
 * - There are TWO Continue buttons in the DOM (mobile + desktop sticky);
 *   we target the visible one with `:visible`.
 *
 * Updated 2026-05-09 for i18n routing:
 * - `/` now 308-redirects to `/<locale>/`. Wait for the redirect to settle
 *   on a locale-prefixed URL before reading the first product link,
 *   otherwise dev-server lazy-compile of the `[locale]` segment under
 *   parallel-worker contention can race the assertion.
 */

async function gotoLocalizedHome(page: Page) {
  await page.goto('/')
  await page.waitForURL(/\/[a-z]{2}-[A-Z]{2}(\/?$|\/?\?)/, { timeout: 30_000 })
}

async function goToFirstProduct(page: Page): Promise<string> {
  await gotoLocalizedHome(page)
  const firstLink = page.locator('a[href*="/gift-card/"]').first()
  await expect(firstLink).toBeVisible({ timeout: 15_000 })
  const href = await firstLink.getAttribute('href')
  // Locale-aware: hrefs are now /<locale>/gift-card/<slug>.
  expect(href).toMatch(/^\/[a-z]{2}-[A-Z]{2}\/gift-card\/[a-z0-9-]+$/)
  await firstLink.click()
  await page.waitForURL(
    new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    { timeout: 30_000 }
  )
  return href!
}

async function pickAmount(page: Page) {
  // Either pattern: RANGE input ("ENTER AMOUNT") or FIXED grid ("SELECT AMOUNT").
  const enterAmount = page.getByText(/ENTER AMOUNT/i).first()
  const selectAmount = page.getByText(/SELECT AMOUNT/i).first()

  if (await enterAmount.isVisible().catch(() => false)) {
    // Range product: type a number that is guaranteed to fit (the helper
    // text shows "Between $X and $Y"; placeholder is "e.g. <min>").
    const numericInput = page.locator('input[type="number"]').first()
    const placeholder = (await numericInput.getAttribute('placeholder')) || ''
    const minMatch = placeholder.match(/(\d+(?:\.\d+)?)/)
    const min = minMatch ? Number(minMatch[1]) : 10
    await numericInput.fill(String(min))
  } else if (await selectAmount.isVisible().catch(() => false)) {
    // Fixed product: click the first denomination button in the grid.
    const grid = selectAmount.locator('xpath=following-sibling::*[1]')
    const firstDenomButton = grid.getByRole('button').first()
    await firstDenomButton.click()
  } else {
    throw new Error('PDP did not render any amount selector (neither RANGE nor FIXED).')
  }
}

test.describe('Product Detail Page', () => {
  test('should display product name, amount selector, delivery toggle and CTA', async ({ page }) => {
    await goToFirstProduct(page)

    // Either the RANGE label or the FIXED label must be visible.
    const hasEnter = await page.getByText(/ENTER AMOUNT/i).first().isVisible().catch(() => false)
    const hasSelect = await page.getByText(/SELECT AMOUNT/i).first().isVisible().catch(() => false)
    expect(hasEnter || hasSelect).toBe(true)

    // Delivery method toggle is always present.
    await expect(page.getByText(/DELIVERY METHOD/i).first()).toBeVisible()
    await expect(page.getByRole('button', { name: /^For me$/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Send as gift$/i })).toBeVisible()

    // Continue CTA exists in DOM (one for mobile, one for desktop).
    const ctas = page.getByRole('button', { name: /Continue to Checkout/i })
    expect(await ctas.count()).toBeGreaterThan(0)
  })

  test('should show gift form when "Send as gift" is selected', async ({ page }) => {
    await goToFirstProduct(page)

    // Initially the GIFT RECIPIENT label should not be present
    await expect(page.getByText(/GIFT RECIPIENT/i)).toHaveCount(0)

    // Click the visible "Send as gift" toggle button
    await page.getByRole('button', { name: /^Send as gift$/i }).click()

    // Gift form should now be visible — the recipient label and the
    // recipient-email input (placeholder "friend@example.com") render together
    await expect(page.getByText(/GIFT RECIPIENT/i)).toBeVisible({ timeout: 5_000 })
    await expect(page.getByPlaceholder(/friend@example\.com/i)).toBeVisible()
  })

  test('should enable Continue button after entering/selecting an amount', async ({ page }) => {
    await goToFirstProduct(page)

    // Visible CTA only — both desktop and mobile share the same disabled state.
    const visibleCta = page
      .getByRole('button', { name: /Continue to Checkout/i })
      .locator('visible=true')
      .first()
    await expect(visibleCta).toBeVisible()
    await expect(visibleCta).toBeDisabled()

    await pickAmount(page)

    await expect(visibleCta).toBeEnabled({ timeout: 5_000 })
  })
})
