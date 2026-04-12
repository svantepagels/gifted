import { orderRepository } from '@/lib/orders/mock-repository'
import { OrderFulfillment } from '@/lib/orders/types'
import type { OrderRequest, OrderResponse } from '@/lib/reloadly/types'
import { safeJsonParse } from '@/lib/utils/safe-json'

/**
 * Real Reloadly checkout service
 * 
 * Replaces mock checkout with actual Reloadly order API integration.
 * 
 * IMPORTANT: Gift card codes are NOT returned in the API response.
 * Reloadly sends codes via email to the recipientEmail address within 30s-5min.
 * 
 * We store transaction IDs for order tracking and customer support.
 */
export class ReloadlyCheckoutService {
  /**
   * Process order by calling Reloadly order API
   * 
   * Flow:
   * 1. Validate inputs (email format, product ID)
   * 2. Get order from repository
   * 3. Map order to Reloadly OrderRequest
   * 4. Call /api/reloadly/order endpoint
   * 5. Handle response status (SUCCESSFUL, PENDING, FAILED)
   * 6. Store transaction ID and fulfillment data
   * 7. Update order status
   * 
   * @param orderId - Internal order ID
   * @param customerEmail - Customer's email for the order
   * @returns Success/error result with transaction ID
   */
  async processOrder(
    orderId: string,
    customerEmail: string
  ): Promise<{
    success: boolean
    transactionId?: number
    error?: string
  }> {
    try {
      // 1. Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEmail)) {
        return { 
          success: false, 
          error: 'Please enter a valid email address' 
        }
      }

      // 2. Get order from repository
      const order = await orderRepository.getById(orderId)
      if (!order) {
        return { success: false, error: 'Order not found' }
      }

      // 3. Update order with customer email
      order.customerEmail = customerEmail
      
      // 4. Get numeric Reloadly product ID (already a number, no conversion needed)
      const productId = order.reloadlyProductId
      if (!productId || typeof productId !== 'number') {
        console.error('[ReloadlyCheckout] Invalid reloadlyProductId:', order.reloadlyProductId)
        return { 
          success: false, 
          error: 'Product configuration error. Please try again or contact support.' 
        }
      }
      
      console.log('[ReloadlyCheckout] Processing order with productId:', productId)

      // 5. Map order to Reloadly OrderRequest
      const orderRequest: OrderRequest = {
        productId, // Reloadly expects number, not string
        countryCode: order.countryCode,
        quantity: 1,
        unitPrice: order.amount,
        customIdentifier: orderId,
        senderName: customerEmail.split('@')[0], // Use email prefix as sender name
        recipientEmail: order.recipientEmail || customerEmail,
      }

      // 6. Call Reloadly order API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      let response: Response
      try {
        response = await fetch('/api/reloadly/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderRequest),
          signal: controller.signal,
        })
      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection and try again.')
        }
        
        throw new Error('Network error. Please check your connection and try again.')
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.ok) {
        // Enhanced error messages based on HTTP status
        let errorData: any
        let errorMessage: string
        
        try {
          // Try to parse error response as JSON
          errorData = await safeJsonParse<any>(response, 'checkout-error')
        } catch {
          // Fallback to text if not JSON
          const text = await response.text()
          errorData = { error: text || `HTTP ${response.status}` }
        }
        
        switch (response.status) {
          case 400:
            errorMessage = errorData.error || 'Invalid order details. Please check the product and amount.'
            break
          case 401:
            errorMessage = 'Authentication failed. Please try again or contact support.'
            break
          case 403:
            errorMessage = 'This product is currently unavailable. Please choose another.'
            break
          case 429:
            errorMessage = errorData.error || 'Too many orders. Please wait a minute and try again.'
            break
          case 500:
          case 503:
            errorMessage = 'Service temporarily unavailable. Please try again in a moment.'
            break
          default:
            errorMessage = errorData.error || `Order failed (Error ${response.status})`
        }
        
        console.error('[ReloadlyCheckout] API error:', {
          status: response.status,
          errorData,
          errorMessage,
        })
        
        throw new Error(errorMessage)
      }

      // Parse success response with validation
      let orderResponse: OrderResponse
      try {
        orderResponse = await safeJsonParse<OrderResponse>(response, 'checkout-success')
      } catch (parseError) {
        console.error('[ReloadlyCheckout] Failed to parse order response:', parseError)
        throw new Error('Invalid response from payment processor. Please try again or contact support.')
      }

      // 7. Handle FAILED status
      if (orderResponse.status === 'FAILED') {
        await orderRepository.updateStatus(orderId, 'failed')
        return {
          success: false,
          error: 'Order failed at the provider. Please try again or contact support.',
        }
      }

      // 8. Handle PENDING status
      // Some orders may take 1-5 minutes to process
      // Codes will still be sent via email once processing completes
      if (orderResponse.status === 'PENDING') {
        await orderRepository.updateStatus(orderId, 'processing')
        await orderRepository.updatePayment(
          orderId,
          `RELOADLY_${orderResponse.transactionId}`,
          'PENDING'
        )
        
        // Mark as successful checkout (user will see success page)
        // Email will arrive once Reloadly finishes processing
        return {
          success: true,
          transactionId: orderResponse.transactionId,
        }
      }

      // 9. Handle SUCCESSFUL status
      // Extract fulfillment data from Reloadly response
      // NOTE: Actual gift card codes are sent via email by Reloadly
      // The API response contains transaction details but NOT the codes
      // This is a security best practice - codes never pass through our system
      const fulfillment: OrderFulfillment = {
        cardCode: `Transaction ID: ${orderResponse.transactionId}`,
        pin: undefined, // Codes sent via email by Reloadly
        redemptionUrl: undefined, // Included in Reloadly's email
      }

      // 10. Store transaction ID as payment reference
      await orderRepository.updatePayment(
        orderId,
        `RELOADLY_${orderResponse.transactionId}`,
        orderResponse.status
      )

      // 11. Store fulfillment data and mark order complete
      await orderRepository.storeFulfillment(orderId, fulfillment)

      return {
        success: true,
        transactionId: orderResponse.transactionId,
      }
    } catch (error) {
      console.error('Reloadly checkout error:', error)
      
      // Mark order as failed in repository
      await orderRepository.updateStatus(orderId, 'failed')
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred. Please try again.',
      }
    }
  }
}

// Export singleton instance
export const reloadlyCheckoutService = new ReloadlyCheckoutService()
