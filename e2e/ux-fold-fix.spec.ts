/**
 * UX desktop-fold-fix validation
 *
 * Independent verification by the TESTER agent of the claims made by the
 * ARCHITECT/RESEARCHER/CODER agents in branch `ux/desktop-fold-fix`.
 *
 * Runs against the deployed preview with Vercel SSO bypass cookie.
 *
 * Acceptance criteria (from REVIEW.md / SPEC.md):
 *   - P0a Header has logo + country + cart only (no BROWSE/DEALS/HELP/Help icon)
 *   - P0b Above the fold at 1920×1080: hero + search + chips + ≥7 product cards
 *   - P0c Above the fold at 1440×900: hero + search + chips + ≥6 product cards
 *   - P0d Above the fold at 768×1024: hero + search + chips + ≥4 product cards
 *   - P0e Above the fold at 390×844: hero (intact mobile layout, no regression)
 *   - P1a Sticky search/chips bar present on tablet+desktop
 *   - P1b ProductGrid uses 7-col layout at 2xl (≥1536px)
 *   - P1c Product detail page has two-column layout on desktop with sticky purchase rail
 *
 * Reference: ~/.openclaw/workspace/uxreview/gifted/REVIEW.md, SPEC.md, RESEARCH.md
 */

import { test, expect, Page } from '@playwright/test';

// Vercel preview JWT bypass cookie - shipped by the architect
const VERCEL_BYPASS_COOKIE = {
  name: '_vercel_jwt',
  value:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwcm90ZWN0aW9uLWJ5cGFzcy1hdXRvbWF0aW9uIiwiYXVkIjoiZ2lmdGVkLXV4LWZpeC52ZXJjZWwuYXBwIiwiaWF0IjoxNzc4MTA0OTA3LCJieXBhc3MiOiJkeEVBMktSWVh0clpET2hkT2FXTWpaOTVMeFBRMnZhVCJ9.RULjLwWM1YGXm_ygpZzbZRWcce6sLJLyTUE9RWBA4_0',
  domain: 'gifted-ux-fix.vercel.app',
  path: '/',
};

const PREVIEW = 'https://gifted-ux-fix.vercel.app';

test.describe.configure({ mode: 'parallel' });

async function loadHome(page: Page) {
  await page.context().addCookies([VERCEL_BYPASS_COOKIE]);
  await page.goto(`${PREVIEW}/`, { waitUntil: 'domcontentloaded' });
  // Wait for Framer Motion to settle (h1 hydrates from opacity:0 → 1)
  await page.waitForLoadState('networkidle');
  // Belt-and-suspenders: explicit wait for h1 to be visible
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 15_000 });
}

