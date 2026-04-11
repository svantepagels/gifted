# ARCHITECT DELIVERABLE: Real Reloadly Checkout Integration

**Date:** 2026-04-11
**Agent:** ARCHITECT
**Task:** Replace mock checkout with real Reloadly order integration

---

## PROBLEM STATEMENT

The Gifted checkout currently uses a mock payment service (`lib/payments/mock-checkout.ts`) that generates fake gift card codes instead of placing real orders with Reloadly. The real order API endpoint exists (`app/api/reloadly/order/route.ts`) but is not connected to the checkout flow.

---

## SOLUTION ARCHITECTURE

### Overview

Replace the mock checkout flow with a real integration that:
1. Accepts payment information on the checkout page
2. Calls the Reloadly order API endpoint
3. Receives real gift card codes from Reloadly
4. Stores the fulfillment data in the order
5. Redirects to success page with actual codes

### Data Flow

```
User fills checkout form
  ↓
CheckoutForm.onSubmit(email)
  ↓
CheckoutPage.handleSubmit(email)
  ↓
reloadlyCheckoutService.processOrder(orderId, email)
  ↓
POST /api/reloadly/order with OrderRequest
  ↓
Reloadly API returns OrderResponse with gift card codes
  ↓
Store fulfillment in orderRepository
  ↓
Update order status to 'completed'
  ↓
Redirect to /success?orderId={id}
```

---

## IMPLEMENTATION SPECIFICATION

### 1. Create Real Checkout Service

**File:** `lib/payments/reloadly-checkout.ts` (NEW)

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
        // Optional: Add phone if available
        // recipientPhoneDetails: {
        //   countryCode: '+1',
        //   phoneNumber: '1234567890'
        // }
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
      // Codes are delivered by Reloadly directly to the recipient email
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

**Key Design Decisions:**

1. **Email Delivery**: Reloadly sends gift card codes directly to the recipient email. The API response contains transaction details but NOT the actual codes. This is by design for security.

2. **Product ID Conversion**: Our app stores product IDs as strings, but Reloadly expects numbers. We convert during the API call.

3. **Sender Name**: We extract from the email prefix since we don't collect full names in checkout. This can be enhanced later.

4. **Error Handling**: All errors are caught, logged, and the order is marked as failed in the repository.

5. **Custom Identifier**: We pass our internal order ID so we can correlate Reloadly transactions with our orders.

---

### 2. Update Checkout Page

**File:** `app/checkout/page.tsx` (MODIFY)

**Changes Required:**

Replace this import:
```typescript
import { mockCheckoutService } from '@/lib/payments/mock-checkout'
```

With:
```typescript
import { reloadlyCheckoutService } from '@/lib/payments/reloadly-checkout'
```

Replace the `handleSubmit` function (lines 63-77):

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

**Complete Modified Section:**
```typescript
const handleSubmit = async (email: string) => {
  if (!order) return
  
  // Process order with Reloadly
  const result = await reloadlyCheckoutService.processOrder(order.id, email)
  
  if (result.success) {
    // Redirect to success page with order ID
    router.push(`/success?orderId=${order.id}`)
  } else {
    // Error will be caught by CheckoutForm error handling
    throw new Error(result.error || 'Order processing failed')
  }
}
```

---

### 3. Important Notes on Reloadly Integration

#### Gift Card Code Delivery

**Reloadly sends gift card codes via EMAIL** to the recipient email specified in the order request. The API response contains:
- Transaction ID
- Order status
- Product details
- Amount and fees

But it does **NOT** contain the actual gift card codes or PINs. These are delivered by Reloadly directly to the recipient's email inbox.

#### Order Flow

1. **User completes checkout** → Enters email
2. **API places order** → Reloadly creates transaction
3. **Reloadly sends email** → Recipient receives codes
4. **Success page** → Shows order confirmation (not actual codes)

#### Success Page Messaging

The success page should inform users that:
- Order was successful
- Gift card codes will be delivered via email
- Check spam folder if not received
- Contact support if issues arise

