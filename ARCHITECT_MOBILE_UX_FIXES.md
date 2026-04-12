# Mobile UX Fixes - Technical Specification

**Date:** 2026-04-12  
**Project:** Gifted Digital Gift Cards  
**Urgency:** HIGH - User-facing bugs affecting purchase flow  
**Estimated Completion:** 2-3 hours

---

## Executive Summary

Three critical mobile UX bugs need fixing:
1. **Bottom navigation removal** - Unnecessary nav bar cluttering mobile interface
2. **Currency mismatch** - Selector shows £ but prices display USD
3. **Dark area bug** - Unwanted dark/black space on product pages

All bugs are localized to specific components with clear fix paths.

---

## Bug 1: Remove Bottom Navigation Bar

### Problem Statement
Bottom navigation bar appears on all pages with links to non-existent routes (Search, Cart, Account all lead to 404). This serves no purpose on a single-product-purchase flow site.

### Current Implementation
- **Component:** `components/layout/MobileBottomNav.tsx`
- **Usage:** Rendered in 4 page templates
- **Mobile Styling:** Fixed at `bottom-0`, height `h-16` (64px), only shows on `md:hidden` (mobile)

### Affected Files
```
app/page.tsx                              (Line: bottom of JSX)
app/gift-card/[slug]/ProductDetailClient.tsx  (Line: bottom of JSX)
app/gift-card/[slug]/not-found.tsx        (Line: bottom of JSX)
app/checkout/page.tsx                     (Multiple locations - CheckoutContent component)
```

### Fix Specification

#### Step 1: Remove Component Imports
**Action:** Delete the following import from each affected file:
```tsx
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
```

**Files to modify:**
- `app/page.tsx`
- `app/gift-card/[slug]/ProductDetailClient.tsx`
- `app/gift-card/[slug]/not-found.tsx`
- `app/checkout/page.tsx`

#### Step 2: Remove Component Usage
**Action:** Delete all `<MobileBottomNav />` JSX elements

**Exact lines to remove:**
```tsx
<MobileBottomNav />
```

**Locations:**
- `app/page.tsx` - After `<Footer />`
- `app/gift-card/[slug]/ProductDetailClient.tsx` - After `<Footer />`
- `app/gift-card/[slug]/not-found.tsx` - After `<Footer />`
- `app/checkout/page.tsx` - 3 occurrences (in CheckoutContent, loading state, and Suspense fallback)

#### Step 3: Adjust Mobile Sticky CTA Positioning
**Problem:** Product detail page has mobile sticky CTA positioned at `bottom-16` (64px) to sit above the bottom nav.

**File:** `app/gift-card/[slug]/ProductDetailClient.tsx`

**Current code:**
```tsx
{/* Mobile Sticky CTA */}
<div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant z-30">
```

**Change to:**
```tsx
{/* Mobile Sticky CTA */}
<div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant z-30">
```

**Rationale:** With bottom nav removed, CTA should anchor to screen bottom (`bottom-0` instead of `bottom-16`).

#### Step 4: Adjust Page Bottom Padding
**Problem:** Pages have `pb-20` (80px) or `pb-36` (144px) padding to prevent content from being hidden behind bottom nav.

**Files and changes:**

**`app/page.tsx`**
```tsx
// BEFORE
<main className="min-h-screen pb-20 md:pb-0">

// AFTER
<main className="min-h-screen pb-8 md:pb-0">
```

**`app/gift-card/[slug]/ProductDetailClient.tsx`**
```tsx
// BEFORE
<main className="min-h-screen pb-36 md:pb-8">

// AFTER  
<main className="min-h-screen pb-32 md:pb-8">
```
**Note:** Keep `pb-32` (128px) to accommodate mobile sticky CTA (approx 88px height with padding)

**`app/checkout/page.tsx`**
```tsx
// BEFORE
<main className="min-h-screen pb-20 md:pb-8">

// AFTER
<main className="min-h-screen pb-8 md:pb-8">
```

