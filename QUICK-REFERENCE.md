# GIFTED - Quick Reference for CODER

**Use this document for fast lookups during implementation.**

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm run test

# Update visual baselines
npm run test:update
```

---

## 📁 File Structure Pattern

```
app/
├── layout.tsx              # Server (CartProvider wrapper)
├── page.tsx                # Server (fetch products)
├── gift-card/[slug]/
│   └── page.tsx            # Server (fetch product detail)
├── checkout/page.tsx       # Server + Client wrapper
└── success/page.tsx        # Server (fetch order)

components/
├── server/
│   ├── Header.tsx
│   └── Footer.tsx
└── client/
    ├── SearchBar.tsx       # 'use client'
    ├── CategoryChips.tsx   # 'use client'
    ├── AmountSelector.tsx  # 'use client'
    └── CheckoutForm.tsx    # 'use client'

lib/
├── giftcards/
│   ├── types.ts
│   ├── mock-data.ts
│   ├── service.ts
│   └── reloadly-adapter.ts
└── payments/
    ├── types.ts
    └── lemon-squeezy-adapter.ts
```

---

## 🎨 Design Tokens (Tailwind)

```typescript
// tailwind.config.ts
colors: {
  primary: '#0F172A',           // Navy
  secondary: '#0051D5',         // Blue CTA
  'secondary-hover': '#003BA3', // Blue hover
  surface: '#F7F9FB',           // Page background
  'surface-container-lowest': '#FFFFFF', // White cards
  'tertiary-fixed-dim': '#62DF7D',       // Success green
  'on-tertiary-container': '#009842',    // Success dark
}

fontFamily: {
  sans: ['Inter', 'sans-serif'],
  headline: ['Archivo Black', 'sans-serif'],
}

spacing: {
  // 8pt grid: 8, 16, 24, 32, 48, 64, 96
}

borderRadius: {
  md: '0.75rem', // 12px (buttons/inputs)
  lg: '1rem',    // 16px (cards)
}
```

**Common Classes:**
- Button: `px-8 py-4 bg-secondary text-white rounded-md hover:bg-secondary-hover`
- Card: `bg-surface-container-lowest rounded-lg p-6`
- Input: `rounded-md border-gray-300 focus:ring-secondary focus:border-secondary`

---

## 🔌 Integration Patterns

### Reloadly (Mock for Now)

```typescript
// lib/giftcards/reloadly-adapter.ts
export async function fetchGiftCardsByCountry(countryCode: string): Promise<GiftCardProduct[]> {
  // TODO: Replace with Reloadly API call
  // const token = await getReloadlyToken();
  // const response = await fetch(
  //   `${process.env.RELOADLY_API_BASE}/countries/${countryCode}/products`,
  //   { headers: { Authorization: `Bearer ${token}` } }
  // );
  // return transformReloadlyProducts(await response.json());
  
  // Mock for now
  return MOCK_PRODUCTS.filter(p => p.countryCode === countryCode);
}
```

### Lemon Squeezy (Mock for Now)

```typescript
// app/api/checkout/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // TODO: Replace with Lemon Squeezy checkout creation
  // const session = await createLemonSqueezyCheckout({ ... });
  // return NextResponse.json({ checkoutUrl: session.data.attributes.url });
  
  // Mock for now
  return NextResponse.json({ 
    checkoutUrl: `/checkout/mock-payment?orderId=${body.orderId}` 
  });
}
```

---

## 🧩 Component Patterns

### Server Component (Default)

```typescript
// components/server/ProductCard.tsx
export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-lg p-6">
      <img src={product.logoUrl} alt={product.name} />
      <h3 className="font-headline text-xl">{product.name}</h3>
      <p className="text-gray-600">{product.category}</p>
    </div>
  );
}
```

### Client Component (Interactive)

```typescript
// components/client/SearchBar.tsx
'use client';

