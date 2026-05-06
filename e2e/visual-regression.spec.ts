import { test, expect, Page } from '@playwright/test'

/**
 * Visual regression tests.
 *
 * Updated 2026-05-07. Hardcoded slugs (`/gift-card/amazon`, `/gift-card/
 * starbucks`) no longer match the Reloadly catalog format
 * `{brand}-{country}-{productId}`. Snapshots also predate the desktop UX
 * rebuild. We discover a real product slug at runtime and only re-baseline
 * snapshots manually with `--update-snapshots`.
 */

async function findFirstProductSlug(page: Page): Promise<string> {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const firstLink = page.locator('a[href^="/gift-card/"]').first()
  await expect(firstLink).toBeVisible()
  const href = await firstLink.getAttribute('href')
  expect(href).toMatch(/^\/gift-card\/[a-z0-9-]+$/)
  return href!
}

test.describe('Visual Regression Tests', () => {
  test('home page matches design', async ({ page, viewport }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Scroll through the full page to hydrate any lazy elements, then back
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)

    const screenshotName =
      viewport && viewport.width && viewport.width > 768 ? 'desktop-home.png' : 'mobile-home.png'

    await expect(page).toHaveScreenshot(screenshotName, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('product detail page matches design', async ({ page, viewport }) => {
    const slug = await findFirstProductSlug(page)
    await page.goto(slug)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    const screenshotName =
      viewport && viewport.width && viewport.width > 768
        ? 'desktop-product-detail.png'
        : 'mobile-product-detail.png'

    await expect(page).toHaveScreenshot(screenshotName, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  test('product detail with amount entered', async ({ page, viewport }) => {
    if (!viewport || !viewport.width || viewport.width <= 768) {
      test.skip()
    }

    const slug = await findFirstProductSlug(page)
    await page.goto(slug)
    await page.waitForLoadState('networkidle')

    // Either RANGE input or FIXED grid: pick the first valid amount.
    const enterAmount = page.getByText(/ENTER AMOUNT/i).first()
    if (await enterAmount.isVisible().catch(() => false)) {
      const numericInput = page.locator('input[type="number"]').first()
      const placeholder = (await numericInput.getAttribute('placeholder')) || ''
      const min = Number(placeholder.match(/(\d+(?:\.\d+)?)/)?.[1] || '25')
      await numericInput.fill(String(min))
    } else {
      await page.locator('button').filter({ hasText: /^\$?\d/ }).first().click()
    }
    await page.waitForTimeout(300)

    await expect(page).toHaveScreenshot('desktop-product-detail-selected.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })

  // NOTE: A full checkout-page snapshot test was removed in 2026-05-07
  // because reaching /checkout requires hitting the live Reloadly +
  // orders backend, which makes a screenshot test flaky and slow.
  // Use `e2e/checkout-flow.spec.ts` (smoke) for that path.
})
