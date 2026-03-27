# GIFTED - Implementation Checklist

**Use this checklist to track progress through implementation phases**

---

## Phase 1: Foundation (Days 1-2)

### Project Setup
- [ ] Initialize Next.js 14 with TypeScript: `npx create-next-app@latest gifted --typescript --tailwind --app`
- [ ] Install dependencies:
  ```bash
  npm install framer-motion lucide-react clsx tailwind-merge react-hook-form @hookform/resolvers zod date-fns
  npm install -D @playwright/test
  ```
- [ ] Create folder structure (as per ARCHITECTURE.md Section 3)
- [ ] Set up `.env.local` with placeholder environment variables

### Design System
- [ ] Implement CSS custom properties in `globals.css` (RESEARCH.md Section 1.2)
  - [ ] Color tokens (primary, surface hierarchy, secondary, tertiary, error, outline)
  - [ ] Spacing tokens (8pt grid: 1, 2, 3, 4, 6, 8, 12, 16)
  - [ ] Border radius tokens (sm, md, lg, full)
  - [ ] Shadow tokens (ambient shadow)
  - [ ] Typography classes (.display-lg, .headline-lg, .headline-sm, .title-lg, .body-lg, .body-md, .label-lg, .label-md, .label-sm)

- [ ] Configure `tailwind.config.ts` (RESEARCH.md Section 1.2)
  - [ ] Extend theme with color tokens
  - [ ] Extend spacing
  - [ ] Extend border radius
  - [ ] Extend box shadow
  - [ ] Add font families (Archivo, Inter)

- [ ] Load fonts in `app/layout.tsx`
  - [ ] Inter from Google Fonts
  - [ ] Archivo Black (local or Google Fonts)
  - [ ] Add `display: 'swap'` to prevent FOIT

### Basic Components (UI Primitives)
- [ ] `components/ui/Button.tsx` - Primary/secondary variants, loading state
- [ ] `components/ui/Input.tsx` - Text input with error states
- [ ] `components/ui/TextArea.tsx` - Multiline input
- [ ] `components/ui/Badge.tsx` - Category/status labels
- [ ] `components/ui/Card.tsx` - Product card container

### Testing Foundation
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Copy `playwright.config.ts` from RESEARCH.md Section 4.2
- [ ] Install browsers: `npx playwright install --with-deps`
- [ ] Create test directory structure: `tests/e2e/`, `tests/e2e/visual/`

**Success Criteria:**
- [ ] `npm run dev` starts without errors
- [ ] Design tokens accessible via Tailwind classes (`bg-primary`, `text-on-primary`, etc.)
- [ ] Typography classes working (`.display-lg`, `.headline-sm`, etc.)
- [ ] Fonts loading correctly (no FOIT)

---

## Phase 2: Data Layer (Days 3-4)

### Type Definitions
- [ ] `lib/countries/types.ts` - Country, Currency interfaces
- [ ] `lib/giftcards/types.ts` - GiftCardProduct, DenominationType, CategoryFilter
- [ ] `lib/orders/types.ts` - Order, OrderItem, RecipientInfo, OrderStatus
- [ ] `lib/payments/types.ts` - CheckoutSession, PaymentResult

### Mock Data
- [ ] `lib/countries/data.ts` - List of countries with flags, currencies
- [ ] `lib/giftcards/mock-data.ts` - 15-20 mocked gift card products
  - [ ] At least 3 brands per category (Retail, Entertainment, Food, Travel)
  - [ ] Mix of FIXED and RANGE denomination types
  - [ ] Multiple countries represented (US, CA, GB, DE, AU)

### Service Layer
- [ ] `lib/giftcards/service.ts`
  - [ ] `getGiftCardsByCountry(countryCode: string)`
  - [ ] `getGiftCardBySlug(slug: string)`
  - [ ] `searchGiftCards(query: string, countryCode: string)`
  - [ ] `getCategories(countryCode: string)`

- [ ] `lib/orders/service.ts`
  - [ ] `createOrder(data: CreateOrderData)`
  - [ ] `getOrderById(orderId: string)`
  - [ ] `updateOrderStatus(orderId: string, status: OrderStatus)`

