# RESEARCHER DELIVERABLE: Reloadly Checkout Integration - Comprehensive Context

**Date:** 2026-04-11  
**Agent:** RESEARCHER  
**Task:** Provide comprehensive context for implementing real Reloadly checkout integration

---

## EXECUTIVE SUMMARY

This document provides critical context, best practices, and gotchas for integrating Reloadly's Gift Card API into the Gifted checkout flow. Based on official Reloadly documentation, API reference materials, and industry best practices, this research complements the ARCHITECT's technical specification with operational insights.

**Key Findings:**
- ✅ Reloadly handles gift card code delivery via email (we never see the codes)
- ⚠️ Order status can be SUCCESSFUL, PENDING, or FAILED - handle PENDING properly
- ⚠️ Rate limiting is strict (3 orders/min) - critical for production
- ✅ Sandbox environment provides realistic testing without spending real money
- ⚠️ Product IDs must be numbers (our app stores strings - conversion required)
- ✅ Webhooks available for asynchronous order status updates

---

## TABLE OF CONTENTS

1. [Reloadly API Architecture](#reloadly-api-architecture)
2. [Order Status Lifecycle](#order-status-lifecycle)
3. [Email Delivery Mechanism](#email-delivery-mechanism)
4. [Error Codes & Handling](#error-codes--handling)
5. [Rate Limiting Deep Dive](#rate-limiting-deep-dive)
6. [Security Best Practices](#security-best-practices)
7. [Testing Strategy](#testing-strategy)
8. [Common Integration Pitfalls](#common-integration-pitfalls)
9. [Production Hardening](#production-hardening)
10. [Monitoring & Observability](#monitoring--observability)
11. [Webhook Integration](#webhook-integration)
12. [Sources & References](#sources--references)

---

## 1. RELOADLY API ARCHITECTURE

### Authentication Flow

Reloadly uses OAuth 2.0 client credentials flow:

```
1. POST to auth.reloadly.com/oauth/token
   - Credentials: client_id + client_secret
   - Returns: access_token (expires in ~1 hour)

2. Use access_token in Authorization header
   - Format: "Bearer {access_token}"
   - Valid for all API calls until expiry

3. Token refresh
   - No refresh tokens provided
   - Must re-authenticate when expired
   - Client handles this transparently
```

**Our Implementation:**
The `reloadlyClient` in `lib/reloadly/client.ts` already handles token caching and automatic refresh (60-second buffer before expiry).

### Environment Separation

Reloadly provides two completely isolated environments:

| Environment | Auth URL | API URL | Purpose |
|-------------|----------|---------|---------|
| **Sandbox** | auth.reloadly.com | giftcards-sandbox.reloadly.com | Testing with fake transactions |
| **Production** | auth.reloadly.com | giftcards.reloadly.com | Live orders, real money |

**Critical:** Sandbox and production use **different credentials**. Never mix them.

**Current Configuration:** We're using sandbox credentials (correct for development/testing).

---

## 2. ORDER STATUS LIFECYCLE

### Status Values

Reloadly orders return one of three statuses:

| Status | Meaning | What It Means For Us | Action Required |
|--------|---------|----------------------|-----------------|
| **SUCCESSFUL** | Order completed, codes sent | Gift card delivered successfully | Mark order complete, show success |
| **PENDING** | Order processing, not yet fulfilled | Reloadly is still working on it | Show "processing" message, poll for updates |
| **FAILED** | Order failed, no delivery | Something went wrong | Mark order failed, refund user if needed |

### Handling PENDING Status

**CRITICAL FINDING:** The ARCHITECT's spec only handles SUCCESSFUL and FAILED. We must also handle PENDING:

```typescript
// In reloadly-checkout.ts processOrder method
if (orderResponse.status === 'FAILED') {
  await orderRepository.updateStatus(orderId, 'failed')
  return {
    success: false,
    error: 'Order failed at Reloadly. Please try again or contact support.',
  }
}

// ADD THIS:
if (orderResponse.status === 'PENDING') {
  await orderRepository.updateStatus(orderId, 'processing')
  // Store transaction ID for later polling
  await orderRepository.updatePayment(
    orderId,
    `RELOADLY_${orderResponse.transactionId}`,
    'PENDING'
  )
  return {
    success: true, // Still redirect to success
    transactionId: orderResponse.transactionId,
    pending: true, // Flag for UI to show "processing" message
  }
}
```

**Why This Matters:**
- Some gift card providers take time to process orders
- PENDING orders may resolve to SUCCESSFUL within seconds or minutes
- Users should not be told the order "failed" if it's just slow

### Status Polling Strategy

For PENDING orders, we have two options:

**Option A: Webhook (Recommended)**
Set up a webhook endpoint to receive status updates from Reloadly when PENDING orders complete.

**Option B: Manual Polling**
If user refreshes success page, poll Reloadly for transaction status update.

**Recommendation:** Start with Option B (simpler), add Option A later (more robust).

---

## 3. EMAIL DELIVERY MECHANISM

### How Reloadly Delivers Codes

Based on official Reloadly documentation:

1. **API Response:** Contains transaction details but **NOT gift card codes**
2. **Email Delivery:** Reloadly sends a separate email to `recipientEmail` with:
   - Gift card code(s)
   - PIN (if applicable)
   - Redemption instructions
   - Brand logo and branding
   - Expiry date (if applicable)

**Example Email Structure:**
```
From: Reloadly <noreply@reloadly.com>
To: recipient@example.com
Subject: Your Amazon Gift Card is Ready!

----------------------------------
Your Gift Card Details:
----------------------------------
Brand: Amazon.com
Amount: $25.00
Code: XXXX-XXXX-XXXX-XXXX
PIN: N/A

Redemption Instructions:
1. Go to amazon.com/redeem
2. Enter the code above
3. The balance will be added to your account

This gift card expires: Never
----------------------------------
```

### Email Delivery Timing

- **Typical:** Within 30 seconds to 2 minutes
- **Delayed:** Can take up to 5 minutes for some providers
- **Failures:** Rare, but can happen due to email spam filters

### What Our Success Page Should Say

**ARCHITECT's Current Approach:** Success page shows transaction details (correct)

**Recommended Messaging:**

```
✅ Order Successful!

Your gift card has been ordered successfully.

Transaction ID: {transactionId}
Amount: ${amount}
Recipient: {recipientEmail}

📧 Gift card codes will be delivered via email within 2-5 minutes.

What's next?
• Check your email inbox for a message from Reloadly
• If you don't see it, check your spam folder
• Codes typically arrive within 2 minutes

Need help? Contact support with Transaction ID: {transactionId}
```

---

## 4. ERROR CODES & HANDLING

### Common Reloadly API Errors

Based on research and documentation:

| HTTP Status | Error Type | Common Causes | How to Handle |
|-------------|-----------|---------------|---------------|
| **400** | Bad Request | Missing fields, invalid product ID, invalid amount | Show user-friendly message, log details |
| **401** | Unauthorized | Invalid credentials, expired token | Re-authenticate, retry once |
| **403** | Forbidden | Insufficient funds, product unavailable in region | Show specific error message |
| **404** | Not Found | Product ID doesn't exist | Validate product IDs before checkout |
| **429** | Rate Limit | Too many requests (>3/min for orders) | Show "try again in X seconds" message |
| **500** | Server Error | Reloadly API issue | Retry after delay, show generic error |
| **503** | Service Unavailable | Reloadly maintenance | Retry after delay, show maintenance message |

### Enhanced Error Handling

The ARCHITECT's spec handles errors generically. Here's an enhanced version:

```typescript
// In reloadly-checkout.ts processOrder method
try {
  const response = await fetch('/api/reloadly/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderRequest),
  })

  if (!response.ok) {
    const errorData = await response.json()
    
    // Enhanced error handling based on status code
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
  }
  
  // ... rest of processing
} catch (error) {
  console.error('Reloadly checkout error:', error)
  
  // Log to Sentry with context
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(error, {
      tags: {
        service: 'reloadly',
        endpoint: 'checkout',
        orderId,
      },
      extra: {
        customerEmail,
        productId: order.productId,
      }
    })
  }
  
  await orderRepository.updateStatus(orderId, 'failed')
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Unknown error occurred',
  }
}
```

---

## 5. RATE LIMITING DEEP DIVE

### Current Implementation

In `app/api/reloadly/order/route.ts`:
- **Limit:** 3 requests per minute per IP
- **Enforcement:** Via `rateLimitCheck()` function
- **Response:** 429 status with retry headers

### Rate Limit Implications

**For Sandbox Testing:**
- Limit is strict even in sandbox
- Useful for testing rate limit handling
- Reset time: 60 seconds

**For Production:**
- 3 orders/minute = 180 orders/hour = 4,320 orders/day per IP
- Most individual users won't hit this
- Risk: Single IP behind NAT (corporate networks, VPNs)

### Rate Limit Strategy

**Option 1: IP-Based (Current)**
- ✅ Simple to implement
- ⚠️ Can penalize legitimate users behind shared IPs
- ⚠️ Vulnerable to distributed attacks

**Option 2: User-Based**
- ✅ Fair per-user limits
- ⚠️ Requires user authentication
- ⚠️ More complex to implement

**Option 3: Hybrid**
- ✅ 3 orders/min per IP (current)
- ✅ 10 orders/hour per email address
- ✅ Balances fairness and simplicity

**Recommendation:** Keep current IP-based rate limiting for MVP. Add user-based limits after implementing proper authentication.

### User Experience for Rate Limits

When user hits rate limit, show:

```
⏳ Please Wait

You've reached the maximum number of orders (3 per minute).

You can place another order in: {countdown} seconds

This limit helps us prevent fraud and ensure service quality.

Need to place multiple orders? Contact support.
```

---

## 6. SECURITY BEST PRACTICES

### Credential Security

**Current State:** ✅ Credentials stored in `.env.local` (not committed to git)

**Checklist:**
- [x] Credentials in environment variables
- [x] `.env.local` in `.gitignore`
- [x] `.env.example` with placeholder values
- [ ] Vercel environment variables configured (pending deployment)
- [ ] Rotate credentials after public deployment

### API Key Rotation

**Best Practice:** Rotate Reloadly credentials every 90 days

**Process:**
1. Generate new credentials in Reloadly dashboard
2. Add new credentials to Vercel environment variables
3. Deploy with new credentials
4. Revoke old credentials after 24 hours (buffer period)

### Request Validation

**Current Implementation:** Basic validation in `app/api/reloadly/order/route.ts`

**Enhanced Validation:**

```typescript
// Validate email format
if (!orderData.recipientEmail || !isValidEmail(orderData.recipientEmail)) {
  return NextResponse.json(
    { error: 'Invalid email address' },
    { status: 400 }
  )
}

// Validate product ID is numeric
if (isNaN(Number(orderData.productId))) {
  return NextResponse.json(
    { error: 'Invalid product ID' },
    { status: 400 }
  )
}

// Validate amount is positive
if (orderData.unitPrice <= 0) {
  return NextResponse.json(
    { error: 'Invalid amount' },
    { status: 400 }
  )
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

### PII Handling

**Sensitive Data in Orders:**
- Customer email addresses
- Recipient email addresses
- IP addresses

**Recommendations:**
1. Don't log sensitive data in plain text
2. Redact emails in Sentry reports (show only domain)
3. Don't store IP addresses longer than necessary
4. Comply with GDPR/CCPA if serving EU/California users

---

## 7. TESTING STRATEGY

### Sandbox Testing Approach

Reloadly sandbox provides:
- ✅ Free test transactions (no real money)
- ✅ Real API responses and behavior
- ✅ Actual email delivery to test addresses
- ✅ All product catalog (same as production)

### Test Cases

**Test Case 1: Successful Order - Self Delivery**
```
Product: Amazon US $5 gift card
Delivery: Send to me
Email: your-test-email@gmail.com

Expected:
- Order status: SUCCESSFUL
- Email received within 2 minutes
- Transaction ID stored
- Success page displays correctly
```

**Test Case 2: Successful Order - Gift Delivery**
```
Product: Starbucks $10 gift card
Delivery: Send as gift
Recipient: friend-test-email@gmail.com
Gift Message: "Happy Birthday!"

Expected:
- Recipient receives email with code
- Gift message included in email
- Order marked complete
```

**Test Case 3: Failed Order - Invalid Product**
```
Product ID: 999999 (doesn't exist)

Expected:
- 404 or 400 error from API
- User sees friendly error message
- Order marked as failed
```

**Test Case 4: Rate Limit**
```
Action: Place 4 orders rapidly

Expected:
- First 3 succeed
- 4th returns 429 error
- User sees "please wait" message
- 60 seconds later, orders work again
```

**Test Case 5: PENDING Status**
```
Product: Any product that may return PENDING
(Some providers process slower)

Expected:
- Order status: PENDING initially
- Success page shows "processing" message
- Email eventually arrives when status changes to SUCCESSFUL
```

**Test Case 6: Network Timeout**
```
Simulate: Kill internet connection mid-request

Expected:
- Fetch throws network error
- User sees generic error message
- Order marked as failed
- No duplicate charges
```

### Manual Testing Checklist

- [ ] Place order with minimum amount ($1-5)
- [ ] Place order with maximum amount (check product limits)
- [ ] Test with real email you control
- [ ] Test with different email providers (Gmail, Outlook, etc.)
- [ ] Check spam folder for Reloadly emails
- [ ] Verify email delivery timing (<5 min)
- [ ] Test gift message display in email
- [ ] Test rate limiting (3+ rapid orders)
- [ ] Test error handling (invalid product ID)
- [ ] Verify transaction ID is stored correctly

### Automated Testing

**Unit Tests** (for reloadly-checkout.ts):

```typescript
describe('ReloadlyCheckoutService', () => {
  it('should convert string product ID to number', () => {
    // Test product ID conversion
  })
  
  it('should handle SUCCESSFUL status correctly', () => {
    // Mock successful order response
  })
  
  it('should handle FAILED status correctly', () => {
    // Mock failed order response
  })
  
  it('should handle PENDING status correctly', () => {
    // Mock pending order response
  })
  
  it('should mark order as failed on API error', () => {
    // Mock API error
  })
})
```

**E2E Tests** (Playwright):

```typescript
test('complete checkout flow with Reloadly', async ({ page }) => {
  // Navigate to product page
  await page.goto('/gift-card/12345')
  
  // Select amount and proceed
  await page.click('button:has-text("$5")')
  await page.click('button:has-text("Buy Now")')
  
  // Fill checkout form
  await page.fill('input[type="email"]', 'test@example.com')
  await page.click('button:has-text("Complete Order")')
  
  // Wait for redirect to success page
  await page.waitForURL('**/success?orderId=*')
  
  // Verify success message
  await expect(page.locator('text=Order Successful')).toBeVisible()
})
```

---

## 8. COMMON INTEGRATION PITFALLS

### Pitfall #1: Product ID Type Mismatch

**Problem:** Our app stores product IDs as strings (`order.productId: string`), but Reloadly expects numbers.

**Symptom:** 400 Bad Request errors with message like "productId must be a number"

**Solution:** ✅ Already addressed in ARCHITECT's spec with `parseInt(order.productId)`

**Additional Safety:**

```typescript
const productId = parseInt(order.productId)
if (isNaN(productId)) {
  return { success: false, error: 'Invalid product ID format' }
}

const orderRequest: OrderRequest = {
  productId, // Now guaranteed to be a number
  // ... rest of fields
}
```

### Pitfall #2: Email Validation

**Problem:** Invalid email addresses cause silent failures (order may process but codes never delivered)

**Symptom:** No error from API, but recipient never receives email

**Solution:** Validate email format before API call

```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

// In processOrder:
if (!isValidEmail(customerEmail)) {
  return { success: false, error: 'Invalid email address format' }
}
```

### Pitfall #3: Assuming Codes in API Response

**Problem:** Expecting gift card codes in the API response

**Symptom:** Trying to extract `orderResponse.cardCode` which doesn't exist

**Reality:** Codes are **only** delivered via email, never in API response

**Solution:** ✅ ARCHITECT's spec handles this correctly - stores transaction ID only

### Pitfall #4: Not Handling PENDING Status

**Problem:** Only checking for SUCCESSFUL or FAILED

**Symptom:** Orders stuck in "processing" state forever, or marked as failed when they're actually pending

**Solution:** Add explicit PENDING handling (see Section 2)

### Pitfall #5: Ignoring Rate Limits

**Problem:** Not throttling requests on client side

**Symptom:** Users clicking "Submit" multiple times → duplicate orders or rate limit errors

**Solution:** Disable submit button during processing

```typescript
const [isProcessing, setIsProcessing] = useState(false)

const handleSubmit = async (email: string) => {
  if (isProcessing) return // Prevent duplicate submissions
  
  setIsProcessing(true)
  try {
    const result = await reloadlyCheckoutService.processOrder(order.id, email)
    // ... handle result
  } finally {
    setIsProcessing(false)
  }
}
```

### Pitfall #6: Missing Error Context

**Problem:** Generic error messages don't help debug issues

**Symptom:** Support tickets with "Order failed" but no context

**Solution:** Log detailed context for failed orders

```typescript
catch (error) {
  console.error('Reloadly checkout error:', {
    error,
    orderId,
    customerEmail: customerEmail.replace(/(.{2}).*(@.*)/, '$1***$2'), // Redact middle
    productId: order.productId,
    amount: order.amount,
    timestamp: new Date().toISOString(),
  })
  
  // ... rest of error handling
}
```

---

## 9. PRODUCTION HARDENING

### Pre-Production Checklist

- [ ] **Sandbox Testing Complete**
  - At least 10 successful test orders
  - All error cases tested
  - Email delivery verified
  - Rate limiting tested

- [ ] **Environment Variables Set**
  - Vercel production environment configured
  - All Reloadly credentials added
  - Environment set to 'sandbox' initially
  
- [ ] **Monitoring Configured**
  - Sentry error tracking enabled
  - Log aggregation setup (optional)
  - Uptime monitoring for API endpoint

- [ ] **Rollback Plan Documented**
  - Git revert procedure
  - Vercel rollback command
  - Mock checkout restoration steps

- [ ] **Support Procedures**
  - Document how to look up orders in Reloadly dashboard
  - Create support email templates
  - Define SLAs for order issues

### Production Deployment Steps

**Phase 1: Deploy with Sandbox Credentials**

```bash
# Set Vercel environment variables (sandbox)
vercel env add RELOADLY_CLIENT_ID production
vercel env add RELOADLY_CLIENT_SECRET production
vercel env add RELOADLY_ENVIRONMENT production # Value: "sandbox"

# Deploy
git push origin main
vercel --prod --yes

# Test production deployment
# Place 2-3 test orders on live site
# Verify everything works
```

**Phase 2: Monitor for 24-48 Hours**

- Watch Sentry for errors
- Monitor order success rate
- Check email delivery reports
- Verify rate limiting works

**Phase 3: Switch to Production Credentials**

```bash
# Get production credentials from Reloadly dashboard
# Update Vercel environment variables
vercel env rm RELOADLY_CLIENT_ID production
vercel env add RELOADLY_CLIENT_ID production # New production value

vercel env rm RELOADLY_CLIENT_SECRET production
vercel env add RELOADLY_CLIENT_SECRET production # New production value

vercel env rm RELOADLY_ENVIRONMENT production
vercel env add RELOADLY_ENVIRONMENT production # Value: "production"

# Redeploy (automatically picks up new env vars)
vercel --prod --yes
```

**Phase 4: Top Up Reloadly Account**

Before going live with production:
1. Log into Reloadly production dashboard
2. Add funds to wallet (start with $100-500)
3. Set up low-balance alerts
4. Configure auto-top-up if available

### Production Monitoring

**Key Metrics:**

```typescript
// Track these metrics in analytics/monitoring
{
  "order.placed": 1,              // Increment on order attempt
  "order.successful": 1,          // Increment on SUCCESSFUL status
  "order.failed": 1,              // Increment on FAILED status
  "order.pending": 1,             // Increment on PENDING status
  "order.processing_time_ms": 2500, // Time from submit to response
  "reloadly.api.latency_ms": 1800,  // Reloadly API response time
  "reloadly.api.error.401": 1,    // Count auth errors
  "reloadly.api.error.429": 1,    // Count rate limits
  "email.delivery.delay_minutes": 2, // Time until email received
}
```

**Alerts:**

- ⚠️ Order failure rate > 5% in last hour
- ⚠️ No successful orders in last 30 minutes (during peak hours)
- 🚨 Reloadly API returning 500 errors
- 🚨 Order processing time > 10 seconds
- ⚠️ Rate limit hit more than 10 times in last hour

---

## 10. MONITORING & OBSERVABILITY

### Sentry Integration

Current implementation in `app/api/reloadly/order/route.ts` includes:
- Order placement logging (info level)
- Error capture with context
- Rate limit warnings

**Enhanced Sentry Context:**

```typescript
// In reloadly-checkout.ts
import * as Sentry from '@sentry/nextjs'

// Before API call
Sentry.addBreadcrumb({
  category: 'reloadly.checkout',
  message: 'Starting order processing',
  level: 'info',
  data: {
    orderId,
    productId: order.productId,
    amount: order.amount,
  }
})

// After successful order
Sentry.captureMessage('Reloadly order successful', {
  level: 'info',
  tags: {
    service: 'reloadly',
    status: 'success',
  },
  extra: {
    transactionId: orderResponse.transactionId,
    processingTime: Date.now() - startTime,
  }
})

// On error
Sentry.captureException(error, {
  tags: {
    service: 'reloadly',
    endpoint: 'checkout',
    orderId,
  },
  extra: {
    customerEmail,
    productId: order.productId,
    errorType: error.name,
    statusCode: response?.status,
  }
})
```

### Logging Best Practices

**What to Log:**
- ✅ Order initiation (orderId, productId, amount)
- ✅ API request/response times
- ✅ Status changes (pending → successful)
- ✅ Errors with full context

**What NOT to Log:**
- ❌ Gift card codes (if ever accessible)
- ❌ Full email addresses in production logs
- ❌ Reloadly API credentials
- ❌ Credit card info (if payment gateway added later)

**Log Levels:**

```typescript
console.log('Order initiated', { orderId }) // INFO
console.warn('Rate limit approaching', { ip, count }) // WARNING
console.error('Order failed', { orderId, error }) // ERROR
```

### Health Check Endpoint

Create a health check to verify Reloadly API connectivity:

```typescript
// app/api/health/reloadly/route.ts
import { NextResponse } from 'next/server'
import { reloadlyClient } from '@/lib/reloadly/client'

export async function GET() {
  try {
    // Simple test: fetch products (doesn't cost money)
    const products = await reloadlyClient.getAllProductsPaginated(0, 1)
    
    return NextResponse.json({
      status: 'healthy',
      reloadly: 'connected',
      productCount: products.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        reloadly: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}
```

---

## 11. WEBHOOK INTEGRATION

### Why Webhooks?

**Problem with Polling:**
- Must constantly check for PENDING order updates
- Wastes API calls
- Delays in user seeing completion

**Solution with Webhooks:**
- Reloadly notifies us when order status changes
- Immediate updates
- No polling needed

### Webhook Setup

**Step 1: Create Webhook Endpoint**

```typescript
// app/api/webhooks/reloadly/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { orderRepository } from '@/lib/orders/mock-repository'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature
    const signature = request.headers.get('x-reloadly-signature')
    const body = await request.text()
    
    const secret = process.env.RELOADLY_WEBHOOK_SECRET
    if (!secret) {
      throw new Error('Webhook secret not configured')
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }
    
    // 2. Parse webhook payload
    const event = JSON.parse(body)
    
    // 3. Handle event based on type
    if (event.eventType === 'giftcard.transaction.status') {
      const { customIdentifier, status, transactionId } = event.data
      
      // customIdentifier is our orderId
      const order = await orderRepository.getById(customIdentifier)
      if (!order) {
        console.warn('Order not found for webhook', { customIdentifier })
        return NextResponse.json({ received: true })
      }
      
      // Update order status
      if (status === 'SUCCESSFUL') {
        await orderRepository.updateStatus(customIdentifier, 'completed')
      } else if (status === 'FAILED') {
        await orderRepository.updateStatus(customIdentifier, 'failed')
      }
      
      console.log('Webhook processed', { orderId: customIdentifier, status })
    }
    
    // 4. Always return 2xx to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    // Still return 200 to prevent retries (log error for debugging)
    return NextResponse.json({ received: true }, { status: 200 })
  }
}
```

**Step 2: Configure in Reloadly Dashboard**

1. Go to Developers → Webhooks
2. Click "Add Webhook"
3. Enter URL: `https://your-domain.vercel.app/api/webhooks/reloadly`
4. Select service: "Gift Cards"
5. Select event: "transaction.status"
6. Copy webhook signature secret
7. Add to Vercel env vars: `RELOADLY_WEBHOOK_SECRET`

**Step 3: Test Webhook**

```bash
# Reloadly dashboard has webhook testing tool
# Send test event and verify endpoint receives it
```

### Webhook Best Practices

**Idempotency:**
Webhooks may be delivered multiple times. Always handle them idempotently:

```typescript
// Check if we already processed this transaction
const existingStatus = order.paymentStatus
if (existingStatus === 'SUCCESSFUL' && status === 'SUCCESSFUL') {
  console.log('Duplicate webhook received', { transactionId })
  return NextResponse.json({ received: true }) // Acknowledge but don't reprocess
}
```

**Retry Logic:**
If your endpoint doesn't return 2xx, Reloadly retries up to 10 times:

```typescript
// ALWAYS return 200, even on errors
// Log errors for debugging, but don't fail the webhook
try {
  // ... process webhook
} catch (error) {
  console.error('Error processing webhook:', error)
  // Still return 200 to stop retries
  return NextResponse.json({ received: true, error: true }, { status: 200 })
}
```

**Processing Time:**
Respond within 3 seconds or Reloadly assumes timeout:

```typescript
// Do heavy processing asynchronously
const processWebhookAsync = async (event: any) => {
  // Long-running tasks here
}

// In webhook handler:
processWebhookAsync(event) // Don't await
return NextResponse.json({ received: true }, { status: 200 }) // Return immediately
```

---

## 12. SOURCES & REFERENCES

### Official Reloadly Documentation

1. **Reloadly API Reference**
   - URL: https://docs.reloadly.com/gift-cards
   - Topics: Authentication, order placement, error codes

2. **Reloadly Developer Guides**
   - URL: https://developers.reloadly.com/gift-cards
   - Topics: Quickstart, integration guides, best practices

3. **Reloadly Webhook Documentation**
   - URL: https://support.reloadly.com/reloadly-webhook
   - Topics: Webhook setup, event types, retry logic

4. **Reloadly Blog**
   - URL: https://www.reloadly.com/blog/
   - Topics: Integration examples, use cases, tutorials

### Key Articles Referenced

1. "How to order a gift card" (Reloadly Blog, Aug 2022)
   - Source: https://www.reloadly.com/blog/how-to-order-a-gift-card/
   - Finding: Product ID must be number, email delivery mechanism

2. "Gift Card Activation Software" (Reloadly Blog, Jan 2022)
   - Source: https://blog.reloadly.com/blog/gift-card-activation-software/
   - Finding: Email includes all activation details

3. "4 tips and tricks for working with Reloadly's API Reference" (Reloadly Blog, Mar 2023)
   - Source: https://www.reloadly.com/blog/4-tips-and-tricks-for-working-with-reloadlys-api-reference/
   - Finding: API status page, token management

### Research Methodology

1. **Web Search:** Queried for Reloadly API best practices, error handling, testing approaches
2. **Documentation Review:** Read official Reloadly developer documentation
3. **Code Analysis:** Examined existing codebase (`lib/reloadly/client.ts`, `app/api/reloadly/order/route.ts`)
4. **Architecture Review:** Studied ARCHITECT's specifications for context
5. **Security Research:** Investigated PCI DSS compliance, PII handling, credential management

### Additional Resources

- **Reloadly Status Page:** Monitor API uptime
- **Reloadly Support:** Contact for integration questions
- **Postman Collection:** Pre-configured API requests for testing
- **Sandbox Dashboard:** https://developers.reloadly.com/ (test transactions)

---

## SUMMARY OF KEY RECOMMENDATIONS

### Critical Implementation Details

1. ✅ **Handle PENDING Status:** Don't assume orders are only SUCCESSFUL or FAILED
2. ✅ **Product ID Conversion:** Convert string to number before API call
3. ✅ **Email Validation:** Validate format before processing
4. ✅ **Error Context:** Log detailed context for debugging
5. ✅ **Rate Limit UX:** Show countdown timer when limit hit

### Production Readiness

1. ⚠️ **Start with Sandbox:** Deploy to production using sandbox credentials first
2. ⚠️ **Monitor 24-48h:** Watch for errors before switching to production API
3. ⚠️ **Top Up Account:** Fund Reloadly production wallet before going live
4. ⚠️ **Set Up Alerts:** Configure Sentry alerts for failure rates

### Future Enhancements

1. 💡 **Webhook Integration:** Add for PENDING order status updates
2. 💡 **User Dashboard:** Let users check order status
3. 💡 **Payment Gateway:** Add Stripe/Lemon Squeezy before charging real money
4. 💡 **Database Migration:** Move from mock repository to PostgreSQL

---

## HANDOFF TO CODER

### What to Implement

**Baseline (ARCHITECT's Spec):**
- Create `lib/payments/reloadly-checkout.ts`
- Update `app/checkout/page.tsx` (import + handleSubmit)

**Enhanced (RESEARCHER's Recommendations):**
- Add PENDING status handling in `processOrder()`
- Add email format validation
- Add product ID validation (NaN check)
- Enhance error messages based on HTTP status codes
- Add submit button disable during processing

### Testing Priorities

1. **Must Test:**
   - Successful order flow (self-delivery)
   - Gift order flow
   - Email delivery (<5 min)
   - Rate limiting (4th order fails)

2. **Should Test:**
   - PENDING status handling
   - Invalid product ID error
   - Network timeout error
   - Duplicate submission prevention

3. **Nice to Test:**
   - Different email providers (Gmail, Outlook, Yahoo)
   - International products
   - Minimum/maximum denominations

### Questions to Resolve

- Should we implement webhook endpoint now or later?
- Do we want enhanced error messages or keep them generic?
- Should we add email validation client-side or server-side?
- Do we want to display estimated email delivery time on success page?

---

**END OF RESEARCHER DELIVERABLE**

This research provides the operational context needed to implement Reloadly checkout integration successfully. All findings are based on official documentation and industry best practices.
