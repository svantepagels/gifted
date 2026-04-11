# RESEARCHER QUICK REFERENCE: Reloadly Checkout Implementation

**Agent:** RESEARCHER  
**Date:** 2026-04-11  
**For:** CODER implementing real Reloadly checkout

---

## TL;DR - Critical Facts

1. **Gift card codes are NEVER in the API response** → Reloadly sends them via email
2. **Product IDs must be numbers** → Convert our string IDs with `parseInt()`
3. **Order status can be PENDING** → Don't assume only SUCCESSFUL/FAILED
4. **Rate limit is strict** → 3 orders/minute per IP (even in sandbox)
5. **Sandbox is realistic** → Real emails sent, real API behavior, free transactions

---

## Quick Gotchas

### ❌ Common Mistakes

```typescript
// WRONG: Expecting codes in API response
const codes = orderResponse.giftCardCode // ❌ Doesn't exist!

// RIGHT: Codes are sent via email by Reloadly
const transactionId = orderResponse.transactionId // ✅ Store this

// WRONG: Passing string product ID
productId: order.productId // ❌ API expects number

// RIGHT: Convert to number
productId: parseInt(order.productId) // ✅ Works

// WRONG: Only handling SUCCESSFUL/FAILED
if (status === 'FAILED') { /* handle */ } // ❌ Missing PENDING

// RIGHT: Handle all three statuses
if (status === 'SUCCESSFUL') { /* complete */ }
else if (status === 'PENDING') { /* processing */ } // ✅ Added
else if (status === 'FAILED') { /* failed */ }
```

---

## Order Status Lifecycle

```
User submits checkout
  ↓
API call to Reloadly
  ↓
Response status can be:

┌─────────────┬────────────────────┬─────────────────────┐
│ SUCCESSFUL  │ PENDING            │ FAILED              │
├─────────────┼────────────────────┼─────────────────────┤
│ Instant     │ Processing (1-5m)  │ Error occurred      │
│ Email sent  │ Email sent later   │ No email            │
│ Mark done   │ Mark processing    │ Mark failed         │
│ Show success│ Show "processing"  │ Show error          │
└─────────────┴────────────────────┴─────────────────────┘
```

---

## Email Delivery

**What happens:**
1. API call succeeds → Reloadly queues email
2. Email sent within 30s-5min to `recipientEmail`
3. Email contains: code, PIN (if needed), redemption URL, instructions
4. We NEVER see the actual codes (security by design)

**Success page should say:**
```
✅ Order Successful!

Gift card codes will be delivered to:
📧 recipient@example.com

What's next?
• Check your email inbox (usually arrives within 2 minutes)
• Look in spam folder if not found
• Contact support if not received within 5 minutes

Transaction ID: {transactionId}
```

---

## Enhanced Implementation

### Add PENDING Handling

```typescript
// In lib/payments/reloadly-checkout.ts processOrder()

// After getting orderResponse, add this check:
if (orderResponse.status === 'PENDING') {
  await orderRepository.updateStatus(orderId, 'processing')
  await orderRepository.updatePayment(
    orderId,
    `RELOADLY_${orderResponse.transactionId}`,
    'PENDING'
  )
  return {
    success: true, // Still succeed (not an error)
    transactionId: orderResponse.transactionId,
  }
}
```

### Add Email Validation

```typescript
// At start of processOrder()
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(customerEmail)) {
  return { 
    success: false, 
    error: 'Invalid email address format' 
  }
}
```

### Add Product ID Safety Check

```typescript
// Before creating orderRequest
const productId = parseInt(order.productId)
if (isNaN(productId)) {
  return { 
    success: false, 
    error: 'Invalid product ID' 
  }
}

const orderRequest: OrderRequest = {
  productId, // Use validated number
  // ... rest
}
```

### Better Error Messages

```typescript
// In catch block when response.ok is false
switch (response.status) {
  case 400:
    throw new Error('Invalid order details. Please check product and amount.')
  case 401:
    throw new Error('Authentication failed. Please try again.')
  case 403:
    throw new Error('This product is not available. Please choose another.')
  case 429:
    throw new Error('Too many orders. Please wait a minute and try again.')
  case 500:
  case 503:
    throw new Error('Service temporarily unavailable. Please try again shortly.')
  default:
    throw new Error(errorData.error || `Order failed (Error ${response.status})`)
}
```

