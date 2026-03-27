import { CheckoutSession } from './types'
import { orderRepository } from '@/lib/orders/mock-repository'

// TODO: Replace with Lemon Squeezy checkout
// See INTEGRATION-SWAP-GUIDE.md for Lemon Squeezy implementation

export class MockCheckoutService {
  async createCheckoutSession(orderId: string): Promise<CheckoutSession> {
    // In production, this would create a Lemon Squeezy checkout session
    // and return the hosted checkout URL
    
    return {
      id: `mock_session_${Date.now()}`,
      url: `/checkout?orderId=${orderId}`, // Mock URL
      orderId,
    }
  }
  
  async processPayment(orderId: string): Promise<{
    success: boolean
    paymentId?: string
    error?: string
  }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05
    
    if (success) {
      const paymentId = `mock_payment_${Date.now()}`
      
      // Update order with payment info
      await orderRepository.updatePayment(orderId, paymentId, 'succeeded')
      await orderRepository.updateStatus(orderId, 'processing')
      
      // Simulate gift card fulfillment
      const fulfillment = {
        cardCode: this.generateMockCode(),
        pin: this.generateMockPin(),
        redemptionUrl: 'https://example.com/redeem',
      }
      
      await orderRepository.storeFulfillment(orderId, fulfillment)
      
      return { success: true, paymentId }
    } else {
      await orderRepository.updateStatus(orderId, 'failed')
      return { success: false, error: 'Payment declined by processor' }
    }
  }
  
  private generateMockCode(): string {
    return Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 10)
    ).join('')
  }
  
  private generateMockPin(): string {
    return Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 10)
    ).join('')
  }
}

export const mockCheckoutService = new MockCheckoutService()
