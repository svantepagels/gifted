export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type DeliveryMethod = 'self' | 'gift'

export interface OrderFulfillment {
  cardCode: string
  pin?: string
  expiryDate?: string
  redemptionUrl?: string
}

export interface Order {
  id: string
  createdAt: Date
  updatedAt: Date
  status: OrderStatus
  
  // Product info
  productId: string
  reloadlyProductId: number // Numeric Reloadly API product ID
  productName: string
  productLogoUrl: string
  
  // Purchase details
  amount: number
  currency: string
  serviceFee: number
  total: number
  
  // Delivery
  deliveryMethod: DeliveryMethod
  customerEmail: string
  recipientEmail?: string
  giftMessage?: string
  
  // Payment
  paymentId?: string
  paymentStatus?: string
  
  // Fulfillment
  fulfillment?: OrderFulfillment
  
  // Metadata
  countryCode: string
  ipAddress?: string
}

export interface CreateOrderInput {
  productId: string
  reloadlyProductId: number // Required for Reloadly API integration
  productName: string
  productLogoUrl: string
  amount: number
  currency: string
  serviceFee: number
  deliveryMethod: DeliveryMethod
  customerEmail: string
  recipientEmail?: string
  giftMessage?: string
  countryCode: string
}