---

## Testing Checklist

### Before Deployment
- [ ] Test successful order (self-delivery)
- [ ] Test gift order (recipient email)
- [ ] Verify email arrives within 5 minutes
- [ ] Test 4 rapid orders (should hit rate limit on 4th)
- [ ] Test with invalid product ID
- [ ] Verify transaction ID is stored

### What Email Should Look Like

```
From: Reloadly <noreply@reloadly.com>
To: recipient@example.com
Subject: Your [Brand Name] Gift Card

Your Gift Card Code: XXXX-XXXX-XXXX
PIN: [if applicable]
Amount: $XX.XX

Redeem at: [URL]
Instructions: [Steps to redeem]
```

**Important:** You'll receive this email when testing in sandbox!

---

## Deployment Steps

```bash
# 1. Commit code
git add lib/payments/reloadly-checkout.ts app/checkout/page.tsx
git commit -m "fix: integrate real Reloadly checkout"
git push origin main

# 2. Verify environment variables exist in .env.local
# These should already be set:
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
RELOADLY_ENVIRONMENT=sandbox

# 3. Set Vercel environment variables
vercel env add RELOADLY_CLIENT_ID production
# Enter value when prompted

vercel env add RELOADLY_CLIENT_SECRET production
# Enter value when prompted

vercel env add RELOADLY_ENVIRONMENT production
# Enter: sandbox

# 4. Deploy
vercel --prod --yes

# 5. Test on production URL
# Place a test order, verify email received
```

---

## Monitoring

### What to Watch After Deployment

**In Sentry:**
- Look for errors in `/api/reloadly/order`
- Check for 429 rate limit warnings
- Monitor order failure rate

**In Console Logs:**
- "Reloadly checkout error" messages
- API response statuses
- Transaction IDs

**Email Testing:**
- Place test order
- Wait 5 minutes
- Check spam folder if needed
- Verify codes are present in email

---

## When Things Go Wrong

### "Order not found"
**Cause:** Order ID not passed correctly  
**Fix:** Check URL parameter `?orderId={id}` is correct

### "Authentication failed"
**Cause:** Invalid Reloadly credentials  
**Fix:** Verify env vars in Vercel dashboard match `.env.local`

### "Invalid product ID"
**Cause:** Product ID is string or invalid  
**Fix:** Check `parseInt()` conversion is working

### "Rate limit exceeded"
**Cause:** >3 orders in 1 minute from same IP  
**Fix:** Wait 60 seconds, try again

### "No email received"
**Cause:** Email delay or spam filter  
**Fix:** Wait 5 minutes, check spam, verify email address is correct

### "Order status PENDING forever"
**Cause:** Some providers take longer to process  
**Fix:** Implement webhook endpoint OR poll for status updates

---

## Rollback Plan

If things break:

```bash
# Option 1: Revert deployment
vercel rollback

# Option 2: Revert code
git revert HEAD
git push origin main

# Option 3: Restore mock checkout
# Change import in app/checkout/page.tsx:
import { mockCheckoutService } from '@/lib/payments/mock-checkout'
# And revert handleSubmit function
```

---

## Support Resources

- **Reloadly Dashboard:** https://developers.reloadly.com/
- **Reloadly Support:** support@reloadly.com
- **API Documentation:** https://docs.reloadly.com/gift-cards
- **Sandbox Testing:** Free unlimited test transactions

---

## Final Pre-Flight Check

Before merging to main:

✅ `lib/payments/reloadly-checkout.ts` created  
✅ Import updated in `app/checkout/page.tsx`  
✅ `handleSubmit` updated in `app/checkout/page.tsx`  
✅ PENDING status handling added  
✅ Email validation added  
✅ Product ID conversion safe-checked  
✅ Error messages enhanced  
✅ Local test passed (order complete, email received)  
✅ Rate limit tested (4th order fails)  
✅ Environment variables verified in `.env.local`  

**Ready to deploy!** 🚀

---

**Questions?** Review `RESEARCHER_RELOADLY_CHECKOUT_CONTEXT.md` for detailed explanations.
