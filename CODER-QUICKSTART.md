# CODER Quick Start Guide

**Project:** GIFTED - Premium Gift Card Marketplace  
**Tech:** Next.js 14, TypeScript, Tailwind, Framer Motion, Playwright  
**Status:** Architecture complete, ready for implementation  

---

## What You're Building

A production-grade, mobile-first gift card marketplace with:
- Country-specific product catalog
- Search and category filtering
- "For Me" vs "Send as Gift" flows
- Guest checkout (primary path)
- Mocked integrations (Reloadly + Lemon Squeezy) with clear swap boundaries
- Premium design matching provided references

**Design Philosophy:** Architectural Ledger aesthetic (Swiss minimalism, heavy typography, tonal layering, no borders/gradients)

---

## Critical Resources

1. **Full Architecture:** `/Users/administrator/.openclaw/workspace/gifted-project/ARCHITECTURE.md` (69KB - read this first)
2. **Integration Guide:** `/Users/administrator/.openclaw/workspace/gifted-project/INTEGRATION-GUIDE.md`
3. **Design System:** `/Users/administrator/.openclaw/workspace/gifted-project/design-refs/desktop_flow/stitch/slate_cobalt_premium/DESIGN.md`
4. **Design References:**
   - Desktop: `/Users/administrator/.openclaw/workspace/gifted-project/design-refs/desktop_flow/stitch/`
   - Mobile: `/Users/administrator/.openclaw/workspace/gifted-project/design-refs/mobile_flow/stitch/`

---

## Project Structure (Verbatim from ARCHITECTURE.md)

