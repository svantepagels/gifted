# GIFTED - Architecture Summary

**Date:** 2026-03-26  
**Architect:** Fernando (Swarm ARCHITECT Agent)  
**Status:** ✅ Architecture Complete - Ready for Implementation

---

## What Was Delivered

I've created a complete, production-ready technical architecture for GIFTED, a premium digital gift card marketplace. The architecture is fully specified with exact implementation details, leaving no room for guesswork.

### Documents Created

1. **ARCHITECTURE.md** (69KB)
   - Complete technical specification
   - All data models with TypeScript interfaces
   - Every component with exact props, structure, and appearance
   - Integration boundaries with explicit TODO comments
   - Animation specifications using Framer Motion
   - Complete Playwright testing strategy
   - Design system token reference
   - 10-phase implementation plan

2. **INTEGRATION-GUIDE.md** (26KB)
   - Step-by-step guide for swapping mocked integrations to real APIs
   - Reloadly integration (gift card catalog)
   - Lemon Squeezy integration (payment processing)
   - Database schema (PostgreSQL + Prisma)
   - Email delivery setup (Resend)
   - Complete code examples for each integration
   - Rollback plan for production issues

3. **CODER-QUICKSTART.md** (19KB)
   - Day-by-day implementation guide
   - Design system quick reference
   - Critical do's and don'ts
   - Mock data examples
   - Success criteria checklist

---

## Architecture Highlights

### Tech Stack
- **Next.js 14+** with App Router (latest stable)
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Hook Form + Zod** for validation
- **Playwright** for testing

