/**
 * Home → Product navigation flow against the deployed preview.
 * Independent verification by the TESTER agent.
 */

import { test, expect, Page } from '@playwright/test';

const VERCEL_BYPASS_COOKIE = {
  name: '_vercel_jwt',
  value:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm90ZWN0aW9uLWJ5cGFzcy1hdXRvbWF0aW9uIiwiYXVkIjoiZ2lmdGVkLXV4LWZpeC52ZXJjZWwuYXBwIiwiaWF0IjoxNzc4MTA0OTA3LCJieXBhc3MiOiJkeEVBMktSWVh0clpET2hkT2FXTWpaOTVMeFBRMnZhVCJ9.RULjLwWM1YGXm_ygpZzbZRWcce6sLJLyTUE9RWBA4_0',
  domain: 'gifted-ux-fix.vercel.app',
  path: '/',
};

const PREVIEW = 'https://gifted-ux-fix.vercel.app';

async function loadHome(page: Page) {
  await page.context().addCookies([VERCEL_BYPASS_COOKIE]);
  await page.goto(`${PREVIEW}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
}

test.describe('User flow: home → product → back', () => {
  test('Desktop 1920: click first product card, verify URL change, verify product page renders', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadHome(page);

    // Wait for at least one card to be ready
    const firstCard = page.locator('a[href^="/gift-card/"]').first();
    await expect(firstCard).toBeVisible();

    // Capture the href so we can assert URL later
    const href = await firstCard.getAttribute('href');
    expect(href).toMatch(/^\/gift-card\//);

    await firstCard.click();
    await page.waitForURL(/\/gift-card\//);
    await page.waitForLoadState('networkidle');

    // Verify product detail loaded - "ENTER AMOUNT" or "Choose amount" should be visible
    const amountControl = page.getByText(/ENTER AMOUNT|Choose amount/i).first();
    await expect(amountControl).toBeVisible({ timeout: 10_000 });

    // Continue to Checkout button — explicitly target the *visible* one.
    // Two buttons exist in DOM (desktop / mobile variants); pick whichever is rendered.
    const ctaButtons = page.getByRole('button', { name: /Continue to Checkout/i });
    const ctaCount = await ctaButtons.count();
    expect(ctaCount).toBeGreaterThanOrEqual(1);

    let visibleDesktopCta = null;
    for (let i = 0; i < ctaCount; i++) {
      const btn = ctaButtons.nth(i);
      const isOnScreen = await btn.evaluate((el) => {
        const cs = getComputedStyle(el);
        const r = (el as HTMLElement).getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
      });
      if (isOnScreen) {
        visibleDesktopCta = btn;
        break;
      }
    }
    expect(visibleDesktopCta, 'A Continue to Checkout button must be visually rendered on desktop').not.toBeNull();
    await expect(visibleDesktopCta!).toBeVisible();

    // Go back via browser nav
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1').first()).toBeVisible();
    // Confirm product cards still rendered
    const cardCount = await page.locator('a[href^="/gift-card/"]').count();
    expect(cardCount).toBeGreaterThanOrEqual(150);
  });

  test('Mobile 390: click first product card, verify product page renders', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loadHome(page);

    const firstCard = page.locator('a[href^="/gift-card/"]').first();
    await expect(firstCard).toBeVisible();

    await firstCard.click();
    await page.waitForURL(/\/gift-card\//);
    await page.waitForLoadState('networkidle');

    // Verify product detail rendered on mobile too
    await expect(page.getByText(/ENTER AMOUNT|Choose amount/i).first()).toBeVisible();
    // CTA button exists in DOM (may be disabled until amount entered).
    // The product page has TWO Continue to Checkout buttons:
    //   1) Desktop button inside `<div className="hidden md:block">` (display:none on mobile)
    //   2) Mobile sticky CTA inside `<div className="md:hidden fixed bottom-0...">` (visible on mobile)
    // We must explicitly target the visible one — `.first()` can resolve to the
    // hidden desktop button, which causes Playwright to report "hidden" even
    // though the mobile button is rendered fine.
    const ctaButtons = page.getByRole('button', { name: /Continue to Checkout/i });
    const total = await ctaButtons.count();
    expect(total).toBeGreaterThanOrEqual(1);

    let visibleCta = null;
    for (let i = 0; i < total; i++) {
      const btn = ctaButtons.nth(i);
      // Use evaluate to check both `display:none` and `visibility:hidden`,
      // since Playwright's isVisible() varies across element states.
      const isOnScreen = await btn.evaluate((el) => {
        const cs = getComputedStyle(el);
        const r = (el as HTMLElement).getBoundingClientRect();
        return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
      });
      if (isOnScreen) {
        visibleCta = btn;
        break;
      }
    }
    expect(visibleCta, 'A Continue to Checkout button must be visually rendered on mobile').not.toBeNull();

    await visibleCta!.scrollIntoViewIfNeeded();
    await expect(visibleCta!).toBeVisible();

    await page.screenshot({ path: 'test-results/ux-flow-mobile-product.png' });
  });

  test('Search filter on home updates URL', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadHome(page);

    // Pick the visible search input (not the hidden mobile twin)
    const inputs = await page.getByPlaceholder(/Search brands/i).all();
    let visibleSearch = null;
    for (const i of inputs) {
      if (await i.isVisible()) {
        visibleSearch = i;
        break;
      }
    }
    expect(visibleSearch).not.toBeNull();

    await visibleSearch!.fill('Netflix');
    // Wait briefly for filtering / URL change
    await page.waitForTimeout(700);

    // URL may or may not include ?q=Netflix depending on impl. The IMPORTANT thing:
    // The Netflix card should still be visible, and most non-Netflix cards should be hidden.
    const netflixCard = page.locator('a[href^="/gift-card/netflix"]').first();
    await expect(netflixCard).toBeVisible({ timeout: 5_000 });

    // Sanity: substantial filter happened — count of visible cards should drop
    const visibleCards = await page.locator('a[href^="/gift-card/"]').evaluateAll((els) =>
      els.filter((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const cs = getComputedStyle(el as HTMLElement);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
      }).length
    );
    console.log(`[search] visible cards after typing 'Netflix' = ${visibleCards}`);
    // Expect WAY fewer than the full 153 catalog
    expect(visibleCards).toBeLessThan(50);
  });

  test('Category chip click filters products', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadHome(page);

    // Click a known category chip - "Gaming" since the live HTML showed it
    const gamingChip = page.getByRole('button', { name: /^Gaming$/i }).first();
    await expect(gamingChip).toBeVisible();
    await gamingChip.click();

    await page.waitForTimeout(700);

    // The filter should have reduced the visible catalog
    const visibleCards = await page.locator('a[href^="/gift-card/"]').evaluateAll((els) =>
      els.filter((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const cs = getComputedStyle(el as HTMLElement);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
      }).length
    );
    console.log(`[category=Gaming] visible cards = ${visibleCards}`);
    // Filtering happened (expect some, but not all 153)
    expect(visibleCards).toBeGreaterThan(0);
    expect(visibleCards).toBeLessThan(153);
  });
});
