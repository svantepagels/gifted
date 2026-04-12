import { Order, OrderStatus, CreateOrderInput, OrderFulfillment } from './types'

// TODO: Replace with database (Prisma + PostgreSQL/Supabase)
// See INTEGRATION-SWAP-GUIDE.md for Prisma schema

class OrderRepository {
  private orders: Map<string, Order> = new Map()
  
  async create(input: CreateOrderInput): Promise<Order> {
    const order: Order = {
      id: this.generateOrderId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending',
      productId: input.productId,
      reloadlyProductId: input.reloadlyProductId, // Numeric Reloadly API product ID
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
    
    this.orders.set(order.id, order)
    return order
  }
  
  async getById(id: string): Promise<Order | null> {
    return this.orders.get(id) || null
  }
  
  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = this.orders.get(id)
    if (!order) return null
    
    order.status = status
    order.updatedAt = new Date()
    this.orders.set(id, order)
    return order
  }
  
  async updatePayment(
    id: string,
    paymentId: string,
    paymentStatus: string
  ): Promise<Order | null> {
    const order = this.orders.get(id)
    if (!order) return null
    
    order.paymentId = paymentId
    order.paymentStatus = paymentStatus
    order.updatedAt = new Date()
    this.orders.set(id, order)
    return order
  }
  
  async storeFulfillment(
    id: string,
    fulfillment: OrderFulfillment
  ): Promise<Order | null> {
    const order = this.orders.get(id)
    if (!order) return null
    
    order.fulfillment = fulfillment
    order.status = 'completed'
    order.updatedAt = new Date()
    this.orders.set(id, order)
    return order
  }
  
  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }
}

export const orderRepository = new OrderRepository()