```
gifted-project/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Home/Browse
│   │   ├── gift-card/[slug]/page.tsx # Product detail
│   │   ├── checkout/page.tsx
│   │   ├── success/page.tsx
│   │   └── auth/verify/page.tsx
│   ├── components/
│   │   ├── layout/                   # Header, Footer, MobileBottomNav
│   │   ├── country/                  # CountrySelector, CountryModal
│   │   ├── search/                   # SearchBar
│   │   ├── products/                 # ProductCard, ProductGrid, CategoryChips
│   │   ├── product-detail/           # AmountSelector, DeliveryMethodToggle, RecipientForm
│   │   ├── checkout/                 # OrderSummary, CheckoutForm, PaymentSection
│   │   ├── success/                  # SuccessSummary
│   │   └── ui/                       # Button, Input, TextArea, Badge, Card
│   ├── lib/
│   │   ├── giftcards/                # Types, mock-data, service, reloadly-adapter
│   │   ├── payments/                 # Types, mock-checkout, lemon-squeezy-adapter
│   │   ├── orders/                   # Types, service
│   │   ├── countries/                # Types, data
│   │   └── utils/                    # cn, currency, validation
│   ├── hooks/                        # useCountry, useCart, useBreakpoint
│   ├── context/                      # CountryContext, CartContext
│   └── styles/
│       └── globals.css               # Tailwind + design tokens
├── tests/
│   └── e2e/                          # Playwright tests
├── public/
│   ├── brand-logos/
│   └── flags/
├── playwright.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Implementation Phases (Start → Finish)

### Phase 1: Foundation (Days 1-2)
**Goal:** Skeleton with design system

1. Initialize Next.js 14 with TypeScript:
```bash
npx create-next-app@latest gifted --typescript --tailwind --app --no-src
cd gifted
```

2. Install dependencies:
```bash
npm install framer-motion lucide-react clsx tailwind-merge react-hook-form @hookform/resolvers zod date-fns
npm install -D @playwright/test
```

3. Set up folder structure (see above)

4. **CRITICAL:** Implement design tokens in `globals.css` (from ARCHITECTURE.md section "Design System Token Reference")
   - Copy ALL CSS custom properties (colors, typography, spacing, radius)
   - Add `@layer base` for typography classes (`.display-lg`, `.headline-sm`, etc.)

5. Configure `tailwind.config.ts`:
   - Add design token references
   - Configure font families (Archivo Black/ExtraBold, Inter)

6. Build UI primitives (`components/ui/`):
   - Button (4 variants: primary, secondary, outline, ghost)
   - Input (with focus/error states)
   - TextArea (with character count)
   - Badge (4 variants)
   - Card (simple wrapper)

7. Create layout components:
   - Header (desktop nav)
   - Footer (simple)
   - MobileBottomNav (4 tabs)

**Deliverable:** Runnable app with styled primitives, empty pages rendering

---

### Phase 2: Data Layer (Days 3-4)
**Goal:** Mocked data + state management

1. **Create types:**
   - `lib/countries/types.ts` (Country, Currency)
   - `lib/giftcards/types.ts` (GiftCardProduct, DenominationType, etc.)
   - `lib/orders/types.ts` (Order, OrderStatus, DeliveryMethod, etc.)
   - `lib/payments/types.ts` (CheckoutSession, PaymentResult)

2. **Create mock data:**
   - `lib/countries/data.ts` (at least 5 countries: US, UK, CA, AU, SE with flags, currencies)
   - `lib/giftcards/mock-data.ts` (at least 20 products across categories: Amazon, Nike, Starbucks, Netflix, Spotify, etc.)

3. **Create adapters (MOCKED):**
   - `lib/giftcards/reloadly-adapter.ts` (filter mock data by country)
   - `lib/payments/lemon-squeezy-adapter.ts` (return fake session)
   - **Add TODO comments everywhere** (see ARCHITECTURE.md section 5.1-5.2 for exact comments)

4. **Create services:**
   - `lib/giftcards/service.ts` (getProducts, searchProducts, getCategoryFilters)
   - `lib/orders/service.ts` (createDraftOrder, getOrderById, updateOrderStatus)

5. **Create contexts:**
   - `context/CountryContext.tsx` (selectedCountry state + localStorage persistence)
   - `context/CartContext.tsx` (currentOrder state + sessionStorage persistence)

6. **Create hooks:**
   - `hooks/useCountry.ts`
   - `hooks/useCart.ts`
   - `hooks/useBreakpoint.ts`

**Deliverable:** Data layer complete, contexts working, mock data populating

---

### Phase 3: Country Selection (Days 4-5)
**Goal:** Functional country picker

1. **Build CountrySelector component:**
   - Pill button with flag emoji + country name + currency
   - Hover state (background shift)
   - Click opens CountryModal

2. **Build CountryModal component:**
   - Desktop: Centered modal (480px max-width)
   - Mobile: Full-screen modal
   - Search input (filters list)
   - Country list (flag + name + currency)
   - Click country → Select + close
   - Escape key → Close

3. **Wire up Header:**
   - Desktop: Show CountrySelector in header
   - Mobile: Show in MobileBottomNav

4. **Persist selection:**
   - Save to localStorage on change
   - Restore on app load

**Deliverable:** Country selection fully functional, persists across page loads

---

### Phase 4: Browse Page (Days 5-7)
**Goal:** Product discovery with search/filter

1. **Build SearchBar component:**
   - Input with search icon
   - Debounced onChange (300ms)
   - Clear button when text exists

2. **Build CategoryChips component:**
   - Horizontal scrollable row
   - "All" chip + dynamic category chips
   - Active state (primary-container background)
   - Click chip → Filter products

3. **Build ProductCard component:**
   - Brand logo (centered, 80x80px)
   - Brand name (headline-sm, Archivo ExtraBold)
   - Category badge (label-xs, uppercase)
   - Price range (body-sm)
   - Hover animation (desktop): scale(1.02) + ambient shadow

4. **Build ProductGrid component:**
   - Responsive grid (2/3/4 columns)
   - Gap: 24px desktop, 16px mobile

5. **Build EmptyState component:**
   - Icon + headline + description + action button
   - Show when no results

6. **Wire up Browse page (`app/page.tsx`):**
   - Load products for selected country
   - Implement search (debounced)
   - Implement category filter
   - Show loading state
   - Show empty state if no results

7. **Add trust section:**
   - Simple section with badges (Instant, Secure, Support)

**Deliverable:** Functional browse page, search/filter working, responsive

---

### Phase 5: Product Detail (Days 7-9)
**Goal:** Product configuration + order creation

1. **Build ProductInfo component:**
   - Product logo (120x120px)
   - Brand name (display-sm, Archivo Black)
   - Country badge
   - "Digital Delivery" label
   - Description
   - Trust badges

2. **Build AmountSelector component:**
   - **Fixed denominations:** Grid of amount chips (selected = secondary background)
   - **Range:** Input field with currency symbol, min/max labels, validation

3. **Build DeliveryMethodToggle component:**
   - Two large toggle buttons (For Me / Send as Gift)
   - Selected: secondary background
   - Smooth transition (150ms)

4. **Build RecipientForm component:**
   - Slide-down animation when "Send as Gift" selected
   - Email input (required, validated)
   - Message textarea (optional, max 300 chars, show char count)

5. **Build OrderSummary component:**
   - Desktop: Sticky sidebar
   - Mobile: Sticky bottom (collapsible)
   - Show: Product, Amount, Service Fee, Total
   - Primary CTA: "Continue as Guest"
   - Secondary CTA: "Sign In"

6. **Wire up Product Detail page (`app/gift-card/[slug]/page.tsx`):**
   - Load product by slug
   - Handle amount selection
   - Handle delivery method toggle
   - Show/hide RecipientForm
   - Form validation (React Hook Form + Zod)
   - "Continue as Guest" → Create draft order → Navigate to /checkout

**Deliverable:** Product detail page functional, order creation working

---

### Phase 6: Checkout (Days 9-10)
**Goal:** Checkout page with mock payment

1. **Build CheckoutForm component:**
   - Customer email input
   - "Subscribe to deals" checkbox
   - Order review section

2. **Build PaymentSection component:**
   - Placeholder UI (credit card icon + text)
   - "Continue to Payment" button
   - **Add TODO comment** (see ARCHITECTURE.md section 6.5)

3. **Build TrustBadges component:**
   - Horizontal row of badges (Shield, Zap, Lock icons)

4. **Wire up Checkout page (`app/checkout/page.tsx`):**
   - Load order from CartContext
   - Show OrderSummary (same component from product detail)
   - Show CheckoutForm
   - Show PaymentSection
   - "Continue to Payment" → Mock payment processing (1.5s delay) → Navigate to /success?order_id=XXX

**Deliverable:** Checkout page functional, mock payment flow working

---

### Phase 7: Success Page (Days 10-11)
**Goal:** Polished success confirmation

1. **Build SuccessSummary component:**
   - Green checkmark icon (animated SVG path draw)
   - Headline: "Gift card delivered!"
   - Order ID
   - Product summary (logo + name + amount)
   - Recipient email (if gift)
   - Next steps buttons ("Buy Another" + "View Order Details")

2. **Wire up Success page (`app/success/page.tsx`):**
   - Load order by ID from query param
   - Show loading state while loading
   - Show error state if order not found
   - Render SuccessSummary

3. **Add animations:**
   - Page entrance: fade in + scale
   - Checkmark: SVG path draw (600ms)

**Deliverable:** Success page functional, animations smooth

---

### Phase 8: Animations & Polish (Days 11-12)
**Goal:** Add tasteful micro-animations

1. **Add animations (Framer Motion):**
   - Page entrances (all pages)
   - Button press feedback (scale 0.98 on tap)
   - Card hover (desktop)
   - Modal entrance/exit
   - Sticky element appearance
   - Category chip selection
   - Loading spinner

2. **Polish responsive behaviors:**
   - Test all breakpoints (390px, 768px, 1024px, 1280px)
   - Verify sticky elements work on mobile
   - Verify touch targets are 44x44px minimum
   - Verify text is readable on all screen sizes

3. **Add loading states:**
   - Page transitions
   - Data fetching
   - Form submission

4. **Add error states:**
   - Network errors
   - Validation errors
   - Empty states

**Deliverable:** Polished UX with smooth animations, no jank

---

### Phase 9: Testing (Days 12-14)
**Goal:** Playwright tests + visual regression

1. **Set up Playwright:**
```bash
npx playwright install
```

2. **Configure `playwright.config.ts`:**
   - Copy config from ARCHITECTURE.md section 12.1
   - Set up 3 projects: Desktop Chrome, Mobile Safari, Tablet

3. **Write interaction tests:**
   - `tests/e2e/home.spec.ts` (country selection, search, filter)
   - `tests/e2e/product-detail.spec.ts` (amount selection, delivery method)
   - `tests/e2e/checkout.spec.ts` (full flow: browse → configure → checkout → success)

4. **Write visual regression tests:**
   - `tests/e2e/visual/desktop.spec.ts` (screenshot all key pages)
   - `tests/e2e/visual/mobile.spec.ts` (screenshot all key pages)

5. **Generate baseline screenshots:**
```bash
npx playwright test --update-snapshots
```

6. **Compare against design references:**
   - Open design reference PNGs in one window
   - Open Playwright screenshots in another
   - Compare manually (spacing, typography, colors, hierarchy)
   - Iterate on discrepancies

7. **Run full test suite:**
```bash
npx playwright test
```

**Deliverable:** All tests passing, visual regression within 20% threshold

---

### Phase 10: Documentation (Day 14)
**Goal:** Production-ready README

1. **Write README.md:**
   - Project overview
   - Tech stack
   - Getting started (install, run dev, run tests)
   - Project structure
   - Design system overview
   - Mock integration boundaries
   - How to swap to real integrations (link to INTEGRATION-GUIDE.md)
   - Deployment guide
   - Known limitations

2. **Document env variables:**
```bash
# .env.example
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GIFTED

