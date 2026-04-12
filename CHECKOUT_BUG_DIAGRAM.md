# Checkout Bug: Visual Flow Diagram

## THE BUG 🐛

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCT PAGE                                                   │
│  (app/gift-card/[slug]/ProductDetailClient.tsx)                │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ User clicks "Continue to Checkout"
                             ▼
                  ┌──────────────────────┐
                  │  Create Order        │
                  │                      │
                  │  productId:          │
                  │  product.id          │  ❌ WRONG!
                  │  "reloadly-12345"    │  (This is a STRING)
                  │                      │
                  └──────────────────────┘
                             │
                             │ Save to in-memory Map
                             ▼
                  ┌──────────────────────┐
                  │  orderRepository     │
                  │  Map<id, order>      │
                  └──────────────────────┘
                             │
                             │ Redirect to /checkout?orderId=ORD-xxx
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  CHECKOUT PAGE - NEW REQUEST                                    │
│  (app/checkout/page.tsx)                                        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ orderRepository.getById(ORD-xxx)
                             ▼
                  ┌──────────────────────┐
                  │  orderRepository     │
                  │  Map<id, order>      │  ❌ EMPTY!
                  │  (new instance)      │  (In-memory state lost)
                  └──────────────────────┘
                             │
                             │ Returns null
                             ▼
                  ┌──────────────────────┐
                  │  router.push('/')    │  💀 User sees blank page
                  └──────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  IF ORDER SOMEHOW PERSISTED... (Still fails)                   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ User enters email, clicks Pay
                             ▼
                  ┌──────────────────────┐
                  │  reloadlyCheckout    │
                  │  .processOrder()     │
                  └──────────────────────┘
                             │
                             │ parseInt(order.productId)
                             ▼
                  ┌──────────────────────┐
                  │  parseInt(           │
                  │   "reloadly-12345"   │  ❌ WRONG!
                  │  )                   │
                  │  = NaN               │  💀 Not a number!
                  └──────────────────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  ERROR:              │
                  │  "Invalid product"   │  💀 User sees error
                  └──────────────────────┘
```

## THE FIX ✅

```
┌─────────────────────────────────────────────────────────────────┐
│  PRODUCT PAGE                                                   │
│  (app/gift-card/[slug]/ProductDetailClient.tsx)                │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ User clicks "Continue to Checkout"
                             ▼
                  ┌──────────────────────────────┐
                  │  Extract IDs:                │
                  │                              │
                  │  product.id                  │
                  │  = "reloadly-12345"          │
                  │  (string, for display)       │
                  │                              │
                  │  product._meta               │
                  │    .reloadlyProductId        │
                  │  = 12345                     │  ✅ CORRECT!
                  │  (number, for API)           │  (This is a NUMBER)
                  └──────────────────────────────┘
                             │
                             │ Create order with BOTH IDs
                             ▼
                  ┌──────────────────────────────┐
                  │  Create Order                │
                  │                              │
                  │  productId:                  │
                  │    "reloadly-12345"          │  ✅ String (display)
                  │                              │
                  │  reloadlyProductId:          │
                  │    12345                     │  ✅ Number (API)
                  └──────────────────────────────┘
                             │
                             ├──────────────────────┬──────────────────────┐
                             │                      │                      │
                             ▼                      ▼                      ▼
              ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
              │  orderRepository     │  │  browserOrderStorage │  │  URL                 │
              │  Map<id, order>      │  │  sessionStorage      │  │  ?orderId=ORD-xxx    │
              └──────────────────────┘  └──────────────────────┘  └──────────────────────┘
                                                   │
                                                   │ Persists across page loads!
                                                   │
                                                   │ Redirect to /checkout
                                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│  CHECKOUT PAGE - NEW REQUEST                                    │
