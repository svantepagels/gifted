/**
 * Unit tests for the Order repository fallback + MemoryOrderRepository.
 *
 * These cover the fix shipped in ccfebfe:
 *   1. MemoryOrderRepository satisfies the full OrderRepository contract.
 *   2. buildRepository selects memory storage when Upstash envs are missing,
 *      and logs a warning in production.
 */

// We isolate each test by clearing module cache and resetting env vars.
describe('orders/repository', () => {
  const realEnv = { ...process.env }
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

  beforeEach(() => {
    jest.resetModules()
    warnSpy.mockClear()
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN
  })

  afterAll(() => {
    process.env = realEnv
    warnSpy.mockRestore()
  })

  const baseInput = {
    productId: 'p1',
    reloadlyProductId: 14932,
    productName: 'Amazon',
    productLogoUrl: 'https://example.com/a.png',
    amount: 25,
    currency: 'USD',
    serviceFee: 1.5,
    deliveryMethod: 'self' as const,
    customerEmail: 'a@b.com',
    countryCode: 'US',
  }

  it('falls back to in-memory repo in production when Upstash envs are missing, with warning', () => {
    const originalNodeEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true })
    try {
      // Import lazily so the factory runs with the env we just set
      const mod = require('../repository')
      expect(mod.orderRepository).toBeDefined()
      expect(warnSpy).toHaveBeenCalledTimes(1)
      expect(warnSpy.mock.calls[0][0]).toMatch(/UPSTASH_REDIS_REST_URL/)
      expect(warnSpy.mock.calls[0][0]).toMatch(/Falling back to in-memory/)
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true })
    }
  })

  it('falls back to in-memory repo silently in non-production', () => {
    const originalNodeEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true })
    try {
      const mod = require('../repository')
      expect(mod.orderRepository).toBeDefined()
      expect(warnSpy).not.toHaveBeenCalled()
    } finally {
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalNodeEnv, configurable: true })
    }
  })

  it('MemoryOrderRepository: create returns an Order with ORD- UUID prefix', async () => {
    const { orderRepository } = require('../repository')
    const order = await orderRepository.create(baseInput)
    expect(order.id).toMatch(/^ORD-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    expect(order.status).toBe('pending')
    expect(order.total).toBe(26.5)
    expect(order.amount).toBe(25)
    expect(order.serviceFee).toBe(1.5)
  })

  it('MemoryOrderRepository: getById returns saved order, null for unknown id', async () => {
    const { orderRepository } = require('../repository')
    const created = await orderRepository.create(baseInput)
    const fetched = await orderRepository.getById(created.id)
    expect(fetched).not.toBeNull()
    expect(fetched!.id).toBe(created.id)
    expect(fetched!.productName).toBe('Amazon')

    const missing = await orderRepository.getById('ORD-does-not-exist')
    expect(missing).toBeNull()
  })

  it('MemoryOrderRepository: updateStatus moves the order to the new status', async () => {
    const { orderRepository } = require('../repository')
    const created = await orderRepository.create(baseInput)
    const updated = await orderRepository.updateStatus(created.id, 'completed')
    expect(updated).not.toBeNull()
    expect(updated!.status).toBe('completed')
    expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(created.createdAt.getTime())
  })

  it('MemoryOrderRepository: updatePayment stores payment id + status', async () => {
    const { orderRepository } = require('../repository')
    const created = await orderRepository.create(baseInput)
    const updated = await orderRepository.updatePayment(created.id, 'pay_123', 'paid')
    expect(updated).not.toBeNull()
    expect(updated!.paymentId).toBe('pay_123')
    expect(updated!.paymentStatus).toBe('paid')
  })

  it('MemoryOrderRepository: storeFulfillment marks order completed', async () => {
    const { orderRepository } = require('../repository')
    const created = await orderRepository.create(baseInput)
    const fulfilled = await orderRepository.storeFulfillment(created.id, {
      code: 'GC-XYZ',
      pin: '1234',
      expiresAt: new Date('2027-01-01').toISOString(),
    } as any)
    expect(fulfilled).not.toBeNull()
    expect(fulfilled!.status).toBe('completed')
    expect(fulfilled!.fulfillment).toBeDefined()
  })

  it('MemoryOrderRepository: update ops return null for unknown id', async () => {
    const { orderRepository } = require('../repository')
    expect(await orderRepository.updateStatus('missing', 'completed')).toBeNull()
    expect(await orderRepository.updatePayment('missing', 'p', 'paid')).toBeNull()
    expect(await orderRepository.storeFulfillment('missing', { code: 'x' } as any)).toBeNull()
  })
})