**Current Success Page:** Already shows transaction details but not codes (which is correct).

---

### 4. Testing Protocol

#### Pre-Test Checklist

1. **Environment Variables Set:**
   ```bash
   RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
   RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
   RELOADLY_ENVIRONMENT=sandbox
   RELOADLY_AUTH_URL=https://auth.reloadly.com
   RELOADLY_GIFTCARDS_SANDBOX_URL=https://giftcards-sandbox.reloadly.com
   ```

2. **Test Email Ready:** Use a real email you can access to receive codes

3. **Small Test Amount:** Start with minimum denomination products

#### Test Procedure

**Test 1: Successful Order**

1. Navigate to a product page (e.g., Amazon US gift card)
2. Select minimum amount (e.g., $5)
3. Choose "Send to me"
4. Enter test email address
5. Click checkout
6. Complete checkout form with email
7. Submit order
8. **Expected Result:**
   - Redirected to success page
   - Order status = 'completed'
   - Transaction ID stored
   - Email received from Reloadly with gift card codes

**Test 2: Gift Order**

1. Navigate to product page
2. Select amount
3. Choose "Send as gift"
4. Enter recipient email + gift message
5. Complete checkout with YOUR email (buyer)
6. **Expected Result:**
   - Recipient email receives codes
   - Your email receives order confirmation

**Test 3: Error Handling**

1. Temporarily set invalid Reloadly credentials
2. Attempt checkout
3. **Expected Result:**
   - Error message displayed
   - Order marked as 'failed'
   - No redirect to success page

**Test 4: Rate Limiting**

1. Place 4 orders rapidly
2. **Expected Result:**
   - First 3 succeed
   - 4th returns 429 Too Many Requests

#### Verification Commands

```bash
# Check order in Reloadly sandbox dashboard
# https://developers.reloadly.com/

# Check local order repository (if logging enabled)
# Look for console logs showing order status changes

# Verify email delivery
# Check inbox for recipient email
```

---

### 5. Environment Configuration

#### Required Variables (Already Set)

✅ All Reloadly credentials are configured in `.env.local`

#### Vercel Deployment

When deploying to production:

```bash
# Set environment variables in Vercel
vercel env add RELOADLY_CLIENT_ID production
# Enter: bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz

vercel env add RELOADLY_CLIENT_SECRET production
# Enter: ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV

vercel env add RELOADLY_ENVIRONMENT production
# Enter: sandbox (or 'production' when ready for live orders)

vercel env add RELOADLY_AUTH_URL production
# Enter: https://auth.reloadly.com

vercel env add RELOADLY_GIFTCARDS_SANDBOX_URL production
# Enter: https://giftcards-sandbox.reloadly.com

vercel env add RELOADLY_GIFTCARDS_PRODUCTION_URL production
# Enter: https://giftcards.reloadly.com
```

---

### 6. Production Readiness Checklist

Before switching to production Reloadly environment:

- [ ] Test at least 5 successful sandbox orders
- [ ] Verify email delivery works reliably
- [ ] Test error handling (invalid products, rate limits, network errors)
- [ ] Update `RELOADLY_ENVIRONMENT` to `production`
- [ ] Top up Reloadly production account balance
- [ ] Set up monitoring/alerts for failed orders
- [ ] Configure Sentry for error tracking
- [ ] Document support process for order issues

---

## FILES TO MODIFY

### New Files
1. `lib/payments/reloadly-checkout.ts` - Real checkout service

### Modified Files
1. `app/checkout/page.tsx` - Update import and handleSubmit function

### Files to Keep (No Changes)
1. `app/api/reloadly/order/route.ts` - Already correctly implemented
2. `lib/reloadly/client.ts` - Already correctly implemented
3. `lib/orders/mock-repository.ts` - Works as-is (can migrate to DB later)

---

## IMPLEMENTATION CHECKLIST

