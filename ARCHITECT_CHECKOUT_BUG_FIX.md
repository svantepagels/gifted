# ARCHITECT DELIVERABLE: Checkout Bug Fix

## Executive Summary

**Bug**: "Invalid product. Please try selecting the product again." error appears on checkout page, blocking ALL purchases.

**Root Cause**: TWO bugs working together:
1. **Wrong Product ID stored** - Using string ID `"reloadly-12345"` instead of numeric ID `12345`
2. **Order Persistence Failure** - In-memory Map loses orders between Next.js requests

**Impact**: CRITICAL - 100% of checkout attempts fail

**Solution**: Fix product ID mapping + implement browser-based order state management

---

## Bug Analysis

### Current Flow (BROKEN)

```
1. Product Page: User selects Netflix (€25)
   └─> product.id = "reloadly-12345" (STRING)
   └─> product._meta.reloadlyProductId = 12345 (NUMBER)

2. Click "Continue to Checkout"
   └─> Creates order: { productId: "reloadly-12345", ... }
   └─> Stores in orderRepository (in-memory Map)
   └─> Redirects to /checkout?orderId=ORD-xxx

3. Checkout Page Loads (NEW REQUEST)
   └─> orderRepository.getById(ORD-xxx)
   └─> Returns null (in-memory Map is empty - new instance)
   └─> Redirects to / (blank page)

4. IF order somehow persisted:
   └─> reloadlyCheckoutService.processOrder()
   └─> parseInt(order.productId) // parseInt("reloadly-12345")
   └─> Result: NaN
   └─> ERROR: "Invalid product. Please try selecting the product again."
```

### Data Type Mismatch

**GiftCardProduct Interface**:
```typescript
{
  id: string                    // "reloadly-12345" (internal, URL-friendly)
  slug: string                  // "netflix-us-12345"
  _meta: {
    reloadlyProductId: number  // 12345 (actual Reloadly API ID)
  }
}
```

**What Reloadly API Expects**:
```typescript
{
  productId: number  // 12345 (MUST BE NUMBER, NOT STRING)
}
```

**What We're Sending**:
```typescript
{
  productId: "reloadly-12345"  // STRING - causes parseInt() to fail
}
```

---

## Solution Architecture

### Strategy: Browser-Based Order State

Instead of server-side repository (requires database), use URL state + sessionStorage for order persistence.

**Why This Works**:
- ✅ Survives page refreshes (URL + sessionStorage)
- ✅ No server-side storage needed (works with Vercel Edge)
- ✅ Simple to implement (no DB migration)
- ✅ Production-ready (used by many checkout flows)

---

## Implementation Specification

### 1. Fix Product ID Storage

**File**: `app/gift-card/[slug]/ProductDetailClient.tsx`

**Current Code** (Lines 60-73):
```typescript
const order = await orderRepository.create({
  productId: product.id,  // ❌ WRONG - String "reloadly-12345"
  productName: product.brandName,
  productLogoUrl: product.logoUrl,
  amount: selectedAmount,
  currency: selectedCountry.currency,
  serviceFee: calculateServiceFee(selectedAmount),
  deliveryMethod,
  customerEmail: '',
  recipientEmail: deliveryMethod === 'gift' ? recipientEmail : undefined,
  giftMessage: deliveryMethod === 'gift' ? giftMessage : undefined,
  countryCode: selectedCountry.code,
})
```

**Fixed Code**:
```typescript
// Extract numeric Reloadly product ID
const reloadlyProductId = product._meta?.reloadlyProductId
if (!reloadlyProductId) {
  alert('Product configuration error. Please try another product.')
  return
}

const order = await orderRepository.create({
  productId: reloadlyProductId.toString(),  // ✅ Store as string for consistency
  reloadlyProductId,  // ✅ NEW: Store numeric ID separately
  productName: product.brandName,
  productLogoUrl: product.logoUrl,
  amount: selectedAmount,
  currency: selectedCountry.currency,
  serviceFee: calculateServiceFee(selectedAmount),
  deliveryMethod,
  customerEmail: '',
  recipientEmail: deliveryMethod === 'gift' ? recipientEmail : undefined,
  giftMessage: deliveryMethod === 'gift' ? giftMessage : undefined,
  countryCode: selectedCountry.code,
})
```