# Future integrations (currently mocked)
# RELOADLY_CLIENT_ID=
# RELOADLY_CLIENT_SECRET=
# RELOADLY_API_URL=
# LEMON_SQUEEZY_API_KEY=
# LEMON_SQUEEZY_STORE_ID=
# LEMON_SQUEEZY_WEBHOOK_SECRET=
```

**Deliverable:** Complete README, project ready for handoff

---

## Design System Quick Reference

### Colors (Use CSS Custom Properties)

```css
/* Primary Navy */
--primary: #0F172A
--on-primary: #FFFFFF

/* Secondary Blue (CTAs) */
--secondary: #0051D5
--on-secondary: #FFFFFF

/* Success Green */
--tertiary: #009842
--tertiary-fixed-dim: #62DF7D

/* Error Red */
--error: #DC2626

/* Surface Hierarchy (NO BORDERS - use background shifts) */
--surface: #F7F9FB                     /* Page background */
--surface-container-lowest: #FFFFFF    /* Cards */
--surface-container-low: #F2F4F6       /* Nested elements */
--surface-container: #ECEEF0           /* Search bars, inputs */
--surface-container-high: #E6E8EA      /* Pill buttons */
```

### Typography (Classes)

```css
/* Headlines - Archivo Black/ExtraBold */
.display-lg   /* 57px, -0.02em tracking */
.display-md   /* 45px */
.display-sm   /* 36px */
.headline-lg  /* 32px */
.headline-md  /* 28px */
.headline-sm  /* 24px */

