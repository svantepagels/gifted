import { test, expect } from '@playwright/test'

/**
 * Browse / Home page E2E tests.
 *
 * Updated 2026-05-07 to match the current Reloadly-backed catalog and the
 * desktop UX rebuild (`ux/desktop-fold-fix`):
 * - Hero copy is now "Buy Digital / Gift Cards / Instantly"
 * - Search input placeholder is "Search brands..."
 * - There are TWO search inputs in the DOM (mobile-only + desktop-sticky);
 *   tests target the visible one with `:visible`.
 * - Product slugs follow `{brand}-{country}-{productId}` (e.g.
 *   `amazon-us-1234`) — we read the first card's slug from the live page
 *   instead of hardcoding a slug that may rotate when the catalog changes.
 * - There are TWO category-chip rows in the DOM (mobile-stacked + desktop-
 *   sticky), so we use `.locator(...).filter({ visible: true })`.
 *
 * Updated 2026-05-09 for i18n routing:
 * - `/` now 308-redirects to `/en-IE/`. We wait for the locale-prefixed URL
 *   to settle before interacting, otherwise dev-server lazy-compile of the
 *   `[locale]` segment under parallel-worker contention pushes the
 *   subsequent `router.push` past the old 5s timeout.
 * - `waitForURL` timeouts bumped from 5s → 15s on actions that depend on a
 *   subsequent client-side `router.push`, matching the navigation timeout
 *   already used elsewhere in this file. Production build is fully
 *   prerendered, so this only affects dev-server runs.
 */

/**
 * Helper: navigate to `/` and wait for the i18n middleware to settle on a
 * locale-prefixed URL. Returns the resolved locale path prefix
 * (e.g. `/en-IE`) so callers can build subsequent assertions against it.
 */
async function gotoLocalizedHome(page: import('@playwright/test').Page): Promise<string> {
  await page.goto('/')
  // Wait for the 308 redirect from `/` to `/<locale>/` to land before any
  // interactions. Dev-server first-compile of the `[locale]` segment can
  // take 5–10s under parallel-worker contention.
  await page.waitForURL(/\/[a-z]{2}-[A-Z]{2}(\/?$|\/?\?)/, { timeout: 30_000 })
  const url = new URL(page.url())
  const match = url.pathname.match(/^\/([a-z]{2}-[A-Z]{2})/)
  return match ? `/${match[1]}` : ''
}

test.describe('Browse/Home Page', () => {
  test('should display hero, search, categories and a populated product grid', async ({ page }) => {
    await gotoLocalizedHome(page)

    // Hero — the wordmark is split across three spans, so we match a
    // distinctive substring instead of the entire phrase.
    await expect(page.getByRole('heading', { name: /Gift Cards/i }).first()).toBeVisible()

    // Search bar (visible instance only — mobile hidden sibling is hidden via CSS)
    const searchInput = page.getByPlaceholder(/Search brands/i).locator('visible=true')
    await expect(searchInput.first()).toBeVisible()

    // Category chips — "All" always exists; the visible one renders on the
    // active breakpoint.
    const allChips = page.getByRole('button', { name: /^All$/ })
    await expect(allChips.first()).toBeVisible()

    // At least one product card with a /gift-card/ link should be present.
    // Locale-aware: hrefs are now /<locale>/gift-card/<slug>, so match anywhere in the URL.
    const productLinks = page.locator('a[href*="/gift-card/"]')
    await expect(productLinks.first()).toBeVisible()
    expect(await productLinks.count()).toBeGreaterThan(0)
  })

  test('should filter products by search query', async ({ page }) => {
    await gotoLocalizedHome(page)

    const searchInput = page.getByPlaceholder(/Search brands/i).locator('visible=true').first()
    await expect(searchInput).toBeVisible({ timeout: 15_000 })
    await searchInput.click()
    await searchInput.fill('Amazon')

    // SearchBar pushes ?q=Amazon on every change — wait for it.
    // 15s timeout absorbs dev-server first-hit compile of the `[locale]`
    // segment under parallel-worker contention.
    await page.waitForURL(/[?&]q=Amazon/i, { timeout: 15_000 })

    // After filter, at least one Amazon card remains
    await expect(page.getByText(/amazon/i).first()).toBeVisible()
  })

  test('should filter products by category', async ({ page }) => {
    await gotoLocalizedHome(page)

    // Pick a non-"All" chip that exists in the rendered list, then click
    // the visible one (not the hidden mobile/desktop sibling).
    const visibleAll = page.getByRole('button', { name: /^All$/ }).locator('visible=true').first()
    await expect(visibleAll).toBeVisible({ timeout: 15_000 })

    // Get the parent chip row and click the second visible chip in it
    const visibleChipRow = visibleAll.locator('xpath=ancestor::*[contains(@class, "flex") and contains(@class, "gap-3")][1]')
    const visibleChips = visibleChipRow.getByRole('button')
    const chipCount = await visibleChips.count()
    expect(chipCount).toBeGreaterThan(1)

    // Click the second chip (first non-"All" category)
    const secondChip = visibleChips.nth(1)
    const chipText = (await secondChip.innerText()).trim()
    await secondChip.click()

    // URL should reflect the chosen category. 15s timeout absorbs
    // dev-server first-hit compile cost under parallel-worker contention.
    await page.waitForURL(new RegExp(`category=${encodeURIComponent(chipText)}`, 'i'), { timeout: 15_000 })
  })

  test('should navigate from a product card to its detail page', async ({ page }) => {
    await gotoLocalizedHome(page)

    // Read a real catalog slug from the rendered grid instead of guessing.
    const firstProductLink = page.locator('a[href*="/gift-card/"]').first()
    await expect(firstProductLink).toBeVisible()
    const href = await firstProductLink.getAttribute('href')
    // Locale-aware: hrefs now look like /<locale>/gift-card/<slug>.
    expect(href).toMatch(/^\/[a-z]{2}-[A-Z]{2}\/gift-card\/[a-z0-9-]+$/)

    await firstProductLink.click()
    // Wait for the navigation to finish — Next dev mode can be slow to
    // compile route segments on first hit.
    await page.waitForURL(
      new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      { timeout: 30_000 }
    )

    // PDP shows the amount-entry block ("ENTER AMOUNT") on every product
    // (custom-range and fixed-denomination products both render this label).
    await expect(page.getByText(/ENTER AMOUNT/i).first()).toBeVisible({
      timeout: 15_000,
    })
  })
})
