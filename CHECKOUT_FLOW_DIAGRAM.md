# Checkout Flow - Before vs After

## BEFORE (Mock Checkout) ❌

```
User enters email on checkout page
         ↓
handleSubmit() called
         ↓
mockCheckoutService.processPayment(orderId)
         ↓
Generate fake card code: "1234567890123456"
Generate fake PIN: "1234"
         ↓
Store fake fulfillment in order
         ↓
Redirect to /success
         ↓
User sees fake codes
```

**Problem:** No real order placed with Reloadly. Codes are fake.

---

## AFTER (Real Reloadly Integration) ✅

```
User enters email on checkout page
         ↓
handleSubmit() called
         ↓
reloadlyCheckoutService.processOrder(orderId, email)
         ↓
Build OrderRequest:
  {
    productId: 12345,
    countryCode: "US",
    quantity: 1,
    unitPrice: 50.00,
    recipientEmail: "user@example.com",
    customIdentifier: "ORD-123"
  }
         ↓
POST /api/reloadly/order
         ↓
Reloadly API authenticates
         ↓
Reloadly places real gift card order
         ↓
Reloadly sends email to recipient with REAL codes
         ↓
API returns OrderResponse:
  {
    transactionId: 789456,
    status: "SUCCESSFUL",
    amount: 50.00,
    product: { productName: "Amazon US $50" }
  }
         ↓
Store transaction ID in order
         ↓
Update order status to "completed"
         ↓
Redirect to /success
         ↓
User sees order confirmation
         ↓
User receives email from Reloadly with REAL codes
```

**Success:** Real order placed. Real codes delivered via email.

---

## Data Flow Comparison

### MOCK (Before)

| Step | What Happens | Data |
|------|-------------|------|
| 1 | User submits checkout | email: "user@example.com" |
| 2 | Mock service called | orderId: "ORD-123" |
| 3 | **Fake code generated** | cardCode: "1234567890123456" |
| 4 | Stored in order | fulfillment: { fake codes } |
| 5 | Success page | Shows fake codes |

### REAL (After)

| Step | What Happens | Data |
|------|-------------|------|
| 1 | User submits checkout | email: "user@example.com" |
| 2 | Reloadly service called | orderId: "ORD-123" |
| 3 | **API request built** | OrderRequest { productId, amount, email } |
| 4 | **Reloadly order placed** | POST /api/reloadly/order |
| 5 | **Reloadly responds** | transactionId: 789456 |
| 6 | **Reloadly sends email** | recipient gets REAL codes |
| 7 | Stored in order | fulfillment: { transactionId } |
| 8 | Success page | Shows confirmation message |
| 9 | User checks email | Opens Reloadly email with codes |

---

## File Changes

### NEW FILE: `lib/payments/reloadly-checkout.ts`

```
ReloadlyCheckoutService
  └─ processOrder(orderId, email)
       ├─ Get order from repository
       ├─ Build OrderRequest
       ├─ POST /api/reloadly/order
       ├─ Handle response
       ├─ Store transaction ID
       └─ Return success/error
```

### MODIFIED FILE: `app/checkout/page.tsx`

```diff
- import { mockCheckoutService } from '@/lib/payments/mock-checkout'
+ import { reloadlyCheckoutService } from '@/lib/payments/reloadly-checkout'

  const handleSubmit = async (email: string) => {
    if (!order) return
    
-   order.customerEmail = email
-   const result = await mockCheckoutService.processPayment(order.id)
+   const result = await reloadlyCheckoutService.processOrder(order.id, email)
    
    if (result.success) {
      router.push(`/success?orderId=${order.id}`)
    } else {
-     throw new Error(result.error || 'Payment failed')
+     throw new Error(result.error || 'Order processing failed')
    }
  }
```

---

## API Integration

### Order API Endpoint (Already Exists)

**Path:** `app/api/reloadly/order/route.ts`

**What it does:**
1. Rate limits (3 requests/min)
2. Validates request data
3. Calls Reloadly API client
4. Logs to Sentry
5. Returns order response

**What it expects:**
```typescript
{
  productId: number
  countryCode: string
  quantity: number
  unitPrice: number
  customIdentifier: string
  senderName: string
  recipientEmail: string
}
```

**What it returns:**
```typescript
{
  transactionId: number
  amount: number
  status: "SUCCESSFUL" | "PENDING" | "FAILED"
  recipientEmail: string
  product: {
    productId: number
    productName: string
    totalPrice: number
  }
}
```

---

## Testing Matrix

| Test Case | Expected Result | Verification |
|-----------|----------------|--------------|
| **Successful order** | Redirect to success, email received | ✓ Check inbox for Reloadly email |
| **Invalid product** | Error shown, order marked failed | ✓ Error message displayed |
| **Rate limit hit** | 429 error, retry message | ✓ API returns rate limit error |
| **Network error** | Error shown, order marked failed | ✓ Console shows network error |
| **Gift order** | Recipient email gets codes | ✓ Check recipient inbox |

---

## Email Delivery (Important!)

### How Reloadly Delivers Codes

**Reloadly sends gift card codes directly via email:**

1. You place order via API
2. Reloadly processes the order
3. Reloadly sends email to `recipientEmail`
4. Email contains:
   - Gift card code
   - PIN (if applicable)
   - Redemption instructions
   - Expiration date

**The API response does NOT include the codes.** This is intentional for security.

### What We Store

```typescript
fulfillment: {
  cardCode: "Transaction ID: 789456",  // Reference, not actual code
  pin: undefined,                      // Sent via email
  redemptionUrl: undefined             // Sent via email
}
```

### User Experience

1. User completes checkout
2. Success page shows: "Order confirmed! Check your email for gift card codes."
3. User checks inbox
4. Email from Reloadly contains actual codes
5. User redeems the code

---

## Environment Variables (Already Configured)

```bash
✅ RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
✅ RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
✅ RELOADLY_ENVIRONMENT=sandbox
✅ RELOADLY_AUTH_URL=https://auth.reloadly.com
✅ RELOADLY_GIFTCARDS_SANDBOX_URL=https://giftcards-sandbox.reloadly.com
✅ RELOADLY_GIFTCARDS_PRODUCTION_URL=https://giftcards.reloadly.com
```

No changes needed to environment configuration.

---

## Success Criteria

✅ **Code compiles** without TypeScript errors
✅ **Checkout completes** without runtime errors  
✅ **Order is created** in Reloadly system
✅ **Transaction ID** is stored in order
✅ **Email is received** from Reloadly with codes
✅ **Order status** is marked as "completed"
✅ **Success page** displays confirmation

---

## Rollback Plan

If something breaks:

```bash
# Option 1: Revert the commit
git revert HEAD
git push origin main

# Option 2: Restore mock service
# In app/checkout/page.tsx:
# - Change import back to mockCheckoutService
# - Restore old handleSubmit function

# Option 3: Vercel rollback
vercel rollback
```

---

**Visual Summary:**

```
┌─────────────────────────────────────────────────┐
│              BEFORE (Mock)                      │
├─────────────────────────────────────────────────┤
│  Checkout → Mock Service → Fake Codes → User   │
│             ❌ Not real                          │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│              AFTER (Real)                        │
├─────────────────────────────────────────────────┤
│  Checkout → Reloadly API → Real Order →        │
│  → Reloadly Email → Real Codes → User          │
│             ✅ Actual gift cards                 │
└─────────────────────────────────────────────────┘
```

**The key difference:** Real orders placed with Reloadly, real codes delivered via email.
