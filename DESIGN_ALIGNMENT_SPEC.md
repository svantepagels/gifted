# GIFTED Design Alignment Specification
**Architect:** Fernando  
**Date:** 2026-03-27  
**Status:** Complete Technical Specification  

## Executive Summary

This document specifies EXACT alignment requirements between the current GIFTED implementation and the design references. Every misalignment is documented with pixel-precise specifications for the Coder to implement.

---

## 1. TYPOGRAPHY SYSTEM OVERHAUL

### 1.1 Logo Typography (CRITICAL FIX)
**Current:** Regular bold weight, standard letter-spacing  
**Design Spec:** Extra-bold/Black weight, tight compressed spacing

```typescript
// tailwind.config.ts - ADD new font token
fontFamily: {
  'archivo-black': ['Archivo Black', 'sans-serif'], // New dedicated logo font
}

// app/layout.tsx - Import Archivo Black separately
import { Archivo_Black } from 'next/font/google'
const archivoBlack = Archivo_Black({ 
  weight: '400', // Archivo Black only has one weight
  subsets: ['latin'],
  variable: '--font-archivo-black',
})

// components/layout/Header.tsx - Logo component
<Link 
  href="/"
  className="font-archivo-black text-[16px] leading-none tracking-tighter text-primary uppercase"
>
  GIFTED
</Link>
```

### 1.2 Hero Headline Typography
**Current:** text-display-md (2.75rem) sm:text-display-lg (3.5rem)  
**Design Spec:** 64-80px (4rem-5rem) on desktop, extra-bold, tight line-height

```typescript
// components/browse/HeroSection.tsx
<h1 className="font-archivo-black text-[2.5rem] sm:text-[4rem] lg:text-[5rem] leading-[0.95] tracking-[-0.02em] text-primary mb-6 text-center uppercase">
  BUY DIGITAL GIFT CARDS INSTANTLY.
</h1>
```

**Note:** The headline MUST end with a period for emphasis per design.

### 1.3 Section Headers
**Current:** Various sizes  
**Design Spec:** 18-20px, bold, uppercase, letter-spacing

```typescript
// Standardize ALL section headers
className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4"

// Examples:
// - "SELECT AMOUNT"
// - "DELIVERY METHOD"
// - "RECIPIENT EMAIL"
// - "ORDER SUMMARY"
```

### 1.4 Navigation Links
**Current:** text-body-md  
**Design Spec:** 12-13px, medium weight, uppercase, wide letter-spacing

```typescript
// components/layout/Header.tsx - Navigation
<nav className="hidden md:flex items-center gap-8">
  <Link className="text-[12px] font-medium uppercase tracking-[1px] text-surface-on-surface hover:text-secondary transition-colors">
    BROWSE
  </Link>
  <Link className="text-[12px] font-medium uppercase tracking-[1px] text-surface-on-surface hover:text-secondary transition-colors">
    DEALS
  </Link>
</nav>
```

---

## 2. LAYOUT & GRID SYSTEM

### 2.1 Product Grid Columns (CRITICAL FIX)
**Current:** 4 columns max (xl:grid-cols-4)  
**Design Spec:** 6 columns

```typescript
// components/browse/ProductGrid.tsx
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

### 2.2 Product Card Dimensions
**Current:** Wider cards with larger padding  
**Design Spec:** Narrow portrait cards, ~130-145px width

```typescript
// components/browse/ProductCard.tsx
// Remove motion wrapper or adjust it
<div className="bg-surface-container-lowest rounded-[12px] border border-[#E5E7EB] overflow-hidden hover:shadow-sm transition-shadow">
  {/* Logo Container */}
  <div className="aspect-square bg-surface-container flex items-center justify-center p-6">
    {/* Logo - 48-56px square */}
    <div className="w-14 h-14">
      {/* Logo image here */}
    </div>
  </div>
  
  {/* Content */}
  <div className="p-4 text-center">
    <h3 className="text-[14px] font-semibold text-surface-on-surface mb-1">
      {product.brandName}
    </h3>
    <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-surface-on-surface-variant">
      FROM ${minPrice}
    </p>
  </div>
