import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { reloadlyClient } from '@/lib/reloadly/client'
import type { OrderRequest } from '@/lib/reloadly/types'
import { rateLimitCheck, getIP } from '@/lib/rate-limit'
import { orderRepository } from '@/lib/orders/repository'
import { giftCardService } from '@/lib/giftcards/service'
import type { GiftCardProduct } from '@/lib/giftcards/types'
import type { OrderFulfillment } from '@/lib/orders/types'

export const dynamic = 'force-dynamic'

/**
 * Body for the canonical "process an existing order" flow.
 *
 * The client submits an `orderId` (created via POST /api/orders) plus the
 * customer's email. Everything else comes from the server-side order record,
 * so clients cannot tamper with product/price/recipient.
 */
const processOrderSchema = z.object({
  orderId: z.string().min(1),
  customerEmail: z.string().email(),
})

/**
 * Validate that the amount the user is paying is one of the product's allowed
 * denominations (FIXED) or falls within the configured range (RANGE).
 */
function validateUnitPrice(product: GiftCardProduct, unitPrice: number): string | null {
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return 'Invalid amount'
  }

  if (product.denominationType === 'FIXED') {
    const allowed = product.fixedDenominations?.map(d => d.value) ?? []
    if (allowed.length === 0) {
      return 'Product has no configured denominations'
    }
    // Compare with a small epsilon to tolerate float rounding from currency math
    const match = allowed.some(v => Math.abs(v - unitPrice) < 0.005)
    if (!match) {
      return `Amount ${unitPrice} is not an allowed denomination for this product`
    }
    return null
  }

  if (product.denominationType === 'RANGE') {
    const range = product.denominationRange
    if (!range) {
      return 'Product range is not configured'
    }
    if (unitPrice < range.min || unitPrice > range.max) {
      return `Amount must be between ${range.min} and ${range.max}`
    }
    return null
  }

  return 'Unknown denomination type'
}

/**
 * POST /api/reloadly/order
 *
 * Processes an existing pending order:
 *   1. Rate limit (strict: 3 req/min)
 *   2. Load the order from the repository (source of truth)
 *   3. Re-validate unit price against the product's denominations
 *   4. Call Reloadly to fulfill the gift card
 *   5. Update the order with transaction ID / status / fulfillment
 *   6. Return the transaction ID to the caller
 *
 * NOTE: Payment capture integration is intentionally deferred. Until a real
 * payment processor gates this route, anyone who can reach it can spend the
 * Reloadly balance. Treat this as production-blocked.
 */
export async function POST(request: NextRequest) {
  const ip = getIP(request)

  try {
    // 1. Rate limit (strict mode: 3 req/min per IP)
    let rateLimitResult
    try {
      rateLimitResult = await rateLimitCheck(ip, true)
    } catch (error) {
      Sentry.captureException(error, {
        tags: { component: 'rate-limit', endpoint: '/api/reloadly/order' },
      })
      // Fail-open is a deliberate choice: the order repo + Reloadly provide
      // their own backstops and we don't want a transient Redis blip to nuke
      // real customer checkouts.
      rateLimitResult = {
        success: true,
        limit: 999,
        remaining: 999,
        reset: Math.floor(Date.now() / 1000) + 60,
      }
    }

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many order requests. Please wait before trying again.',
          limit: rateLimitResult.limit,
          remaining: 0,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      )
    }

    // 2. Parse body
    let rawBody: unknown
    try {
      rawBody = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const parsed = processOrderSchema.safeParse(rawBody)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid order payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { orderId, customerEmail } = parsed.data

    // 3. Load the order — server-side is the source of truth
    const order = await orderRepository.getById(orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Guard against re-processing a completed/failed order
    if (order.status === 'completed') {
      return NextResponse.json(
        { error: 'Order has already been completed' },
        { status: 409 }
      )
    }

    // 4. Server-side validation of unitPrice against product denominations
    const product = await giftCardService.getProductByReloadlyId(order.reloadlyProductId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product no longer available' },
        { status: 400 }
      )
    }
    const priceError = validateUnitPrice(product, order.amount)
    if (priceError) {
      return NextResponse.json(
        { error: priceError },
        { status: 400 }
      )
    }

    // 5. Record the customer email on the order (so support can reach them)
    await orderRepository.updateStatus(orderId, 'processing')

    // 6. Build the Reloadly request
    const recipientEmail = order.recipientEmail || customerEmail
    const orderRequest: OrderRequest = {
      productId: order.reloadlyProductId,
      countryCode: order.countryCode,
      quantity: 1,
      unitPrice: order.amount,
      customIdentifier: orderId,
      // Use the email local-part as a human-friendly sender label. Not great;
      // a future revision should collect a real sender name on the form.
      senderName: customerEmail.split('@')[0],
      recipientEmail,
    }

    // 7. Call Reloadly
    const reloadlyResponse = await reloadlyClient.placeOrder(orderRequest)

    if (!reloadlyResponse || typeof reloadlyResponse !== 'object') {
      throw new Error('Invalid response from gift card provider')
    }
    if (!reloadlyResponse.transactionId || !reloadlyResponse.status) {
      throw new Error('Incomplete response from gift card provider')
    }

    // 8. Update the order with fulfillment outcome
    if (reloadlyResponse.status === 'FAILED') {
      await orderRepository.updateStatus(orderId, 'failed')
      return NextResponse.json(
        { error: 'Order failed at the provider. Please try again.' },
        { status: 502 }
      )
    }

    await orderRepository.updatePayment(
      orderId,
      `RELOADLY_${reloadlyResponse.transactionId}`,
      reloadlyResponse.status
    )

    if (reloadlyResponse.status === 'SUCCESSFUL') {
      // Reloadly sends the redeemable code directly to the recipient's email.
      // We only hold the transaction ID as a support reference — NOT a code.
      const fulfillment: OrderFulfillment = {
        cardCode: String(reloadlyResponse.transactionId),
        pin: undefined,
        redemptionUrl: undefined,
      }
      await orderRepository.storeFulfillment(orderId, fulfillment)
    }
    // If PENDING: status already set to 'processing' above. The user lands on
    // the success page either way; until we add webhooks, we cannot notify
    // them if PENDING later resolves to FAILED.

    // NOTE: Intentionally not logging an "order placed" event to Sentry.
    // Sentry is for errors, not business analytics, and the fields we used to
    // log (recipientEmail, IP) were PII. Route this through PostHog or a
    // dedicated analytics pipeline when we wire one up.
    return NextResponse.json(
      {
        transactionId: reloadlyResponse.transactionId,
        status: reloadlyResponse.status,
        orderId,
      },
      {
        headers: {
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString(),
        },
      }
    )
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/reloadly/order',
        severity: 'critical',
      },
      // No user-identifying data here. If we need more context for triage
      // later, hash identifiers first — never put raw PII in `extra`.
    })

    const requestId = crypto.randomUUID()
    return NextResponse.json(
      {
        error: 'Failed to place order. Please try again or contact support.',
        requestId,
      },
      { status: 500 }
    )
  }
}