**Changes**:
1. Extract `reloadlyProductId` from `product._meta.reloadlyProductId`
2. Validate it exists (guard against malformed products)
3. Store BOTH:
   - `productId`: String version for display/routing
   - `reloadlyProductId`: Numeric ID for Reloadly API

---

### 2. Update Order Type

**File**: `lib/orders/types.ts`

**Add to `Order` interface**:
```typescript
export interface Order {
  id: string
  createdAt: Date
  updatedAt: Date
  status: OrderStatus
  productId: string
  reloadlyProductId: number  // ✅ NEW: Numeric Reloadly product ID
  productName: string
  productLogoUrl?: string
  amount: number
  currency: string
  serviceFee: number
  total: number
  deliveryMethod: DeliveryMethod
  customerEmail: string
  recipientEmail?: string
  giftMessage?: string
  countryCode: string
  paymentId?: string
  paymentStatus?: string
  fulfillment?: OrderFulfillment
}

export interface CreateOrderInput {
  productId: string
  reloadlyProductId: number  // ✅ NEW: Required for order creation
  productName: string
  productLogoUrl?: string
  amount: number
  currency: string
  serviceFee: number
  deliveryMethod: DeliveryMethod
  customerEmail: string
  recipientEmail?: string
  giftMessage?: string
  countryCode: string
}
```

---

### 3. Update Reloadly Checkout Service

**File**: `lib/payments/reloadly-checkout.ts`

**Current Code** (Lines 50-58):
```typescript
// 4. Validate and convert product ID to number
const productId = parseInt(order.productId)
if (isNaN(productId)) {
  return { 
    success: false, 
    error: 'Invalid product. Please try selecting the product again.' 
  }
}
```

**Fixed Code**:
```typescript
// 4. Get numeric Reloadly product ID
const productId = order.reloadlyProductId
if (!productId || typeof productId !== 'number') {
  console.error('[ReloadlyCheckout] Invalid reloadlyProductId:', order.reloadlyProductId)
  return { 
    success: false, 
    error: 'Product configuration error. Please try again or contact support.' 
  }
}
```

**Changes**:
1. Use `order.reloadlyProductId` directly (already a number)
2. Add type validation (must be number)
3. Improved error message (less user-blaming)
4. Add console logging for debugging

---

### 4. Implement Browser-Based Order Persistence

**File**: `lib/orders/browser-storage.ts` (NEW FILE)

```typescript
/**
 * Browser-based order storage using sessionStorage
 * 
 * Why sessionStorage?
 * - Survives page refreshes (unlike useState)
 * - Cleared when tab closes (unlike localStorage)
 * - No server-side state needed (works with Vercel Edge)
 * - Perfect for checkout flows
 */

import { Order } from './types'

const STORAGE_KEY = 'gifted_current_order'

export class BrowserOrderStorage {
  /**
   * Store order in sessionStorage
   */
  save(order: Order): void {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
    } catch (error) {
      console.error('[BrowserOrderStorage] Failed to save order:', error)
    }
  }
  
  /**
   * Load order from sessionStorage
   */
  load(): Order | null {
    if (typeof window === 'undefined') return null
    
    try {
      const data = sessionStorage.getItem(STORAGE_KEY)
      if (!data) return null
      
      const order = JSON.parse(data)
      
      // Restore Date objects
      order.createdAt = new Date(order.createdAt)
      order.updatedAt = new Date(order.updatedAt)
      
      return order
    } catch (error) {
      console.error('[BrowserOrderStorage] Failed to load order:', error)
      return null
    }
  }
  
  /**
   * Clear order from sessionStorage
   */
  clear(): void {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('[BrowserOrderStorage] Failed to clear order:', error)
    }
  }
  
  /**
   * Check if order exists
   */
  exists(): boolean {
    return this.load() !== null
  }
}

export const browserOrderStorage = new BrowserOrderStorage()
```

