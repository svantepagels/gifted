# Handoff to TESTER Agent

**From:** CODER Agent  
**To:** TESTER Agent  
**Project:** GIFTED - Premium Gift Card Marketplace  
**Date:** 2026-03-27  
**Status:** ✅ Ready for Testing  

---

## 🎯 Your Mission

Verify the GIFTED application matches the design references exactly and functions flawlessly across all devices and user flows.

---

## ⚡ Quick Start (2 Minutes)

```bash
# Navigate to project
cd /Users/administrator/.openclaw/workspace/gifted-project

# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 📋 What to Test

### Priority 1: Visual Regression (High Priority)

**Compare against design references:**
- Desktop refs: `/Users/administrator/.openclaw/workspace/gifted-project/design-refs/desktop_flow/stitch/`
- Mobile refs: `/Users/administrator/.openclaw/workspace/gifted-project/design-refs/mobile_flow/stitch/`

**Key screens to verify:**
1. `1._browse_home_gifted/screen.png` - Homepage (desktop)
2. `1._browse_home_mobile_gifted/screen.png` - Homepage (mobile)
3. `3._product_detail_checkout_gifted/screen.png` - Product detail (desktop)
4. `3._product_detail_mobile_gifted/screen.png` - Product detail (mobile)
5. `payment_checkout_gifted/screen.png` - Checkout (desktop)
6. `4._payment_mobile_gifted/screen.png` - Checkout (mobile)
7. `4._success_confirmation_gifted/screen.png` - Success (desktop)
8. `5._success_mobile_gifted/screen.png` - Success (mobile)

**What to check:**
- ✅ Typography (Archivo for headlines, Inter for body)
- ✅ Colors (exact hex values from design system)
- ✅ Spacing (8pt grid)
- ✅ Element sizes (buttons, inputs, cards)
- ✅ Border radius (12px-16px)
- ✅ No borders (tonal layering instead)
- ✅ Minimal shadows (only floating elements)

**Acceptance:** Visual match within 20% pixel threshold

### Priority 2: Interaction Testing

#### Test 1: Country Selection
1. Click country selector (top right, shows 🇺🇸 by default)
2. Search for "Canada"
3. Click Canada from list
4. Verify:
   - Country selector updates to 🇨🇦 Canada C$
   - Product grid updates (only products available in Canada)
   - Refresh page - selection persists
5. **Expected:** Country persists via localStorage

#### Test 2: Search
1. Type "Amazon" in search bar
2. Verify:
   - Typing is smooth (300ms debounce)
   - Results filter as you type
   - Clear button (X) appears
3. Type "xyz" (no results)
4. Verify empty state shows
5. **Expected:** Search filters products correctly

#### Test 3: Category Filter
1. Click "Entertainment" chip
2. Verify products filter (only Spotify, Netflix, Steam)
3. Click "All" chip
4. Verify all products show again
5. **Expected:** Filter toggles work

#### Test 4: Product Configuration
1. Click Amazon product card
2. Select $50 amount
3. Verify order summary updates (amount: $50, fee: $1.75, total: $51.75)
4. Toggle to "Send as Gift"
5. Verify gift form appears (recipient email + message)
6. Enter invalid email "test"
7. Verify validation error shows
8. Enter valid email "test@example.com"
9. Verify error clears
10. **Expected:** Form validation works, order summary updates in real-time

#### Test 5: Checkout Flow (End-to-End)
1. From product page, click "Continue as Guest"
2. Verify redirect to `/checkout?orderId=ORD-...`
3. Verify order review shows correct product, amount, total
4. Enter email "user@example.com"
5. Enter confirm email "user@example.com"
6. Click "Complete Purchase"
7. Verify:
   - Loading state appears (spinner)
   - ~1.5 second delay
   - Redirect to `/success?orderId=...`
8. Verify success page shows:
   - Animated green checkmark
   - Order ID
   - Product name and amount
9. **Expected:** Full flow completes without errors

#### Test 6: Checkout Error Case
1. Repeat steps 1-3 from Test 5
2. Enter email "test@example.com"
3. Enter confirm email "test2@example.com" (mismatch)
4. Verify validation error: "Emails do not match"
5. **Expected:** Email match validation works

### Priority 3: Responsive Design

**Test viewports:**
1. **Mobile:** 390x844 (iPhone 12 Pro)
2. **Tablet:** 768x1024 (iPad)
3. **Desktop:** 1280x720 (standard laptop)
4. **Large:** 1920x1080 (desktop monitor)

**What to verify:**

| Feature | Mobile (< 768px) | Desktop (>= 1024px) |
|---------|------------------|---------------------|
| Navigation | Bottom nav (4 tabs) | Top nav bar |
| Header | Simplified (logo + cart) | Full nav links |
| Product Grid | 2 columns | 4 columns |
| Order Summary | Sticky bottom sheet | Sticky sidebar |
| Category Chips | Horizontal scroll | All visible |
| Buttons | Full-width | Contained |
| Touch Targets | Min 44x44px | Mouse-optimized |

**How to test:**
1. Use Chrome DevTools (Cmd+Option+I)
2. Toggle device toolbar (Cmd+Shift+M)
3. Select "iPhone 12 Pro" preset
4. Navigate through all pages
5. Resize to desktop width
6. Verify layouts switch correctly

### Priority 4: Animations

**Verify these animations work:**
1. **Page entrance** - Browse page fades in + scales (300ms)
2. **Button press** - Buttons scale to 0.98 on tap
3. **Card hover** - Product cards scale to 1.02 on hover (desktop only)
4. **Success checkmark** - SVG path draws from 0 to 100% (600ms)
5. **Modal entrance** - Country selector modal slides/scales in
6. **Category chip** - Background color transitions smoothly (150ms)

**Timing guidelines:**
- All animations should be **150-400ms**
- Easing should be **ease-out**
- No bouncy or spring physics
- Desktop-only: card hover, button hover

### Priority 5: Accessibility

**Keyboard navigation:**
1. Press Tab repeatedly from homepage
2. Verify focus states are visible (blue outline)
3. Verify tab order is logical:
   - Header nav
   - Country selector
   - Search bar
   - Category chips
   - Product cards (left to right, top to bottom)
4. Press Enter on product card
5. Verify navigation works

**Color contrast:**
1. Use Chrome DevTools > Lighthouse
2. Run accessibility audit
3. Verify no contrast issues
4. **Target:** Accessibility score > 90

**Screen reader:**
1. Enable VoiceOver (Cmd+F5 on Mac)
2. Navigate through homepage
3. Verify all elements are announced
4. Verify images have alt text (or decorative role)

---

## 🧪 Playwright Test Structure

### Test Files to Create

```
tests/
└── e2e/
    ├── browse.spec.ts           # Search, filter, navigation
    ├── product-detail.spec.ts   # Amount selection, delivery toggle
    ├── checkout.spec.ts         # Full purchase flow
    └── visual/
        ├── desktop.spec.ts      # Visual regression (desktop)
        └── mobile.spec.ts       # Visual regression (mobile)
