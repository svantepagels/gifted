# CHECKOUT JSON PARSING ERROR - ARCHITECTURE FIX

## Problem Analysis

**Error**: "Unexpected end of JSON input" when completing purchase at checkout

**Root Cause**: Missing error handling for edge cases where API responses might be:
1. Empty response bodies (204 No Content)
2. Malformed JSON from network issues
3. Incomplete responses due to timeouts
4. Non-JSON error responses (plain text errors)

**Error Location**: Multiple points in the request chain:
- `lib/payments/reloadly-checkout.ts` line 88: `await response.json()`
- `lib/reloadly/client.ts` line 258: `await response.json()` in `placeOrder()`
- Missing validation that responses actually contain JSON before parsing

## Architecture Solution

### 1. Safe JSON Parsing Utility

Create a reusable helper that safely parses JSON with fallback handling:

```typescript
// lib/utils/safe-json.ts
export async function safeJsonParse<T>(
  response: Response,
  context: string
): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  // Check if response has JSON content-type
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error(`[${context}] Non-JSON response:`, text.substring(0, 200));
    throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
  }
  
  // Check for empty body
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    console.error(`[${context}] Empty response body`);
    throw new Error('Server returned empty response');
  }
  
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    console.error(`[${context}] JSON parse error:`, error);
    console.error(`[${context}] Response text:`, text.substring(0, 500));
    throw new Error(`Invalid JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

### 2. Fix Reloadly Client

Update `lib/reloadly/client.ts` to use safe parsing:

**Lines to change**: 
- Line 258 in `placeOrder()`
- Line 92 in `getAllProducts()`  
- Line 119 in `getAllProductsPaginated()`
- Line 149 in `getAllProductsPaginatedWithMeta()`
- Line 253 in `getRedeemInstructions()`
- Line 267 in `getProductById()`

**Pattern**:
```typescript
// Before:
return await response.json();

// After:
return await safeJsonParse<OrderResponse>(response, 'placeOrder');
```

### 3. Fix Checkout Service

Update `lib/payments/reloadly-checkout.ts`:

**Line 77-88**: Replace JSON parsing with validation:
```typescript
// Enhanced error handling with response validation
if (!response.ok) {
  let errorMessage: string;
  let errorData: any;
  
  try {
    // Try to parse error response as JSON
    errorData = await safeJsonParse<any>(response, 'checkout-error');
  } catch {
    // Fallback to text if not JSON
    const text = await response.text();
    errorData = { error: text || `HTTP ${response.status}` };
  }
  
  // ... existing error message logic ...
  
  throw new Error(errorMessage);
}

// Parse success response with validation
let orderResponse: OrderResponse;
try {
  orderResponse = await safeJsonParse<OrderResponse>(response, 'checkout-success');
} catch (parseError) {
  console.error('[ReloadlyCheckout] Failed to parse order response:', parseError);
  throw new Error('Invalid response from payment processor. Please try again or contact support.');
}
```

### 4. Add Response Validation to API Route

Update `app/api/reloadly/order/route.ts`:

**After line 61** (after `placeOrder` call), add validation:
```typescript
const order = await reloadlyClient.placeOrder(orderData);

// Validate response has required fields
if (!order || typeof order !== 'object') {
  console.error('[API] Invalid order response:', order);
  throw new Error('Invalid response from payment provider');
}

if (!order.transactionId || !order.status) {
  console.error('[API] Order missing required fields:', order);
  throw new Error('Incomplete response from payment provider');
}

console.log('[API] Order placed successfully:', {
  transactionId: order.transactionId,
  status: order.status
});
```

### 5. Add Client-Side Timeout

Update `lib/payments/reloadly-checkout.ts` fetch call with timeout:

```typescript
// Add timeout wrapper
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

try {
  const response = await fetch('/api/reloadly/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderRequest),
    signal: controller.signal,
  });
  
  clearTimeout(timeoutId);
  
  // ... rest of error handling ...
} catch (error) {
  clearTimeout(timeoutId);
  
  if (error.name === 'AbortError') {
    throw new Error('Request timed out. Please check your connection and try again.');
  }
  
  throw error;
}
```

## Implementation Order

1. **Create** `lib/utils/safe-json.ts` utility
2. **Update** `lib/reloadly/client.ts` to use safe parsing (all 6 locations)
3. **Update** `lib/payments/reloadly-checkout.ts` with enhanced error handling
4. **Update** `app/api/reloadly/order/route.ts` with response validation
5. **Add** request timeout to checkout service
6. **Test** with sandbox orders
7. **Deploy** and verify on production

## Testing Checklist

- [ ] Test successful checkout flow
- [ ] Test with invalid product ID (should show clear error)
- [ ] Test with network timeout (disconnect mid-request)
- [ ] Test with invalid email format
- [ ] Test error messages are user-friendly
- [ ] Check console logs show detailed debug info
- [ ] Verify no "Unexpected end of JSON input" errors

## Expected Behavior After Fix

**Before**: "Unexpected end of JSON input" - cryptic error
**After**: Clear, actionable error messages like:
- "Server returned empty response"
- "Invalid response from payment processor"  
- "Request timed out. Please check your connection"
- "Order failed: [specific Reloadly error]"

## Edge Cases Handled

1. **Empty response body**: Caught and explained
2. **Non-JSON response**: Detected via content-type header
3. **Malformed JSON**: Try-catch with context logging
4. **Network timeout**: AbortController with 30s limit
5. **Missing required fields**: Validation before using response
6. **Plain text errors**: Fallback parsing for non-JSON errors

---

**Critical**: This error blocks ALL checkout flows. Priority fix for immediate deployment.