import { useState } from 'react';

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState('');
  
  return (
    <input
      type="search"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onSearch(e.target.value);
      }}
      placeholder="Search gift cards..."
      className="w-full px-4 py-3 rounded-md"
    />
  );
}
```

### Framer Motion Animation

```typescript
// components/client/AnimatedButton.tsx
'use client';

import { motion } from 'framer-motion';

export function AnimatedButton({ children, ...props }: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="px-8 py-4 bg-secondary text-white rounded-md"
      {...props}
    >
      {children}
    </motion.button>
  );
}
```

---

## 📋 Form Validation

```typescript
// components/client/CheckoutForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  recipientEmail: z.string().email().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export function CheckoutForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register('email')} />
      {errors.email && <p className="text-red-600">{errors.email.message}</p>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 🛒 Cart Context

```typescript
// contexts/CartContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface CartItem {
  productId: number;
  amount: number;
  quantity: number;
}

const CartContext = createContext<{
  items: CartItem[];
  addItem: (item: CartItem) => void;
  total: number;
} | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const addItem = (item: CartItem) => setItems([...items, item]);
  const total = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  
  return (
    <CartContext.Provider value={{ items, addItem, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be within CartProvider');
  return context;
}
```

**Usage:**

```typescript
// app/layout.tsx
import { CartProvider } from '@/contexts/CartContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}

// components/client/AddToCartButton.tsx
'use client';
import { useCart } from '@/contexts/CartContext';

export function AddToCartButton({ product, amount }) {
  const { addItem } = useCart();
  return <button onClick={() => addItem({ productId: product.id, amount, quantity: 1 })}>Add</button>;
}
```

---

## ♿ Accessibility Checklist

**Every Component Should Have:**
- [ ] Semantic HTML (`<button>` not `<div onClick>`)
- [ ] Labels on inputs (`htmlFor` + `id`)
- [ ] Focus indicators (default Tailwind `focus-visible:ring-2`)
- [ ] ARIA for dynamic content (`role="alert"` for errors)
- [ ] Keyboard navigation (`Tab`, `Enter`, `Esc`)
- [ ] Touch targets 24×24px minimum (`min-h-[44px] min-w-[44px]` on mobile)

**Example:**

```typescript
<label htmlFor="email" className="block text-sm font-medium">
  Email
</label>
<input
  id="email"
  type="email"
  aria-describedby={errors.email ? 'email-error' : undefined}
  className="w-full px-4 py-3 rounded-md focus:ring-2 focus:ring-secondary"
/>
{errors.email && (
  <p id="email-error" className="text-red-600 text-sm" role="alert">
    {errors.email.message}
  </p>
)}
```

---

## 🎭 Playwright Tests

```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test('Desktop - Home page matches design', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await expect(page).toHaveScreenshot('desktop-home.png', {
    fullPage: true,
    maxDiffPixels: 100,
  });
});

test('Mobile - Bottom nav visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  
  const bottomNav = page.locator('[data-testid="mobile-bottom-nav"]');
  await expect(bottomNav).toBeVisible();
  await expect(bottomNav).toHaveCSS('position', 'fixed');
});
```

**Run Tests:**
```bash
# First run (create baselines)
npx playwright test --update-snapshots

# Subsequent runs (compare)
npx playwright test

# View report
npx playwright show-report
```

---

## 🎨 Design Reference Locations

**Desktop:**
- Home: `design-refs/desktop_flow/stitch/1._browse_home_gifted/screen.png`
- Product: `design-refs/desktop_flow/stitch/3._product_detail_checkout_gifted/screen.png`
- Payment: `design-refs/desktop_flow/stitch/payment_checkout_gifted/screen.png`
- Success: `design-refs/desktop_flow/stitch/4._success_confirmation_gifted/screen.png`

**Mobile:**
- Home: `design-refs/mobile_flow/stitch/1._browse_home_gifted/screen.png`
- Product: `design-refs/mobile_flow/stitch/3._product_detail_checkout_gifted/screen.png`
- Payment: `design-refs/mobile_flow/stitch/payment_checkout_gifted/screen.png`
- Success: `design-refs/mobile_flow/stitch/4._success_confirmation_gifted/screen.png`

---

## 🔧 Common Patterns

### API Route (App Router)

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get('country') ?? 'US';
  const products = await fetchProducts(country);
  return NextResponse.json(products);
}
```

### Dynamic Route

```typescript
// app/gift-card/[slug]/page.tsx
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await fetchProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }
  
  return <ProductDetail product={product} />;
}
```

### Conditional Rendering (Gift Flow)

```typescript
const [deliveryMethod, setDeliveryMethod] = useState<'for-me' | 'send-as-gift'>('for-me');

