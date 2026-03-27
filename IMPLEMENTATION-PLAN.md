# Implementation Plan

5-day build schedule for production-ready GIFTED application.

---

## Day 1: Foundation & Layout (8 hours)

### Morning: Project Setup (2 hours)
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Install dependencies (Tailwind, Framer Motion, Lucide, RHF, Zod, Playwright)
- [ ] Configure `tailwind.config.ts` with design tokens
- [ ] Set up fonts (Archivo, Inter) in `app/layout.tsx`
- [ ] Create `styles/globals.css` with base styles
- [ ] Set up folder structure (components, lib, hooks, contexts)

**Deliverable:** Running Next.js app with design system configured

### Afternoon: Core Layout (3 hours)
- [ ] Implement `Header` component
  - Logo, nav links, country selector slot, cart icon
- [ ] Implement `Footer` component
  - Links, copyright, minimal design
- [ ] Implement `MobileBottomNav` component
  - Fixed bottom, 4 icons, active states
- [ ] Implement `AppContext` and `AppProvider`
  - Country selection state
  - Current order state
- [ ] Add providers to `app/layout.tsx`

**Deliverable:** Layout shell with navigation working

### Late Afternoon: Shared Components (3 hours)
- [ ] `Button` component (primary, secondary, sizes, states)
- [ ] `Input` component (text, email, number, validation styling)
- [ ] `CountrySelector` component with dropdown
  - Flag display, currency, animated dropdown
  - Click outside to close
- [ ] Mock country data in `lib/countries/data.ts`

**Deliverable:** Reusable UI components library

### Evening: Review & Test (1 hour)
- [ ] Visual QA against design references
- [ ] Test responsive behavior
- [ ] Ensure no console errors
- [ ] Commit: "Day 1: Foundation complete"

---

## Day 2: Home/Browse Experience (8 hours)

### Morning: Data Layer (2 hours)
- [ ] Create type definitions in `lib/giftcards/types.ts`
- [ ] Create mock data in `lib/giftcards/mock-data.ts`
  - 8-10 brands with realistic data
  - Multiple countries, currencies
- [ ] Implement `GiftCardService` in `lib/giftcards/service.ts`
  - Filtering by country, category, search
- [ ] Add brand logo placeholders to `public/brand-logos/`

**Deliverable:** Mock data layer with filtering

### Mid-Morning: Browse Components (3 hours)
- [ ] `HeroSection` component
  - Large headline, subtitle, whitespace
- [ ] `SearchBar` component
  - Large input, search icon, clear button
  - URL query sync
- [ ] `CategoryChips` component
  - Horizontal scroll, active states
  - URL query sync
- [ ] `ProductCard` component
  - Logo container, brand info, pricing
  - Hover animation, link to detail
- [ ] `ProductGrid` component
  - Responsive grid, empty state, loading state

**Deliverable:** Browse page components

### Afternoon: Home Page Assembly (2 hours)
- [ ] Build `app/page.tsx`
  - Compose HeroSection, SearchBar, CategoryChips, ProductGrid
  - Server-side data fetching
  - Connect to GiftCardService
- [ ] Test filtering (search, category, country)
- [ ] Add `TrustSection` component
  - Benefits, trust badges

**Deliverable:** Complete home page

### Late Afternoon: Polish & Testing (1 hour)
- [ ] Verify spacing matches 8pt grid
- [ ] Check typography (Archivo headlines, Inter body)
- [ ] Test mobile scroll behavior
- [ ] Playwright test for home page
- [ ] Compare with `design-refs/mobile_flow/stitch/1._browse_home_gifted/screen.png`
- [ ] Compare with `design-refs/desktop_flow/stitch/1._browse_home_mobile_gifted/screen.png`

**Deliverable:** Polished home page matching design refs

---

## Day 3: Product Detail & Pre-Checkout (8 hours)

### Morning: Product Page Components (3 hours)
- [ ] `ProductHero` component
  - Large logo, product name, badges
- [ ] `AmountSelector` component
  - Fixed denomination grid
  - Custom amount input for RANGE type
  - Selected state styling
- [ ] `DeliveryMethodToggle` component
  - "For me" vs "Send as gift"
  - Radio/segmented control style
- [ ] `GiftDetailsForm` component
  - Recipient email, gift message
  - Conditional rendering, validation

**Deliverable:** Product selection components

### Mid-Morning: Order Summary (2 hours)
- [ ] `OrderSummary` component
  - Line items (amount, fee, total)
  - Currency formatting
  - Primary CTA: "Continue as guest"
  - Secondary CTA: "Sign in"
  - Trust badges
  - Empty state
- [ ] Implement `useCart` hook
  - Selection state, total calculation
- [ ] Sticky positioning on desktop
- [ ] Fixed bottom on mobile (safe-area-inset)

**Deliverable:** Order summary with CTAs

### Afternoon: Product Page Assembly (2 hours)
- [ ] Build `app/gift-card/[slug]/page.tsx`
  - Two-column layout (desktop), stacked (mobile)
  - Connect components to selection state
  - Form validation (React Hook Form + Zod)
  - Dynamic metadata generation
