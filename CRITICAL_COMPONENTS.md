# Critical Component Implementations
**Quick Reference for High-Priority Fixes**

This document provides copy-paste ready code for the most critical component updates.

---

## 1. LOGO (Header Component)

**File:** `app/layout.tsx`

```typescript
import { Archivo_Black, Inter } from 'next/font/google'

const archivoBlack = Archivo_Black({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body className="font-inter">
        {children}
      </body>
    </html>
  )
}
```

**File:** `tailwind.config.ts`

```typescript
fontFamily: {
  'archivo-black': ['var(--font-archivo-black)', 'sans-serif'],
  'inter': ['var(--font-inter)', 'sans-serif'],
},
```

**File:** `components/layout/Header.tsx`

```typescript
<Link 
  href="/"
  className="font-archivo-black text-[16px] leading-none tracking-tighter text-black uppercase"
>
  GIFTED
</Link>
```

---

## 2. HERO HEADLINE

**File:** `components/browse/HeroSection.tsx`

```typescript
export function HeroSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 bg-[#F2F4F7] rounded-[16px] mx-4 my-6">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="font-archivo-black text-[2.5rem] sm:text-[4rem] lg:text-[5rem] leading-[0.95] tracking-[-0.02em] text-black mb-0 uppercase">
          BUY DIGITAL GIFT CARDS INSTANTLY.
        </h1>
      </div>
    </section>
  )
}
```

---

## 3. SEARCH BAR

**File:** `components/shared/SearchBar.tsx`

```typescript
'use client'

import { Search } from 'lucide-react'

export function SearchBar() {
  return (
    <div className="w-full max-w-[540px] mx-auto px-4">
      <div className="relative flex items-center bg-white border border-[#D0D5DD] rounded-full h-[52px] pr-1">
        <Search className="absolute left-5 h-5 w-5 text-[#9CA3AF] pointer-events-none" />
        <input
          type="text"
          placeholder="Search 2,000+ brands or categories..."
          className="flex-1 pl-14 pr-4 bg-transparent text-[14px] text-black placeholder:text-[#9CA3AF] focus:outline-none border-0 ring-0 rounded-full"
        />
        <button className="h-[44px] px-6 bg-black text-white text-[12px] font-bold uppercase tracking-[1px] rounded-full hover:bg-[#1A1A1A] transition-colors flex-shrink-0">
          SEARCH
        </button>
      </div>
    </div>
  )
}
```

---

## 4. CATEGORY CHIPS

**File:** `components/shared/CategoryChips.tsx`

```typescript
'use client'

import { useState } from 'react'

interface Category {
  id: string
  name: string
}

interface CategoryChipsProps {
  categories: Category[]
}

export function CategoryChips({ categories }: CategoryChipsProps) {
  const [selected, setSelected] = useState<string>('all')
  
  const allCategories = [
    { id: 'all', name: 'ALL POPULAR' },
    ...categories,
  ]
  
  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide px-4 sm:px-0">
      {allCategories.map((category) => (
        <button
          key={category.id}
          onClick={() => setSelected(category.id)}
          className={
            selected === category.id
              ? "h-9 px-5 bg-black text-white text-[12px] font-bold uppercase tracking-[0.5px] rounded-full flex-shrink-0"
              : "h-9 px-5 bg-white border border-[#D0D5DD] text-[#374151] text-[12px] font-bold uppercase tracking-[0.5px] rounded-full hover:border-black transition-colors flex-shrink-0"
          }
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
```

---

## 5. PRODUCT GRID (6 COLUMNS)

**File:** `components/browse/ProductGrid.tsx`

```typescript
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-4 sm:px-0">
  {products.map((product) => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

---

## 6. PRODUCT CARD

**File:** `components/browse/ProductCard.tsx`

```typescript
'use client'

import Link from 'next/link'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils/currency'

interface ProductCardProps {
  product: GiftCardProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectedCountry } = useApp()
  
  const minPrice = product.denominationType === 'FIXED' && product.fixedDenominations
    ? product.fixedDenominations[0].value
    : product.denominationRange?.min || 0
  
  return (
    <Link href={`/gift-card/${product.slug}`} className="block group">
      <div className="bg-white rounded-[12px] border border-[#E5E7EB] overflow-hidden hover:shadow-sm transition-shadow duration-200">
        {/* Logo Container */}
        <div className="aspect-square bg-[#F8F8FA] flex items-center justify-center p-6">
          <div className="w-14 h-14 flex items-center justify-center">
            {/* Placeholder - replace with actual logo */}
            <div className="w-full h-full rounded-lg bg-[#ECEEF0] flex items-center justify-center">
              <span className="text-xl font-bold text-[#64748B]">
                {product.brandName[0]}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 text-center">
          <h3 className="text-[14px] font-semibold text-black mb-1 group-hover:text-[#2563EB] transition-colors">
            {product.brandName}
          </h3>
          <p className="text-[11px] font-medium uppercase tracking-[0.5px] text-[#6B7280]">
            FROM {formatCurrency(minPrice, selectedCountry.currency)}
          </p>
        </div>
      </div>
    </Link>
  )
}
```

---

## 7. AMOUNT SELECTOR

**File:** `components/product/AmountSelector.tsx`

```typescript
'use client'

