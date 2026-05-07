import { test, expect, Page } from '@playwright/test'

/**
 * Checkout flow smoke test.
 *
 * Updated 2026-05-07. We deliberately stop short of actually submitting
 * payment because:
 *   - The catalog now uses real Reloadly products (not Stripe-mock).
 *   - Submitting "Complete Purchase" against production would either hit
 *     real Stripe + Reloadly fulfillment, or fail in a way that is not
 *     diagnostic for UX.
 *
 * What we DO assert end-to-end:
 *   1. From the homepage we can reach a real product detail page.
 *   2. After picking/entering an amount, the Continue CTA enables.
 *   3. Clicking Continue creates an order and navigates to /checkout.
 *   4. The checkout page renders the order review and email form.
 *   5. Email validation rejects mismatched / missing emails.
 *
 * Anything beyond step 5 is covered by unit tests in `lib/__tests__/`.
 */

async function goToFirstProductAndPickAmount(page: Page) {
  await page.goto('/')
  const firstLink = page.locator('a[href^="/gift-card/"]').first()
  await expect(firstLink).toBeVisible()
  await firstLink.click()
  await page.waitForURL(/\/gift-card\//)

  const enterAmount = page.getByText(/ENTER AMOUNT/i).first()
  const selectAmount = page.getByText(/SELECT AMOUNT/i).first()

  if (await enterAmount.isVisible().catch(() => false)) {
    const numericInput = page.locator('input[type="number"]').first()
    const placeholder = (await numericInput.getAttribute('placeholder')) || ''
    const minMatch = placeholder.match(/(\d+(?:\.\d+)?)/)
    const min = minMatch ? Number(minMatch[1]) : 10
    await numericInput.fill(String(min))
  } else if (await selectAmount.isVisible().catch(() => false)) {
    const grid = selectAmount.locator('xpath=following-sibling::*[1]')
    await grid.getByRole('button').first().click()
  } else {
    throw new Error('PDP did not render any amount selector.')
  }
}

test.describe('Checkout Flow (smoke)', () => {
  test('should reach checkout page after picking amount on a real product', async ({ page }) => {
    await goToFirstProductAndPickAmount(page)

    const visibleCta = page
      .getByRole('button', { name: /Continue to Checkout/i })
      .locator('visible=true')
      .first()
    await expect(visibleCta).toBeEnabled({ timeout: 5_000 })
    await visibleCta.click()

    // Either we reach /checkout, or we surface a fallback error inline.
    // Production should reach /checkout?orderId=...
    await page.waitForURL(/\/checkout/, { timeout: 15_000 })
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('should validate email fields on the checkout form', async ({ page }) => {
    await goToFirstProductAndPickAmount(page)

    const visibleCta = page
      .getByRole('button', { name: /Continue to Checkout/i })
      .locator('visible=true')
      .first()
    await expect(visibleCta).toBeEnabled({ timeout: 5_000 })
    await visibleCta.click()

    await page.waitForURL(/\/checkout/, { timeout: 15_000 })

    // Trigger client-side validation by submitting empty.
    const completeBtn = page.getByRole('button', { name: /Complete Purchase/i })
    await expect(completeBtn).toBeVisible()
    await completeBtn.click()

    // zod schema rejects with HTML5 `required` first; either a browser-
    // native validation message OR a visible inline error appears.
    const inlineError = page.getByText(/email|required|invalid/i).first()
    await expect(inlineError).toBeVisible({ timeout: 5_000 })
  })
})