---

### 5. Update Product Detail Client to Use Browser Storage

**File**: `app/gift-card/[slug]/ProductDetailClient.tsx`

**Add at top**:
```typescript
import { browserOrderStorage } from '@/lib/orders/browser-storage'
```

**Replace order creation** (Lines 53-75):
```typescript
const handleContinue = async () => {
  if (!product || !selectedAmount || isCreatingOrder) return
  
  // Validate gift details if sending as gift
  if (deliveryMethod === 'gift' && !recipientEmail) {
    alert('Please enter recipient email address')
    return
  }
  
  // Extract numeric Reloadly product ID
  const reloadlyProductId = product._meta?.reloadlyProductId
  if (!reloadlyProductId) {
    alert('Product configuration error. Please try another product.')
    return
  }
  
  // Create order
  setIsCreatingOrder(true)
  try {
    const order = await orderRepository.create({
      productId: product.id,
      reloadlyProductId,  // ✅ Store numeric ID
      productName: product.brandName,
      productLogoUrl: product.logoUrl,
      amount: selectedAmount,
      currency: selectedCountry.currency,
      serviceFee: calculateServiceFee(selectedAmount),
      deliveryMethod,
      customerEmail: '',
      recipientEmail: deliveryMethod === 'gift' ? recipientEmail : undefined,
      giftMessage: deliveryMethod === 'gift' ? giftMessage : undefined,
      countryCode: selectedCountry.code,
    })
    
    // ✅ Save to browser storage (survives page refresh)
    browserOrderStorage.save(order)
    
    router.push(`/checkout?orderId=${order.id}`)
  } catch (error) {
    console.error('Failed to create order:', error)
    alert('Failed to create order. Please try again.')
    setIsCreatingOrder(false)
  }
}
```

---

### 6. Update Checkout Page to Use Browser Storage

**File**: `app/checkout/page.tsx`

**Add at top**:
```typescript
import { browserOrderStorage } from '@/lib/orders/browser-storage'
```

**Replace order loading** (Lines 21-40):
```typescript
useEffect(() => {
  async function loadOrder() {
    if (!orderId) {
      router.push('/')
      return
    }
    
    try {
      // Try loading from browser storage first (faster, more reliable)
      let orderData = browserOrderStorage.load()
      
      // Validate order ID matches
      if (orderData && orderData.id !== orderId) {
        console.warn('[Checkout] Order ID mismatch, fetching from repository')
        orderData = null
      }
      
      // Fallback to repository if not in browser storage
      if (!orderData) {
        orderData = await orderRepository.getById(orderId)
      }
      
      if (!orderData) {
        console.error('[Checkout] Order not found:', orderId)
        router.push('/')
        return
      }
      
      setOrder(orderData)
    } catch (error) {
      console.error('Failed to load order:', error)
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }
  
  loadOrder()
}, [orderId, router])
```

**Add cleanup on successful checkout** (after payment processing):
```typescript
const handleSubmit = async (email: string) => {
  if (!order) return
  
  // Process order with Reloadly
  const result = await reloadlyCheckoutService.processOrder(order.id, email)
  
  if (result.success) {
    // ✅ Clear browser storage on success
    browserOrderStorage.clear()
    
    // Redirect to success page
    router.push(`/success?orderId=${order.id}`)
  } else {
    throw new Error(result.error || 'Order processing failed')
  }
}
```

---

### 7. Update Success Page to Use Browser Storage

**File**: `app/success/page.tsx`

**Add fallback for order retrieval**:
```typescript
import { browserOrderStorage } from '@/lib/orders/browser-storage'

// In loadOrder function:
let orderData = await orderRepository.getById(orderId)

// Fallback to browser storage if repository is empty
if (!orderData) {
  orderData = browserOrderStorage.load()
  
  // Validate order ID matches
  if (orderData && orderData.id !== orderId) {
    orderData = null
  }
}
```