### Adapter Stubs (with TODO comments)
- [ ] `lib/giftcards/reloadly-adapter.ts`
  - [ ] Mocked `getAccessToken()` with TODO comment
  - [ ] Mocked `getGiftCardsByCountry()` with TODO comment
  - [ ] Mocked `getGiftCardByProductId()` with TODO comment

- [ ] `lib/payments/lemon-squeezy-adapter.ts`
  - [ ] Mocked `createCheckoutSession()` with TODO comment
  - [ ] Mocked `verifyWebhook()` with TODO comment

### Context Providers
- [ ] `context/CountryContext.tsx` - Selected country state
- [ ] `context/CartContext.tsx` - Current order state

### Custom Hooks
- [ ] `hooks/useCountry.ts` - Access/update selected country
- [ ] `hooks/useCart.ts` - Access/update cart state
- [ ] `hooks/useBreakpoint.ts` - Detect responsive breakpoint

**Success Criteria:**
- [ ] Mock data returns realistic gift card products
- [ ] Service layer functions return typed data
- [ ] Context providers accessible in components
- [ ] TODO comments clearly mark integration boundaries

---

## Phase 3: Country Selection (Days 4-5)

### Components
- [ ] `components/country/CountrySelector.tsx` - Pill button in header
  - [ ] Shows flag emoji + country name + currency code
  - [ ] Opens CountryModal on click
  - [ ] Persists selection (localStorage or context)

- [ ] `components/country/CountryModal.tsx` - Modal with country list
  - [ ] Searchable list of countries
  - [ ] Displays flag, country name, currency
  - [ ] Click to select, closes modal
  - [ ] Accessible (focus trap, Esc to close, ARIA attributes)

### Integration
- [ ] Country selection updates available products (filters mock data)
- [ ] Currency displays correctly throughout app
- [ ] Mobile-friendly modal (full-screen on mobile)

### Testing
- [ ] Interaction test: Open modal, search country, select, verify selection persists
- [ ] Accessibility test: Keyboard navigation (Tab, Enter, Esc)
- [ ] Visual regression: Desktop modal, mobile modal

**Success Criteria:**
- [ ] Country selector visible in header on all pages
- [ ] Modal accessible via keyboard
- [ ] Selection persists across page navigation
- [ ] Products filtered by selected country

---

## Phase 4: Browse Page (Days 5-7)

### Layout Components
- [ ] `components/layout/Header.tsx`
  - [ ] Brand wordmark ("GIFTED")
  - [ ] Country selector
  - [ ] Navigation links (Browse, Deals, My Cards)
  - [ ] Help and Cart icons
  - [ ] Sticky on scroll (desktop)

- [ ] `components/layout/Footer.tsx`
  - [ ] Links (About, Terms, Privacy, Contact)
  - [ ] Trust badges
  - [ ] Copyright notice

- [ ] `components/layout/MobileBottomNav.tsx`
  - [ ] Icons for Home, Search, Orders, Profile
  - [ ] Active state highlighting
  - [ ] Sticky bottom positioning

### Browse Page Components
- [ ] `components/search/SearchBar.tsx`
  - [ ] Search input with icon
  - [ ] Debounced search (300ms)
  - [ ] Clear button
  - [ ] Mobile-optimized (large tap target)

- [ ] `components/products/CategoryChips.tsx`
  - [ ] Horizontal scrollable chip list
  - [ ] Active state styling
  - [ ] Click to filter products
  - [ ] Smooth scroll animation

- [ ] `components/products/ProductCard.tsx`
  - [ ] Brand logo (Image component with optimization)
  - [ ] Product name
  - [ ] Category badge
  - [ ] Price range or "From $X"
  - [ ] Hover animation (y: -4, transition 200ms)
  - [ ] Click navigates to product detail

- [ ] `components/products/ProductGrid.tsx`
  - [ ] Responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
  - [ ] Gap spacing (6 or 8)
  - [ ] Empty state when no products

- [ ] `components/products/EmptyState.tsx`
  - [ ] Icon and message
  - [ ] "Try different country" CTA

### Page Implementation
- [ ] `app/page.tsx` (Home/Browse)
  - [ ] Hero section with headline
  - [ ] SearchBar
  - [ ] CategoryChips
  - [ ] ProductGrid with filtered products
  - [ ] Trust section (optional)
  - [ ] Footer

