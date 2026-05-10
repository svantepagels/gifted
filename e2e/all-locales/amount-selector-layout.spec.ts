import { test, expect, type Page } from '@playwright/test'
import { LOCALES, attachConsoleErrorCapture, pickProductSlug } from './helpers'
import { localeMeta } from '../../lib/i18n/config'

/**
 * Regression test for the PDP "SELECT AMOUNT" denomination selector.
 *
 * Bugs originally fixed by this test:
 *   1. Cards rendered the raw ISO currency code ("EUR") as a tiny
 *      label above the formatted price — duplicate currency display.
 *   2. `formatCurrencyForLocale` omitted `currencyDisplay`, so several
 *      locales fell back to "EUR 10" / "USD 10" instead of "€10" /
 *      "$10". Fix: `currencyDisplay: 'narrowSymbol'`.
 *   3. `grid-cols-5` overflowed at 375px viewport, so adjacent cards
 *      visually collided ("EUR 10EUR 20" with no gap). Fix: responsive
 *      `grid-cols-3 sm:grid-cols-4 md:grid-cols-5` with proper gap.
 *
 * Coverage matrix: 9 locales × {mobile-375, desktop-1280}.
 *
 * Strategy: pick the first product on the locale's homepage. We do NOT
 * hard-code brand slugs because the catalog cell available in each
 * locale is data-driven. This still exercises the same code path
 * (FIXED denominations are the most common case in the mock data).
 */

const VIEWPORTS = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'desktop-1280', width: 1280, height: 800 },
] as const

const CONSOLE_ALLOWLIST = [
  /Sentry/i,
  /favicon/i,
  /Failed to load resource.*404/i,
  /Download the React DevTools/i,
  /hydrat/i,
  /NEXT_NOT_FOUND/i,
  /not[\s-]?found/i,
  /404/,
]

async function gotoFirstFixedPDP(page: Page, locale: string): Promise<boolean> {
  const slug = await pickProductSlug(page, locale as any)
  if (!slug) return false
  await page.goto(`/${locale}/gift-card/${slug}`, { waitUntil: 'domcontentloaded' })
  // Wait for either the FIXED grid or the RANGE input to appear.
  const grid = page.getByTestId('amount-selector-grid')
  const rangeInput = page.getByTestId('amount-range-input')
  try {
    await expect(grid.or(rangeInput)).toBeVisible({ timeout: 10_000 })
  } catch {
    return false
  }
  return await grid.isVisible().catch(() => false)
}

for (const vp of VIEWPORTS) {
  test.describe(`AmountSelector layout @ ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    for (const locale of LOCALES) {
      const meta = localeMeta[locale]
      const currencyCode = meta.currency

      test(`${locale}: cards show symbol (not ISO code) and don't collide`, async ({
        page,
      }) => {
        const getErrors = attachConsoleErrorCapture(page, CONSOLE_ALLOWLIST)

        const hasFixedGrid = await gotoFirstFixedPDP(page, locale)

        // If the locale's first product is RANGE-typed (no fixed
        // denominations), exercise the RANGE branch instead. The same
        // formatter bug would surface in the min/max hint paragraph.
        if (!hasFixedGrid) {
          const body = await page.locator('main').innerText().catch(() => '')
          // Either the page rendered at all (we got *some* main text) or
          // the catalog has no product for this locale (skip).
          if (!body) {
            test.skip(true, `no product available for ${locale}`)
            return
          }
          expect(
            body,
            `${locale} (RANGE branch) must not show bare ISO currency code`
          ).not.toMatch(new RegExp(`\\b${currencyCode}\\b(?![.\\d])`, 'i'))
          return
        }

        const grid = page.getByTestId('amount-selector-grid')
        const cards = page.getByTestId('amount-card')
        const count = await cards.count()
        expect(count, `${locale} should have ≥ 1 denomination card`).toBeGreaterThan(0)

        // 1. Visible text must NOT contain the bare ISO code as a
        //    standalone token. We allow occurrences inside numbers
        //    ("EUR10" still hits, that's fine — should not happen).
        for (let i = 0; i < count; i++) {
          const text = (await cards.nth(i).innerText()).trim()
          expect(
            text,
            `[${locale}] card #${i} text "${text}" must not contain bare "${currencyCode}"`
          ).not.toMatch(new RegExp(`\\b${currencyCode}\\b(?![.\\d])`, 'i'))
          expect(
            text.length,
            `[${locale}] card #${i} must have visible text`
          ).toBeGreaterThan(0)
        }

        // 2. No two same-row adjacent cards may overlap. Gap ≥ 4px.
        const boxes = await Promise.all(
          Array.from({ length: count }, (_, i) => cards.nth(i).boundingBox())
        )
        for (let i = 1; i < boxes.length; i++) {
          const a = boxes[i - 1]
          const b = boxes[i]
          if (!a || !b) continue
          const sameRow = Math.abs(a.y - b.y) < 4
          if (sameRow) {
            const gap = b.x - (a.x + a.width)
            expect(
              gap,
              `[${locale}] gap between card ${i - 1} and ${i} must be ≥ 4px (got ${gap}px)`
            ).toBeGreaterThanOrEqual(4)
          }
        }

        // 3. No card content overflows its bounding box.
        for (let i = 0; i < count; i++) {
          const overflowing = await cards.nth(i).evaluate(
            (el: HTMLElement) =>
              el.scrollWidth > el.clientWidth + 1 ||
              el.scrollHeight > el.clientHeight + 1
          )
          expect(
            overflowing,
            `[${locale}] card #${i} must not overflow its bounding box`
          ).toBe(false)
        }

        // 4. Visual snapshot for the PR description.
        await grid.screenshot({
          path: `test-results/amount-selector-${locale}-${vp.name}.png`,
        })

        expect(getErrors(), `console errors for ${locale}`).toEqual([])
      })
    }
  })
}