```

### Example Test: Browse Page

```typescript
// tests/e2e/browse.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Browse Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })
  
  test('should display country selector', async ({ page }) => {
    const selector = page.getByTestId('country-selector')
    await expect(selector).toBeVisible()
    await expect(selector).toContainText('United States')
  })
  
  test('should filter products by search', async ({ page }) => {
    const searchInput = page.getByTestId('search-input')
    await searchInput.fill('Amazon')
    
    // Wait for debounce (300ms)
    await page.waitForTimeout(400)
    
    const productCards = page.getByTestId(/^product-card-/)
    await expect(productCards).toHaveCount(1)
    await expect(productCards.first()).toContainText('Amazon')
  })
  
  test('should filter products by category', async ({ page }) => {
    const entertainmentChip = page.getByTestId('category-chip-entertainment')
    await entertainmentChip.click()
    
    const productCards = page.getByTestId(/^product-card-/)
    const count = await productCards.count()
    expect(count).toBeGreaterThan(0)
    
    // Verify all visible cards are Entertainment category
    for (let i = 0; i < count; i++) {
      const card = productCards.nth(i)
      const category = await card.getAttribute('data-category')
      expect(category).toBe('Entertainment')
    }
  })
})
```

### Example Test: Visual Regression

```typescript
// tests/e2e/visual/desktop.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression - Desktop', () => {
  test('browse page matches design reference', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:3000')
    
    // Wait for images to load
    await page.waitForLoadState('networkidle')
    
    // Compare against baseline
    await expect(page).toHaveScreenshot('browse-desktop.png', {
      maxDiffPixelRatio: 0.2, // 20% threshold
    })
  })
  
  test('product detail matches design reference', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('http://localhost:3000')
    
    // Click first product
    const productCard = page.getByTestId('product-card-amazon')
    await productCard.click()
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
    
    // Compare against baseline
    await expect(page).toHaveScreenshot('product-detail-desktop.png', {
      maxDiffPixelRatio: 0.2,
    })
  })
})
```

### Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/browse.spec.ts

# Run tests with UI (interactive mode)
npm run test:e2e:ui

# Generate baseline screenshots
npx playwright test --update-snapshots

# View test report
npx playwright show-report
```

---

## 🐛 Known Issues to Watch For

### None Currently
The build is passing with zero errors. If you find any issues:
1. Document them clearly
2. Include steps to reproduce
3. Include screenshots (visual discrepancies)
4. Prioritize by severity (blocking, major, minor)

---

## 📊 Acceptance Criteria

### Must Pass
- ✅ Build succeeds (`npm run build`)
- ✅ No TypeScript errors
- ✅ No console errors in browser
- ✅ Visual match within 20% threshold
- ✅ All interaction tests pass
- ✅ Responsive design works (390px to 1920px)
- ✅ Lighthouse accessibility > 90
- ✅ Lighthouse performance > 90 (mobile)
- ✅ Lighthouse performance > 95 (desktop)