#### Step 5: Delete Component File (Optional Cleanup)
**File:** `components/layout/MobileBottomNav.tsx`

**Action:** Delete entire file (no longer needed)

**Rationale:** Removes dead code and prevents accidental re-use.

---

## Bug 2: Currency Mismatch Fix

### Problem Statement
Currency selector displays correct symbol (e.g., £ for GBP), but product prices hardcoded to show "USD" and "$" regardless of selection.

### Root Cause
**File:** `components/product/AmountSelector.tsx`  
**Lines:** 45-50 (in fixed denominations rendering)

**Hardcoded values:**
```tsx
<span className="text-xs uppercase text-surface-on-surface-variant mb-1">USD</span>
<span className="text-2xl font-bold text-surface-on-surface">
  ${denom.value}
</span>
```

### Current State Analysis

#### Component Receives Correct Currency
```tsx
interface AmountSelectorProps {
  product: GiftCardProduct
  currency: string  // ✅ This is passed correctly from selectedCountry.currency
  selectedAmount: number | null
  onAmountChange: (amount: number) => void
}
```

#### Currency Utility Available But Not Used
```tsx
import { formatCurrency } from '@/lib/utils/currency'  // ✅ Already imported
```

The `formatCurrency` function correctly handles all currencies:
```tsx
formatCurrency(amount: number, currency: string, locale: string = 'en-US'): string
// Returns properly formatted currency with correct symbol
// Examples:
// formatCurrency(10, 'USD') → "$10.00"
// formatCurrency(10, 'GBP') → "£10.00"
// formatCurrency(10, 'EUR') → "€10.00"
```

### Fix Specification

#### File to Modify
`components/product/AmountSelector.tsx`

#### Code Change - Fixed Denominations Section

**BEFORE (Lines ~40-55):**
```tsx
if (product.denominationType === 'FIXED' && product.fixedDenominations) {
  return (
    <div>
      <label className="block text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
        SELECT AMOUNT
      </label>
      <div className="grid grid-cols-5 gap-3">
        {product.fixedDenominations.map((denom) => {
          const isSelected = selectedAmount === denom.value
          
          return (
            <motion.button
              key={denom.value}
              onClick={() => onAmountChange(denom.value)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-secondary bg-secondary/5'
                  : 'border-outline-variant hover:border-surface-on-surface-variant'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xs uppercase text-surface-on-surface-variant mb-1">USD</span>
              <span className="text-2xl font-bold text-surface-on-surface">
                ${denom.value}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
```

**AFTER:**
```tsx
if (product.denominationType === 'FIXED' && product.fixedDenominations) {
  return (
    <div>
      <label className="block text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
        SELECT AMOUNT
      </label>
      <div className="grid grid-cols-5 gap-3">
        {product.fixedDenominations.map((denom) => {
          const isSelected = selectedAmount === denom.value
          
          return (
            <motion.button
              key={denom.value}
              onClick={() => onAmountChange(denom.value)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-200
                ${isSelected
                  ? 'border-secondary bg-secondary/5'
                  : 'border-outline-variant hover:border-surface-on-surface-variant'
                }
              `}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xs uppercase text-surface-on-surface-variant mb-1">{currency}</span>
              <span className="text-2xl font-bold text-surface-on-surface">
                {formatCurrency(denom.value, currency)}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
```

#### Changes Made
1. **Line ~45:** Replace `USD` with `{currency}` (uses prop value)
2. **Line ~47:** Replace `${denom.value}` with `{formatCurrency(denom.value, currency)}`

#### Expected Behavior After Fix

**When user selects £ (GBP):**
```
Currency label: "GBP"
Price display: "£10.00"
```

**When user selects $ (USD):**
```
Currency label: "USD"  
Price display: "$10.00"
```

**When user selects € (EUR):**
```
Currency label: "EUR"
Price display: "€10.00"
```

### Data Flow Validation

**Current flow (CORRECT):**
```
User clicks currency selector
  ↓