│  (app/checkout/page.tsx)                                        │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Try browserOrderStorage.load() first
                             ▼
                  ┌──────────────────────┐
                  │  browserOrderStorage │
                  │  .load()             │  ✅ SUCCESS!
                  │                      │  (Order found in sessionStorage)
                  │  Returns order       │
                  └──────────────────────┘
                             │
                             │ Order loaded successfully
                             ▼
                  ┌──────────────────────┐
                  │  Display checkout    │  ✅ User sees checkout form
                  │  with order details  │
                  └──────────────────────┘
                             │
                             │ User enters email, clicks Pay
                             ▼
                  ┌──────────────────────┐
                  │  reloadlyCheckout    │
                  │  .processOrder()     │
                  └──────────────────────┘
                             │
                             │ Use order.reloadlyProductId directly
                             ▼
                  ┌──────────────────────────────┐
                  │  productId =                 │
                  │    order.reloadlyProductId   │  ✅ CORRECT!
                  │  = 12345                     │  (Already a number)
                  │                              │
                  │  No parseInt() needed!       │
                  └──────────────────────────────┘
                             │
                             │ Call Reloadly API with number
                             ▼
                  ┌──────────────────────┐
                  │  POST /api/reloadly  │
                  │  /order              │
                  │                      │
                  │  {                   │
                  │    productId: 12345, │  ✅ Number accepted!
                  │    ...               │
                  │  }                   │
                  └──────────────────────┘
                             │
                             │ Reloadly responds: SUCCESS
                             ▼
                  ┌──────────────────────┐
                  │  Clear browser       │
                  │  storage             │
                  └──────────────────────┘
                             │
                             │ Redirect to success page
                             ▼
                  ┌──────────────────────┐
                  │  SUCCESS PAGE        │  ✅ User sees confirmation!
                  │  Order completed     │
                  └──────────────────────┘
```

## DATA TYPE FLOW

### Before (Broken)
```
product._meta.reloadlyProductId = 12345 (number)
                    ↓
            [IGNORED - not used]
                    ↓
      order.productId = "reloadly-12345" (string)
                    ↓
        parseInt("reloadly-12345")
                    ↓
                   NaN
                    ↓
                 ❌ ERROR
```

### After (Fixed)
```
product._meta.reloadlyProductId = 12345 (number)
                    ↓
            [EXTRACTED and STORED]
                    ↓
      order.reloadlyProductId = 12345 (number)
                    ↓
         Used directly (no parsing)
                    ↓
                 12345
                    ↓
          Reloadly API accepts
                    ↓
                 ✅ SUCCESS
```

## BROWSER STORAGE FLOW

### sessionStorage vs In-Memory Map

```
┌────────────────────────────────────────────────────────────┐
│  IN-MEMORY MAP (Current - BROKEN)                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Request 1 (Product Page):                                │
│    orderRepository = new Map()                            │
│    map.set("ORD-123", {...})                              │
│                                                            │
│  Request 2 (Checkout Page):                               │
│    orderRepository = new Map()  ← NEW INSTANCE!           │
│    map.get("ORD-123")           ← null (empty map)        │
│                                                            │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  SESSIONSTORAGE (Fixed - WORKS)                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Request 1 (Product Page):                                │
│    sessionStorage.setItem("order", {...})                 │
│    ↓ Stored in browser (persists)                         │
│                                                            │
│  Request 2 (Checkout Page):                               │
│    sessionStorage.getItem("order")                        │
│    ↓ Retrieved from browser ✅                            │
│                                                            │
│  Tab Closed:                                              │
│    sessionStorage.clear()                                 │
│    ↓ Automatically cleared (security)                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## KEY INSIGHTS

### Product ID Types
```typescript
interface GiftCardProduct {
  id: string                     // "reloadly-12345" (internal, URL-friendly)
  slug: string                   // "netflix-us-12345" (for URLs)
  _meta: {
    reloadlyProductId: number   // 12345 (for Reloadly API)
  }
}
```

**USE CASE**:
- `id` / `slug` → Display, routing, internal tracking
- `reloadlyProductId` → Reloadly API calls ONLY

### Storage Strategy
```typescript
// ❌ WRONG: In-memory (doesn't persist)
const orders = new Map<string, Order>()

// ✅ RIGHT: Browser storage (persists across requests)
sessionStorage.setItem('order', JSON.stringify(order))
```

**WHY sessionStorage?**
- ✅ Survives page refreshes
- ✅ Cleared when tab closes (security)
- ✅ No server-side state needed
- ✅ Works with Vercel Edge functions
- ✅ Standard practice for checkout flows

---

**BOTTOM LINE**:
1. Store TWO IDs (string for display, number for API)
2. Use browser storage (not in-memory Map)
3. No parseInt() on product IDs (use native number)