import { useState } from 'react'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { cn } from '@/lib/utils'

interface AmountSelectorProps {
  product: GiftCardProduct
  currency: string
  selectedAmount: number | null
  onAmountChange: (amount: number) => void
}

export function AmountSelector({ product, currency, selectedAmount, onAmountChange }: AmountSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  
  const amounts = product.denominationType === 'FIXED' && product.fixedDenominations
    ? product.fixedDenominations.map(d => d.value)
    : [10, 25, 50, 100]
  
  return (
    <div>
      <h3 className="text-[18px] font-bold uppercase tracking-[1.5px] text-black mb-4">
        SELECT AMOUNT
      </h3>
      
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {amounts.map(amount => (
          <button
            key={amount}
            onClick={() => onAmountChange(amount)}
            className={cn(
              "h-[80px] rounded-lg flex flex-col items-center justify-center transition-all",
              selectedAmount === amount
                ? "border-2 border-[#2563EB] bg-white"
                : "border border-[#E0E0E0] bg-white hover:border-black"
            )}
          >
            <span className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.5px] mb-1",
              selectedAmount === amount ? "text-[#2563EB]" : "text-[#374151]"
            )}>
              {currency}
            </span>
            <span className={cn(
              "text-[24px] font-bold",
              selectedAmount === amount ? "text-[#2563EB]" : "text-black"
            )}>
              ${amount}
            </span>
          </button>
        ))}
        
        {product.denominationType === 'RANGE' && (
          <button
            onClick={() => setShowCustom(true)}
            className="h-[80px] border border-[#E0E0E0] rounded-lg flex flex-col items-center justify-center hover:border-black transition-colors bg-white"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.5px] mb-1 text-[#374151]">
              CUSTOM
            </span>
            <span className="text-[24px] font-bold text-black">
              $…
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
```

---

## 8. ORDER SUMMARY PANEL

**File:** `components/product/OrderSummary.tsx`

```typescript
'use client'

import { formatCurrency, calculateServiceFee } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'

interface OrderSummaryProps {
  productName: string
  amount: number | null
  currency: string
  onContinue: () => void
  sticky?: boolean
}

export function OrderSummary({ productName, amount, currency, onContinue, sticky }: OrderSummaryProps) {
  const serviceFee = amount ? calculateServiceFee(amount) : 0
  const total = (amount || 0) + serviceFee
  
  return (
    <div className={cn(
      "bg-white rounded-[12px] p-8 border border-[#E5E7EB]",
      sticky && "sticky top-24"
    )}>
      {/* Header */}
      <h2 className="text-[20px] font-bold uppercase tracking-[1px] text-black mb-6">
        ORDER SUMMARY
      </h2>
      
      {/* Product Card */}
      {amount && (
        <div className="flex items-center gap-4 p-4 bg-[#F8F8FA] border border-[#EEEEEE] rounded-[10px] mb-6">
          <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
            {/* Logo placeholder */}
            <span className="text-white text-lg font-bold">{productName[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-black mb-0.5 truncate">
              {productName}
            </h3>
            <p className="text-[13px] text-[#4A90D9]">
              Digital Delivery
            </p>
          </div>
          <span className="text-[15px] font-bold text-black flex-shrink-0">
            ${amount}.00
          </span>
        </div>
      )}
      
      {/* Price Breakdown */}
      {amount && (
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
      )}
      
      {/* Divider */}
      {amount && <div className="border-t border-[#EEEEEE] my-4" />}
      
      {/* Total */}
      <div className="flex items-end justify-between mb-6">
        <span className="text-[14px] font-bold uppercase tracking-[1px] text-black">
          TOTAL
        </span>
        <div className="text-right">
          <div className="text-[36px] font-extrabold leading-none text-black">
            ${total}.00
          </div>
          <div className="text-[11px] text-[#999999] uppercase tracking-[0.5px] mt-1">
            {currency}
          </div>
        </div>
      </div>
      
      {/* CTA Buttons */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          disabled={!amount}
          className="w-full h-14 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:bg-[#CCCCCC] disabled:cursor-not-allowed text-white text-[16px] font-bold uppercase tracking-[1px] rounded-[10px] transition-colors"
        >
          CONTINUE AS GUEST
        </button>
        <button className="w-full h-14 bg-[#F0F0F0] hover:bg-[#E5E5E5] text-black text-[16px] font-bold uppercase tracking-[1px] rounded-[10px] transition-colors">
          SIGN IN
        </button>
      </div>
      
      {/* Legal disclaimer */}
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[1px] text-[#999999] text-center leading-relaxed">
        By completing your purchase, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}
```

---

## 9. DELIVERY METHOD TOGGLE

**File:** `components/product/DeliveryMethodToggle.tsx`

```typescript
'use client'

import { DeliveryMethod } from '@/lib/orders/types'
import { cn } from '@/lib/utils'

interface DeliveryMethodToggleProps {
  value: DeliveryMethod
  onChange: (method: DeliveryMethod) => void
}

export function DeliveryMethodToggle({ value, onChange }: DeliveryMethodToggleProps) {
  return (
    <div>
      <h3 className="text-[18px] font-bold uppercase tracking-[1.5px] text-black mb-4">
        DELIVERY METHOD
      </h3>
      
      <div className="flex gap-0 rounded-lg overflow-hidden">
        <button 
          onClick={() => onChange('self')}
          className={cn(
            "flex-1 h-12 text-[12px] font-bold uppercase tracking-[0.5px] transition-all",
            value === 'self'
              ? "bg-[#1A1A2E] text-white"
              : "bg-white border border-[#E0E0E0] text-[#374151] hover:border-black"
          )}
        >
          FOR ME
        </button>
        
        <button 
          onClick={() => onChange('gift')}
          className={cn(
            "flex-1 h-12 text-[12px] font-bold uppercase tracking-[0.5px] transition-all",
            value === 'gift'
              ? "bg-[#1A1A2E] text-white"
              : "bg-white border border-[#E0E0E0] text-[#374151] hover:border-black"
          )}
        >
          SEND AS GIFT
        </button>
      </div>
    </div>
  )
}
```

---

## 10. SUCCESS PAGE ICON

**File:** `components/success/SuccessIcon.tsx`

```typescript
import { Check } from 'lucide-react'

export function SuccessIcon() {
  return (
    <div className="relative inline-flex items-center justify-center mb-8">
      {/* Outer ring/halo */}
      <div className="absolute w-[110px] h-[110px] rounded-full bg-[#4CAF50]/20" />
      
      {/* Main circle */}
      <div className="relative w-[80px] h-[80px] rounded-full bg-[#4CAF50] flex items-center justify-center shadow-lg">
        <Check className="w-10 h-10 text-white stroke-[3]" />
      </div>
    </div>
  )
}
```

---

## 11. CARD INPUT GROUP (STACKED)

**File:** `components/checkout/CardInputGroup.tsx`

```typescript
'use client'

import { CreditCard } from 'lucide-react'

export function CardInputGroup() {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[1.5px] text-black mb-2">
        CARD INFORMATION
      </label>
      
      <div className="rounded-lg overflow-hidden border border-[#E0E0E0] bg-white focus-within:border-[#1A1A2E] transition-colors">
        {/* Card Number - Top */}
        <div className="relative border-b border-[#E0E0E0]">
          <input
            type="text"
            placeholder="Card number"
            className="w-full h-[50px] px-4 pr-12 text-[15px] text-black placeholder:text-[#999999] focus:outline-none bg-transparent"
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
            className="flex-1 h-[50px] px-4 text-[15px] text-black placeholder:text-[#999999] border-r border-[#E0E0E0] focus:outline-none bg-transparent"
          />
          <input
            type="text"
            placeholder="CVC"
            className="w-[40%] h-[50px] px-4 text-[15px] text-black placeholder:text-[#999999] focus:outline-none bg-transparent"
          />
        </div>
      </div>
    </div>
  )
}
```

---

## 12. UTILITY FUNCTION

**File:** `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## IMPLEMENTATION CHECKLIST

For Coder - implement in this order:

1. [ ] Update `app/layout.tsx` with Archivo Black font
2. [ ] Update `tailwind.config.ts` with font-archivo-black
3. [ ] Replace Header logo with new styling
4. [ ] Replace HeroSection headline
5. [ ] Replace SearchBar component
6. [ ] Replace CategoryChips component
7. [ ] Update ProductGrid columns to 6
8. [ ] Replace ProductCard component
9. [ ] Replace AmountSelector component
10. [ ] Replace DeliveryMethodToggle component
11. [ ] Replace OrderSummary component
12. [ ] Create CardInputGroup component
13. [ ] Create SuccessIcon component
14. [ ] Update SuccessSummary to use SuccessIcon

After implementing all components, run:
```bash
npm run build
npm run dev
```

Test at these breakpoints:
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px
- Large: 1440px

Compare screenshots with design references.