### Functionality
- [ ] Search filters products by brand name
- [ ] Category chips filter products by category
- [ ] Products update when country changes
- [ ] Responsive layout (mobile, tablet, desktop)

### Testing
- [ ] Interaction test: Search products, filter by category
- [ ] Visual regression: Desktop home, mobile home
- [ ] Performance test: LCP < 2.5s

**Success Criteria:**
- [ ] Browse page matches design reference (`1._browse_home_gifted/screen.png`)
- [ ] Search and filter work correctly
- [ ] Responsive on all breakpoints
- [ ] No layout shift on load

---

## Phase 5: Product Detail (Days 7-9)

### Components
- [ ] `components/product-detail/ProductInfo.tsx`
  - [ ] Brand logo
  - [ ] Product name (headline-lg)
  - [ ] Country badge
  - [ ] "Digital Delivery" label
  - [ ] Description
  - [ ] Terms link

- [ ] `components/product-detail/AmountSelector.tsx`
  - [ ] For FIXED: Grid of denomination chips
  - [ ] For RANGE: Custom amount input with min/max validation
  - [ ] Active state styling
  - [ ] Error message for out-of-range amounts

- [ ] `components/product-detail/DeliveryMethodToggle.tsx`
  - [ ] Two options: "For Me" / "Send as Gift"
  - [ ] Toggle button style
  - [ ] Active state highlighting

- [ ] `components/product-detail/RecipientForm.tsx`
  - [ ] Recipient email input (required if "Send as Gift")
  - [ ] Gift message textarea (optional, max 200 chars)
  - [ ] React Hook Form + Zod validation
  - [ ] Error messages below fields

- [ ] `components/checkout/OrderSummary.tsx`
  - [ ] Product name
  - [ ] Selected amount
  - [ ] Service fee (calculated)
  - [ ] Total
  - [ ] Currency
  - [ ] Primary CTA: "Continue as Guest"
  - [ ] Secondary CTA: "Sign In"
  - [ ] Sticky sidebar (desktop) / sticky bottom (mobile)

### Page Implementation
- [ ] `app/gift-card/[slug]/page.tsx`
  - [ ] Fetch product by slug (server component)
  - [ ] ProductInfo section
  - [ ] AmountSelector
  - [ ] DeliveryMethodToggle
  - [ ] RecipientForm (conditional)
  - [ ] OrderSummary (sticky)
  - [ ] Handle form submission → navigate to /checkout

### Form Validation
- [ ] Email validation (React Hook Form + Zod)
- [ ] Amount validation (within min/max for RANGE)
- [ ] Required field validation
- [ ] Conditional validation (recipientEmail required if "Send as Gift")

### Testing
- [ ] Interaction test: Select amount, toggle delivery method, submit form
- [ ] Visual regression: Desktop product detail, mobile product detail
- [ ] Form validation test: Empty email, invalid email, out-of-range amount

**Success Criteria:**
- [ ] Product detail page matches design reference (`3._product_detail_checkout_gifted/screen.png`)
- [ ] Form validation works correctly
- [ ] Order summary calculates total correctly
- [ ] "Continue as Guest" is visually dominant

---

## Phase 6: Checkout (Days 9-10)

### Components
- [ ] `components/checkout/CheckoutForm.tsx`
  - [ ] Customer email input
  - [ ] Order review section
  - [ ] Recipient summary (if gift)
  - [ ] PaymentSection (mocked)
  - [ ] Terms checkbox
  - [ ] Submit button (disabled while processing)

- [ ] `components/checkout/PaymentSection.tsx`
  - [ ] Placeholder for Lemon Squeezy checkout
  - [ ] "Payment will be processed by Lemon Squeezy" message
  - [ ] Trust badges (secure checkout, etc.)

- [ ] `components/checkout/TrustBadges.tsx`
  - [ ] Security icons/text
  - [ ] "256-bit encryption" or similar

### Page Implementation
- [ ] `app/checkout/page.tsx`
  - [ ] Fetch order from context/state
  - [ ] CheckoutForm
  - [ ] OrderSummary (sticky)
  - [ ] Handle submit → Create checkout session (mocked)
  - [ ] Redirect to mock success or real Lemon Squeezy URL