- [ ] Test amount selection flow
- [ ] Test delivery method switching
- [ ] Test gift form validation

**Deliverable:** Complete product detail page

### Late Afternoon: Polish & Testing (1 hour)
- [ ] Verify all states (empty, selected, error)
- [ ] Check responsive behavior
- [ ] Playwright test for product page
- [ ] Compare with design refs
- [ ] Test navigation from home to product
- [ ] Test cart badge updates in header

**Deliverable:** Polished product page

---

## Day 4: Checkout & Success (8 hours)

### Morning: Order Management (2 hours)
- [ ] Create `lib/orders/types.ts`
- [ ] Implement `OrderRepository` in `lib/orders/mock-repository.ts`
  - createOrder, getOrderById, updateOrderStatus, storeFulfillment
  - In-memory Map storage
- [ ] Create `lib/payments/types.ts`
- [ ] Implement `MockCheckoutService` in `lib/payments/mock-checkout.ts`
  - Simulate 2-second payment delay

**Deliverable:** Order persistence and mock payment

### Mid-Morning: Checkout Components (2 hours)
- [ ] `OrderReview` component
  - Product summary, recipient info, edit button
- [ ] `CheckoutForm` component
  - Email, confirm email, validation
  - Submit button with loading state
  - Error display
- [ ] `PaymentArea` component
  - Placeholder for Lemon Squeezy
  - Trust badges, payment icons
  - TODO comment for integration

**Deliverable:** Checkout form components

### Afternoon: Checkout Page (2 hours)
- [ ] Build `app/checkout/page.tsx`
  - Redirect if no selection
  - Order creation on submit
  - Mock payment processing
  - Mock fulfillment (random code/PIN)
  - Redirect to success on completion
  - Error handling
- [ ] Test full checkout flow
- [ ] Test error states (payment failure)

**Deliverable:** Complete checkout flow

### Late Afternoon: Success Page (2 hours)
- [ ] `SuccessSummary` component
  - Success icon, order ID
  - Product details, code/PIN display
  - Redeem instructions
  - "Buy another" CTA
- [ ] Build `app/success/page.tsx`
  - Fetch order by ID from query param
  - Show not found if order invalid
- [ ] Test success page styling
- [ ] Compare with design refs
- [ ] Playwright tests for checkout + success

**Deliverable:** Complete purchase flow (home → product → checkout → success)

---

## Day 5: Polish, Testing & Documentation (8 hours)

### Morning: Visual Polish (3 hours)
- [ ] Add Framer Motion animations
  - Button press (whileTap scale)
  - Card hover (whileHover lift)
  - Dropdown entrance (fade + slide)
  - Page entrance (subtle fade)
- [ ] Refine spacing across all pages
  - Audit with 8pt grid overlay
- [ ] Check all typography weights
  - Archivo: Black/ExtraBold for headlines
  - Inter: Regular/Medium/SemiBold for UI
- [ ] Verify color usage
  - Primary navy, secondary blue, correct surface hierarchy
- [ ] Add loading states
  - Skeleton cards for product grid
  - Spinner for checkout processing
- [ ] Add empty states
  - No products found, no country selected

**Deliverable:** Polished UI with animations

### Mid-Morning: Accessibility Audit (1.5 hours)
- [ ] Add ARIA labels to interactive elements
- [ ] Test keyboard navigation
  - Tab order logical
  - Enter/Space activates buttons
  - Escape closes dropdowns
- [ ] Verify focus states visible
- [ ] Check color contrast (WCAG AA)
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Fix any violations

**Deliverable:** Accessible implementation

### Afternoon: Playwright Testing (2 hours)
- [ ] Write visual regression tests (`e2e/visual-regression.spec.ts`)
  - Desktop: home, product, checkout, success
  - Mobile: home, product, checkout, success
- [ ] Run tests, generate screenshots
- [ ] Compare screenshots with design references
- [ ] Iterate on any visual mismatches
- [ ] Write interaction tests
  - Search and filter
  - Amount selection
  - Checkout flow
- [ ] Ensure all tests passing

**Deliverable:** Full test coverage

### Late Afternoon: Documentation & Prep (1.5 hours)
- [ ] Update `README.md`
  - Getting started instructions
  - Run commands
  - Integration swap guide summary
- [ ] Verify all TODO comments in place
  - Reloadly integration points
  - Lemon Squeezy integration points
  - Database swap points
- [ ] Create `.env.local.example`
- [ ] Test clean install
  - Clone repo, npm install, npm run dev
  - Verify no errors
- [ ] Create demo video/screenshots

**Deliverable:** Documentation complete

### Final Review (1 hour)
- [ ] Run Lighthouse on all pages (>90 score)
- [ ] Check bundle size (reasonable for Next.js app)
- [ ] Verify no hydration errors
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on real devices (iOS, Android)
- [ ] Final visual comparison with design refs
- [ ] Commit: "Production-ready GIFTED v1.0"

**Deliverable:** Production-ready application

---

## Post-Implementation: Integration Checklist

