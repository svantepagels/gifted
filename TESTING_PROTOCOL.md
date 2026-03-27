# GIFTED Testing Protocol
**Tester Agent Instructions**

## Objective
Capture pixel-perfect screenshots of the implemented GIFTED application and compare them against the design references to verify alignment.

---

## Setup

### 1. Install Dependencies
```bash
cd /Users/administrator/.openclaw/workspace/gifted-project
npm install
npm run build
npm run dev
```

### 2. Playwright Configuration
Create or update `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Screenshot Capture Script

### File: `tests/screenshot-comparison.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Design Alignment Screenshots', () => {
  
  test('Homepage Desktop (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ 
      path: 'screenshots/homepage-desktop-1440.png',
      fullPage: true 
    })
  })
  
  test('Homepage Desktop (1024px)', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ 
      path: 'screenshots/homepage-desktop-1024.png',
      fullPage: true 
    })
  })
  
  test('Homepage Mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ 
      path: 'screenshots/homepage-mobile-375.png',
      fullPage: true 
    })
  })
  
  test('Product Detail Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    
    // Click first product card
    await page.click('a[href*="/gift-card/"]')
    await page.waitForLoadState('networkidle')
    
    // Select an amount
    await page.click('button:has-text("$25")')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: 'screenshots/product-detail-desktop.png',
      fullPage: true 
    })
  })
  
  test('Product Detail Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await page.click('a[href*="/gift-card/"]')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("$25")')
    await page.waitForTimeout(500)
    
    await page.screenshot({ 
      path: 'screenshots/product-detail-mobile.png',
      fullPage: true 
    })
  })
  
  test('Checkout Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    
    // Navigate to product
    await page.click('a[href*="/gift-card/"]')
    await page.waitForLoadState('networkidle')
    
    // Select amount and continue
    await page.click('button:has-text("$25")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("CONTINUE")')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ 
      path: 'screenshots/checkout-desktop.png',
      fullPage: true 
    })
  })
  
  test('Checkout Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    await page.click('a[href*="/gift-card/"]')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("$25")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("CONTINUE")')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ 
      path: 'screenshots/checkout-mobile.png',
      fullPage: true 
    })
  })
  
  test('Success Page Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Navigate through checkout flow
    await page.goto('/')
    await page.click('a[href*="/gift-card/"]')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("$25")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("CONTINUE")')
    await page.waitForLoadState('networkidle')
    
    // Fill checkout form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[placeholder*="Card number"]', '4242424242424242')
    await page.fill('input[placeholder*="MM"]', '12/25')
    await page.fill('input[placeholder*="CVC"]', '123')
    await page.fill('input[placeholder*="ZIP"]', '10001')
    
    // Submit (this will use mock service)
    await page.click('button:has-text("PAY")')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ 
      path: 'screenshots/success-desktop.png',
      fullPage: true 
    })
  })
  
  test('Success Page Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/')
    await page.click('a[href*="/gift-card/"]')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("$25")')
    await page.waitForTimeout(500)
    await page.click('button:has-text("CONTINUE")')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[placeholder*="Card number"]', '4242424242424242')
    await page.fill('input[placeholder*="MM"]', '12/25')
    await page.fill('input[placeholder*="CVC"]', '123')
    await page.fill('input[placeholder*="ZIP"]', '10001')
    
    await page.click('button:has-text("PAY")')
    await page.waitForLoadState('networkidle')
    
    await page.screenshot({ 
      path: 'screenshots/success-mobile.png',
      fullPage: true 
    })
  })
  
  test('Component Details - Header', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Crop to header only
    const header = page.locator('header')
    await header.screenshot({ 
      path: 'screenshots/component-header.png' 
    })
  })
  
  test('Component Details - Search Bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const searchBar = page.locator('input[placeholder*="Search"]').locator('..')
    await searchBar.screenshot({ 
      path: 'screenshots/component-searchbar.png' 
    })
  })
  
  test('Component Details - Category Chips', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const chips = page.locator('button:has-text("ALL POPULAR")').locator('..')
    await chips.screenshot({ 
      path: 'screenshots/component-category-chips.png' 
    })
  })
  
  test('Component Details - Product Card', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const firstCard = page.locator('a[href*="/gift-card/"]').first()
    await firstCard.screenshot({ 
      path: 'screenshots/component-product-card.png' 
    })
  })
  
  test('Component Details - Order Summary', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')
    await page.click('a[href*="/gift-card/"]')
    await page.waitForLoadState('networkidle')
    await page.click('button:has-text("$25")')
    await page.waitForTimeout(500)
    
    const orderSummary = page.locator('text=ORDER SUMMARY').locator('..')
    await orderSummary.screenshot({ 
      path: 'screenshots/component-order-summary.png' 
    })
  })
})
```

---

## Running Tests

### Execute Screenshot Capture
```bash
cd /Users/administrator/.openclaw/workspace/gifted-project
npx playwright test tests/screenshot-comparison.spec.ts
```

### View Results
```bash
npx playwright show-report
```

Screenshots will be saved to `screenshots/` directory.

---

## Manual Comparison Checklist

### Homepage Desktop
**Compare:** `screenshots/homepage-desktop-1440.png` vs `design-refs/mobile_flow/stitch/1._browse_home_gifted/screen.png`

#### Header Section
- [ ] Logo font is bold/compressed (Archivo Black)
- [ ] Logo size is 16px
- [ ] Navigation links are 12px, uppercase, tracked
- [ ] Country selector is pill-shaped with USD badge
- [ ] Help icon is circular with ?
- [ ] Cart icon shows badge if items present
- [ ] Header height is 56-64px
- [ ] Background is white with subtle bottom border

#### Hero Section
- [ ] Background is light gray (#F2F4F7)
- [ ] Border radius is 16-20px
- [ ] Headline is 4-5rem on desktop
- [ ] Headline is Archivo Black, uppercase
- [ ] Headline ends with period
- [ ] Line height is tight (0.95)
- [ ] Letter spacing is -0.02em
- [ ] Centered alignment

#### Search Bar
- [ ] Background is white
- [ ] Border is 1px light gray (#D0D5DD)
- [ ] Border radius is full (pill shape)
- [ ] Height is 52px
- [ ] Width is ~540px max
- [ ] Search icon is on left
- [ ] Placeholder text: "Search 2,000+ brands or categories..."
- [ ] SEARCH button is internal, black background, white text
- [ ] Button is pill-shaped with padding

#### Category Chips
- [ ] Active chip: black background, white text
- [ ] Inactive chips: white background, gray border
- [ ] All chips are pill-shaped (full rounded)
- [ ] Text is 12px, bold, uppercase, tracked
- [ ] Height is 36-40px
- [ ] Horizontal padding is 20-24px

#### Product Grid
- [ ] **6 columns on desktop**
- [ ] Gap between cards is 16-20px
- [ ] Cards have subtle border (#E5E7EB)
- [ ] Cards have minimal or no shadow (only on hover)
- [ ] Border radius is 12px

#### Product Cards
- [ ] Card width is ~130-145px
- [ ] Logo area has light gray background (#F8F8FA)
- [ ] Logo container is square (aspect-ratio 1:1)
- [ ] Logo is 48-56px
- [ ] Brand name is 14px, semi-bold, centered
- [ ] Price is 11px, uppercase, "FROM $XX"
- [ ] Price color is medium gray
- [ ] Content padding is consistent

### Product Detail Desktop
**Compare:** `screenshots/product-detail-desktop.png` vs `design-refs/mobile_flow/stitch/3._product_detail_checkout_gifted/screen.png`

#### Layout
- [ ] Two-column layout: 60/40 split
- [ ] Left column: product configuration
- [ ] Right column: order summary (sticky)
- [ ] Gap between columns is 32-40px

#### Amount Selection
- [ ] Section header: "SELECT AMOUNT" 18px, bold, uppercase
- [ ] 5 amount buttons in row
- [ ] Each button shows USD label above price
- [ ] USD label is 10px, uppercase
- [ ] Price is 24px, bold
- [ ] Active button: 2px blue border
- [ ] Inactive: 1px gray border
- [ ] Custom button shows "$…"
- [ ] Button height is 80px

#### Delivery Method Toggle
- [ ] Two buttons side-by-side
- [ ] Active: black background (#1A1A2E), white text
- [ ] Inactive: white background, gray border
- [ ] Text is 12px, bold, uppercase
- [ ] Height is 48px

#### Order Summary Panel
- [ ] White background
- [ ] Rounded corners (12px)
- [ ] "ORDER SUMMARY" header: 20px, bold, uppercase
- [ ] Product thumbnail in gray card
- [ ] Price breakdown with "FREE" in green
- [ ] **Total price is 36px, extra-bold**
- [ ] Currency label (USD) is 11px below total
- [ ] Primary CTA: blue (#2563EB), "CONTINUE AS GUEST"
- [ ] Secondary CTA: light gray, "SIGN IN"
- [ ] Legal disclaimer: 10px, uppercase, gray, centered

### Checkout Desktop
**Compare:** `screenshots/checkout-desktop.png` vs `design-refs/mobile_flow/stitch/payment_checkout_gifted/screen.png`

#### Page Layout
- [ ] Two-column: ~60/40 split
- [ ] Left: payment form
- [ ] Right: order summary
- [ ] "Checkout" headline is large

#### Card Input Group
- [ ] **Stacked/connected fields**
- [ ] Top: card number field (full width)
- [ ] Bottom: expiry + CVC split (60/40)
- [ ] Border radius on outer corners only
- [ ] Internal borders between fields
- [ ] Card icon in card number field (right)
- [ ] Focus state changes border color

#### Payment Button
- [ ] Text: "PAY $XX.XX"
- [ ] Background: #1565C0 (different from continue button)
- [ ] Full width
- [ ] Height: 56px
- [ ] Text: 16px, bold, uppercase, tracked
- [ ] Border radius: 10px

### Success Page
**Compare:** `screenshots/success-desktop.png` vs `design-refs/mobile_flow/stitch/4._success_confirmation_gifted/screen.png`

#### Success Icon
- [ ] **Green checkmark with halo ring**
- [ ] Inner circle: 80px, #4CAF50
- [ ] Outer ring: 110px, #4CAF50 at 20% opacity
- [ ] White checkmark inside
- [ ] Centered at top of card

#### Success Message
- [ ] "PURCHASE SUCCESSFUL" 32-36px, extra-bold, uppercase
- [ ] Centered alignment
- [ ] Subtext: "...arrive in your inbox in 1-2 minutes."
- [ ] Subtext is 16-18px, gray, centered

#### Order Details Card
- [ ] Light gray background (#F5F5F5)
- [ ] Rounded corners (12px)
- [ ] Two-column grid for labels/values
- [ ] Labels: 11px, bold, uppercase, gray
- [ ] Values: 16px, semi-bold, black
- [ ] Product thumbnail in top-right

#### CTAs
- [ ] Primary: dark navy (#1A237E), "BUY ANOTHER GIFT CARD"
- [ ] Secondary: blue link, "VIEW ORDER HISTORY"
- [ ] Trust badges below (3 icons with labels)

### Mobile Responsive
**Compare:** Mobile screenshots vs `design-refs/desktop_flow/stitch/1._browse_home_mobile_gifted/screen.png`

- [ ] Product grid: 2 columns on mobile
- [ ] Header height: 56px
- [ ] Navigation hidden or in hamburger
- [ ] Checkout form stacks vertically
- [ ] Order summary moves to bottom or top
- [ ] All buttons are full-width
- [ ] Typography scales down appropriately

---

## Measurement Tool

### Use Browser DevTools
1. Open implemented page in Chrome
2. Right-click > Inspect
3. Use ruler tool to measure:
   - Font sizes
   - Spacing
   - Border widths
   - Element dimensions

### Key Measurements to Verify

| Element | Expected | Actual |
|---------|----------|--------|
| Logo font size | 16px | _____ |
| Hero headline (desktop) | 64-80px | _____ |
| Section headers | 18px | _____ |
| Navigation links | 12px | _____ |
| Product grid columns | 6 | _____ |
| Amount button height | 80px | _____ |
| Total price in summary | 36px | _____ |
| Success icon diameter | 80px | _____ |
| Order summary border-radius | 12px | _____ |

---

## Color Verification

### Use Color Picker Extension
Install a browser color picker (e.g., ColorZilla for Chrome)

### Key Colors to Verify

| Element | Expected Color | Actual |
|---------|---------------|--------|
| Active category chip bg | #000000 or #1A1A1A | _____ |
| Inactive chip border | #D0D5DD | _____ |
| Primary CTA (continue) | #2563EB | _____ |
| Payment CTA | #1565C0 | _____ |
| Success icon | #4CAF50 | _____ |
| Product card border | #E5E7EB | _____ |
| Input backgrounds | #F5F5F5 | _____ |
| Hero section bg | #F2F4F7 | _____ |

---

## Reporting Results

### Create Comparison Report

**File:** `COMPARISON_REPORT.md`

```markdown
# Design Alignment Comparison Report
Date: [DATE]
Tester: [NAME]

