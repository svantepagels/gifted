# TESTER VERIFICATION CHECKLIST

Use this checklist to verify the GIFTED implementation against the specification.

**Source of truth:** Design reference screenshots in `design-refs/`

---

## 🎨 DESIGN SYSTEM COMPLIANCE

### Colors
- [ ] Primary navy (`#0F172A`) used for headlines and primary text
- [ ] CTA buttons use secondary blue (`#0051D5`)
- [ ] Success states use tertiary green (`#62DF7D`)
- [ ] Page background is `surface` (`#F7F9FB`)
- [ ] Cards use `surface-container-lowest` (`#FFFFFF`)
- [ ] No hardcoded colors outside design tokens

### Typography
- [ ] Headlines use Archivo Black with `-0.02em` tracking
- [ ] Body text and UI use Inter
- [ ] Archivo is NOT used for body text
- [ ] Typography hierarchy is clear (display → headline → title → body)
- [ ] Font weights match spec (see ARCHITECTURE.md §2.2)

### Spacing
- [ ] All spacing follows 8pt grid (8px, 16px, 24px, 32px, etc.)
- [ ] Consistent padding inside cards (typically 1.5rem / 24px)
- [ ] Margins between sections use spacing tokens
- [ ] No arbitrary spacing values

### The No-Line Rule (CRITICAL)
- [ ] **NO 1px borders used to separate sections**
- [ ] Section separation uses background color shifts
- [ ] Example: hero (surface) → category bar (surface-container-lowest) → grid (surface)
- [ ] Ghost borders only on form inputs and logos that need them
- [ ] Ghost borders use `outline-variant` at 30% opacity

### Borders & Radius
- [ ] Buttons use `md` radius (12px)
- [ ] Cards use `lg` radius (16px)
- [ ] Pills/chips use `full` radius
- [ ] Input fields use `md` radius (12px)
- [ ] No sharp corners on interactive elements

### Shadows
- [ ] Shadows ONLY on floating elements (dropdowns, modals, sticky summaries)
- [ ] Shadow token is `shadow-ambient` (`0px 12px 32px rgba(15, 23, 42, 0.06)`)
- [ ] No shadows on resting cards in the product grid
- [ ] Hover states may add shadow (combined with scale)

---

## 📱 VISUAL REGRESSION TESTS

### Desktop Home Page
**Reference:** `mobile_flow/stitch/1._browse_home_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] Hero headline is large and centered
- [ ] Country selector is prominent below headline
- [ ] Search bar is wide and centered
- [ ] Category chips are visible as pills
- [ ] Product grid is 4 columns on desktop
- [ ] Trust section has 3 columns
- [ ] Footer is present
- [ ] No mobile bottom nav visible on desktop

### Mobile Home Page
**Reference:** `desktop_flow/stitch/1._browse_home_mobile_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] Hero headline scales down appropriately
- [ ] Country selector is accessible
- [ ] Search bar is full-width
- [ ] Category chips scroll horizontally
- [ ] Product grid is 2 columns on mobile
- [ ] Trust section stacks vertically
- [ ] Mobile bottom nav is fixed at bottom
- [ ] Safe area insets are respected

### Desktop Product Detail
**Reference:** `mobile_flow/stitch/3._product_detail_checkout_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] 2-column layout (product left, summary right)
- [ ] Product logo is large and centered
- [ ] Amount chips are clearly selectable
- [ ] Delivery method toggle is prominent
- [ ] Order summary is sticky on scroll
- [ ] Trust info panel is visible
- [ ] CTAs are clearly hierarchical

### Mobile Product Detail
**Reference:** `desktop_flow/stitch/3._product_detail_mobile_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] Single column layout
- [ ] Product logo is appropriately sized
- [ ] Amount selector is touch-friendly
- [ ] Delivery toggle is easy to tap
- [ ] Sticky bottom CTA is present
- [ ] Doesn't cover important content

### Desktop Checkout
**Reference:** `mobile_flow/stitch/payment_checkout_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] Progress indicator shows Step 2 of 2
- [ ] Order review card is clear
- [ ] Product details are visible
- [ ] Recipient info shown (if gift mode)
- [ ] Price breakdown is detailed
- [ ] Customer email input is prominent
- [ ] Payment placeholder is clear
- [ ] Trust badges near payment area

### Mobile Checkout
**Reference:** `desktop_flow/stitch/4._payment_mobile_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] Stacked layout flows well
- [ ] All sections are readable
- [ ] Input fields are large enough
- [ ] Submit button is accessible
- [ ] Safe area respected at bottom

