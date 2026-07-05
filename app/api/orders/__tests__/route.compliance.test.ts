/**
 * Layer-3 fail-fast tests: POST /api/orders must refuse to even record
 * intent for an open-loop / stored-value product (hand-crafted request).
 * See lib/giftcards/compliance.ts for the rationale.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { NextRequest } from 'next/server'

const mockCreate = jest.fn<any>()

jest.mock('@/lib/orders/repository', () => ({
  orderRepository: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}))

jest.mock('@/lib/rate-limit', () => ({
  rateLimitCheck: async () => ({
    success: true,
    limit: 10,
    remaining: 9,
    reset: Math.floor(Date.now() / 1000) + 60,
  }),
  getIP: () => '127.0.0.1',
}))

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}))

import { POST } from '../route'

function makeRequest(productName: string) {
  return new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      productId: 'reloadly-101',
      reloadlyProductId: 101,
      productName,
      amount: 25,
      currency: 'USD',
      serviceFee: 0,
      deliveryMethod: 'self',
      countryCode: 'US',
    }),
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/orders — open-loop products cannot be ordered', () => {
  it.each([
    'Visa Prepaid Card',
    'Mastercard Prepaid USD',
    'American Express Gift Card',
    'Binance Gift Card',
    'Crypto Voucher',
  ])('403s and never persists an order for %p', async (productName) => {
    const res = await POST(makeRequest(productName))

    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('This product cannot be ordered')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('control: a closed-loop product still creates an order (201)', async () => {
    mockCreate.mockImplementation(async (data: any) => ({
      id: 'order-1',
      status: 'pending',
      ...data,
    }))

    const res = await POST(makeRequest('Amazon US'))

    expect(res.status).toBe(201)
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