### Mock Payment Flow
- [ ] `lib/payments/mock-checkout.ts`
  - [ ] `mockCreateCheckout()` - Returns mock checkout URL
  - [ ] Simulate 500ms delay
  - [ ] Leave TODO comment for Lemon Squeezy swap

- [ ] Mock success handler
  - [ ] Update order status to PAID
  - [ ] Navigate to `/success?order={orderId}`

### Form Validation
- [ ] Customer email validation
- [ ] Terms checkbox validation (must be checked)

### Testing
- [ ] Interaction test: Submit checkout, verify redirect to success
- [ ] Visual regression: Desktop checkout, mobile checkout
- [ ] Form validation test: Empty email, unchecked terms

**Success Criteria:**
- [ ] Checkout page matches design reference (`payment_checkout_gifted/screen.png`)
- [ ] Mock payment flow completes successfully
- [ ] TODO comments clearly mark Lemon Squeezy integration points
- [ ] Order summary updates correctly

---

## Phase 7: Success Page (Days 10-11)

### Components
- [ ] `components/success/SuccessSummary.tsx`
  - [ ] Success icon/checkmark animation (Framer Motion)
  - [ ] "Order Complete!" headline
  - [ ] Order ID
  - [ ] Product name
  - [ ] Amount
  - [ ] Recipient email (if gift)
  - [ ] Delivery method
  - [ ] "What's next" section
  - [ ] CTA: "Buy Another Gift Card"
  - [ ] CTA: "View My Orders" (optional)

### Page Implementation
- [ ] `app/success/page.tsx`
  - [ ] Fetch order by ID from URL params
  - [ ] SuccessSummary
  - [ ] Trust/info section (how to redeem, support, etc.)

### Animations
- [ ] Success checkmark path animation (RESEARCH.md Section 6.3)
- [ ] Fade-in page entrance (300ms)
- [ ] Stagger animation for order details

### Testing
- [ ] Visual regression: Desktop success, mobile success
- [ ] Animation test: Verify checkmark animates smoothly

**Success Criteria:**
- [ ] Success page matches design reference (`4._success_confirmation_gifted/screen.png`)
- [ ] Success animation feels premium (not cheesy)
- [ ] Order details displayed accurately
- [ ] Clear next steps for user

---

## Phase 8: Animations (Days 11-12)

### Micro-Animations
- [ ] Button press feedback (scale: 0.98, 100ms)
- [ ] Card hover elevation (y: -4, 200ms easeOut)
- [ ] Modal entrance/exit (opacity + scale, 200ms)
- [ ] Page transitions (opacity + y, 300ms easeOut)
- [ ] Category chip selection (background color, 150ms)
- [ ] Input focus (border color, 200ms)
- [ ] Loading spinner (rotate animation)

### Scroll Animations (Optional)
- [ ] Fade-in sections on scroll (trust section, footer)
- [ ] Use `useInView` hook from Framer Motion

### Performance Check
- [ ] All animations < 400ms duration
- [ ] No janky scrolling or layout shift
- [ ] Animations use `transform` and `opacity` only (GPU-accelerated)

**Success Criteria:**
- [ ] Animations feel premium, not gimmicky
- [ ] No performance degradation
- [ ] Tasteful, restrained motion throughout

---

## Phase 9: Testing (Days 12-14)

### Playwright Tests

**Interaction Tests:**
- [ ] `tests/e2e/home.spec.ts`
  - [ ] Search products
  - [ ] Filter by category
  - [ ] Click product card → navigate to detail

- [ ] `tests/e2e/product-detail.spec.ts`
  - [ ] Select amount
  - [ ] Toggle delivery method
  - [ ] Fill recipient form (if gift)
  - [ ] Submit → navigate to checkout

- [ ] `tests/e2e/checkout.spec.ts`
  - [ ] Fill customer email
  - [ ] Check terms checkbox
  - [ ] Submit → navigate to success

- [ ] `tests/e2e/country-selection.spec.ts`
  - [ ] Open country modal
  - [ ] Search country
  - [ ] Select country → products update

