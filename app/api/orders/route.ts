import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { orderRepository } from '@/lib/orders/repository'
import { rateLimitCheck, getIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const createOrderSchema = z.object({
  productId: z.string().min(1),
  reloadlyProductId: z.number().int().positive(),
  productName: z.string().min(1),
  productLogoUrl: z.string().url().or(z.literal('')).optional().default(''),
  amount: z.number().positive(),
  currency: z.string().min(3).max(3),
  serviceFee: z.number().nonnegative(),
  deliveryMethod: z.enum(['self', 'gift']),
  customerEmail: z.string().optional().default(''),
  recipientEmail: z.string().email().optional(),
  giftMessage: z.string().max(500).optional(),
  countryCode: z.string().min(2).max(3),
})

/**
 * POST /api/orders
 * Create a new (pending) order and persist it to the repository.
 *
 * NOTE: This endpoint does NOT charge the customer and does NOT fulfill the
 * gift card. It only records the user's intent. Fulfillment happens after
 * payment capture via POST /api/reloadly/order.
 */
export async function POST(request: NextRequest) {
  const ip = getIP(request)

  try {
    const rateLimitResult = await rateLimitCheck(ip, false)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid order payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const order = await orderRepository.create(parsed.data)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: '/api/orders', method: 'POST' },
    })
    return NextResponse.json(
      { error: 'Failed to create order', requestId: crypto.randomUUID() },
      { status: 500 }
    )
  }
}