### Desktop Success
**Reference:** `mobile_flow/stitch/4._success_confirmation_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] Success icon is restrained (not over-celebratory)
- [ ] Headline is clear and appropriate
- [ ] Order summary card shows all details
- [ ] "What's Next?" section has numbered steps
- [ ] CTAs are clear and actionable
- [ ] Order ID is visible and copyable

### Mobile Success
**Reference:** `desktop_flow/stitch/5._success_mobile_gifted/screen.png`

- [ ] Playwright screenshot matches reference (≤5% diff)
- [ ] Success icon scales appropriately
- [ ] Content is readable on small screen
- [ ] Order details are complete
- [ ] Next steps are clear
- [ ] CTAs are thumb-friendly

---

## 🧪 E2E FLOW TESTING

### Guest Checkout - For Me
- [ ] Start at home page
- [ ] Select country from dropdown
- [ ] Products filter based on country
- [ ] Click on a product card
- [ ] Navigate to product detail page
- [ ] Select an amount (fixed or custom)
- [ ] "For Me" delivery method is selected by default
- [ ] Click "Continue as Guest"
- [ ] Navigate to checkout page
- [ ] Order review shows correct product and amount
- [ ] Enter customer email
- [ ] Click submit payment (mock)
- [ ] Navigate to success page
- [ ] Success page shows "Purchase Complete"
- [ ] Order details are correct

### Guest Checkout - Send as Gift
- [ ] Start at home page
- [ ] Select country
- [ ] Click on a product
- [ ] Select amount
- [ ] Toggle to "Send as Gift"
- [ ] Recipient email field appears
- [ ] Message textarea appears
- [ ] Fill recipient email
- [ ] Fill optional message
- [ ] Continue as guest
- [ ] Order review shows recipient info
- [ ] Gift message is displayed
- [ ] Enter customer email
- [ ] Submit payment
- [ ] Success page shows "Gift Card Sent"
- [ ] Recipient email is shown

### Search & Filter
- [ ] Search bar filters products by name
- [ ] Category chips filter by category
- [ ] Multiple filters can be combined
- [ ] Empty state shows when no results
- [ ] Clear search shows all products again

### Country Selection
- [ ] Country selector opens modal/dropdown
- [ ] All countries are listed with flags
- [ ] Selecting country closes selector
- [ ] Country pill shows selected country + currency
- [ ] Products filter to show only available in that country
- [ ] Selection persists across page navigation
- [ ] Selection persists on page refresh

### Amount Selection
- [ ] Fixed denominations show as selectable chips
- [ ] Selected chip has visual feedback (border)
- [ ] Range denominations allow custom input
- [ ] Custom amount validates min/max
- [ ] Service fee updates when amount changes
- [ ] Total updates correctly
- [ ] Cannot proceed without selecting amount

### Validation
- [ ] Recipient email requires valid format
- [ ] Customer email requires valid format
- [ ] Gift message has 200 character limit
- [ ] Custom amount respects min/max range
- [ ] Error messages are clear and helpful
- [ ] Errors show inline near the field
- [ ] Form cannot submit with validation errors

---

## 📐 RESPONSIVE BEHAVIOR

### Mobile (375x667)
- [ ] All text is readable (no tiny text)
- [ ] Touch targets are ≥44px
- [ ] No horizontal scroll (except intentional carousels)
- [ ] Sticky elements don't cover content
- [ ] Safe area insets respected
- [ ] Bottom nav is accessible
- [ ] Forms are easy to fill on small screen

### Tablet (768x1024)
- [ ] Layout transitions smoothly from mobile
- [ ] Product grid shows 3 columns
- [ ] Still feels mobile-optimized
- [ ] Touch interactions work well

### Desktop (1920x1080)
- [ ] Product grid shows 4 columns
- [ ] Wide margins make good use of space
- [ ] Sticky elements work correctly
- [ ] Hover states are present
- [ ] Desktop nav is visible
- [ ] Mobile bottom nav is hidden

### Breakpoint Transitions
- [ ] No layout breaks at any width
- [ ] Grid columns transition smoothly
- [ ] Typography scales appropriately
- [ ] Spacing remains proportional
- [ ] No content overflow

---

## 🎭 INTERACTIONS & ANIMATIONS

### Buttons
- [ ] Hover state changes background (desktop)
- [ ] Press feedback (scale: 0.98)
- [ ] Disabled state is visually clear
- [ ] Focus ring is visible (keyboard nav)
- [ ] Loading state shows spinner
- [ ] Transitions are smooth (150-200ms)

### Product Cards
- [ ] Hover scales card slightly (1.02) on desktop
- [ ] Hover adds shadow-ambient
- [ ] No hover effect on mobile (touch)
- [ ] Click/tap navigates to product page
- [ ] Logo ghost border appears if needed

### Category Chips
- [ ] Selected state is visually distinct
- [ ] Hover state on desktop
- [ ] Smooth transition between states
- [ ] Horizontal scroll feels smooth on mobile

### Forms
- [ ] Focus state highlights input
- [ ] Validation errors appear below input
- [ ] Error state changes border color
- [ ] Character counter updates live
- [ ] Placeholder text is helpful

### Page Transitions
- [ ] Fade in on page load
- [ ] No jarring layout shifts
- [ ] Loading states are clear
- [ ] Error states are handled gracefully

### Micro-interactions
- [ ] Country selector opens smoothly
- [ ] Amount chips have clear selected state
- [ ] Delivery toggle has satisfying click
- [ ] Order summary updates reactively
- [ ] Success icon animates in (subtle)

### Animation Quality
- [ ] All animations are tasteful (no bounce)
- [ ] Durations are appropriate (200-400ms)
- [ ] Easing is smooth (ease-out)
- [ ] No performance jank
- [ ] Respects prefers-reduced-motion

---

## ♿ ACCESSIBILITY

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] All interactive elements are reachable
- [ ] Focus states are clearly visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/dropdowns
- [ ] No keyboard traps

### Screen Readers
- [ ] Headings are semantic (h1, h2, h3)
- [ ] Buttons have descriptive labels
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Images have alt text

### Visual Accessibility
- [ ] Color contrast meets WCAG AA
- [ ] Text is readable at all sizes
- [ ] Interactive elements are distinguishable
- [ ] Error states don't rely on color alone
- [ ] Focus indicators are visible

### Forms
- [ ] All inputs have labels
- [ ] Labels are associated with inputs (for/id)
- [ ] Required fields are marked
- [ ] Error messages are descriptive
- [ ] Success states are announced

---

## 🔌 INTEGRATION READINESS

### Reloadly Integration Boundary
- [ ] File exists: `lib/giftcards/reloadly-adapter.ts`
- [ ] All real API calls have TODO comments
- [ ] TODO comments explain what to replace
- [ ] Auth token method is stubbed
- [ ] Catalog fetch is stubbed
- [ ] Product mapping is stubbed
- [ ] Purchase method is stubbed
- [ ] Service has `useRealAPI` toggle

### Lemon Squeezy Integration Boundary
- [ ] File exists: `lib/payments/lemon-squeezy-adapter.ts`
- [ ] All real API calls have TODO comments
- [ ] Checkout creation is stubbed
- [ ] Session status check is stubbed
- [ ] Webhook verification is stubbed
- [ ] Webhook processing is stubbed
- [ ] Service has `useRealAPI` toggle

### Order Service
- [ ] Creates orders before payment
- [ ] Links order to payment session
- [ ] Marks orders as paid (webhook simulation)
- [ ] Triggers fulfillment after payment
- [ ] Handles fulfillment failures
- [ ] Generates order IDs correctly

### Mock Data Quality
- [ ] At least 20 products in catalog
- [ ] Multiple countries with different availability
- [ ] Products span all categories
- [ ] Fixed and range denominations represented
- [ ] Realistic product names and descriptions
- [ ] Proper currency symbols

---

## 📝 CODE QUALITY

### TypeScript
- [ ] No `any` types (except unavoidable)
- [ ] All props are properly typed
- [ ] Service methods have return types
- [ ] Type definitions match specification
- [ ] No TypeScript errors

### File Organization
- [ ] Files are in correct directories
- [ ] Component files are modular
- [ ] No giant monolithic files
- [ ] Clear separation of concerns
- [ ] Imports are clean (no circular deps)

### Naming
- [ ] Variables are descriptively named
- [ ] Functions describe what they do
- [ ] Components are PascalCase
- [ ] Files match component names
- [ ] No cryptic abbreviations

### Comments
- [ ] Integration boundaries have clear TODOs
- [ ] Complex logic is explained
- [ ] TODOs explain what to replace and how
- [ ] No dead code
- [ ] No commented-out blocks (unless marked as future integration)

### Testing
- [ ] All test files are present
- [ ] Tests are well-organized
- [ ] Test data-testid attributes are present
- [ ] Visual regression tolerance is set (5%)
- [ ] E2E flows cover happy paths

---

## 🚀 PERFORMANCE

### Load Time
- [ ] Initial page load is fast (<2s)
- [ ] Images are optimized
- [ ] No console errors
- [ ] No console warnings
- [ ] No hydration errors

### Runtime
- [ ] Smooth scrolling
- [ ] No jank during animations
- [ ] Form inputs are responsive
- [ ] Search filtering is fast
- [ ] State updates don't cause lag

### Build
- [ ] `npm run build` succeeds
- [ ] No build warnings
- [ ] Bundle size is reasonable
- [ ] Static generation works (if used)

---

## 📄 DOCUMENTATION

### README
- [ ] Quick start instructions are clear
- [ ] Environment variables documented
- [ ] Integration swap guide is present
- [ ] Testing commands documented
- [ ] Architecture reference linked

### Integration Swap Guide
- [ ] Reloadly setup steps are clear
- [ ] Lemon Squeezy setup steps are clear
- [ ] Webhook configuration explained
- [ ] Environment variables listed
- [ ] Testing approach outlined

### Comments in Code
- [ ] Integration boundaries are marked
- [ ] Complex logic is explained
- [ ] Future work is clearly labeled
- [ ] No misleading comments

---

## ✅ FINAL CHECKS

### Premium Feel
- [ ] Looks expensive, not generic
- [ ] Typography feels editorial
- [ ] Spacing creates luxury
- [ ] Animations are refined
- [ ] No cheap template vibes

### Mobile Quality
- [ ] Mobile doesn't feel like a squeezed desktop
- [ ] Touch interactions feel native
- [ ] Bottom nav is useful
- [ ] Forms are easy to fill
- [ ] All actions are accessible

### Desktop Quality
- [ ] Desktop doesn't feel like stretched mobile
- [ ] Wide space is used well
- [ ] Hover states add value
- [ ] Sticky elements enhance UX
- [ ] Multi-column layouts work

### Empty States
- [ ] No country selected: helpful message
- [ ] No search results: clear empty state
- [ ] No products in category: useful feedback
- [ ] Each state has clear next action

### Error States
- [ ] Validation errors are clear
- [ ] Form errors appear inline
- [ ] Network errors are handled
- [ ] Payment errors are user-friendly
- [ ] Recovery actions are obvious

### Success States
- [ ] Order confirmation is clear
- [ ] Success page celebrates appropriately
- [ ] Next steps are obvious
- [ ] Confirmation details are complete

---

## 🎯 PASS CRITERIA

**Implementation passes when:**

1. ✅ All design system checks pass
2. ✅ All visual regression tests pass (≤5% diff)
3. ✅ All E2E flows complete successfully
4. ✅ Responsive behavior is flawless
5. ✅ Animations feel premium
6. ✅ Accessibility checks pass
7. ✅ Integration boundaries are clear
8. ✅ Code quality is high
9. ✅ Documentation is complete
10. ✅ It feels designed, not templated

**If ANY check fails, send back for iteration.**

---

## 📋 TESTER WORKFLOW

1. **Run visual regression tests first**
   ```bash
   npm run test:visual
   ```
   Compare screenshots against design refs. Flag any differences >5%.

2. **Run E2E tests**
   ```bash
   npm run test:e2e
   ```
   Ensure all flows pass.

3. **Manual responsive testing**
   - Test at mobile, tablet, desktop widths
   - Check breakpoint transitions
   - Verify all interactions work at each size

4. **Accessibility audit**
   - Use keyboard only
   - Run axe DevTools
   - Test with screen reader (basic check)

5. **Code review**
   - Check integration boundaries
   - Verify TODO comments are present
   - Ensure types are complete

6. **Premium feel check**
   - Does it look expensive?
   - Are animations tasteful?
   - Is spacing deliberate?
   - Is typography hierarchy clear?

7. **Document findings**
   - List any failed checks
   - Provide screenshots of issues
   - Suggest fixes

8. **Iterate or approve**
   - If all checks pass: APPROVE
   - If any fail: SEND BACK with feedback

---

**This is the quality bar. Don't lower it.**