AppContext.setSelectedCountry(country)
  ↓
selectedCountry stored in context (includes currency: "GBP", currencySymbol: "£")
  ↓
ProductDetailClient reads selectedCountry.currency
  ↓
Passes currency="GBP" to AmountSelector
  ↓
AmountSelector receives correct currency prop ✅
  ↓
BUT: Hardcoded "USD" and "$" displayed ❌ (BUG)
```

**After fix:**
```
AmountSelector receives currency="GBP" ✅
  ↓
Displays currency="GBP" in label ✅
  ↓
formatCurrency(10, "GBP") → "£10.00" ✅
```

---

## Bug 3: Dark/Black Area on Product Page

### Problem Statement
Large dark or black empty space appearing on product detail pages between content sections.

### Investigation Strategy

Since the exact location isn't visible in code analysis, here are the most likely causes:

#### Potential Cause 1: Missing Product Logo/Image
**File:** `components/product/ProductHero.tsx`  
**Line:** 10-14

**Current code:**
```tsx
<div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-surface-container flex items-center justify-center">
  <span className="text-display-sm font-archivo text-surface-on-surface-variant">
    {product.brandName[0]}
  </span>
</div>
```

**Potential issue:** If `product.logoUrl` exists but isn't being used, and the placeholder background is dark.

**Fix approach:**
```tsx
<div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-white flex items-center justify-center overflow-hidden">
  {product.logoUrl ? (
    <img 
      src={product.logoUrl} 
      alt={product.brandName}
      className="w-full h-full object-contain"
    />
  ) : (
    <span className="text-display-sm font-archivo text-surface-on-surface-variant">
      {product.brandName[0]}
    </span>
  )}
</div>
```

#### Potential Cause 2: OrderSummary Component Dark Background
**File:** `components/product/OrderSummary.tsx`

**Check:** This component has dark/navy colors (`text-primary` which is `#0F172A`)

**If visible on product page:** Component may not be rendered on product detail page (not found in ProductDetailClient.tsx), so unlikely to be the cause.

#### Potential Cause 3: Footer Dark Section
**File:** `components/layout/Footer.tsx` (not examined yet)

**Action required:** Examine Footer component for dark backgrounds.

#### Potential Cause 4: Min-Height Creating Empty Space
**File:** `app/gift-card/[slug]/ProductDetailClient.tsx`  
**Line:** Main container

**Current:**
```tsx
<main className="min-h-screen pb-36 md:pb-8">
```

**Potential issue:** If content is short, `min-h-screen` forces minimum height, creating empty space at bottom.

**Fix approach:** Change to:
```tsx
<main className="min-h-[calc(100vh-4rem)] pb-32 md:pb-8">
```
This accounts for header height and prevents excessive empty space.

### Diagnostic Approach

**Step 1: Inspect Footer Component**
```bash
cat components/layout/Footer.tsx
```
Look for dark backgrounds (`bg-primary`, `bg-surface-container-high`, `bg-gray-900`, etc.)

**Step 2: Check Global CSS**
```bash
grep -n "bg-\[#" app/globals.css
grep -n "background.*dark" app/globals.css
```

**Step 3: Browser DevTools Testing**
After deploying fixes 1 & 2:
- Open product page on mobile (390px width)
- Use browser DevTools to inspect dark area
- Check computed styles for `background-color`
- Identify parent element with dark background

### Recommended Fix (Without Screenshot)

**File:** `app/gift-card/[slug]/ProductDetailClient.tsx`

**Changes:**
1. Ensure main has explicit light background:
```tsx
<main className="min-h-screen pb-32 md:pb-8 bg-surface">
```

2. Ensure content container has light background:
```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-surface">
```

3. Ensure all child containers specify backgrounds:
```tsx
<div className="max-w-4xl mx-auto space-y-8">
  {/* All children should have explicit bg-surface or bg-surface-container-lowest */}
</div>
```