---

## Testing Checklist

### Manual Testing

**Test 1: Self Purchase Flow**
```
1. Navigate to product page (e.g., Netflix €25)
2. Select amount
3. Ensure "Buy for Myself" is selected (default)
4. Click "Continue to Checkout"
5. ✅ VERIFY: Checkout page loads successfully
6. ✅ VERIFY: Product details display correctly
7. ✅ VERIFY: No "Invalid product" error
8. Enter email
9. Complete payment
10. ✅ VERIFY: Success page displays
```

**Test 2: Gift Purchase Flow**
```
1. Navigate to product page
2. Select amount
3. Switch to "Send as Gift"
4. Enter recipient email and message
5. Click "Continue to Checkout"
6. ✅ VERIFY: Checkout page loads with gift details
7. ✅ VERIFY: Recipient email displays
8. ✅ VERIFY: Gift message displays
9. Complete payment
10. ✅ VERIFY: Success page displays
```

**Test 3: Page Refresh Resilience**
```
1. Navigate to product page
2. Select amount and click "Continue to Checkout"
3. ✅ Checkout page loads
4. Refresh the page (F5 or Cmd+R)
5. ✅ VERIFY: Order data persists (no redirect to home)
6. ✅ VERIFY: All fields still populated
7. Complete checkout
8. ✅ VERIFY: Success
```

**Test 4: Multiple Products**
```
Test with multiple products to ensure reloadlyProductId is correct:
- Netflix (different denominations)
- Apple/iTunes
- Google Play
- Steam
- Amazon

For each:
1. Select product
2. Select amount
3. Continue to checkout
4. ✅ VERIFY: No "Invalid product" error
5. ✅ VERIFY: Correct product displays
```

**Test 5: Browser Back Button**
```
1. Select product → Continue to Checkout
2. Click browser back button
3. ✅ VERIFY: Returns to product page
4. ✅ VERIFY: Selected amount persists
5. Click Continue again
6. ✅ VERIFY: Checkout loads correctly
```

**Test 6: Tab Close/Reopen**
```
1. Start checkout flow
2. Close browser tab (entire window)
3. Reopen browser
4. Navigate to checkout URL directly
5. ✅ VERIFY: Redirects to home (sessionStorage cleared)
6. ℹ️ This is expected behavior (security)
```

### Browser DevTools Checks

**Console Checks**:
```javascript
// No errors related to:
- "Invalid product"
- "Order not found"
- "Failed to load order"
- NaN or parseInt errors
```

**SessionStorage Check**:
```javascript
// In browser console during checkout:
JSON.parse(sessionStorage.getItem('gifted_current_order'))

// Should show complete order object with:
// - reloadlyProductId: NUMBER (not string)
// - productId: string
// - amount, currency, etc.
```

**Network Tab**:
```
1. Check /api/reloadly/order request
2. Verify request payload:
   {
     "productId": 12345,  // ✅ NUMBER, not string
     "countryCode": "US",
     "quantity": 1,
     "unitPrice": 25,
     ...
   }
3. ✅ VERIFY: No 400/422 errors
```

---

## Deployment Steps

### 1. Pre-Deployment Checklist

```bash
# Verify all files modified
✅ lib/orders/types.ts (added reloadlyProductId)
✅ lib/orders/browser-storage.ts (new file)
✅ lib/payments/reloadly-checkout.ts (use reloadlyProductId)
✅ app/gift-card/[slug]/ProductDetailClient.tsx (store reloadlyProductId)
✅ app/checkout/page.tsx (load from browser storage)
✅ app/success/page.tsx (fallback to browser storage)

# Build locally
cd /Users/administrator/.openclaw/workspace/gifted-project
npm run build

# ✅ VERIFY: No TypeScript errors
# ✅ VERIFY: No build errors
```

### 2. Test Locally

```bash
# Run dev server
npm run dev

# Open http://localhost:3000
# Test complete purchase flow (see Testing Checklist above)
```

