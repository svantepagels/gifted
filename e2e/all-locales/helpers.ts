import { Page } from '@playwright/test'
import { locales, localeMeta, type Locale } from '../../lib/i18n/config'

export const LOCALES: readonly Locale[] = locales
export const NON_EN_LOCALES: readonly Locale[] = locales.filter(
  (l) => !l.startsWith('en-')
)

export function isRtl(loc: Locale): boolean {
  return localeMeta[loc].direction === 'rtl'
}

/**
 * Attach console / pageerror listeners. Returns a getter that yields
 * the captured errors at any point. Use in `beforeEach`:
 *
 *   const getErrors = attachConsoleErrorCapture(page)
 *   ...
 *   expect(getErrors()).toEqual([])
 */
export function attachConsoleErrorCapture(
  page: Page,
  allowlist: RegExp[] = []
): () => string[] {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    const text = m.text()
    if (allowlist.some((re) => re.test(text))) return
    errors.push(text)
  })
  page.on('pageerror', (e) => {
    if (allowlist.some((re) => re.test(e.message))) return
    errors.push(`pageerror: ${e.message}`)
  })
  return () => errors
}

/**
 * Pick the first product card href on the home page and return its
 * brand slug (the segment after `/gift-card/`). Returns null when no
 * card is on the page.
 */
export async function pickProductSlug(
  page: Page,
  locale: Locale
): Promise<string | null> {
  await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
  const href = await page
    .locator('a[href*="/gift-card/"]')
    .first()
    .getAttribute('href')
    .catch(() => null)
  if (!href) return null
  const m = href.match(/\/gift-card\/([^/?#]+)/)
  return m?.[1] ?? null
}

/**
 * Pick a viable brand slug for a brand-landing-page test by looking
 * for a `/buy/<slug>` link in the locale's home page or relying on
 * the well-known global fallback `crypto-voucher`.
 */
export async function pickBrandSlug(
  page: Page,
  locale: Locale
): Promise<string> {
  await page.goto(`/${locale}/`, { waitUntil: 'domcontentloaded' })
  const href = await page
    .locator(`a[href*="/${locale}/buy/"]`)
    .first()
    .getAttribute('href')
    .catch(() => null)
  if (href) {
    const m = href.match(/\/buy\/([^/?#]+)/)
    if (m?.[1]) return m[1]
  }
  // Global fallback — `crypto-voucher` is wired into viable-cells.ts
  // as a `GLOBAL_FALLBACK_SLUGS` brand and is expected to render in
  // every locale.
  return 'crypto-voucher'
}