- [ ] Create `lib/payments/reloadly-checkout.ts` with ReloadlyCheckoutService class
- [ ] Update `app/checkout/page.tsx` imports (remove mock, add reloadly-checkout)
- [ ] Update `app/checkout/page.tsx` handleSubmit function
- [ ] Test successful order flow locally
- [ ] Test error handling
- [ ] Verify email delivery from Reloadly
- [ ] Test gift order flow
- [ ] Deploy to Vercel
- [ ] Set environment variables in Vercel
- [ ] Test production deployment
- [ ] Monitor first live order

---

## ROLLBACK PLAN

If issues arise after deployment:

1. **Immediate Rollback:**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

2. **Code Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Restore Mock Service:**
   - Change import back to `mockCheckoutService`
   - Restore old `handleSubmit` function

---

## MONITORING & ALERTS

### Key Metrics to Track

1. **Order Success Rate:** Should be >95%
2. **Average Order Processing Time:** Should be <5 seconds
3. **Failed Order Count:** Should be <5% of total
4. **Email Delivery Rate:** Should be 100% (verified via customer reports)

### Sentry Alerts

Already configured in `app/api/reloadly/order/route.ts`:
- Captures order placement events
- Logs errors with context
- Includes IP and user agent for debugging

---

## SUPPORT & TROUBLESHOOTING

### Common Issues

**Issue:** "Order not found"
- **Cause:** Order ID not passed correctly
- **Fix:** Check URL parameter in checkout redirect

**Issue:** "Payment failed"
- **Cause:** Reloadly returned FAILED status
- **Fix:** Check Reloadly dashboard for transaction details

**Issue:** "No codes received"
- **Cause:** Email delivery delay or spam folder
- **Fix:** Wait 5 minutes, check spam, contact Reloadly support

**Issue:** Rate limit hit
- **Cause:** More than 3 orders per minute from same IP
- **Fix:** Wait 60 seconds, try again

### Debug Commands

```bash
# Check Reloadly API connectivity
cd /Users/administrator/.openclaw/workspace/gifted-project
npx tsx test-reloadly-direct.ts

# View order repository state (requires adding debug logging)
# Add console.log in orderRepository.getById()
```

---

## DELIVERABLE SUMMARY

### What This Fixes

✅ Replaces mock gift card codes with real Reloadly orders
✅ Connects existing order API to checkout flow
✅ Stores real transaction IDs and fulfillment data
✅ Maintains existing error handling and UX
✅ No changes to success page needed (already correct)

### What This Doesn't Change

- Order creation flow (still uses mock repository)
- Payment gateway (no payment collection yet - Reloadly test credits)
- Success page UI
- Email notifications (handled by Reloadly)

### Next Steps (Future Enhancements)

1. **Add Payment Gateway:** Integrate Stripe/Lemon Squeezy before charging users
2. **Database Migration:** Replace mock repository with PostgreSQL/Supabase
3. **Enhanced Error Messages:** Show specific Reloadly error codes to users
4. **Order Tracking:** Allow users to check order status via dashboard
5. **Production Mode:** Switch to `RELOADLY_ENVIRONMENT=production`

---

## CODER HANDOFF

### Implementation Order

1. **First:** Create `lib/payments/reloadly-checkout.ts` (copy spec exactly)
2. **Second:** Update `app/checkout/page.tsx` (3 line changes)
3. **Third:** Test locally with sandbox credentials
4. **Fourth:** Deploy to Vercel with env vars
5. **Fifth:** Test production deployment

### Testing Commands

```bash
# Start dev server
npm run dev

# Navigate to product page
open http://localhost:3000/gift-card/12345

# Complete checkout flow
# Watch console for Reloadly API calls
# Check email for gift card codes
```

### Verification Criteria

- ✅ Checkout completes without errors
- ✅ Redirected to success page
- ✅ Order status = 'completed' in repository
- ✅ Transaction ID stored
- ✅ Email received with gift card codes from Reloadly

---

**END OF ARCHITECTURE SPECIFICATION**