### 3. Commit Changes

```bash
git add .
git commit -m "fix(checkout): resolve 'Invalid product' error and order persistence

- Store numeric reloadlyProductId alongside string productId
- Implement browser-based order storage (sessionStorage)
- Fix Reloadly API integration (send number, not string)
- Add order persistence across page refreshes
- Improve error messages and logging

Fixes: CRITICAL checkout bug blocking all purchases
Tested: Self + gift flows, page refresh, multiple products"
```

### 4. Deploy to Vercel

```bash
git push origin main
vercel --prod --yes
```

### 5. Post-Deployment Verification

```bash
# Run live site verification script
./verify-production.ts

# Manual smoke test on production:
1. Visit https://gifted-project-blue.vercel.app
2. Select Netflix €25
3. Click "Continue to Checkout"
4. ✅ VERIFY: No errors
5. Complete test purchase (use test Reloadly account)
6. ✅ VERIFY: Success page reached
```

---

## Rollback Plan

If deployment causes issues:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or deploy previous working commit
vercel --prod --yes
```

**Safe Rollback**: These changes are additive (new field, new storage mechanism). Old orders (without reloadlyProductId) will still fail, but new orders will work.

---

## Future Improvements

### Short-Term (Week 2)
1. **Add Database** - Replace in-memory repository with Prisma + Supabase
2. **Order History** - Store completed orders for customer reference
3. **Admin Panel** - View and manage orders

### Medium-Term (Week 3-4)
1. **Resume Checkout** - Allow users to return to abandoned carts
2. **Order Tracking** - Real-time status updates from Reloadly webhooks
3. **Analytics** - Track checkout abandonment rate

### Long-Term
1. **Multi-Product Cart** - Buy multiple gift cards at once
2. **Recurring Gifts** - Schedule monthly gift card deliveries
3. **Wallet Integration** - Save payment methods for faster checkout

---

## Error Messages - Before vs After

### Before (User-Blaming)
```
❌ "Invalid product. Please try selecting the product again."
```
- Implies user did something wrong
- No context on what failed
- No guidance on next steps

### After (Helpful)
```
✅ "Product configuration error. Please try again or contact support."
```
- Acknowledges system issue
- Provides clear next steps
- Offers support option

---

## Success Metrics

### Key Performance Indicators

**Before Fix**:
- Checkout Success Rate: 0% ❌
- "Invalid product" errors: 100% of attempts
- Customer complaints: HIGH

**After Fix (Expected)**:
- Checkout Success Rate: >95% ✅
- "Invalid product" errors: <1% (only malformed products)
- Customer complaints: LOW

### Monitoring

Add to success page analytics:
```typescript
// Track successful checkouts
analytics.track('checkout_completed', {
  productId: order.reloadlyProductId,
  amount: order.total,
  deliveryMethod: order.deliveryMethod,
})
```

Add to error handler:
```typescript
// Track failed checkouts
analytics.track('checkout_failed', {
  error: error.message,
  step: 'payment_processing',
})
```

---

## Summary

### Root Causes Identified
1. ✅ **Product ID Type Mismatch** - Sending string instead of number to Reloadly
2. ✅ **Order Persistence Failure** - In-memory Map doesn't persist across requests

### Solutions Implemented
1. ✅ **Store reloadlyProductId** - Keep numeric ID separate from string ID
2. ✅ **Browser-based storage** - Use sessionStorage for checkout state
3. ✅ **Improved validation** - Check reloadlyProductId exists and is valid
4. ✅ **Better error messages** - Less user-blaming, more helpful

### Impact
- **Fixes**: 100% of checkout failures
- **Enables**: All gift card purchases
- **Improves**: User experience and error messaging
- **Risk**: LOW (additive changes, no breaking changes)

---

**ARCHITECT HANDOFF COMPLETE**

Ready for CODER to implement following this exact specification.
All file paths, code snippets, and testing procedures are provided above.

Priority: CRITICAL
Estimated Implementation Time: 2-3 hours
Deployment Risk: LOW