/* Body/UI - Inter */
.title-lg     /* 22px, Semi-Bold */
.body-md      /* 16px, Regular */
.label-md     /* 14px, Medium */
.label-sm     /* 13px, Medium */
.label-xs     /* 12px, Semi-Bold, UPPERCASE */
```

### Spacing (8pt Grid)

```css
--spacing-4: 1rem     /* 16px - Base padding */
--spacing-6: 1.5rem   /* 24px - Card padding */
--spacing-8: 2rem     /* 32px - Section spacing */
```

### Border Radius

```css
--radius-md: 0.75rem   /* 12px - Buttons, inputs */
--radius-lg: 1rem      /* 16px - Cards */
--radius-full: 9999px  /* Pills */
```

### Shadow (Use Sparingly)

```css
--ambient-shadow: 0px 12px 32px rgba(15, 23, 42, 0.06)
```

Only use for:
- Floating overlays (modals, dropdowns)
- Card hover on desktop

**NEVER use for:**
- Resting cards
- Section separation (use background shift instead)

---

## Critical Implementation Rules

### ❌ DON'T
- Use 1px borders for section separation (use background color shifts)
- Use gradients, glassmorphism, or blurs
- Use shadows on resting cards
- Use Archivo for body text (too heavy)
- Make up data - use provided mock data structure
- Implement real integrations - keep mocked with TODO comments

### ✅ DO
- Use tonal layering (surface → surface-container-lowest → surface-container)
- Use Archivo for headlines only
- Use Inter for body and UI
- Add tasteful micro-animations (150-400ms, ease-out)
- Add `data-testid` attributes to all interactive elements
- Leave explicit TODO comments at integration boundaries
- Match design references EXACTLY (spacing, typography, hierarchy)

---

## Data Test IDs (Add to Components)

```typescript
// Standard test IDs for Playwright
data-testid="country-selector"
data-testid="country-modal"
data-testid="search-input"
data-testid="category-chip-{categoryId}"
data-testid="product-card-{slug}"
data-testid="amount-{value}"
data-testid="delivery-for-me"
data-testid="delivery-send-gift"
data-testid="recipient-email"
data-testid="customer-email"
data-testid="continue-as-guest"
data-testid="order-summary"
data-testid="success-headline"
```

---

## Mock Data Structure Examples

### Country Example
```typescript
{
  code: 'US',
  name: 'United States',
  flagEmoji: '🇺🇸',
  currency: {
    code: 'USD',
    symbol: '$',
    decimals: 2
  },
  locale: 'en-US'
}
```

### Gift Card Product Example
```typescript
{
  id: 'amazon-us',
  slug: 'amazon-us',
  brandName: 'Amazon',
  description: 'Shop millions of products on Amazon.com',
  logoUrl: '/brand-logos/amazon.png',
  categories: ['retail', 'electronics'],
  availableCountries: ['US', 'UK', 'CA'],
  denominationType: 'FIXED',
  fixedDenominations: [25, 50, 100, 200],
  currency: 'USD',
  serviceFeePercent: 5.5,
  deliveryType: 'DIGITAL',
  redemptionInstructions: 'Enter code at checkout on Amazon.com'
}
```

---

## Key Files to Reference

1. **ARCHITECTURE.md** - Full technical spec (read sections 4-9 carefully)
2. **INTEGRATION-GUIDE.md** - How to swap mocks for real APIs
3. **Design references** - Visual source of truth (match these EXACTLY)

---

## Communication with TESTER

When you complete each phase:
1. Commit changes to git
2. Notify TESTER agent
3. TESTER will run Playwright tests
4. TESTER will report visual discrepancies
5. Iterate until tests pass

**DO NOT MOVE TO NEXT PHASE UNTIL CURRENT PHASE PASSES TESTING**

---

## Emergency Contacts

If stuck on:
- **Design system implementation** → Re-read DESIGN.md and ARCHITECTURE.md section "Design System Token Reference"
- **Component structure** → Reference ARCHITECTURE.md section 6 (Component Specifications)
- **Data models** → Reference ARCHITECTURE.md section 4 (Data Models & Schemas)
- **Integration boundaries** → Reference INTEGRATION-GUIDE.md
- **Testing** → Reference ARCHITECTURE.md section 12 (Testing Strategy)

---

## Success Criteria

Before considering the project complete:
- [ ] All pages render without errors
- [ ] Country selection persists across sessions
- [ ] Search and filter work correctly
- [ ] Full checkout flow completes (browse → configure → checkout → success)
- [ ] Mobile and desktop layouts match design references
- [ ] All Playwright tests pass
- [ ] Visual regression within 20% threshold
- [ ] No console errors or warnings
- [ ] All interactive elements have data-testid attributes
- [ ] All integration boundaries have TODO comments
- [ ] README is complete and accurate

---

**You have everything you need. Start with Phase 1. Build systematically. Match the design EXACTLY. Good luck!** 🔧
