# CODER QUICK REFERENCE

**Read ARCHITECTURE.md for full specification. This is your TL;DR.**

---

## 🎯 What You're Building

Production gift card marketplace. Next.js 14+, TypeScript, Tailwind, Framer Motion.

**NOT a prototype.** Production code with mocked data until real integrations are swapped in.

---

## 📐 Design System Summary

### The No-Line Rule
**NEVER use 1px borders to separate sections.**
- Use background color shifts instead
- `surface` (#F7F9FB) → `surface-container-lowest` (#FFFFFF) → `surface-container-low` (#F2F4F6)

### Typography
- **Headlines:** Archivo Black (tracking: -0.02em)
- **Body/UI:** Inter
- **See ARCHITECTURE.md §2.2** for exact scale

### Colors
- Primary Navy: `#0F172A`
- CTA Blue: `#0051D5` (secondary)
- Success Green: `#62DF7D` (tertiary)
- Page background: `#F7F9FB` (surface)
- Card background: `#FFFFFF` (surface-container-lowest)

### Spacing
8pt grid: `spacing: { 3: '0.5rem', 4: '1rem', 6: '1.5rem', 8: '2rem' }`

### Border Radius
- Buttons/inputs: `md` (12px)
- Cards: `lg` (16px)
- Pills: `full`

### Shadows
Only for floating elements: `shadow-ambient` = `0px 12px 32px rgba(15, 23, 42, 0.06)`

---

## 🗂️ File Structure (Critical Paths)

```
src/
├── app/
│   ├── page.tsx                     # Home/Browse
│   ├── gift-card/[slug]/page.tsx   # Product detail
│   ├── checkout/page.tsx            # Payment
│   └── success/page.tsx             # Confirmation
│
├── components/
│   ├── layout/                      # Header, Footer, MobileBottomNav
│   ├── common/                      # Button, Input, Card
│   ├── products/                    # ProductCard, ProductGrid
│   ├── checkout/                    # AmountSelector, OrderSummary
│   └── ...
│
├── lib/
│   ├── giftcards/
│   │   ├── types.ts                 # Domain types
│   │   ├── mock-data.ts             # Mocked catalog
│   │   ├── service.ts               # Business logic
│   │   └── reloadly-adapter.ts      # 🔥 Integration boundary
│   │
│   ├── payments/
│   │   ├── types.ts
│   │   ├── mock-checkout.ts
│   │   ├── service.ts
│   │   └── lemon-squeezy-adapter.ts # 🔥 Integration boundary
│   │
│   └── orders/
│       ├── types.ts
│       ├── service.ts
│       └── mock-orders.ts
│
└── store/
    └── app-store.ts                 # Zustand global state
```

---

## 🔥 Integration Boundaries (CRITICAL)

### Reloadly (Gift Cards)
**File:** `lib/giftcards/reloadly-adapter.ts`

All real API calls are commented out with `// TODO:`

**What to swap when going live:**
1. Uncomment authentication in `getAuthToken()`
2. Uncomment catalog fetch in `fetchCatalog()`
3. Uncomment purchase in `purchaseGiftCard()`
4. Update `service.ts`: set `useRealAPI = true`

**Every TODO comment explains exactly what to do.**

### Lemon Squeezy (Payments)
**File:** `lib/payments/lemon-squeezy-adapter.ts`

All real API calls are commented out with `// TODO:`

**What to swap when going live:**
1. Uncomment checkout creation in `createCheckout()`
2. Set up webhook endpoint: `/api/webhooks/lemon-squeezy`
3. Implement webhook verification in `verifyAndProcessWebhook()`
4. Update `service.ts`: set `useRealAPI = true`

**⚠️ NEVER trust client-side payment success.** Only mark orders complete after webhook confirmation.

---

## 📄 Page Implementations

### 1. Home (`/`)
**Reference:** `mobile_flow/stitch/1._browse_home_gifted/screen.png` (desktop)

**Must include:**
- Large hero headline
- Prominent country selector
- Search bar
- Category chips (horizontal scroll on mobile)
- Product grid (2 cols mobile → 4 cols desktop)
- Trust section
- Footer
- Mobile bottom nav (fixed)

**Behavior:**
- Country selector filters products
- Search filters brand names
- Category chips filter by category
- Empty state if no country selected

### 2. Product Detail (`/gift-card/[slug]`)
**Reference:** `mobile_flow/stitch/3._product_detail_checkout_gifted/screen.png`

**Layout:**
- Desktop: 2 columns (product left, sticky summary right)
- Mobile: stacked with sticky bottom CTA

**Must include:**
- Product hero (logo + name + badges)
- Amount selector (chips or custom input)
- Delivery method toggle (for me / send as gift)
- Recipient form (conditional on gift mode)
- Trust info panel
- Order summary with CTAs

**CTAs:**
- Primary: "Continue as Guest" (variant="primary")
- Secondary: "Sign in" (variant="ghost", subtle)

### 3. Checkout (`/checkout`)
**Reference:** `mobile_flow/stitch/payment_checkout_gifted/screen.png`

**Must include:**
- Progress indicator (Step 2 of 2)
- Order review card
- Customer email input
- Payment method placeholder (will be Lemon Squeezy embed)
- Trust badges (SSL, Secure Payment)
- Submit button (disabled until ready)

**Mock checkout flow:**
```typescript
1. Create order via orderService
2. Create payment session via paymentService
3. Simulate 2s processing delay
4. Redirect to /success?orderId={id}
```

### 4. Success (`/success`)
**Reference:** `mobile_flow/stitch/4._success_confirmation_gifted/screen.png`

**Must include:**
- Success icon (green checkmark, restrained)
- Headline (conditional on gift vs for-me)
- Order summary card
- Order ID, date, recipient
- "What's Next?" section (numbered steps)
- CTAs: "Send Another" + "View Orders"

---

## 🎨 Component Specs (Key Examples)

### Button
```tsx
<Button 
  variant="primary"    // primary | secondary | ghost
  size="lg"            // sm | md | lg
  fullWidth            // optional
  onClick={handleClick}
>
  Continue as Guest
</Button>
```

**Styles:**
- `primary`: bg-secondary, text-on-secondary
- `secondary`: bg-surface-container-high
- `ghost`: transparent, hover bg-surface-container-low
- Rounded: `md` (12px)
- Focus ring: 2px secondary

### Product Card
```tsx
<ProductCard 
  product={product}
  onClick={handleClick}
/>
```

**Structure:**
- Container: bg-surface-container-lowest, rounded-lg, p-6
- No borders (No-Line Rule!)
- Hover: scale-[1.02], shadow-ambient
- Logo: centered, max-h-16
- Ghost border if logo needs it: border-outline-variant
- Product name: headline-sm
- Category badge: rounded-full pill
- Price range: title-md text-on-surface-variant

### Order Summary
```tsx
<OrderSummary 
  product={product}
  amount={amount}
  serviceFee={fee}
  currency="USD"
  onContinueAsGuest={handleGuest}
  onSignIn={handleSignIn}
/>
```

**Desktop:** sticky top-24, shadow-ambient  
**Mobile:** fixed bottom-0, safe-area-inset-bottom

**Sections (no dividers, use spacing):**
- Product + amount
- Service fee (with tooltip)
- Total (large, bold)
- Primary CTA (full width)
- Secondary link (subtle)

---

## 🧪 Testing Requirements

### Visual Regression
```bash
npm run test:visual
```

**Must verify:**
- Desktop home vs `mobile_flow/stitch/1._browse_home_gifted/screen.png`
- Mobile home vs `desktop_flow/stitch/1._browse_home_mobile_gifted/screen.png`
- Desktop product vs reference
- Mobile product vs reference
- Desktop success vs reference
- Mobile success vs reference

**Tolerance:** Max 5% pixel difference

### E2E Flows
```bash
npm run test:e2e
```

**Must pass:**
1. Guest checkout - for me
2. Guest checkout - send as gift
3. Country filtering
4. Search filtering
5. Category filtering
6. Amount selection validation
7. Email validation
8. Success page render

### Responsive
Test all pages at:
- Mobile: 375x667
- Tablet: 768x1024
- Desktop: 1920x1080

---

## ✅ Quality Checklist

### Design Match
- [ ] Spacing matches 8pt grid
- [ ] Typography uses correct classes (display-lg, headline-sm, etc.)
- [ ] Colors use design tokens (no hardcoded hex)
- [ ] No borders used for sectioning (tonal shifts instead)
- [ ] Shadows only on floating elements
- [ ] Card radius is `lg` (16px)
- [ ] Button radius is `md` (12px)
- [ ] Pills use `full` radius

### Premium Feel
- [ ] Animations are tasteful (no bounce, no flash)
- [ ] Micro-interactions on buttons (scale on press)
- [ ] Hover states on desktop cards
- [ ] Loading states feel polished
- [ ] Empty states are helpful
- [ ] Error states are clear

### Mobile Polish
- [ ] Bottom nav is sticky and accessible
- [ ] Sticky CTAs don't cover content
- [ ] Safe area insets respected
- [ ] Touch targets are 44px minimum
- [ ] Horizontal scrolls feel smooth
- [ ] No horizontal overflow bugs

### Integration Readiness
- [ ] Every mock integration has TODO comments
- [ ] TODO comments explain exactly what to replace
- [ ] Service layer toggle (`useRealAPI`) is documented
- [ ] Webhook structure is defined
- [ ] Error handling is in place

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Headings are semantic (h1, h2, h3)
- [ ] Form labels exist
- [ ] Validation errors are announced
- [ ] Color contrast meets WCAG AA

---

## 🚀 Development Workflow

1. **Start with design system setup**
   - Configure Tailwind with exact tokens
   - Add custom typography classes to globals.css
   - Test a Button component to verify design system

2. **Build components bottom-up**
   - Start with atomic components (Button, Input, Card)
   - Then composite components (ProductCard, OrderSummary)
   - Finally layout components (Header, Footer)

3. **Implement pages**
   - Home first (most complex)
   - Product detail second
   - Checkout third
   - Success last (simplest)

4. **Add mock data**
   - Create realistic product catalog (20+ products)
   - Multiple countries with different availability
   - Categories with good distribution

5. **Wire up state**
   - Zustand store for global state
   - Country selection persistence
   - Cart state for current selection

6. **Implement flows**
   - Navigation between pages
   - Form validation
   - Mock checkout completion

7. **Add animations**
   - Page transitions
   - Component entrance animations
   - Hover/press feedback
   - Loading states

8. **Test everything**
   - Visual regression against screenshots
   - E2E flows
   - Responsive behavior
   - Accessibility

9. **Polish**
   - Fix any spacing issues
   - Verify typography hierarchy
   - Check all interactive states
   - Test empty/error states

---

## 🐛 Common Pitfalls

### DON'T:
- ❌ Use borders to separate sections (use tonal shifts)
- ❌ Hardcode colors (use design tokens)
- ❌ Use generic card shadows (use shadow-ambient only for floating)
- ❌ Make buttons bounce on click (subtle scale only)
- ❌ Use Archivo for body text (Inter only)
- ❌ Trust client-side payment success (webhook only)
- ❌ Implement real integrations before mocks work
- ❌ Skip the design references (they are source of truth)

### DO:
- ✅ Use bg shifts: surface → surface-container-lowest → surface-container-low
- ✅ Follow 8pt grid strictly
- ✅ Add TODO comments at integration boundaries
- ✅ Test against design screenshots
- ✅ Make guest checkout dominant (not sign in)
- ✅ Show country selector prominently
- ✅ Handle empty states gracefully
- ✅ Make it feel expensive and premium

---

## 📚 Key Architecture References

**Full details in ARCHITECTURE.md:**

- **§2:** Design system tokens and typography
- **§3:** Type definitions for all domains
- **§4:** Service layer and integration boundaries
- **§5:** State management (Zustand)
- **§6:** Page specifications
- **§7:** Validation schemas
- **§8:** Animation variants
- **§10:** Mock data structure
- **§11:** Playwright test specs

---

## 💬 Questions to Ask If Stuck

1. **Design unclear?** → Check design reference screenshots in `design-refs/`
2. **Typography class?** → See ARCHITECTURE.md §2.2
3. **Color token?** → See ARCHITECTURE.md §2.1
4. **Component structure?** → See ARCHITECTURE.md §2.3
5. **Integration pattern?** → See ARCHITECTURE.md §4
6. **Test failing?** → Compare against screenshot at tolerance
7. **Animation feel?** → Keep it restrained (200-400ms, ease-out)

---

## 🎯 Success Criteria

**You're done when:**

1. ✅ All pages render without errors
2. ✅ Design matches references (within 5% tolerance)
3. ✅ All Playwright tests pass
4. ✅ Mobile and desktop equally polished
5. ✅ Integration boundaries are clear with TODOs
6. ✅ Guest checkout flow completes successfully
7. ✅ Tester can't find anything off-spec
8. ✅ It feels premium, not generic

**Ship when it looks designed, not just functional.**

---

**Read ARCHITECTURE.md for complete specification. This is your roadmap.**
