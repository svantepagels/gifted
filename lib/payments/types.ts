export interface CheckoutSession {
  id: string
  url: string
  orderId: string
}

export interface PaymentWebhookData {
  orderId: string
  paymentId: string
  status: 'succeeded' | 'failed'
  amount: number
  currency: string
}