{deliveryMethod === 'send-as-gift' && (
  <input
    type="email"
    placeholder="Recipient email"
    {...register('recipientEmail')}
  />
)}
```

---

## 🐛 Debugging Tips

**Hydration Errors:**
```typescript
// ❌ Causes hydration mismatch
<p>{new Date().toString()}</p>

// ✅ Client-only rendering
'use client';
import { useEffect, useState } from 'react';

export function ClientDate() {
  const [date, setDate] = useState<string>('');
  useEffect(() => setDate(new Date().toString()), []);
  return <p>{date}</p>;
}
```

**Server Component in Client Component:**
```typescript
// ❌ Won't work - importing Server Component in Client
'use client';
import { ServerProductList } from './ServerProductList';

// ✅ Pass as children prop
// app/page.tsx (Server)
<ClientWrapper>
  <ServerProductList />
</ClientWrapper>
```

**localStorage in Server Component:**
```typescript
// ❌ Causes error - no window on server
const country = localStorage.getItem('country');

// ✅ Use in Client Component only
'use client';
import { useLocalStorage } from '@/hooks/useLocalStorage';
```

---

## 📦 Environment Variables

```env
# .env.local

# Reloadly (Mock)
RELOADLY_CLIENT_ID=mock
RELOADLY_CLIENT_SECRET=mock
RELOADLY_API_BASE=https://giftcards-sandbox.reloadly.com

# Lemon Squeezy (Mock)
LEMONSQUEEZY_API_KEY=mock
LEMONSQUEEZY_WEBHOOK_SECRET=mock

# Public
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ✅ Quality Gates

**Before Committing:**
- [ ] No TypeScript errors (`npm run build`)
- [ ] No console errors in browser
- [ ] Lighthouse score >90 (Performance, Accessibility)
- [ ] Playwright tests pass
- [ ] Visual comparison against design refs looks correct

**Before Handoff to TESTER:**
- [ ] All pages render on mobile (390px) and desktop (1920px)
- [ ] Keyboard navigation works (Tab through entire site)
- [ ] All `// TODO:` comments exist for integration swaps
- [ ] README includes "How to Run" and "Integration Swap" sections

---

## 🚨 Common Mistakes to Avoid

1. **Using `'use client'` everywhere** → Start with Server Components
2. **Forgetting `htmlFor` on labels** → Breaks accessibility
3. **Using `<div onClick>` instead of `<button>`** → Not keyboard accessible
4. **Hardcoding data in components** → Use props/context
5. **Animating `width`/`height`** → Use `transform` (GPU-accelerated)
6. **No error states** → Always handle loading/error/empty states
7. **Trusting client-side payment confirmation** → Always verify with webhook

---

## 📚 When You Need More Detail

- **Component specs:** `ARCHITECTURE.md`
- **Integration patterns:** `RESEARCH.md`
- **Visual system:** `design-refs/slate_cobalt_premium/DESIGN.md`
- **Implementation schedule:** `IMPLEMENTATION-PLAN.md`
- **Progress tracking:** `COMPONENT-CHECKLIST.md`

---

**Quick Reference Complete. Happy Coding! 🚀**