Once live integrations are ready:

### Week 2: Reloadly Integration
- [ ] Get Reloadly sandbox credentials
- [ ] Uncomment/implement `reloadly-adapter.ts`
- [ ] Update `service.ts` to use live data
- [ ] Test product fetching in sandbox
- [ ] Test order placement in sandbox
- [ ] Verify gift card codes work
- [ ] Switch to production credentials

### Week 3: Lemon Squeezy Integration
- [ ] Create Lemon Squeezy account
- [ ] Create "Gift Card" product
- [ ] Get API credentials
- [ ] Implement `lemon-squeezy-adapter.ts`
- [ ] Create webhook endpoint
- [ ] Test checkout in test mode
- [ ] Test webhook with ngrok
- [ ] Verify end-to-end flow (payment → webhook → fulfillment)
- [ ] Switch to live mode

### Week 4: Database & Email
- [ ] Set up PostgreSQL/Supabase
- [ ] Run Prisma migrations
- [ ] Replace mock repository with Prisma
- [ ] Set up Resend account
- [ ] Create email templates
- [ ] Send confirmation emails after fulfillment
- [ ] Test full production flow

### Week 5: Monitoring & Optimization
- [ ] Set up Sentry for error tracking
- [ ] Add analytics (Plausible/Fathom)
- [ ] Monitor webhook reliability
- [ ] Set up alerts for failed fulfillments
- [ ] Optimize images (Next.js Image)
- [ ] Add CDN for brand logos
- [ ] Performance audit

---

## Time Estimates by Component

### Layout Components
- Header: 1 hour
- Footer: 30 minutes
- MobileBottomNav: 1 hour

### Shared Components
- Button: 1 hour
- Input: 1 hour
- CountrySelector: 2 hours

### Browse Components
- HeroSection: 1 hour
- SearchBar: 1 hour
- CategoryChips: 1.5 hours
- ProductCard: 2 hours
- ProductGrid: 1.5 hours
- TrustSection: 1 hour

### Product Components
- ProductHero: 1 hour
- AmountSelector: 2 hours
- DeliveryMethodToggle: 1 hour
- GiftDetailsForm: 1.5 hours
- OrderSummary: 2 hours

### Checkout Components
- OrderReview: 1 hour
- CheckoutForm: 1.5 hours
- PaymentArea: 30 minutes

### Success Components
- SuccessSummary: 1.5 hours

### Data Layer
- Types: 1 hour
- Mock data: 1 hour
- Service layer: 1.5 hours
- Order management: 1.5 hours
- Payment mocks: 1 hour

### Testing
- Playwright setup: 30 minutes
- Visual regression tests: 2 hours
- Interaction tests: 1.5 hours

### Polish & Iteration
- Animations: 2 hours
- Responsive refinement: 2 hours
- Accessibility: 1.5 hours
- Visual comparison iterations: 2 hours

**Total Estimate: ~40 hours (5 full days)**

---

## Success Criteria

Before marking complete, verify:

✅ **Visual Quality**
- Matches design references on desktop and mobile
- Typography correct (Archivo/Inter)
- Spacing follows 8pt grid
- Colors use design tokens
- Animations subtle and performant

✅ **Functionality**
- Search and filtering works
- Country selection works
- Amount selection works
- Delivery method toggle works
- Gift form validation works
- Checkout flow completes
- Success page shows order details

✅ **Code Quality**
- TypeScript with no `any` types
- Components modular and reusable
- Clear separation: UI / data / business logic
- All integration boundaries marked with TODO
- No console errors or warnings

✅ **Testing**
- Playwright tests passing
- Visual regression screenshots match design
- Interaction tests cover key flows
- No accessibility violations

✅ **Documentation**
- README clear and complete
- Integration swap guide accurate
- Environment variables documented
- Run instructions work on clean install

✅ **Ready for Integration**
- Mock data matches production shape
- Adapter interfaces complete
- TODO comments explain exactly what to replace
- Can swap to live APIs with minimal changes

---

## Handoff Notes

When passing to Tester/Queen:

1. **Run the app:**
   ```bash
   npm install
   npm run dev
   ```

2. **Test flows:**
   - Browse products
   - Search and filter
   - Select amount and checkout
   - Complete mock payment
   - View success page

3. **Run visual tests:**
   ```bash
   npm run test:e2e
   ```

4. **Compare screenshots:**
   - `e2e/screenshots/` vs `design-refs/`
   - Flag any spacing, color, typography differences

5. **Review integration boundaries:**
   - Verify all TODO comments present
   - Confirm mock data shape matches expected Reloadly schema
   - Confirm checkout flow ready for Lemon Squeezy

6. **Provide feedback:**
   - Visual discrepancies
   - UX issues
   - Missing states (loading, error, empty)
   - Performance concerns
   - Accessibility issues

---

**Ready to build!** Follow this plan day by day. Every component is specified in ARCHITECTURE.md. Every visual detail is in DESIGN-TOKENS.md. Every integration swap is in INTEGRATION-SWAP-GUIDE.md.

No ambiguity. Just build.
