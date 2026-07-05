/**
 * Layer-3 tests (fulfillment boundary): POST /api/reloadly/order must
 * refuse to fulfill an open-loop / stored-value product even for a
 * hand-crafted request, and must never reach reloadlyClient.placeOrder
 * for such products. See lib/giftcards/compliance.ts for the rationale.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'

const mockPlaceOrder = jest.fn<any>()
const mockGetById = jest.fn<any>()
const mockUpdateStatus = jest.fn<any>()
const mockUpdatePayment = jest.fn<any>()
const mockStoreFulfillment = jest.fn<any>()
const mockGetProductByReloadlyId = jest.fn<any>()

jest.mock('@/lib/reloadly/client', () => ({
  reloadlyClient: {
    placeOrder: (...args: unknown[]) => mockPlaceOrder(...args),
  },
}))

jest.mock('@/lib/orders/repository', () => ({
  orderRepository: {
    getById: (...args: unknown[]) => mockGetById(...args),
    updateStatus: (...args: unknown[]) => mockUpdateStatus(...args),
    updatePayment: (...args: unknown[]) => mockUpdatePayment(...args),
    storeFulfillment: (...args: unknown[]) => mockStoreFulfillment(...args),
  },
}))

jest.mock('@/lib/giftcards/service', () => ({
  giftCardService: {
    getProductByReloadlyId: (...args: unknown[]) =>
      mockGetProductByReloadlyId(...args),
  },
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimitCheck: async () => ({
    success: true,
    limit: 3,
    remaining: 2,
    reset: Math.floor(Date.now() / 1000) + 60,
  }),
  getIP: () => '127.0.0.1',
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

// Import AFTER the mocks — the real Reloadly client throws at load time
// without credentials.
import { POST } from '../route'

const ORDER_ID = 'order-123'

function makeOrder(reloadlyProductId: number) {
  return {
    id: ORDER_ID,
    status: 'pending',
    reloadlyProductId,
    amount: 25,
    countryCode: 'US',
    recipientEmail: 'friend@example.com',
  }
}

function makeProduct(brandName: string) {
  return {
    id: 'reloadly-101',
    slug: `${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-us-101`,
    brandName,
    denominationType: 'FIXED',
    fixedDenominations: [
      { value: 10, label: '$10' },
      { value: 25, label: '$25' },
    ],
    currency: 'USD',
    _meta: { reloadlyProductId: 101 },
  }
}

function makeRequest() {
  return new NextRequest('http://localhost/api/reloadly/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      orderId: ORDER_ID,
      customerEmail: 'buyer@example.com',
    }),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/reloadly/order — open-loop products cannot be ordered', () => {
  it('403s and never calls placeOrder when the resolved product is open-loop', async () => {
    mockGetById.mockResolvedValue(makeOrder(101))
    mockGetProductByReloadlyId.mockResolvedValue(makeProduct('Visa Prepaid'))

    const res = await POST(makeRequest())

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('This product cannot be ordered')
    expect(mockPlaceOrder).not.toHaveBeenCalled()
    expect(mockUpdateStatus).toHaveBeenCalledWith(ORDER_ID, 'failed')
  })

  it('403s for a crypto stored-value product too', async () => {
    mockGetById.mockResolvedValue(makeOrder(102))
    mockGetProductByReloadlyId.mockResolvedValue(makeProduct('Crypto Voucher'))

    const res = await POST(makeRequest())

    expect(res.status).toBe(403)
    expect(mockPlaceOrder).not.toHaveBeenCalled()
  })

  it('400s when the product is filtered out of the catalog (Layer 1 already removed it)', async () => {
    mockGetById.mockResolvedValue(makeOrder(101))
    // Layer 1 filtering means getProductByReloadlyId returns null for
    // open-loop products — the route must reject, not fulfill.
    mockGetProductByReloadlyId.mockResolvedValue(null)

    const res = await POST(makeRequest())

    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Product no longer available')
    expect(mockPlaceOrder).not.toHaveBeenCalled()
  })

  it('control: a closed-loop product still fulfills normally', async () => {
    mockGetById.mockResolvedValue(makeOrder(103))
    mockGetProductByReloadlyId.mockResolvedValue(makeProduct('Amazon'))
    mockPlaceOrder.mockResolvedValue({
      transactionId: 987,
      status: 'SUCCESSFUL',
    })

    const res = await POST(makeRequest())

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.transactionId).toBe(987)
    expect(mockPlaceOrder).toHaveBeenCalledTimes(1)
  })
})