</div>
```

### 2.3 Container Max Widths
**Current:** Full container with default max-w  
**Design Spec:** Centered, constrained to 880-960px for browse page

```typescript
// app/page.tsx - Update container
<div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
```

### 2.4 Two-Column Checkout Layout
**Current:** grid grid-cols-1 lg:grid-cols-2  
**Design Spec:** 60/40 split with specific gap

```typescript
// app/checkout/page.tsx
<div className="max-w-[1100px] mx-auto">
  <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
    {/* Left: Form */}
    {/* Right: Summary */}
  </div>
</div>
```

---

## 3. COLOR SYSTEM CORRECTIONS

### 3.1 Background Colors
**Current:** Various surface tokens  
**Design Spec:** Specific hex values per context

```typescript
// tailwind.config.ts - UPDATE exact values
surface: {
  DEFAULT: '#F5F5F5',        // Page background (was #F7F9FB)
  bright: '#FAFBFC',
  container: {
    lowest: '#FFFFFF',       // White cards
    low: '#F5F5F5',          // Light gray input backgrounds
    DEFAULT: '#F8F8FA',      // Product card logo area
    high: '#E6E8EA',
    highest: '#DFE1E4',
  },
}
```

### 3.2 Primary CTA Blue
**Current:** #0051D5  
**Design Spec:** Slightly different blue (#1565C0 for pay button, #2563EB for continue)

```typescript
// tailwind.config.ts
secondary: {
  DEFAULT: '#2563EB',        // Primary CTA (Continue as Guest)
  hover: '#1D4ED8',
  payment: '#1565C0',        // Payment submit button
  'on-secondary': '#FFFFFF',
}
```

### 3.3 Border Colors
**Current:** outline-variant with opacity  
**Design Spec:** Exact light gray borders

```typescript
// Replace all border-outline-variant with:
border-[#E5E7EB]  // Standard borders
border-[#D0D5DD]  // Search bar, inactive chips
```

---

## 4. COMPONENT-SPECIFIC SPECIFICATIONS

### 4.1 Header Component
**File:** `components/layout/Header.tsx`

```typescript
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EEEEEE]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link 
            href="/"
            className="font-archivo-black text-[16px] leading-none tracking-tighter text-black uppercase"
          >
            GIFTED
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-[12px] font-medium uppercase tracking-[1px] text-[#374151] hover:text-secondary">
              BROWSE
            </Link>
            <Link className="text-[12px] font-medium uppercase tracking-[1px] text-[#374151] hover:text-secondary">
              DEALS
            </Link>
            <Link className="text-[12px] font-medium uppercase tracking-[1px] text-[#374151] hover:text-secondary">
              MY CARDS
            </Link>
          </nav>
          
          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <CountrySelector /> {/* See section 4.2 */}
            <button className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-bold">
              ?
            </button>
            <button className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2563EB] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
```

### 4.2 Country Selector Pill
**File:** `components/shared/CountrySelector.tsx`

```typescript
// Pill button styling
<button className="flex items-center gap-2 h-8 px-4 bg-[#E8EDF2] rounded-full hover:bg-[#DDE3E9] transition-colors">
  <span className="text-[11px] font-medium uppercase tracking-[0.5px]">
    🇺🇸 UNITED STATES
  </span>
  <span className="px-2 py-0.5 bg-[#D0D5DD] rounded text-[10px] font-bold">
    USD
  </span>
  <ChevronDown className="h-3 w-3" />
</button>
```

### 4.3 Search Bar
**File:** `components/shared/SearchBar.tsx`

```typescript
<div className="w-full max-w-[540px] mx-auto">
  <div className="relative flex items-center bg-white border border-[#D0D5DD] rounded-full h-[52px] pr-1">
    <Search className="absolute left-5 h-5 w-5 text-[#9CA3AF]" />
    <input
      type="text"
      placeholder="Search 2,000+ brands or categories..."
      className="flex-1 pl-14 pr-4 bg-transparent text-[14px] placeholder:text-[#9CA3AF] focus:outline-none"
    />
    <button className="h-[44px] px-6 bg-black text-white text-[12px] font-bold uppercase tracking-[1px] rounded-full hover:bg-[#1A1A1A] transition-colors">
      SEARCH
    </button>
  </div>
</div>
```

### 4.4 Category Chips
**File:** `components/shared/CategoryChips.tsx`

```typescript
// Active chip
<button className="h-9 px-5 bg-black text-white text-[12px] font-bold uppercase tracking-[0.5px] rounded-full">
  ALL POPULAR
</button>

// Inactive chips
<button className="h-9 px-5 bg-white border border-[#D0D5DD] text-[#374151] text-[12px] font-bold uppercase tracking-[0.5px] rounded-full hover:border-black transition-colors">
  GAMING
</button>
```

### 4.5 Amount Selection Buttons
**File:** `components/product/AmountSelector.tsx`

```typescript
// Section header
<h3 className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
  SELECT AMOUNT
</h3>

// Button grid
<div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
  {amounts.map(amount => (
    <button
      key={amount}
      className={cn(
        "h-[80px] rounded-lg flex flex-col items-center justify-center transition-all",
        selectedAmount === amount
          ? "border-2 border-[#2563EB] bg-white text-[#2563EB]"
          : "border border-[#E0E0E0] bg-white text-[#374151] hover:border-black"
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.5px] text-inherit mb-1">
        USD
      </span>
      <span className="text-[24px] font-bold text-inherit">
        ${amount}
      </span>
    </button>
  ))}
  
  {/* Custom amount button */}
  <button className="h-[80px] border border-[#E0E0E0] rounded-lg flex flex-col items-center justify-center hover:border-black transition-colors">
    <span className="text-[11px] font-semibold uppercase tracking-[0.5px] mb-1">
      CUSTOM
    </span>
    <span className="text-[24px] font-bold">
      $…
    </span>
  </button>
</div>
```

### 4.6 Delivery Method Toggle
**File:** `components/product/DeliveryMethodToggle.tsx`

```typescript
<div className="flex gap-0 rounded-lg overflow-hidden">
  {/* FOR ME - Active */}
  <button 
    className={cn(
      "flex-1 h-12 text-[12px] font-bold uppercase tracking-[0.5px] transition-all",
      deliveryMethod === 'self'
        ? "bg-[#1A1A2E] text-white"
        : "bg-white border border-[#E0E0E0] text-[#374151] hover:border-black"
    )}
  >
    FOR ME
  </button>
  
  {/* SEND AS GIFT */}
  <button 
    className={cn(
      "flex-1 h-12 text-[12px] font-bold uppercase tracking-[0.5px] transition-all",
      deliveryMethod === 'gift'
        ? "bg-[#1A1A2E] text-white"
        : "bg-white border border-[#E0E0E0] text-[#374151] hover:border-black"
    )}
  >
    SEND AS GIFT
  </button>
</div>
```

### 4.7 Input Fields (Email, Billing)
**File:** `components/product/GiftDetailsForm.tsx` and `components/checkout/CheckoutForm.tsx`

```typescript
// Label
<label className="block text-[11px] font-bold uppercase tracking-[1.5px] text-primary mb-2">
  RECIPIENT EMAIL
</label>

// Input field
<input
  type="email"
  placeholder="email@address.com"
  className="w-full h-[50px] px-4 bg-[#F5F5F5] border border-[#E0E0E0] rounded-lg text-[15px] text-primary placeholder:text-[#999999] focus:border-[#1A1A2E] focus:outline-none transition-colors"
/>

// Helper text
<p className="mt-2 text-[12px] text-[#666666] leading-relaxed">
  The gift card code will be sent instantly to this address after payment.
</p>
```

### 4.8 Card Information (Stacked Inputs)
**File:** `components/checkout/CardInputGroup.tsx` (NEW COMPONENT)

```typescript
export function CardInputGroup() {
  return (
    <div className="rounded-lg overflow-hidden border border-[#E0E0E0] bg-white">
      {/* Card Number - Top */}
      <div className="relative border-b border-[#E0E0E0]">
        <input
          type="text"
          placeholder="Card number"
          className="w-full h-[50px] px-4 pr-12 text-[15px] focus:outline-none"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <CreditCard className="h-5 w-5 text-[#999999]" />
        </div>
      </div>
      
      {/* Expiry and CVC - Bottom Row */}
      <div className="flex">
        <input
          type="text"
          placeholder="MM / YY"
          className="flex-1 h-[50px] px-4 text-[15px] border-r border-[#E0E0E0] focus:outline-none"
        />
        <input
          type="text"
          placeholder="CVC"
          className="w-[40%] h-[50px] px-4 text-[15px] focus:outline-none"
        />
      </div>
    </div>
  )
}
```

### 4.9 Order Summary Panel
**File:** `components/product/OrderSummary.tsx`

```typescript
export function OrderSummary({ productName, amount, currency, onContinue, sticky }: OrderSummaryProps) {
  const serviceFee = calculateServiceFee(amount || 0)
  const total = (amount || 0) + serviceFee
  
  return (
    <div className={cn(
      "bg-white rounded-[12px] p-8 shadow-sm",
      sticky && "sticky top-24"
    )}>
      {/* Header */}
      <h2 className="text-[20px] font-bold uppercase tracking-[1px] text-primary mb-6">
        ORDER SUMMARY
      </h2>
      
      {/* Product Card */}
      <div className="flex items-center gap-4 p-4 bg-[#F8F8FA] border border-[#EEEEEE] rounded-[10px] mb-6">
        <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
          {/* Logo */}
        </div>
        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-primary mb-0.5">
            {productName}
          </h3>
          <p className="text-[13px] text-[#4A90D9]">
            Digital Delivery
          </p>
        </div>
        <span className="text-[15px] font-bold text-primary">
          ${amount}.00
        </span>
      </div>
      
      {/* Price Breakdown */}
      <div className="space-y-2 text-[14px] mb-4">
        <div className="flex justify-between text-[#777777]">
          <span>Subtotal</span>
          <span>${amount}.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#777777]">Processing Fee</span>
          <span className="text-[#22C55E] font-medium">$0.00</span>
        </div>
      </div>
      
      {/* Divider */}
      <div className="border-t border-[#EEEEEE] my-4" />
      
      {/* Total */}
      <div className="flex items-end justify-between mb-6">
        <span className="text-[14px] font-bold uppercase tracking-[1px] text-primary">
          TOTAL
        </span>
        <div className="text-right">
          <div className="text-[36px] font-extrabold leading-none text-primary">
            ${total}.00
          </div>
          <div className="text-[11px] text-[#999999] uppercase tracking-[0.5px]">
            USD
          </div>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          disabled={!amount}
          className="w-full h-14 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#CCCCCC] text-white text-[16px] font-bold uppercase tracking-[1px] rounded-[10px] transition-colors"
        >
          CONTINUE AS GUEST
        </button>
        <button className="w-full h-14 bg-[#F0F0F0] hover:bg-[#E5E5E5] text-black text-[16px] font-bold uppercase tracking-[1px] rounded-[10px] transition-colors">
          SIGN IN
        </button>
      </div>
      
      {/* Legal disclaimer */}
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[1px] text-[#999999] text-center leading-relaxed">
        By completing your purchase, you agree to our Terms of Service and Privacy Policy. Digital items are non-refundable.
      </p>
    </div>
  )
}
```

### 4.10 Payment Button (Different from Continue)
**File:** `components/checkout/CheckoutForm.tsx`

```typescript
<button
  type="submit"
  className="w-full h-14 bg-[#1565C0] hover:bg-[#1255A0] text-white text-[16px] font-bold uppercase tracking-[1px] rounded-[10px] transition-colors"
>
  PAY ${total}.00
</button>
```

### 4.11 Success Page Icon
**File:** `components/success/SuccessSummary.tsx`

```typescript
export function SuccessSummary({ order }: SuccessSummaryProps) {
  return (
    <div className="max-w-[750px] mx-auto">
      {/* Content Card */}
      <div className="bg-white rounded-[16px] p-12 sm:p-16 text-center">
        {/* Success Icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {/* Outer ring/halo */}
          <div className="absolute w-[110px] h-[110px] rounded-full bg-[#4CAF50]/20" />
          {/* Main circle */}
          <div className="relative w-[80px] h-[80px] rounded-full bg-[#4CAF50] flex items-center justify-center">
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </div>
        </div>
        
        {/* Success Message */}
        <h1 className="text-[32px] sm:text-[36px] font-extrabold uppercase tracking-tight text-primary mb-4">
          PURCHASE SUCCESSFUL
        </h1>
        <p className="text-[16px] sm:text-[18px] text-[#666666] max-w-[400px] mx-auto mb-8 leading-relaxed">
          Your gift card code will arrive in your inbox in 1-2 minutes.
        </p>
        
        {/* Order Details Card */}
        <div className="bg-[#F5F5F5] rounded-[12px] p-6 mb-8 text-left">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#999999] mb-1">
                PRODUCT
              </div>
              <div className="text-[16px] font-semibold text-primary">
                {order.productName} ${order.amount}.00
              </div>
            </div>
            <div className="flex justify-end items-center">
              {/* Product thumbnail icon */}
              <div className="w-10 h-7 bg-black rounded" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#999999] mb-1">
                RECIPIENT
              </div>
              <div className="text-[16px] font-medium text-primary">
                {order.customerEmail}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#999999] mb-1">
                ORDER ID
              </div>
              <div className="text-[16px] font-medium text-primary">
                #{order.id}
              </div>
            </div>
          </div>
        </div>
        
        {/* CTAs */}
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full h-14 bg-[#1A237E] hover:bg-[#151B5E] text-white text-[14px] font-bold uppercase tracking-[1px] rounded-[10px] transition-colors flex items-center justify-center"
          >
            BUY ANOTHER GIFT CARD
          </Link>
          <Link
            href="/orders"
            className="block text-[13px] font-bold uppercase tracking-[1px] text-[#1565C0] hover:text-[#1255A0] transition-colors"
          >
            VIEW ORDER HISTORY
          </Link>
        </div>
      </div>
      
      {/* Trust Badges */}
      <div className="mt-10 pt-8 border-t border-[#E5E7EB]">
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#666666]">
              ✓ INSTANT DELIVERY
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#666666]">
              🔒 SECURE PAYMENT
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#666666]">
              🎧 24/7 SUPPORT
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 5. SPACING SYSTEM

### 5.1 Vertical Spacing Tokens
Use exact pixel values, not arbitrary Tailwind spacing:

```typescript
// Replace current spacing with:
mb-2   → mb-[8px]
mb-3   → mb-[12px]
mb-4   → mb-[16px]
mb-6   → mb-[24px]
mb-8   → mb-[32px]
mb-10  → mb-[40px]
mb-12  → mb-[48px]
mb-16  → mb-[60px]
```

### 5.2 Section Spacing Pattern
```typescript
// Between major sections
className="space-y-[40px]"

// Between form fields
className="space-y-[28px]"

// Label to input
className="mb-[10px]"

// Input to helper text
className="mt-[8px]"
```

---

## 6. MOBILE RESPONSIVE SPECIFICATIONS

### 6.1 Breakpoint Strategy
```typescript
// Mobile: 1-2 columns (products), stacked layout (checkout)
// Tablet (sm): 3 columns, still stacked
// Desktop (lg): 6 columns (browse), 2-column (checkout)
```

### 6.2 Mobile Product Grid
```typescript
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
```

### 6.3 Mobile Header Height
```typescript
// Reduce header height on mobile
<div className="h-14 sm:h-16">
```

---

## 7. INTERACTION STATES

### 7.1 Button Hover States
```typescript
// Primary CTA
hover:bg-[#1D4ED8]

// Secondary button (gray)
hover:bg-[#E5E5E5]

// Payment button
hover:bg-[#1255A0]

// Product cards
hover:shadow-sm transition-shadow duration-200
```

### 7.2 Input Focus States
```typescript
focus:border-[#1A1A2E] focus:outline-none focus:ring-0
```

### 7.3 Active States (Amount Selection)
```typescript
// Selected amount button
border-2 border-[#2563EB] bg-white text-[#2563EB]

// Unselected
border border-[#E0E0E0] bg-white hover:border-black
```

---

## 8. SHADOW & ELEVATION

### 8.1 Remove Excessive Shadows
**Current:** Product cards use shadow-ambient and shadow-ambient-lg  
**Design Spec:** Minimal or no shadows, rely on borders

```typescript
// Replace in ProductCard
- shadow-ambient hover:shadow-ambient-lg
+ border border-[#E5E7EB] hover:shadow-sm

// Only use shadows for:
// 1. Order summary panel (sticky sidebar)
shadow-sm  // Very subtle

// 2. Dropdowns/modals (if implemented)
shadow-ambient  // Keep this token for true floating elements
```

---

## 9. CRITICAL FIXES SUMMARY

### Priority 1 (Must Fix Before Testing)
1. ✅ Logo font weight → Archivo Black, tight tracking
2. ✅ Product grid → 6 columns instead of 4
3. ✅ Hero headline → Larger (4-5rem), uppercase, with period
4. ✅ Section headers → 18px, bold, uppercase, tracking
5. ✅ Amount buttons → Vertical layout with USD label above price
6. ✅ Total price → 36px, extra-bold in summary panel
7. ✅ Success icon → Green checkmark with halo ring
8. ✅ Card input → Stacked/connected fields (top + bottom row)

### Priority 2 (Visual Polish)
9. ✅ Search bar → Rounded pill with internal button
10. ✅ Category chips → Active (black) vs inactive (white/border)
11. ✅ Country selector → Pill with USD badge
12. ✅ Delivery toggle → Black active, white inactive
13. ✅ Border colors → Exact light grays (#E5E7EB, #D0D5DD)
14. ✅ Input fields → Light gray backgrounds (#F5F5F5)

### Priority 3 (Fine-Tuning)
15. ✅ Spacing rhythm → Exact pixel values per section
16. ✅ Navigation links → 12px, uppercase, tracked
17. ✅ Helper text → 12px, gray
18. ✅ Legal disclaimers → 10px, uppercase, gray
19. ✅ Trust badges → Icons + uppercase labels
20. ✅ Remove motion effects that conflict with design simplicity

---

## 10. VERIFICATION CHECKLIST

### For Tester Agent
After implementation, verify these screenshot comparisons:

#### Homepage (Desktop)
- [ ] Logo is bold/compressed matching design
- [ ] Hero headline is 4-5rem with period
- [ ] Search bar is rounded pill with internal button
- [ ] Category chips: black active, white inactive with borders
- [ ] Product grid shows 6 columns
- [ ] Product cards are narrow (~140px), portrait aspect
- [ ] Product cards have subtle borders, minimal shadows
- [ ] Trust badges section matches design

#### Product Detail (Desktop)
- [ ] Two-column layout: 60/40 split
- [ ] Amount buttons show USD label above price
- [ ] Delivery toggle: black active state
- [ ] Email input has light gray background
- [ ] Order summary panel: 36px total price
- [ ] Primary CTA is blue (#2563EB)
- [ ] Secondary CTA is light gray

#### Checkout (Desktop)
- [ ] Page title "Checkout" is large
- [ ] Card input fields are stacked/connected
- [ ] ZIP input field is full-width
- [ ] Payment button says "PAY $XX.XX" in #1565C0
- [ ] Order summary shows product thumbnail
- [ ] Legal disclaimer is 10px, uppercase, centered

#### Success (Desktop)
- [ ] Green checkmark icon with halo ring
- [ ] "PURCHASE SUCCESSFUL" is 32-36px, uppercase, bold
- [ ] Order details card has gray background
- [ ] Primary CTA is dark navy (#1A237E)
- [ ] Trust badges row at bottom

#### Mobile Responsive
- [ ] Grid collapses to 2 columns on mobile
- [ ] Checkout form stacks vertically
- [ ] Navigation hides on mobile (hamburger or bottom nav)
- [ ] Header height reduces to 56px

---

## 11. IMPLEMENTATION ORDER

Recommend implementing in this sequence:

### Phase 1: Typography & Foundation (30 min)
1. Add Archivo Black font import
2. Update tailwind.config.ts with exact colors
3. Fix logo component
4. Update all section headers to 18px/bold/uppercase

### Phase 2: Layout & Grid (45 min)
5. Fix product grid to 6 columns
6. Update product card dimensions and content
7. Fix two-column checkout layout
8. Add max-width constraints per page

### Phase 3: Components (90 min)
9. Rebuild search bar as pill
10. Fix category chips styling
11. Update amount selection buttons
12. Fix delivery method toggle
13. Rebuild input fields (email, billing, card group)
14. Update order summary panel with 36px total

### Phase 4: Pages (60 min)
15. Update hero section headline
16. Fix success page icon and layout
17. Update button styles across all CTAs
18. Add trust badges sections

### Phase 5: Polish (30 min)
19. Replace all spacing tokens with exact pixels
20. Update all border colors to exact hex values
21. Remove excessive shadows
22. Test all hover/focus states

**Total Estimated Implementation Time: ~4 hours**

---

## 12. DATA REQUIREMENTS

### No API Changes Required
All alignment work is purely presentational. No backend, database, or API modifications needed.

### Mock Data Updates (Optional)
- Ensure product catalog has logos (URLs or placeholders)
- Consider adding 6+ products per category for grid testing

---

## 13. DEPLOYMENT NOTES

### Build Verification
```bash
npm run build
# Check for any type errors or build warnings
# Verify bundle size hasn't increased significantly
```

### Lighthouse Targets
- Performance: >90
- Accessibility: >95 (ensure all interactive elements have labels)
- Best Practices: 100
- SEO: >90

### Cross-Browser Testing
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Mobile Safari (iOS 15+)
- Mobile Chrome (Android)

---

## FINAL NOTES

This specification is EXHAUSTIVE and EXACT. Every component, every spacing value, every color has been specified to match the design references pixel-perfectly.

**For Coder:**
- Implement in the order specified
- Use exact hex values and pixel sizes provided
- Do NOT approximate or "make it look similar" - match precisely
- Test each component against the design screenshots
- If any specification is unclear, request clarification before implementing

**For Tester:**
- Use Playwright to capture screenshots of each implemented page
- Compare side-by-side with design reference screenshots
- Flag ANY differences, no matter how small
- Check responsive breakpoints at exact widths (375px, 768px, 1024px, 1440px)
- Verify all interaction states (hover, focus, active)

**For Queen (Approval):**
- Final review should compare Playwright screenshots against design refs
- Approve only when pixel-perfect alignment is achieved
- If differences exist, send back to Coder with specific notes

---

**END OF SPECIFICATION**