### Design System: "Architectural Ledger"
- Swiss minimalism aesthetic
- Heavy-weight typography (Archivo Black + Inter)
- Tonal layering (no borders for section separation)
- Restrained color palette (Navy #0F172A + Blue #0051D5)
- Intentional whitespace
- Premium, trust-heavy feel

### Key Features
1. **Country-First Product Catalog**
   - Gift cards filtered by country
   - Currency-aware pricing
   - Country selection persists across sessions

2. **Dual Purchase Flows**
   - "For Me" - Self-purchase
   - "Send as Gift" - Email delivery with personal message

3. **Guest Checkout Priority**
   - No forced account creation
   - "Continue as Guest" is primary CTA
   - Optional sign-in as secondary action

4. **Responsive Mobile-First Design**
   - Optimized for thumb-friendly interactions
   - Sticky elements on mobile (bottom nav, order summary)
   - Desktop scales beautifully with sidebar layouts

### Integration Architecture

**Mocked Integrations with Clear Boundaries:**

1. **Reloadly (Gift Cards)**
   - File: `lib/giftcards/reloadly-adapter.ts`
   - Mocked: Product catalog, search, categories
   - TODO comments mark exact API calls to implement
   - Service layer abstracts away adapter implementation

2. **Lemon Squeezy (Payments)**
   - File: `lib/payments/lemon-squeezy-adapter.ts`
   - Mocked: Checkout session creation, payment flow
   - TODO comments explain webhook setup
   - Client-side redirect flow designed for real integration

3. **Order Fulfillment**
   - File: `lib/orders/service.ts`
   - Mocked: In-memory order storage
   - TODO comments explain database integration
   - Clear fulfillment workflow (payment → purchase → delivery)

**Why This Matters:**
- CODER can build and test entire flow with mocked data
- Integration swap is surgical - change only adapter files
- No refactoring required when moving to production
- Rollback to mocks possible with single env variable

---

## Data Models

### Core Entities

**Country**
```typescript
{
  code: string;        // ISO 3166-1 alpha-2 (e.g., "US")
  name: string;        // Display name
  flagEmoji: string;   // Unicode flag emoji
  currency: {
    code: string;      // ISO 4217 (e.g., "USD")
    symbol: string;    // Display symbol (e.g., "$")
    decimals: number;  // Usually 2
  };
  locale: string;      // BCP 47 (e.g., "en-US")
}
```

**GiftCardProduct**
```typescript
{
  id: string;
  slug: string;
  brandName: string;
  description: string;
  logoUrl: string;
  categories: string[];
  availableCountries: string[];
  denominationType: 'FIXED' | 'RANGE';
  fixedDenominations?: number[];
  denominationRange?: { min: number; max: number };
  currency: string;
  serviceFeePercent: number;
  deliveryType: 'DIGITAL';
  redemptionInstructions?: string;
  termsUrl?: string;
}
```

**Order**
```typescript
{
  id: string;
  item: OrderItem;
  deliveryMethod: 'FOR_ME' | 'SEND_AS_GIFT';
  customerEmail: string;
  recipient?: { email: string; message?: string };
  country: Country;
  status: OrderStatus;
  createdAt: Date;
  paymentSessionId?: string;
}
```

---

## Component Architecture

### Layout Components
- **Header** - Desktop nav with country selector, help, cart
- **Footer** - Company info, links, copyright
- **MobileBottomNav** - 4-tab navigation (home, browse, country, account)

### Feature Components
- **CountrySelector** - Pill button with flag + country + currency
- **CountryModal** - Full-screen (mobile) or centered (desktop) country picker
- **SearchBar** - Debounced search with clear button
- **CategoryChips** - Horizontal scrollable filters
- **ProductCard** - Brand logo + name + category + price range
- **ProductGrid** - Responsive 2/3/4 column grid
- **AmountSelector** - Fixed chips or custom range input
- **DeliveryMethodToggle** - Large toggle buttons (For Me / Send as Gift)
- **RecipientForm** - Slide-down form for gift purchases
- **OrderSummary** - Sticky sidebar (desktop) or bottom sheet (mobile)
- **CheckoutForm** - Multi-section form with payment placeholder
- **SuccessSummary** - Calm success state with animated checkmark

### UI Primitives
- **Button** - 4 variants (primary, secondary, outline, ghost)
- **Input** - Focus/error states, left/right icons
- **TextArea** - Character counter, max length
- **Badge** - 4 variants for status/category display
- **Card** - Simple wrapper following design system

---

## Routing

```
/                           → Home/Browse page
/gift-card/[slug]           → Product detail
/checkout                   → Checkout/payment
/success                    → Success confirmation
/auth/verify                → Email verification (optional)
```

**User Flows:**

1. **Browse → Purchase (For Me)**
   ```
   / → Select country → Browse products → Click product
   → /gift-card/[slug] → Select amount → Select "For Me"
   → Enter email → Continue as Guest → /checkout
   → Review → Continue to Payment → /success
   ```

2. **Browse → Purchase (Send as Gift)**
   ```
   / → Select country → Click product → /gift-card/[slug]
   → Select amount → Select "Send as Gift"
   → Enter recipient email + message → Enter customer email
   → Continue as Guest → /checkout → Review → Payment → /success
   ```

---

## Animation Strategy

**Principles:**
- Restrained (no bouncy or flashy)
- Purposeful (guide attention, confirm actions)
- Fast (150-400ms max)
- Ease-out for entrances, ease-in-out for state changes

**Key Animations:**
- Page entrance: Fade + scale (300ms)
- Button press: Scale to 0.98 (100ms)
- Card hover: Background shift + shadow + scale 1.02 (200ms)
- Modal: Backdrop fade + slide up (mobile) or scale (desktop)
- Success checkmark: SVG path draw (600ms)
- Sticky elements: Slide in from bottom (300ms)

---

## Testing Strategy

### Playwright Setup
- **3 viewport configurations:**
  - Desktop Chrome (1280x720)
  - Mobile Safari (390x844)
  - Tablet iPad Pro (1024x1366)

### Test Types

1. **Interaction Tests**
   - Country selection
   - Search and filter
   - Product navigation
   - Form validation
   - Full checkout flow (browse → success)

2. **Visual Regression Tests**
   - Screenshot all key pages (desktop + mobile)
   - Compare against design references
   - Threshold: 20% (allows for anti-aliasing differences)
   - Fail if spacing/typography/hierarchy is off

3. **Acceptance Criteria**
   - All tests passing
   - Visual regression within threshold
   - No console errors
   - All interactive elements have `data-testid` attributes

---

## Implementation Plan (14 Days)

| Phase | Days | Goal | Deliverable |
|-------|------|------|-------------|
| 1. Foundation | 1-2 | Skeleton + design system | Styled primitives, empty pages |
| 2. Data Layer | 3-4 | Mocked data + state | Contexts, services, adapters |
| 3. Country Selection | 4-5 | Functional picker | Country selection working |
| 4. Browse Page | 5-7 | Product discovery | Search/filter functional |
| 5. Product Detail | 7-9 | Configuration + order | Order creation working |
| 6. Checkout | 9-10 | Payment placeholder | Mock payment flow |
| 7. Success Page | 10-11 | Confirmation | Success page polished |
| 8. Animations | 11-12 | Micro-interactions | Smooth UX throughout |
| 9. Testing | 12-14 | Playwright tests | All tests passing |
| 10. Documentation | 14 | README + guides | Production-ready docs |

---

## What Makes This Architecture Production-Ready

### 1. No Ambiguity
Every component has:
- Exact TypeScript props
- Precise appearance specifications (colors, typography, spacing)
- Detailed interaction behaviors
- Animation specs with timing and easing

### 2. Clear Integration Boundaries
- All external API calls isolated in adapter modules
- Explicit TODO comments at every integration point
- Mock data structure matches real API expectations
- Service layer abstracts implementation details

### 3. Maintainable Structure
- Separation of concerns (adapters, services, components, UI)
- Type-safe throughout
- Reusable primitives
- Consistent naming conventions

### 4. Testable
- Data-testid attributes on all interactive elements
- Playwright tests verify both behavior and appearance
- Visual regression catches design drift
- Clear acceptance criteria

### 5. Scalable
- Component-based architecture
- Easy to add new gift card providers
- Easy to add new payment processors
- Easy to add new countries/currencies

---

## Next Steps

### For CODER Agent
1. Read **CODER-QUICKSTART.md** for day-by-day plan
2. Reference **ARCHITECTURE.md** for detailed specs
3. Build systematically, phase by phase
4. Add `data-testid` attributes to all components
5. Match design references EXACTLY
6. Leave TODO comments at integration boundaries

### For TESTER Agent
1. Read **ARCHITECTURE.md** section 12 (Testing Strategy)
2. Set up Playwright with provided config
3. Generate baseline screenshots from design references
4. Run visual regression tests after each phase
5. Report discrepancies to CODER for iteration
6. Verify all interaction flows work end-to-end

### For Integration (Future)
1. Read **INTEGRATION-GUIDE.md** for step-by-step swap process
2. Set up Reloadly account and credentials
3. Set up Lemon Squeezy account and webhook
4. Replace adapter methods one-by-one
5. Test each integration thoroughly on staging
6. Deploy to production with monitoring

---

## Files Summary

```
gifted-project/
├── ARCHITECTURE.md           # 69KB - Complete technical spec
├── INTEGRATION-GUIDE.md      # 26KB - Real API integration guide
├── CODER-QUICKSTART.md       # 19KB - Implementation quick reference
├── ARCHITECT-SUMMARY.md      # This file - High-level overview
├── SPEC.md                   # Original requirements
└── design-refs/              # Design screenshots
    ├── desktop_flow/
    │   └── stitch/
    │       ├── 1._browse_home_gifted/
    │       ├── 3._product_detail_checkout_gifted/
    │       ├── payment_checkout_gifted/
    │       ├── sign_up_email_verification_gifted/
    │       ├── 4._success_confirmation_gifted/
    │       └── slate_cobalt_premium/DESIGN.md
    └── mobile_flow/
        └── stitch/
            ├── 1._browse_home_mobile_gifted/
            ├── 3._product_detail_mobile_gifted/
            ├── 4._payment_mobile_gifted/
            ├── 6._sign_up_mobile_gifted/
            ├── 5._success_mobile_gifted/
            └── slate_cobalt_premium/DESIGN.md
```

---

## Confidence Level: VERY HIGH

This architecture is:
- ✅ Complete (no missing pieces)
- ✅ Specific (no vague "integrate with X" statements)
- ✅ Actionable (CODER can start immediately)
- ✅ Testable (clear success criteria)
- ✅ Production-ready (follows best practices)
- ✅ Maintainable (clear structure and separation of concerns)

**The CODER has everything needed to build this exactly as specified.**

---

## Contact

If questions arise during implementation:
- **Design system:** Reference DESIGN.md and ARCHITECTURE.md section "Design System Token Reference"
- **Component structure:** ARCHITECTURE.md section 6
- **Data models:** ARCHITECTURE.md section 4
- **Integration:** INTEGRATION-GUIDE.md
- **Testing:** ARCHITECTURE.md section 12

---

**Architecture complete. Ready for implementation.** 🔧
