import { test, expect } from '@playwright/test'

const BASE = process.env.TC_BASE ?? 'http://localhost:3137'

test.describe('Terms & Conditions page', () => {
  test('renders T&C page with correct title, 19 sections, and legal facts', async ({ page }) => {
    await page.goto(`${BASE}/en-IE/terms-conditions`, { waitUntil: 'networkidle' })

    await expect(page).toHaveTitle(/Terms & Conditions \| Gifted/)

    // H1
    await expect(page.locator('main h1')).toHaveText('Terms & Conditions')

    // 19 numbered section headings
    const h2s = page.locator('main article h2')
    await expect(h2s).toHaveCount(19)
    await expect(h2s.first()).toHaveText('1. Introduction')
    await expect(h2s.last()).toHaveText('19. Customer Care & Contact Information')

    // Legal facts present in visible body
    const body = page.locator('main')
    await expect(body).toContainText('Gifted Tech, LLC')
    await expect(body).toContainText('State of Delaware')
    await expect(body).toContainText('36-5179655')
    await expect(body).toContainText('1111B S Governors Ave, Suite 91924, Dover, DE 19904')

    // No Ding-specific terms in the visible article text (word-boundary match;
    // plain substring would false-positive on "inclu(ding)", "provi(ding)", etc.)
    const articleText = await page.locator('main article').innerText()
    for (const term of ['ding', 'ezetop', 'top-up', 'topup', 'voucher', 'airtime', 'nauta', 'dublin', 'ireland']) {
      const re = new RegExp(`\\b${term.replace(/-/g, '\\-?')}\\b`, 'i')
      const m = articleText.match(re)
      expect(m === null, `article should not contain "${term}" (matched: ${m?.[0] ?? 'n/a'})`).toBe(true)
    }

    // Inner cross-links to privacy & cookie policy
    await expect(page.locator('main article a[href="/en-IE/privacy"]')).toBeVisible()
    await expect(page.locator('main article a[href="/en-IE/cookie-policy"]')).toBeVisible()

    await page.screenshot({ path: 'test-results/tc-top.png', fullPage: false })
    await page.screenshot({ path: 'test-results/tc-full.png', fullPage: true })
  })

  test('footer link navigates to T&C from the home page (site-wide link)', async ({ page }) => {
    await page.goto(`${BASE}/en-IE`, { waitUntil: 'networkidle' })

    const footerLink = page.locator('footer a[href="/en-IE/terms-conditions"]')
    await expect(footerLink).toBeVisible()
    await expect(footerLink).toHaveText('Terms & Conditions')

    await footerLink.click()
    await page.waitForURL('**/en-IE/terms-conditions')
    await expect(page.locator('main h1')).toHaveText('Terms & Conditions')
  })

  test('footer link present and label localized on Arabic locale', async ({ page }) => {
    await page.goto(`${BASE}/ar-AE`, { waitUntil: 'networkidle' })
    const footerLink = page.locator('footer a[href="/ar-AE/terms-conditions"]')
    await expect(footerLink).toBeVisible()
    // Arabic label, link still points to the correct route
    await expect(footerLink).toHaveText('الشروط والأحكام')
  })

  test('old /terms route is a 404 (dead link removed)', async ({ page }) => {
    const resp = await page.goto(`${BASE}/en-IE/terms`, { waitUntil: 'domcontentloaded' })
    expect(resp?.status()).toBe(404)
  })

  test('bare /terms-conditions redirects to a locale-prefixed URL', async ({ page }) => {
    await page.goto(`${BASE}/terms-conditions`, { waitUntil: 'domcontentloaded' })
    expect(page.url()).toMatch(/\/[a-z]{2}-[A-Z]{2}\/terms-conditions$/)
    await expect(page.locator('main h1')).toHaveText('Terms & Conditions')
  })
})
