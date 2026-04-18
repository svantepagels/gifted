import { Redis } from '@upstash/redis'
import { Order, OrderStatus, CreateOrderInput, OrderFulfillment } from './types'

/**
 * OrderRepository — the interface the app depends on.
 *
 * Two implementations exist:
 *   • RedisOrderRepository — production, backed by Upstash Redis
 *   • MemoryOrderRepository — fallback for local dev when Redis is not configured
 *
 * Selection is automatic at module load based on env vars.
 */
export interface OrderRepository {
  create(input: CreateOrderInput): Promise<Order>
  getById(id: string): Promise<Order | null>
  updateStatus(id: string, status: OrderStatus): Promise<Order | null>
  updatePayment(id: string, paymentId: string, paymentStatus: string): Promise<Order | null>
  storeFulfillment(id: string, fulfillment: OrderFulfillment): Promise<Order | null>
}

const ORDER_KEY_PREFIX = 'order:'
// Orders are short-lived — checkout flows complete in minutes. Keep records for 7 days
// so support can look up recent issues, then let them expire.
const ORDER_TTL_SECONDS = 60 * 60 * 24 * 7

function generateOrderId(): string {
  // crypto.randomUUID is available in Node 19+ and modern runtimes
  const uuid = crypto.randomUUID()
  // Keep the ORD- prefix for readability in support tickets; include the full uuid
  return `ORD-${uuid}`
}

function buildOrder(input: CreateOrderInput): Order {
  return {
    id: generateOrderId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'pending',
    productId: input.productId,
    reloadlyProductId: input.reloadlyProductId,
    productName: input.productName,
    productLogoUrl: input.productLogoUrl,
    amount: input.amount,
    currency: input.currency,
    serviceFee: input.serviceFee,
    total: input.amount + input.serviceFee,
    deliveryMethod: input.deliveryMethod,
    customerEmail: input.customerEmail,
    recipientEmail: input.recipientEmail,
    giftMessage: input.giftMessage,
    countryCode: input.countryCode,
  }
}

/**
 * Serialize dates to ISO strings for Redis storage.
 * Upstash Redis returns JSON values as already-parsed objects, so we must
 * revive dates on read.
 */
type SerializedOrder = Omit<Order, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

function serialize(order: Order): SerializedOrder {
  return {
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }
}

function deserialize(raw: unknown): Order | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as SerializedOrder
  if (!o.id) return null
  return {
    ...o,
    createdAt: new Date(o.createdAt),
    updatedAt: new Date(o.updatedAt),
  }
}

class RedisOrderRepository implements OrderRepository {
  constructor(private redis: Redis) {}

  private key(id: string): string {
    return `${ORDER_KEY_PREFIX}${id}`
  }

  async create(input: CreateOrderInput): Promise<Order> {
    const order = buildOrder(input)
    await this.redis.set(this.key(order.id), serialize(order), { ex: ORDER_TTL_SECONDS })
    return order
  }

  async getById(id: string): Promise<Order | null> {
    const raw = await this.redis.get(this.key(id))
    return deserialize(raw)
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.getById(id)
    if (!order) return null
    order.status = status
    order.updatedAt = new Date()
    await this.redis.set(this.key(id), serialize(order), { ex: ORDER_TTL_SECONDS })
    return order
  }

  async updatePayment(id: string, paymentId: string, paymentStatus: string): Promise<Order | null> {
    const order = await this.getById(id)
    if (!order) return null
    order.paymentId = paymentId
    order.paymentStatus = paymentStatus
    order.updatedAt = new Date()
    await this.redis.set(this.key(id), serialize(order), { ex: ORDER_TTL_SECONDS })
    return order
  }

  async storeFulfillment(id: string, fulfillment: OrderFulfillment): Promise<Order | null> {
    const order = await this.getById(id)
    if (!order) return null
    order.fulfillment = fulfillment
    order.status = 'completed'
    order.updatedAt = new Date()
    await this.redis.set(this.key(id), serialize(order), { ex: ORDER_TTL_SECONDS })
    return order
  }
}

/**
 * Development-only fallback. Not safe in serverless production because each
 * worker instance has its own Map.
 */
class MemoryOrderRepository implements OrderRepository {
  private orders = new Map<string, Order>()

  async create(input: CreateOrderInput): Promise<Order> {
    const order = buildOrder(input)
    this.orders.set(order.id, order)
    return order
  }

  async getById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = this.orders.get(id)
    if (!order) return null
    order.status = status
    order.updatedAt = new Date()
    return order
  }

  async updatePayment(id: string, paymentId: string, paymentStatus: string): Promise<Order | null> {
    const order = this.orders.get(id)
    if (!order) return null
    order.paymentId = paymentId
    order.paymentStatus = paymentStatus
    order.updatedAt = new Date()
    return order
  }

  async storeFulfillment(id: string, fulfillment: OrderFulfillment): Promise<Order | null> {
    const order = this.orders.get(id)
    if (!order) return null
    order.fulfillment = fulfillment
    order.status = 'completed'
    order.updatedAt = new Date()
    return order
  }
}

function buildRepository(): OrderRepository {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    return new RedisOrderRepository(new Redis({ url, token }))
  }

  if (process.env.NODE_ENV === 'production') {
    // TODO(svante): Create an Upstash Redis database and add these to Vercel:
    //   https://vercel.com/svantepagels/gifted-project/settings/environment-variables
    //   UPSTASH_REDIS_REST_URL
    //   UPSTASH_REDIS_REST_TOKEN
    // Until then we fall back to an in-memory repo so the checkout flow isn't
    // hard-broken. This is NOT safe long term in serverless: each function
    // instance has its own Map, so an order created on instance A may not be
    // readable from instance B. Checkouts that complete within one warm
    // instance's lifetime will work; others will see "order not found".
    console.warn(
      '[OrderRepository] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. ' +
        'Falling back to in-memory storage — orders will not survive cold starts or cross instances. ' +
        'Configure Upstash in Vercel to fix properly.'
    )
    return new MemoryOrderRepository()
  }

  // Local dev fallback
  return new MemoryOrderRepository()
}

export const orderRepository: OrderRepository = buildRepository()
