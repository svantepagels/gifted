/**
 * Lemon Squeezy Payment Integration Adapter
 * 
 * TODO: Implement Lemon Squeezy checkout integration
 * 
 * OVERVIEW:
 * Lemon Squeezy provides hosted checkout pages, so we don't need to handle
 * payment forms directly. The flow is:
 * 1. Create checkout session on server
 * 2. Redirect user to Lemon Squeezy hosted page
 * 3. User completes payment
 * 4. Lemon Squeezy redirects back to success URL
 * 5. Webhook confirms payment (THIS IS CRITICAL - never trust client-side success)
 * 
 * SETUP:
 * 1. Create Lemon Squeezy account at lemonsqueezy.com
 * 2. Create a "Gift Card" product in dashboard
 * 3. Get API key from Settings > API
 * 4. Configure webhook URL (must be publicly accessible)
 * 5. Store API key in environment variable: LEMON_SQUEEZY_API_KEY
 * 
 * CHECKOUT CREATION:
 * 
 * POST https://api.lemonsqueezy.com/v1/checkouts
 * Headers:
 *   Authorization: Bearer {API_KEY}
 *   Accept: application/vnd.api+json
 *   Content-Type: application/vnd.api+json
 * 
 * Body:
 * {
 *   "data": {
 *     "type": "checkouts",
 *     "attributes": {
 *       "checkout_data": {
 *         "email": "customer@example.com",
 *         "custom": {
 *           "order_id": "ORD-123",
 *           "product_id": "amazon-us",
 *           "amount": 25,
 *           "recipient_email": "gift@example.com"
 *         }
 *       }
 *     },
 *     "relationships": {
 *       "store": {
 *         "data": {
 *           "type": "stores",
 *           "id": "{STORE_ID}"
 *         }
 *       },
 *       "variant": {
 *         "data": {
 *           "type": "variants",
 *           "id": "{VARIANT_ID}"
 *         }
 *       }
 *     }
 *   }
 * }
 * 
 * Response includes:
 * - data.attributes.url (redirect user here)
 * - data.id (store as checkout session ID)
 * 
 * WEBHOOK HANDLING:
 * 
 * 1. Create endpoint: POST /api/webhooks/lemon-squeezy
 * 
 * 2. Verify webhook signature:
 *    - Get X-Signature header
 *    - Compute HMAC-SHA256 of raw request body using webhook secret
 *    - Compare with signature
 *    - REJECT if mismatch
 * 
 * 3. Handle events:
 *    - order_created: Payment initiated
 *    - order_paid: Payment succeeded ✅
 *    - order_refunded: Refund processed
 * 
 * 4. Extract custom data:
 *    const orderId = event.meta.custom_data.order_id
 * 
 * 5. Update order status in database
 * 
 * 6. ONLY AFTER webhook confirmation, fulfill gift card via Reloadly
 * 
 * SECURITY:
 * - Never trust client-side success redirect
 * - Always wait for webhook confirmation
 * - Verify webhook signature
 * - Use HTTPS for webhook endpoint
 * - Store order ID in custom_data, not in URL params
 * 
 * ERROR HANDLING:
 * - 401: Invalid API key
 * - 422: Validation error (check request body)
 * - 429: Rate limited (implement exponential backoff)
 * - 5xx: Lemon Squeezy service issue (retry with backoff)
 * 
 * TESTING:
 * - Use test mode in Lemon Squeezy dashboard
 * - Test card: 4242 4242 4242 4242
 * - Use ngrok for local webhook testing
 * - Monitor webhook delivery in dashboard
 * 
 * NEXT.JS INTEGRATION:
 * - Create checkout on server: app/api/checkout/route.ts
 * - Handle webhook: app/api/webhooks/lemon-squeezy/route.ts
 * - Use App Router API routes for both
 */

export class LemonSqueezyAdapter {
  constructor(
    private apiKey: string,
    private storeId: string,
    private variantId: string,
    private webhookSecret: string
  ) {}
  
  // TODO: Implement checkout creation
  async createCheckout(orderId: string, orderData: {
    email: string
    amount: number
    currency: string
    productName: string
    customData: Record<string, any>
  }): Promise<{ checkoutUrl: string; sessionId: string }> {
    // const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Accept': 'application/vnd.api+json',
    //     'Content-Type': 'application/vnd.api+json',
    //   },
    //   body: JSON.stringify({
    //     data: {
    //       type: 'checkouts',
    //       attributes: {
    //         checkout_data: {
    //           email: orderData.email,
    //           custom: {
    //             order_id: orderId,
    //             ...orderData.customData,
    //           },
    //         },
    //       },
    //       relationships: {
    //         store: { data: { type: 'stores', id: this.storeId } },
    //         variant: { data: { type: 'variants', id: this.variantId } },
    //       },
    //     },
    //   }),
    // })
    //
    // const data = await response.json()
    // return {
    //   checkoutUrl: data.data.attributes.url,
    //   sessionId: data.data.id,
    // }
    
    throw new Error('Lemon Squeezy adapter not implemented')
  }
  
  // TODO: Implement webhook verification
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // const crypto = require('crypto')
    // const hmac = crypto.createHmac('sha256', this.webhookSecret)
    // const digest = hmac.update(payload).digest('hex')
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature),
    //   Buffer.from(digest)
    // )
    
    throw new Error('Webhook verification not implemented')
  }
}