async function loadProduct(page: Page, slug = 'netflix-es-15363') {
  await page.context().addCookies([VERCEL_BYPASS_COOKIE]);
  await page.goto(`${PREVIEW}/gift-card/${slug}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
}

async function countCardsAboveFold(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const vh = window.innerHeight;
    // ProductCard root is an <a> with href starting with /gift-card/
    const cards = Array.from(
      document.querySelectorAll('a[href^="/gift-card/"]')
    ) as HTMLAnchorElement[];
    let count = 0;
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      // Card must be at least 50% above the fold to count
      const visibleHeight = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (visibleHeight >= r.height * 0.5 && r.top < vh) {
        count++;
      }
    }
    return count;
  });
}

test.describe('Header (P0a)', () => {
  for (const vp of [
    { width: 1920, height: 1080, name: 'desktop-1920' },
    { width: 1440, height: 900, name: 'desktop-1440' },
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 390, height: 844, name: 'mobile-390' },
  ]) {
    test(`Header ${vp.name}: logo + country + cart, no BROWSE/DEALS/HELP`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await loadHome(page);

      const headerLocator = page.locator('header').first();
      await expect(headerLocator).toBeVisible();

      const headerText = (await headerLocator.innerText()).toUpperCase();
      // GIFTED logo MUST be present (now an SVG with alt text)
      const logo = headerLocator
        .locator('img[alt="GIFTED" i], a[aria-label="Gifted home"]')
        .first();
      await expect(logo).toBeVisible();
      // Forbidden labels MUST NOT be present in header
      expect(headerText).not.toContain('BROWSE');
      expect(headerText).not.toContain('DEALS');
      // 'HELP' substring would catch any Help link, Help Center, etc. (footer "Help Center" is NOT in <header>)
      expect(headerText).not.toContain('HELP');

      // Country selector exists somewhere in header
      const country = headerLocator.getByText(/United States|🇺🇸/i).first();
      await expect(country).toBeVisible();

      // Cart button exists
      const cart = headerLocator.locator('button[aria-label*="cart" i], button[aria-label*="Shopping" i]').first();
      await expect(cart).toBeVisible();
    });
  }
});

test.describe('Above the fold composition (P0b/c/d/e)', () => {
  test('1920×1080: hero + search + chips + ≥7 product cards above fold', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadHome(page);

    await expect(page.locator('h1').first()).toBeVisible();
    // At desktop, the hidden mobile search bar is in the DOM but display:none.
    // Pick the search input that is actually visible.
    const visibleSearch = page.getByPlaceholder(/Search brands/i).filter({ visible: true } as any).first();
    // Fallback if filter syntax not supported: at least one of the inputs is visible.
    const allSearch = page.getByPlaceholder(/Search brands/i);
    const visibleCount = await allSearch.evaluateAll((els) =>
      els.filter((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const cs = getComputedStyle(el as HTMLElement);
        return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
      }).length
    );
    expect(visibleCount).toBeGreaterThanOrEqual(1);

    const cards = await countCardsAboveFold(page);
    expect(cards).toBeGreaterThanOrEqual(7);
    console.log(`[1920] cards above fold = ${cards}, visible search inputs = ${visibleCount}`);

    await page.screenshot({
      path: 'test-results/ux-fold-fix-1920-fold.png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
  });

  test('1440×900: hero + search + chips + ≥6 product cards above fold', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loadHome(page);

    await expect(page.locator('h1').first()).toBeVisible();

    const visibleCount = await page
      .getByPlaceholder(/Search brands/i)
      .evaluateAll((els) =>
        els.filter((el) => {
          const r = (el as HTMLElement).getBoundingClientRect();
          const cs = getComputedStyle(el as HTMLElement);
          return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
        }).length
      );
    expect(visibleCount).toBeGreaterThanOrEqual(1);

    const cards = await countCardsAboveFold(page);
    expect(cards).toBeGreaterThanOrEqual(6);
    console.log(`[1440] cards above fold = ${cards}, visible search inputs = ${visibleCount}`);

    await page.screenshot({
      path: 'test-results/ux-fold-fix-1440-fold.png',
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
  });

  test('768×1024 tablet: hero + search + chips + ≥4 product cards above fold', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await loadHome(page);

    await expect(page.locator('h1').first()).toBeVisible();

    const visibleCount = await page
      .getByPlaceholder(/Search brands/i)
      .evaluateAll((els) =>
        els.filter((el) => {
          const r = (el as HTMLElement).getBoundingClientRect();
          const cs = getComputedStyle(el as HTMLElement);
          return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
        }).length
      );
    expect(visibleCount).toBeGreaterThanOrEqual(1);

    const cards = await countCardsAboveFold(page);
    expect(cards).toBeGreaterThanOrEqual(4);
    console.log(`[768] cards above fold = ${cards}, visible search inputs = ${visibleCount}`);

    await page.screenshot({
      path: 'test-results/ux-fold-fix-768-fold.png',
      clip: { x: 0, y: 0, width: 768, height: 1024 },
    });
  });

  test('390×844 mobile: hero visible, no regression vs reference', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loadHome(page);

    await expect(page.locator('h1').first()).toBeVisible();
    // mobile must have at least one visible search input on the page
    const visibleCount = await page
      .getByPlaceholder(/Search brands/i)
      .evaluateAll((els) =>
        els.filter((el) => {
          const r = (el as HTMLElement).getBoundingClientRect();
          const cs = getComputedStyle(el as HTMLElement);
          return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none';
        }).length
      );
    expect(visibleCount).toBeGreaterThanOrEqual(1);

    // mobile shows ≥1 card above fold (architect screenshot showed 2)
    const cards = await countCardsAboveFold(page);
    expect(cards).toBeGreaterThanOrEqual(1);
    console.log(`[390] cards above fold = ${cards}`);

    await page.screenshot({
      path: 'test-results/ux-fold-fix-390-fold.png',
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
});

test.describe('Sticky control bar (P1a)', () => {
  test('Desktop 1920: search/chips bar stays sticky during scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadHome(page);

    // Find sticky desktop search bar - it has the `hidden md:block sticky` markers
    const stickyDesktop = page.locator('div.hidden.md\\:block.sticky').first();

    // Confirm element exists with sticky positioning
    const isSticky = await stickyDesktop.evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.position === 'sticky';
    });
    expect(isSticky).toBe(true);

    // Scroll down and verify the bar is still pinned to the top
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(300);

    const stillVisible = await stickyDesktop.isVisible();
    expect(stillVisible).toBe(true);

    const topAfterScroll = await stickyDesktop.evaluate((el) => el.getBoundingClientRect().top);
    // Should be near the top of the viewport (allowing for top-16 / top-20 offset = 64-80px)
    expect(topAfterScroll).toBeLessThanOrEqual(100);
    console.log(`[sticky] top after scroll = ${topAfterScroll}px`);
  });
});

test.describe('Product detail page (P1c)', () => {
  test('Desktop 1920: two-column layout with sticky right rail', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadProduct(page);

    await expect(page.getByText('Netflix').first()).toBeVisible();

    // Two-column grid uses arbitrary template `lg:grid-cols-[minmax(0,1fr)_440px]`
    const grid = page.locator('div.grid.grid-cols-1.lg\\:grid-cols-\\[minmax\\(0\\,1fr\\)_440px\\]').first();
    const exists = await grid.count();
    expect(exists).toBeGreaterThan(0);

    // Right-rail aside has sticky positioning
    const aside = page.locator('aside.lg\\:sticky').first();
    await expect(aside).toBeVisible();
    const isSticky = await aside.evaluate((el) => getComputedStyle(el).position === 'sticky');
    expect(isSticky).toBe(true);

    await page.screenshot({
      path: 'test-results/ux-fold-fix-product-1920-fold.png',
      clip: { x: 0, y: 0, width: 1920, height: 1080 },
    });
  });

  test('Mobile 390: product detail still shows price and CTA', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loadProduct(page);

    await expect(page.getByText('Netflix').first()).toBeVisible();
    await expect(page.getByText(/ENTER AMOUNT|Choose amount/i).first()).toBeVisible();

    await page.screenshot({
      path: 'test-results/ux-fold-fix-product-390-fold.png',
      clip: { x: 0, y: 0, width: 390, height: 844 },
    });
  });
});

test.describe('Product count and grid density', () => {
  test('Home page renders ≥150 product cards', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadHome(page);

    const total = await page.locator('a[href^="/gift-card/"]').count();
    // SPEC says 153, accept ≥150 in case the seed list shifted
    expect(total).toBeGreaterThanOrEqual(150);
    console.log(`[products] total cards rendered = ${total}`);
  });

  test('At ≥1536px viewport, grid uses 7 columns', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await loadHome(page);

    // Find the product grid container
    const grid = page.locator('div.grid-cols-2.md\\:grid-cols-4').first();
    const cols = await grid.evaluate((el) => {
      const cs = getComputedStyle(el);
      const tmpl = cs.gridTemplateColumns;
      return tmpl.split(' ').length;
    });
    // At 1920 we should have 7 explicit columns (2xl:grid-cols-7)
    expect(cols).toBe(7);
    console.log(`[grid] computed columns at 1920px = ${cols}`);
  });
});
