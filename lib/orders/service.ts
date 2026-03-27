/**
 * Order Service
 * 
 * Business logic layer for order management.
 * Wraps the mock repository and provides a clean interface for the UI.
 */

import { orderRepository } from './mock-repository'
import { Order, CreateOrderInput, OrderStatus } from './types'

class OrderService {
  /**
   * Create a new order
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    return await orderRepository.create(input)
  }
  
  /**
   * Get an order by ID
   */
  async getOrder(id: string): Promise<Order | null> {
    return await orderRepository.getById(id)
  }
  
  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    return await orderRepository.updateStatus(id, status)
  }
  
  /**
   * Update payment status for an order
   * 
   * TODO: When integrating Lemon Squeezy:
   * - This should only be called from webhook handlers (server-side)
   * - Never trust client-side payment status
   * - Verify payment via Lemon Squeezy API before updating
   */
  async updatePaymentStatus(
    id: string,
    paymentId: string,
    paymentStatus: string
  ): Promise<Order | null> {
    const order = await orderRepository.updatePayment(id, paymentId, paymentStatus)
    
    // If payment is completed, trigger fulfillment
    if (paymentStatus === 'completed' && order) {
      // TODO: Trigger Reloadly gift card purchase here
      // await this.fulfillOrder(order)
    }
    
    return order
  }
  
  /**
   * Calculate service fee for an order
   * 
   * TODO: Make this configurable or fetch from backend
   */
  calculateServiceFee(amount: number): number {
    // 3.5% service fee
    return Math.round(amount * 0.035 * 100) / 100
  }
  
  /**
   * Fulfill an order by purchasing the gift card from Reloadly
   * 
   * TODO: Implement Reloadly purchase integration:
   * 1. Call Reloadly POST /orders endpoint
   * 2. Store gift card code in order.fulfillment
   * 3. Send delivery email with gift card details
   * 4. Update order status to 'completed'
   */
  private async fulfillOrder(order: Order): Promise<void> {
    console.log('TODO: Fulfill order', order.id)
    
    // MOCK: Simulate fulfillment delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // MOCK: Store fake fulfillment data
    await orderRepository.storeFulfillment(order.id, {
      cardCode: '1234-5678-9012-3456',
      pin: '1234',
      expiryDate: '2027-12-31',
      redemptionUrl: 'https://example.com/redeem',
    })
  }
}

export const orderService = new OrderService()
