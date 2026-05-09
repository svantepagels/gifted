import { test, expect } from '@playwright/test'

/**
 * E2E coverage for i18n routing — directly maps to the brief's
 * acceptance criteria.
 *
 * Run only:
 *   npm run test:e2e -- e2e/i18n.spec.ts
 */

const locales = [
  'fi-FI',
  'en-IE',
  'en-AU',
  'ar-AE',
  'ar-SA',
  'pl-PL',
  'el-GR',
  'en-MT',
  'en-NZ',
] as const

test.describe('i18n routing', () => {
  test('root path 308-redirects to a supported locale', async ({ request }) => {
    const res = await request.get('/', { maxRedirects: 0 })
    // Browsers commonly accept 301/302/307/308 — middleware uses 308.
    expect([301, 302, 307, 308]).toContain(res.status())
    const location = res.headers()['location']
    expect(location).toBeDefined()
    expect(location).toMatch(
      /\/(fi-FI|en-IE|en-AU|ar-AE|ar-SA|pl-PL|el-GR|en-MT|en-NZ)\/?$/
    )
  })

  test('root path with no Accept-Language still negotiates a locale (regression: Negotiator returns ["*"])', async ({
    request,
  }) => {
    const res = await request.get('/', {
      maxRedirects: 0,
      headers: { 'accept-language': '' },
    })
    expect([301, 302, 307, 308]).toContain(res.status())
    const location = res.headers()['location']
    // Falls back to defaultLocale (en-IE) when no language can be matched.
    expect(location).toMatch(/\/en-IE\/?$/)
  })

  for (const loc of locales) {
    test(`${loc} renders with correct <html lang> and <html dir>`, async ({
      page,
    }) => {
      await page.goto(`/${loc}/`)
      await expect(page.locator('html')).toHaveAttribute('lang', loc)
      const expectedDir = loc.startsWith('ar-') ? 'rtl' : 'ltr'
      await expect(page.locator('html')).toHaveAttribute('dir', expectedDir)
    })
  }

  test('fi-FI homepage shows hand-translated Finnish hero copy', async ({ page }) => {
    await page.goto('/fi-FI/')
    // "Lahjakortteja" appears in the hero headline and in the placeholder
    // copy — at least one occurrence must be visible.
    await expect(page.getByText(/Lahjakortteja/i).first()).toBeVisible()
    // Finnish search placeholder should also be rendered. Two SearchBars
    // exist in the DOM (mobile-only + desktop-sticky); target the visible one.
    await expect(
      page.getByPlaceholder(/Hae brändejä/i).locator('visible=true').first()
    ).toBeVisible()
  })

  test('locale switcher in header changes URL prefix', async ({ page }) => {
    await page.goto('/en-IE/')
    // The locale switcher trigger has aria-haspopup="listbox"; the country
    // selector trigger does NOT, so this disambiguates.
    const switcher = page.locator('[aria-haspopup="listbox"]').first()
    await expect(switcher).toBeVisible()
    await switcher.click()
    // Click the Finnish option by its language label.
    await page.getByRole('option', { name: /fi-FI|Suomi/i }).first().click()
    await page.waitForURL(/\/fi-FI(\/|$)/)
    expect(page.url()).toMatch(/\/fi-FI\b/)
  })

  test('unknown locale 404s cleanly', async ({ page }) => {
    const res = await page.goto('/zz-ZZ/', { waitUntil: 'commit' })
    expect(res?.status()).toBe(404)
  })

  test('product detail page works under a non-default locale', async ({ page }) => {
    // 1. Visit en-IE homepage and read a real product slug from the grid.
    await page.goto('/en-IE/')
    const firstCard = page.locator('a[href*="/gift-card/"]').first()
    await expect(firstCard).toBeVisible()
    const href = await firstCard.getAttribute('href')
    expect(href).toBeTruthy()
    // href is now locale-prefixed, e.g. /en-IE/gift-card/foo-us-1234
    const match = href!.match(/\/gift-card\/([^/?#]+)/)
    expect(match).not.toBeNull()
    const slug = match![1]

    // 2. Visit the same product under fi-FI and assert it renders.
    await page.goto(`/fi-FI/gift-card/${slug}`)
    await expect(page).toHaveURL(new RegExp(`/fi-FI/gift-card/${slug}`))
    await expect(page.locator('html')).toHaveAttribute('lang', 'fi-FI')
  })
})
