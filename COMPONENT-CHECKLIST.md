# Component Implementation Checklist

Use this checklist to track component implementation progress.

## Layout Components

### Header (`components/layout/Header.tsx`)
- [ ] Logo (GIFTED wordmark, Archivo Black)
- [ ] Desktop nav links (Browse, Deals, My Cards)
- [ ] Country selector integration
- [ ] Help icon button
- [ ] Cart icon with badge (shows "1" when item selected)
- [ ] Sticky positioning
- [ ] Border bottom with ghost border
- [ ] Responsive: hide nav on mobile

### Footer (`components/layout/Footer.tsx`)
- [ ] Brand name
- [ ] Links (About, Help, Terms, Privacy)
- [ ] Copyright text
- [ ] Restrained styling matching design system

### MobileBottomNav (`components/layout/MobileBottomNav.tsx`)
- [ ] Home icon + label
- [ ] Browse icon + label
- [ ] My Cards icon + label
- [ ] Profile icon + label
- [ ] Fixed bottom positioning
- [ ] Active state highlighting
- [ ] Only visible on mobile (<768px)

---

## Shared Components

### Button (`components/shared/Button.tsx`)
- [ ] Primary variant (secondary blue #0051D5)
- [ ] Secondary variant (outline style)
- [ ] Text variant
- [ ] Size options: sm, md, lg
- [ ] Loading state with spinner
- [ ] Disabled state
- [ ] Full width option
- [ ] Hover state (darker shade)
- [ ] Active state (scale down)
- [ ] 12px border radius
- [ ] Proper padding (1rem vertical, 2rem horizontal for lg)

### Input (`components/shared/Input.tsx`)
- [ ] Text input
- [ ] Number input
- [ ] Email input with validation styling
- [ ] Ghost border (outline-variant at 20% opacity)
- [ ] Focus state (secondary blue border at 100%)
- [ ] Error state (error color border)
- [ ] Label above input
- [ ] Helper text below input
- [ ] 12px border radius
- [ ] surface-container-low background

### CountrySelector (`components/shared/CountrySelector.tsx`)
- [ ] Pill button (rounded-full)
- [ ] Flag emoji display
- [ ] Country name (hidden on mobile)
- [ ] Currency code in parentheses
- [ ] Chevron icon (rotates when open)
- [ ] Dropdown panel (absolute positioned)
- [ ] Country list with flags
- [ ] Checkmark on selected country
- [ ] Click outside to close
- [ ] Framer Motion animations (fade + slide)
- [ ] Ambient shadow on dropdown
- [ ] Hover states on options

### SearchBar (`components/shared/SearchBar.tsx`)
- [ ] Large input field
- [ ] Search icon (left side)
- [ ] Clear button (right side, appears on input)
- [ ] Placeholder text
- [ ] Real-time filtering
- [ ] URL query param sync
- [ ] Ghost border styling

### CategoryChips (`components/shared/CategoryChips.tsx`)
- [ ] Horizontal scrollable row
- [ ] Category buttons (rounded-full)
- [ ] Active state (primary-container background)
- [ ] Inactive state (surface-container-high)
- [ ] URL query param sync
- [ ] Smooth scroll on mobile
- [ ] No scrollbar visible

---

## Browse/Home Components

### HeroSection (`components/browse/HeroSection.tsx`)
- [ ] Large headline (display-lg or headline-lg)
- [ ] Subtitle text
- [ ] Generous whitespace
- [ ] Centered layout
- [ ] Responsive sizing (smaller on mobile)

### ProductCard (`components/browse/ProductCard.tsx`)
- [ ] Logo container (4:3 aspect ratio, white bg)
- [ ] Brand logo (object-contain, centered)
- [ ] Ghost border if logo needs definition
- [ ] Brand name (title-lg)
- [ ] Description (body-md, line-clamp-2)
- [ ] "From {amount}" pricing
- [ ] Category tags (label-sm pills)
- [ ] Hover state (lift -4px, shadow-ambient)
- [ ] Smooth transitions
- [ ] 16px border radius
- [ ] Link to product detail

### ProductGrid (`components/browse/ProductGrid.tsx`)
- [ ] Responsive grid (1 col mobile, 2 col tablet, 3 col desktop)
- [ ] Gap spacing (8 or 12)
- [ ] Empty state (when no products match filters)
- [ ] Loading state (skeleton cards)
- [ ] Filtered by country
- [ ] Filtered by category
- [ ] Filtered by search query

### TrustSection (`components/browse/TrustSection.tsx`)
- [ ] Section title
- [ ] Trust badges/benefits (icons + text)
- [ ] Centered layout
- [ ] Tonal background shift (surface-container-low)
- [ ] Generous padding

---

## Product Detail Components

### ProductHero (`components/product/ProductHero.tsx`)
- [ ] Large brand logo
- [ ] Product name (headline-lg)
- [ ] Selected country badge
- [ ] "Digital delivery" label
- [ ] Category tags
- [ ] Breadcrumb navigation
- [ ] Responsive layout

### AmountSelector (`components/product/AmountSelector.tsx`)
- [ ] Grid of fixed denomination buttons (2-3 cols)
- [ ] Custom amount button (opens input)
- [ ] Range input (for RANGE type products)
- [ ] Selected state (border-secondary)
- [ ] Min/max display for range
- [ ] Currency formatting
- [ ] Disabled state for out-of-range
- [ ] onChange callback

### DeliveryMethodToggle (`components/product/DeliveryMethodToggle.tsx`)
- [ ] Two options: "For me" / "Send as gift"
- [ ] Radio button or segmented control style
- [ ] Selected state highlighting
- [ ] Icon for each option
- [ ] onChange callback
- [ ] Conditional rendering based on selection

### GiftDetailsForm (`components/product/GiftDetailsForm.tsx`)
- [ ] Recipient email input (required if gift mode)
- [ ] Gift message textarea (optional, max 300 chars)
- [ ] Character counter
- [ ] Validation error display
- [ ] Only visible when "Send as gift" selected
- [ ] React Hook Form integration
- [ ] Zod schema validation

### OrderSummary (`components/product/OrderSummary.tsx`)
- [ ] Product name display
- [ ] Selected amount
- [ ] Service fee calculation (5%)
- [ ] Total amount (large, bold)
- [ ] Currency formatting
- [ ] "Continue as guest" primary button
- [ ] "Sign in" secondary button
- [ ] Trust badges (instant delivery, secure, guarantee)
- [ ] Empty state when no amount selected
- [ ] Sticky positioning on desktop
- [ ] Fixed bottom on mobile (with safe-area-inset)

---

## Checkout Components

### OrderReview (`components/checkout/OrderReview.tsx`)
- [ ] Brand logo thumbnail
- [ ] Product name
- [ ] Amount
- [ ] Recipient details (if gift)
- [ ] Gift message preview (if provided)
- [ ] Edit button (back to product page)
- [ ] Card container styling

### CheckoutForm (`components/checkout/CheckoutForm.tsx`)
- [ ] Email input
- [ ] Confirm email input
- [ ] Email match validation
- [ ] Submit button
- [ ] Loading state during submission
- [ ] Error message display
- [ ] React Hook Form + Zod
- [ ] Auto-fill from context if available

### PaymentArea (`components/checkout/PaymentArea.tsx`)
- [ ] Placeholder for Lemon Squeezy embed
- [ ] Trust badges (secure payment, SSL, etc.)
- [ ] Payment method icons
- [ ] Currently: message about mock checkout
- [ ] TODO comment for Lemon Squeezy integration

---

## Success Components

### SuccessSummary (`components/success/SuccessSummary.tsx`)
- [ ] Success icon/illustration (restrained)
- [ ] "Order complete" headline (headline-lg)
- [ ] Order ID display
- [ ] Brand logo
- [ ] Product name
- [ ] Amount
- [ ] Recipient email (where sent)
- [ ] Gift card code display (if available)
- [ ] PIN display (if available)
- [ ] Redeem instructions
- [ ] "Buy another" CTA button
- [ ] "View order details" button
- [ ] Success green accents (tertiary-fixed-dim)
- [ ] Calm, premium feel

---

## Implementation Priority

### Phase 1: Core Layout & Navigation (Day 1)
1. Header
2. Footer
3. MobileBottomNav
4. Button
5. Input
6. CountrySelector

### Phase 2: Home/Browse (Day 2)
1. HeroSection
2. SearchBar
3. CategoryChips
4. ProductCard
5. ProductGrid
6. TrustSection

### Phase 3: Product Detail (Day 3)
1. ProductHero
2. AmountSelector
3. DeliveryMethodToggle
4. GiftDetailsForm
5. OrderSummary

### Phase 4: Checkout & Success (Day 4)
1. OrderReview
2. CheckoutForm
3. PaymentArea
4. SuccessSummary

### Phase 5: Polish & Testing (Day 5)
1. Animations (Framer Motion)
2. Responsive refinement
3. Playwright tests
4. Visual comparison with design refs
5. Accessibility audit

---

## Visual Quality Checklist

For each component, verify:

- [ ] **Typography:** Correct font family (Archivo for headlines, Inter for UI)
- [ ] **Spacing:** Follows 8pt grid (4, 8, 12, 16, 24, 32, 48, 64px)
- [ ] **Colors:** Uses design tokens from tailwind.config.ts
- [ ] **Borders:** Ghost borders only (outline-variant at 20-30%)
- [ ] **Radius:** Correct (8px sm, 12px md, 16px lg)
- [ ] **Shadows:** Ambient shadow only on floating elements
- [ ] **Hover:** Subtle color shift or elevation
- [ ] **Active:** Scale down (0.98) or color darken
- [ ] **Focus:** Visible focus ring (secondary color)
- [ ] **Disabled:** Reduced opacity (40-50%)
- [ ] **Responsive:** Mobile-first, enhanced for desktop
- [ ] **Animation:** Subtle, no bouncy/flashy effects
- [ ] **Accessibility:** ARIA labels, keyboard nav, sufficient contrast

---

## Testing Requirements

For each component:

- [ ] Unit test (React Testing Library)
- [ ] Visual test (Playwright screenshot)
- [ ] Responsive test (mobile + desktop)
- [ ] Interaction test (clicks, form submission)
- [ ] Accessibility test (axe-core)
- [ ] Edge cases (empty states, error states, loading states)