### Nice to Have
- ✅ Lighthouse SEO > 90
- ✅ Lighthouse Best Practices > 95
- ✅ No ESLint warnings
- ✅ All animations smooth (60fps)

---

## 📁 Key Files to Review

### Design System
- `tailwind.config.ts` - Design tokens (colors, typography, spacing)
- `app/globals.css` - Global styles

### Components
- `components/layout/Header.tsx` - Top navigation
- `components/browse/ProductCard.tsx` - Product card with hover animation
- `components/product/AmountSelector.tsx` - Amount selection UI
- `components/checkout/CheckoutForm.tsx` - Checkout form with validation

### Business Logic
- `lib/giftcards/service.ts` - Product data logic
- `lib/orders/service.ts` - Order management
- `lib/payments/service.ts` - Payment handling (mocked)

### Documentation
- `README.md` - Complete project guide
- `QUICK-START.md` - 2-minute setup
- `CODER-DELIVERABLES.md` - Implementation details
- `CODER-FINAL-SUMMARY.md` - Executive summary

---

## 🎨 Design Reference Locations

```
/Users/administrator/.openclaw/workspace/gifted-project/design-refs/
├── desktop_flow/
│   └── stitch/
│       ├── 1._browse_home_gifted/screen.png
│       ├── 3._product_detail_checkout_gifted/screen.png
│       ├── payment_checkout_gifted/screen.png
│       ├── 4._success_confirmation_gifted/screen.png
│       └── slate_cobalt_premium/DESIGN.md
│
└── mobile_flow/
    └── stitch/
        ├── 1._browse_home_mobile_gifted/screen.png
        ├── 3._product_detail_mobile_gifted/screen.png
        ├── 4._payment_mobile_gifted/screen.png
        ├── 5._success_mobile_gifted/screen.png
        └── slate_cobalt_premium/DESIGN.md
```

---

## 💡 Testing Tips

### Visual Comparison
1. Open design reference in one window
2. Open localhost:3000 in another
3. Compare side-by-side
4. Use rulers/grids to check spacing
5. Zoom to 200% to check typography details

### Responsive Testing
1. Use Chrome DevTools device toolbar
2. Test portrait and landscape
3. Verify touch targets are 44x44px minimum (mobile)
4. Check horizontal scrolling (should only be on category chips)

### Performance Testing
1. Use Chrome DevTools > Lighthouse
2. Run in Incognito mode (no extensions)
3. Use "Mobile" and "Desktop" presets
4. Focus on Performance and Accessibility scores

---

## ✅ Checklist for TESTER

### Setup
- [ ] Project cloned/pulled
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Playwright installed (`npx playwright install`)

### Visual Regression
- [ ] Desktop browse page matches design
- [ ] Mobile browse page matches design
- [ ] Desktop product detail matches design
- [ ] Mobile product detail matches design
- [ ] Desktop checkout matches design
- [ ] Mobile checkout matches design
- [ ] Desktop success matches design
- [ ] Mobile success matches design

### Interaction Tests
- [ ] Country selection works + persists
- [ ] Search filters correctly (debounced)
- [ ] Category filtering works
- [ ] Product amount selection works
- [ ] Delivery method toggle works
- [ ] Gift form validation works
- [ ] Checkout form validation works
- [ ] Full purchase flow completes
- [ ] Error states display correctly

### Responsive Tests
- [ ] Mobile layout (390px) works
- [ ] Tablet layout (768px) works
- [ ] Desktop layout (1280px) works
- [ ] Large desktop (1920px) works
- [ ] Bottom nav shows on mobile
- [ ] Top nav shows on desktop
- [ ] Sticky elements work correctly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast sufficient
- [ ] Screen reader compatible
- [ ] Lighthouse accessibility > 90

### Performance
- [ ] Mobile Lighthouse > 90
- [ ] Desktop Lighthouse > 95
- [ ] No console errors
- [ ] Animations smooth (60fps)

---

## 📝 Reporting Issues

If you find issues, create a report with:

**Title:** Clear, descriptive title  
**Severity:** Blocking | Major | Minor  
**Page/Component:** Where the issue occurs  
**Steps to Reproduce:**
1. Go to...
2. Click on...
3. Verify...

**Expected:** What should happen  
**Actual:** What actually happens  
**Screenshots:** Visual proof (if applicable)  
**Browser:** Chrome 90+  
**Viewport:** 390px, 1280px, etc.  

---

## 🚀 Success Criteria

When all tests pass:
1. Document test results
2. Generate Playwright HTML report
3. Create summary of findings
4. Hand off to integration team (or mark as deployment-ready)

---

**Questions?**
- Review `README.md` for full docs
- Check `TROUBLESHOOTING.md` for common issues
- Review `CODER-DELIVERABLES.md` for implementation details

**Good luck, TESTER! The app is solid. Time to prove it.** 🎯