**Visual Regression Tests:**
- [ ] `tests/e2e/visual/desktop.spec.ts`
  - [ ] Home page
  - [ ] Product detail page
  - [ ] Checkout page
  - [ ] Success page

- [ ] `tests/e2e/visual/mobile.spec.ts`
  - [ ] Home page
  - [ ] Product detail page
  - [ ] Checkout page
  - [ ] Success page

**Accessibility Tests:**
- [ ] Lighthouse audit (Performance 90+, Accessibility 95+)
- [ ] Keyboard navigation test (Tab through entire app)
- [ ] Screen reader test (VoiceOver on macOS)
- [ ] Color contrast test (all text readable)

### Bug Fixes
- [ ] Address any failing tests
- [ ] Fix visual regressions
- [ ] Improve accessibility issues

**Success Criteria:**
- [ ] All Playwright tests passing
- [ ] Visual regression tests within 20% threshold
- [ ] Lighthouse scores meet targets
- [ ] No critical accessibility issues

---

## Phase 10: Documentation (Day 14)

### README.md
- [ ] Project overview
- [ ] Tech stack
- [ ] Installation instructions
- [ ] Development commands (`npm run dev`, `npm run build`, `npm run test`)
- [ ] Environment variables setup
- [ ] Mock data vs real integration explanation
- [ ] Integration swap guide (link to INTEGRATION-GUIDE.md)

### Code Documentation
- [ ] Add JSDoc comments to service functions
- [ ] Add TODO comments at all integration boundaries
- [ ] Add inline comments for complex logic

### Deployment Prep
- [ ] Create `.env.example` with placeholder values
- [ ] Add `.gitignore` entries (`.env.local`, `.next`, `node_modules`, `test-results`)
- [ ] Verify build succeeds: `npm run build`

**Success Criteria:**
- [ ] README is clear and complete
- [ ] New developer can clone, install, and run project
- [ ] Integration swap guide is actionable
- [ ] Build succeeds without errors

---

## Final Checklist

### Quality Gates
- [ ] ✅ All pages match design references
- [ ] ✅ All Playwright tests passing
- [ ] ✅ Lighthouse Performance 90+
- [ ] ✅ Lighthouse Accessibility 95+
- [ ] ✅ No console errors or warnings
- [ ] ✅ Responsive on mobile, tablet, desktop
- [ ] ✅ Keyboard navigation works throughout
- [ ] ✅ Forms validate correctly
- [ ] ✅ Mock payment flow completes
- [ ] ✅ Country selection persists
- [ ] ✅ Search and filters work
- [ ] ✅ Animations are tasteful and performant

### Integration Readiness
- [ ] ✅ All TODO comments in place at swap points
- [ ] ✅ Mock data structure mirrors real API structure
- [ ] ✅ Adapter pattern implemented correctly
- [ ] ✅ Environment variables documented
- [ ] ✅ INTEGRATION-GUIDE.md reviewed for completeness

### Documentation Complete
- [ ] ✅ README.md written
- [ ] ✅ `.env.example` created
- [ ] ✅ Code comments added where needed
- [ ] ✅ ARCHITECTURE.md accurate to implementation
- [ ] ✅ RESEARCH.md resources utilized

---

## Handoff to Integration Team

When ready to swap mocked integrations for real APIs:

1. **Reloadly Integration:**
   - Read INTEGRATION-GUIDE.md Part 1
   - Set up Reloadly account and get credentials
   - Replace mocked functions in `lib/giftcards/reloadly-adapter.ts`
   - Test with Reloadly sandbox before production

2. **Lemon Squeezy Integration:**
   - Read INTEGRATION-GUIDE.md Part 2
   - Set up Lemon Squeezy account and create product
   - Replace mocked functions in `lib/payments/lemon-squeezy-adapter.ts`
   - Implement webhook handler in `app/api/webhooks/lemon-squeezy/route.ts`
   - Test with Lemon Squeezy Test Mode

3. **Database Integration:**
   - Set up Postgres or other database
   - Implement order persistence
   - Replace in-memory mock data with DB queries

---

**Checklist Version:** 1.0  
**Last Updated:** 2026-03-26  
**Maintained by:** RESEARCHER Agent