**File:** `components/product/ProductHero.tsx`

**Change logo container background:**
```tsx
// BEFORE
<div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-surface-container flex items-center justify-center">

// AFTER
<div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center">
```

---

## Implementation Checklist

### Bug 1: Bottom Nav Removal
- [ ] Remove `MobileBottomNav` import from `app/page.tsx`
- [ ] Remove `<MobileBottomNav />` from `app/page.tsx`
- [ ] Update `app/page.tsx` main padding from `pb-20` to `pb-8`
- [ ] Remove `MobileBottomNav` import from `app/gift-card/[slug]/ProductDetailClient.tsx`
- [ ] Remove `<MobileBottomNav />` from `app/gift-card/[slug]/ProductDetailClient.tsx`
- [ ] Update sticky CTA from `bottom-16` to `bottom-0` in ProductDetailClient
- [ ] Update ProductDetailClient main padding from `pb-36` to `pb-32`
- [ ] Remove `MobileBottomNav` import from `app/gift-card/[slug]/not-found.tsx`
- [ ] Remove `<MobileBottomNav />` from `app/gift-card/[slug]/not-found.tsx`
- [ ] Remove `MobileBottomNav` import from `app/checkout/page.tsx`
- [ ] Remove 3 instances of `<MobileBottomNav />` from `app/checkout/page.tsx`
- [ ] Update checkout main padding from `pb-20` to `pb-8`
- [ ] Delete `components/layout/MobileBottomNav.tsx` file
- [ ] Verify no other files import MobileBottomNav:
  ```bash
  grep -r "MobileBottomNav" --include="*.tsx" --include="*.ts"
  ```

### Bug 2: Currency Mismatch
- [ ] Open `components/product/AmountSelector.tsx`
- [ ] Locate fixed denominations render block (line ~40-55)
- [ ] Replace hardcoded `USD` with `{currency}` prop
- [ ] Replace `${denom.value}` with `{formatCurrency(denom.value, currency)}`
- [ ] Verify `formatCurrency` is already imported (line ~4)
- [ ] Test with each currency:
  - [ ] USD ($)
  - [ ] GBP (£)
  - [ ] EUR (€)
  - [ ] CAD (C$)
  - [ ] AUD (A$)
  - [ ] BRL (R$)
  - [ ] MXN (MX$)

### Bug 3: Dark Area Investigation
- [ ] Examine `components/layout/Footer.tsx` for dark backgrounds
- [ ] Add explicit `bg-surface` to main element in ProductDetailClient
- [ ] Change ProductHero logo container from `bg-surface-container` to `bg-white border border-outline-variant`
- [ ] Test on mobile (390px width)
- [ ] Use browser DevTools to inspect any remaining dark areas
- [ ] Document findings for further fixes if needed

### Testing
- [ ] Test on iPhone (390px width)
- [ ] Test on Android (360px width)
- [ ] Test on tablet (768px width)
- [ ] Verify bottom nav removed on all pages
- [ ] Verify mobile CTA at bottom of screen (not floating above)
- [ ] Verify currency changes prices correctly for all supported currencies
- [ ] Verify no dark areas on product pages
- [ ] Verify clean white background throughout

### Deployment
- [ ] Commit changes:
  ```bash
  git add .
  git commit -m "fix: remove bottom nav, fix currency display, clean product page styling"
  ```
- [ ] Push to main:
  ```bash
  git push origin main
  ```
- [ ] Deploy to production:
  ```bash
  vercel --prod --yes
  ```
- [ ] Wait for build completion
- [ ] Verify fixes on production URL
- [ ] Test on real mobile device

---

## Success Criteria

### Bug 1: Bottom Nav
✅ No bottom navigation visible on any page (mobile or desktop)  
✅ Mobile sticky CTA sits at bottom of screen (not floating)  
✅ No extra bottom padding causing scrolling issues  
✅ Clean, minimal mobile navigation (only header with logo, currency, cart)

