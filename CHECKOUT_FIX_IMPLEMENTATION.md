# Checkout Fix - Quick Implementation Guide

**What:** Replace mock checkout with real Reloadly order integration
**Files to change:** 2 (1 new file, 1 modified file)
**Time estimate:** 15 minutes

---

## Step 1: Create New Checkout Service

**File:** `lib/payments/reloadly-checkout.ts` (NEW FILE)

Copy this EXACT code:

```typescript
import { orderRepository } from '@/lib/orders/mock-repository'
import { OrderFulfillment } from '@/lib/orders/types'
import type { OrderRequest, OrderResponse } from '@/lib/reloadly/types'

export class ReloadlyCheckoutService {
  /**
   * Process order by calling Reloadly order API
   * 
   * @param orderId - Internal order ID
   * @param customerEmail - Customer's email for the order
   * @returns Success/error result with payment ID
   */
  async processOrder(
    orderId: string,
    customerEmail: string
  ): Promise<{
    success: boolean
    transactionId?: number
    error?: string
  }> {
    try {
      // 1. Get order from repository
      const order = await orderRepository.getById(orderId)
      if (!order) {
        return { success: false, error: 'Order not found' }
      }

      // 2. Update order with customer email
      order.customerEmail = customerEmail
      
      // 3. Map order to Reloadly OrderRequest
      const orderRequest: OrderRequest = {
        productId: parseInt(order.productId), // Convert string to number
        countryCode: order.countryCode,
        quantity: 1,
        unitPrice: order.amount,
        customIdentifier: orderId,
        senderName: customerEmail.split('@')[0], // Use email prefix as sender name
        recipientEmail: order.recipientEmail || customerEmail,
      }

      // 4. Call Reloadly order API
      const response = await fetch('/api/reloadly/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API returned ${response.status}`)
      }

      const orderResponse: OrderResponse = await response.json()

      // 5. Check order status
      if (orderResponse.status === 'FAILED') {
        await orderRepository.updateStatus(orderId, 'failed')
        return {
          success: false,
          error: 'Order failed at Reloadly. Please try again or contact support.',
        }
      }

      // 6. Extract fulfillment data from Reloadly response
      // NOTE: Reloadly sends gift card codes via email to recipientEmail
      // The API response contains transaction details but NOT the actual card codes
      const fulfillment: OrderFulfillment = {
        cardCode: `Transaction ID: ${orderResponse.transactionId}`,
        pin: undefined, // Codes sent via email by Reloadly
        redemptionUrl: undefined, // Included in Reloadly's email
      }

      // 7. Store transaction ID as payment ID
      await orderRepository.updatePayment(
        orderId,
        `RELOADLY_${orderResponse.transactionId}`,
        orderResponse.status
      )

      // 8. Store fulfillment data and mark complete
      await orderRepository.storeFulfillment(orderId, fulfillment)

      return {
        success: true,
        transactionId: orderResponse.transactionId,
      }
    } catch (error) {
      console.error('Reloadly checkout error:', error)
      
      // Mark order as failed
      await orderRepository.updateStatus(orderId, 'failed')
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }
}

// Export singleton instance
export const reloadlyCheckoutService = new ReloadlyCheckoutService()
```

---

## Step 2: Update Checkout Page

**File:** `app/checkout/page.tsx` (MODIFY)

### Change 1: Update Import (Line 11)

**REMOVE:**
```typescript
import { mockCheckoutService } from '@/lib/payments/mock-checkout'
```

**ADD:**
```typescript
import { reloadlyCheckoutService } from '@/lib/payments/reloadly-checkout'
```

### Change 2: Update handleSubmit Function (Lines 46-60)

**REMOVE:**
```typescript
const handleSubmit = async (email: string) => {
  if (!order) return
  
  // Update order with customer email
  order.customerEmail = email
  
  // Process payment
  // TODO: Replace with Lemon Squeezy checkout
  // This mock version simulates payment processing
  const result = await mockCheckoutService.processPayment(order.id)
  
  if (result.success) {
    // Redirect to success page
    router.push(`/success?orderId=${order.id}`)
  } else {
    throw new Error(result.error || 'Payment failed')
  }
}
```

**ADD:**
```typescript
const handleSubmit = async (email: string) => {
  if (!order) return
  
  // Process order with Reloadly
  const result = await reloadlyCheckoutService.processOrder(order.id, email)
  
  if (result.success) {
    // Redirect to success page
    router.push(`/success?orderId=${order.id}`)
  } else {
    throw new Error(result.error || 'Order processing failed')
  }
}
```

---

## Step 3: Test Locally

```bash
# Start dev server
npm run dev

# In browser, navigate to:
http://localhost:3000

# Test flow:
# 1. Browse products
# 2. Select a gift card
# 3. Choose minimum amount
# 4. Enter email address
# 5. Complete checkout
# 6. Verify:
#    - No errors in console
#    - Redirected to success page
#    - Check email for Reloadly gift card codes
```

---

## Step 4: Deploy

```bash
# Commit changes
git add .
git commit -m "fix: connect real Reloadly checkout to order flow"
git push origin main

# Deploy
vercel --prod --yes

# Verify deployment URL works
```

---

## Verification Checklist

- [ ] New file created: `lib/payments/reloadly-checkout.ts`
- [ ] Import updated in `app/checkout/page.tsx`
- [ ] handleSubmit function updated in `app/checkout/page.tsx`
- [ ] Local test passes (no errors)
- [ ] Order reaches success page
- [ ] Email received with gift card codes
- [ ] Deployment successful
- [ ] Production test passes

---

## Troubleshooting

**Error: "Order not found"**
- Check that orderId is being passed in URL correctly

**Error: "Failed to place order"**
- Check Reloadly credentials in `.env.local`
- Verify product ID is valid (check Reloadly dashboard)

**Error: "Rate limit exceeded"**
- Wait 60 seconds between orders (3 orders/min limit)

**No email received**
- Check spam folder
- Wait 5 minutes for delivery
- Verify recipient email is correct

---

## What This Changes

✅ Checkout now places REAL Reloadly orders
✅ Gift card codes delivered via email (not fake codes)
✅ Transaction IDs stored in order
✅ Order status tracked properly

## What This Doesn't Change

- Product catalog (still from Reloadly)
- Order creation flow
- Success page UI
- Error handling UX

---

**DONE!** The checkout now uses real Reloadly orders instead of mock codes.
