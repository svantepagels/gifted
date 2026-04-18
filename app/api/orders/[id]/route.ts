import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { orderRepository } from '@/lib/orders/repository'
import { rateLimitCheck, getIP } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/orders/:id
 * Fetch an order by ID. Used by /checkout and /success pages to load state.
 *
 * Orders contain customer and recipient emails, so we keep this endpoint
 * simple but rate-limited. Future work: add a short-lived signed token tied
 * to the order ID to prevent enumeration.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const ip = getIP(request)

  try {
    const rateLimitResult = await rateLimitCheck(ip, false)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!params.id || typeof params.id !== 'string') {
      return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })
    }

    const order = await orderRepository.getById(params.id)
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: '/api/orders/:id', method: 'GET' },
    })
    return NextResponse.json(
      { error: 'Failed to fetch order', requestId: crypto.randomUUID() },
      { status: 500 }
    )
  }
}