### Bug 2: Currency
✅ When £ selected → prices show "£10.00" format  
✅ When $ selected → prices show "$10.00" format  
✅ When € selected → prices show "€10.00" format  
✅ Currency label matches selected currency (GBP, USD, EUR, etc.)  
✅ All 7 supported currencies work correctly

### Bug 3: Dark Area
✅ No dark/black empty spaces on product pages  
✅ Clean white background throughout product page  
✅ Product logo container has white background with subtle border  
✅ All sections have proper background colors defined

### Overall
✅ Mobile purchase flow works smoothly  
✅ No visual bugs or layout issues  
✅ Professional, clean appearance  
✅ All changes deployed to production  

---

## Technical Notes

### Architecture Decisions

**Why remove bottom nav entirely (not just hide)?**
- Dead links lead to 404 (bad UX)
- No actual navigation needed (single-purpose purchase flow)
- Cleaner to remove than maintain unused component
- Reduces bundle size and maintenance burden

**Why use formatCurrency instead of custom formatting?**
- Built-in Intl.NumberFormat handles all edge cases
- Supports all currencies automatically
- Handles locale-specific formatting
- Already implemented and tested

**Why explicit backgrounds on containers?**
- Prevents CSS inheritance issues
- Makes layout more predictable
- Easier to debug visual issues
- Material Design 3 best practice (explicit surface tones)

### Performance Impact
- **Bundle size:** -2KB (removing MobileBottomNav component)
- **Runtime:** No change (formatCurrency already used elsewhere)
- **Render:** Slightly faster (fewer components in tree)

### Browser Compatibility
All fixes use standard CSS and React patterns. Compatible with:
- iOS Safari 14+
- Chrome Mobile 90+
- Firefox Mobile 90+
- Samsung Internet 14+

---

## Handoff to Coder

### Files to Modify (Summary)
1. `app/page.tsx` - Remove bottom nav, adjust padding
2. `app/gift-card/[slug]/ProductDetailClient.tsx` - Remove bottom nav, adjust CTA position, adjust padding, add bg colors
3. `app/gift-card/[slug]/not-found.tsx` - Remove bottom nav
4. `app/checkout/page.tsx` - Remove bottom nav (3 places), adjust padding
5. `components/product/AmountSelector.tsx` - Fix currency display
6. `components/product/ProductHero.tsx` - Fix logo container background
7. `components/layout/MobileBottomNav.tsx` - DELETE FILE

### Verification Commands
```bash
# Verify no remaining MobileBottomNav references
grep -r "MobileBottomNav" --include="*.tsx" --include="*.ts"

# Should return: no results (or only in deleted file)

# Test currency formatting
npm run dev
# Open http://localhost:3000
# Select any product
# Change currency selector
# Verify prices update immediately

# Build for production
npm run build
# Should complete without errors

# Deploy
vercel --prod --yes
```

### Common Pitfalls to Avoid
❌ Don't just hide bottom nav with CSS (remove it completely)  
❌ Don't forget to update sticky CTA position (bottom-16 → bottom-0)  
❌ Don't hardcode any currency symbols (use formatCurrency)  
❌ Don't forget to test all 7 currencies  
❌ Don't forget to remove the actual component file  

✅ Do remove imports  
✅ Do remove JSX elements  
✅ Do adjust spacing/positioning  
✅ Do test on real mobile device  
✅ Do verify on production URL  

---

## Questions for Product Owner

1. **Bottom nav removal confirmed?**
   - Are there any future plans for Cart/Account pages?
   - Should we keep the component file for future use?

2. **Currency conversion strategy?**
   - Are prices fixed per currency or converted in real-time?
   - Should we show approximate conversions in other currencies?

3. **Dark area specifics?**
   - Can you provide screenshot showing exact location?
   - Is it visible on all products or specific ones?
   - Does it appear on all mobile devices or specific models?

---

**END OF SPECIFICATION**
