'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { orderRepository } from '@/lib/orders/mock-repository'
import { browserOrderStorage } from '@/lib/orders/browser-storage'
import { reloadlyCheckoutService } from '@/lib/payments/reloadly-checkout'
import { Order } from '@/lib/orders/types'
import { formatCurrency } from '@/lib/utils/currency'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        console.warn('[Checkout] No orderId provided')
        router.push('/')
        return
      }
      
      try {
        // Try loading from browser storage first (faster, more reliable)
        let orderData = browserOrderStorage.load()
        console.log('[Checkout] Loaded from browser storage:', orderData?.id)
        
        // Validate order ID matches the URL parameter
        if (orderData && orderData.id !== orderId) {
          console.warn('[Checkout] Order ID mismatch, fetching from repository')
          orderData = null
        }
        
        // Fallback to repository if not in browser storage
        if (!orderData) {
          console.log('[Checkout] Falling back to repository')
          orderData = await orderRepository.getById(orderId)
        }
        
        if (!orderData) {
          console.error('[Checkout] Order not found:', orderId)
          router.push('/')
          return
        }
        
        // Validate order has reloadlyProductId
        if (!orderData.reloadlyProductId) {
          console.error('[Checkout] Order missing reloadlyProductId:', orderId)
          alert('Product configuration error. Please try selecting the product again.')
          router.push('/')
          return
        }
        
        console.log('[Checkout] Order loaded successfully:', orderData.id, 'reloadlyProductId:', orderData.reloadlyProductId)
        setOrder(orderData)
      } catch (error) {
        console.error('[Checkout] Failed to load order:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadOrder()
  }, [orderId, router])
  
  const handleSubmit = async (email: string) => {
    if (!order) return
    
    // Process order with Reloadly
    const result = await reloadlyCheckoutService.processOrder(order.id, email)
    
    if (result.success) {
      // Clear browser storage on successful checkout
      browserOrderStorage.clear()
      console.log('[Checkout] Order processed successfully, cleared browser storage')
      
      // Redirect to success page
      router.push(`/success?orderId=${order.id}`)
    } else {
      throw new Error(result.error || 'Order processing failed')
    }
  }
  
  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-body-lg text-surface-on-surface-variant">Loading...</p>
          </div>
        </main>
      </>
    )
  }
  
  if (!order) {
    return null
  }
  
  return (
    <>
      <Header />
      <main className="min-h-screen pb-8 md:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Link
              href={`/gift-card/${order.productId}`}
              className="inline-flex items-center gap-2 text-body-md text-surface-on-surface-variant hover:text-surface-on-surface transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Product
            </Link>
            
            <h1 className="font-archivo-black text-[2.25rem] leading-[1.2] tracking-[-0.02em] text-surface-on-surface mb-8 uppercase">
              CHECKOUT
            </h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Review */}
              <div className="bg-surface-container-lowest rounded-lg p-6">
                <h2 className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
                  ORDER REVIEW
                </h2>
                
                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-outline-variant">
                  <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="text-headline-md font-archivo text-surface-on-surface-variant">
                      {order.productName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-archivo text-title-md text-surface-on-surface mb-1">
                      {order.productName}
                    </h3>
                    <p className="text-body-md text-surface-on-surface-variant">
                      {formatCurrency(order.amount, order.currency)}
                    </p>
                  </div>
                </div>
                
                {order.deliveryMethod === 'gift' && order.recipientEmail && (
                  <div className="mb-6 pb-6 border-b border-outline-variant">
                    <h4 className="text-label-md text-surface-on-surface-variant mb-2">
                      Gift Recipient
                    </h4>
                    <p className="text-body-md text-surface-on-surface mb-2">
                      {order.recipientEmail}
                    </p>
                    {order.giftMessage && (
                      <div className="mt-3 p-3 bg-surface-container rounded-md">
                        <p className="text-label-md text-surface-on-surface-variant mb-1">
                          Your message:
                        </p>
                        <p className="text-body-md text-surface-on-surface italic">
                          "{order.giftMessage}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="space-y-2 text-body-md">
                  <div className="flex justify-between">
                    <span className="text-surface-on-surface-variant">Amount</span>
                    <span className="text-surface-on-surface">
                      {formatCurrency(order.amount, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-on-surface-variant">Service Fee</span>
                    <span className="text-surface-on-surface">
                      {formatCurrency(order.serviceFee, order.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-outline-variant font-medium text-title-md">
                    <span className="text-surface-on-surface">Total</span>
                    <span className="text-surface-on-surface">
                      {formatCurrency(order.total, order.currency)}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-secondary/5 rounded-md flex items-start gap-2">
                  <Shield className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-label-md text-surface-on-surface">
                    Your payment is secured with bank-level encryption
                  </p>
                </div>
              </div>
              
              {/* Checkout Form */}
              <div>
                <CheckoutForm 
                  onSubmit={handleSubmit}
                  isGift={order.deliveryMethod === 'gift'}
                  recipientEmail={order.recipientEmail}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-body-lg text-surface-on-surface-variant">Loading...</p>
          </div>
        </main>
      </>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