## Summary
- Total screens tested: X
- Passing: X
- Failing: X
- Pass rate: XX%

## Detailed Findings

### Homepage Desktop
**Status:** PASS / FAIL

Issues found:
1. Logo font weight is incorrect (expected: extra-bold, actual: bold)
2. Product grid shows 4 columns instead of 6
3. ...

Screenshots:
- Implementation: screenshots/homepage-desktop-1440.png
- Design Reference: design-refs/mobile_flow/stitch/1._browse_home_gifted/screen.png

---

### Product Detail Desktop
**Status:** PASS / FAIL

Issues found:
...

---

## Priority Issues
1. [CRITICAL] Product grid columns
2. [HIGH] Logo typography
3. [MEDIUM] Spacing inconsistencies
...

## Recommendations
- Send back to Coder for fixes: [list issues]
- Minor polish needed: [list items]
- Ready for Queen approval: YES / NO
```

---

## Exit Criteria

The implementation is ready for Queen approval when:

1. ✅ All critical issues resolved (grid columns, logo, headlines, etc.)
2. ✅ Typography matches design specs within 1px
3. ✅ Colors match design specs exactly (hex values)
4. ✅ Spacing matches design specs within 4px
5. ✅ All interactive states work (hover, focus, active)
6. ✅ Mobile responsive breakpoints function correctly
7. ✅ No console errors or warnings
8. ✅ Build completes successfully
9. ✅ Lighthouse scores meet targets (Performance >90, Accessibility >95)
10. ✅ Cross-browser testing passes (Chrome, Safari, Firefox)

---

## Tools Needed

- Playwright Test Runner
- Chrome DevTools
- Color picker extension
- Ruler/measurement tool
- Image comparison tool (optional: ImageMagick for diff)

---

## Contact

If clarification is needed on any design spec detail, refer to:
- DESIGN_ALIGNMENT_SPEC.md (comprehensive specification)
- CRITICAL_COMPONENTS.md (code examples)
- Original design screenshots in design-refs/

Send any questions to the Architect or Queen before proceeding with testing.
