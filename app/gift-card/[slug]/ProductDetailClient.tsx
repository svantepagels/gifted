'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ProductHero } from '@/components/product/ProductHero'
import { AmountSelector } from '@/components/product/AmountSelector'
import { DeliveryMethodToggle } from '@/components/product/DeliveryMethodToggle'
import { GiftDetailsForm } from '@/components/product/GiftDetailsForm'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { useApp } from '@/contexts/AppContext'
import { DeliveryMethod } from '@/lib/orders/types'
import { createOrder } from '@/lib/orders/api'
import { browserOrderStorage } from '@/lib/orders/browser-storage'
import { calculateServiceFee, formatCurrency } from '@/lib/utils/currency'
import { ArrowRight, Loader2 } from 'lucide-react'

interface ProductDetailClientProps {
  product: GiftCardProduct
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter()
  const { selectedCountry, setCartProduct, setCartAmount, setCartDeliveryMethod, setCartGiftDetails } = useApp()
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('self')
  const [recipientEmail, setRecipientEmail] = useState<string>()
  const [giftMessage, setGiftMessage] = useState<string>()
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  
  // Set cart product when component mounts
  useState(() => {
    setCartProduct(product)
  })
  
  const handleAmountChange = (amount: number) => {
    setSelectedAmount(amount)
    setCartAmount(amount)
  }
  
  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method)
    setCartDeliveryMethod(method)
  }
  
  const handleGiftDetailsChange = (data: { recipientEmail?: string; giftMessage?: string }) => {
    setRecipientEmail(data.recipientEmail)
    setGiftMessage(data.giftMessage)
    setCartGiftDetails(data.recipientEmail, data.giftMessage)
  }
  
  const handleContinue = async () => {
    if (!product || !selectedAmount || isCreatingOrder) return
    
    // Validate gift details if sending as gift
    if (deliveryMethod === 'gift' && !recipientEmail) {
      alert('Please enter recipient email address')
      return
    }
    
    // Extract numeric Reloadly product ID from product metadata
    const reloadlyProductId = product._meta?.reloadlyProductId
    if (!reloadlyProductId) {
      console.error('[ProductDetail] Missing reloadlyProductId for product:', product.id)
      alert('Product configuration error. Please try another product.')
      return
    }
    
    // Create order server-side
    setIsCreatingOrder(true)
    try {
      const order = await createOrder({
        productId: product.id,
        reloadlyProductId, // Numeric Reloadly product ID
        productName: product.brandName,
        productLogoUrl: product.logoUrl,
        amount: selectedAmount,
        currency: selectedCountry.currency,
        serviceFee: calculateServiceFee(selectedAmount),
        deliveryMethod,
        customerEmail: '', // Will be set at checkout
        recipientEmail: deliveryMethod === 'gift' ? recipientEmail : undefined,
        giftMessage: deliveryMethod === 'gift' ? giftMessage : undefined,
        countryCode: selectedCountry.code,
      })

      // Optimistic client-side cache so /checkout can render instantly.
      // The server remains the source of truth.
      browserOrderStorage.save(order)

      router.push(`/checkout?orderId=${order.id}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create order. Please try again.')
      setIsCreatingOrder(false)
    }
  }
  
  const totalAmount = selectedAmount ? selectedAmount + calculateServiceFee(selectedAmount) : null
  const canContinue = product && selectedAmount && (deliveryMethod === 'self' || recipientEmail) && !isCreatingOrder
  
  return (
    <>
      <Header />
      <main className="min-h-screen pb-32 md:pb-8 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ProductHero product={product} countryName={selectedCountry.name} />
            
            <div className="bg-surface-container-lowest rounded-lg p-6 space-y-6">
              <AmountSelector
                product={product}
                currency={selectedCountry.currency}
                selectedAmount={selectedAmount}
                onAmountChange={handleAmountChange}
              />
              
              <DeliveryMethodToggle
                value={deliveryMethod}
                onChange={handleDeliveryMethodChange}
              />
              
              {deliveryMethod === 'gift' && (
                <GiftDetailsForm onChange={handleGiftDetailsChange} />
              )}
            </div>
            
            {/* Desktop Continue Button */}
            <div className="hidden md:flex justify-end">
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-on-secondary rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-secondary-hover transition-all disabled:bg-surface-container-high disabled:text-surface-on-surface-variant disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
              >
                {isCreatingOrder ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Checkout
                    {totalAmount && (
                      <span className="ml-2 px-3 py-1 bg-white/15 rounded-full">
                        {formatCurrency(totalAmount, selectedCountry.currency)}
                      </span>
                    )}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Sticky CTA */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant z-30">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full flex items-center justify-between px-6 py-4 bg-secondary text-secondary-on-secondary rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-secondary-hover transition-all disabled:bg-surface-container-high disabled:text-surface-on-surface-variant disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
          >
            {isCreatingOrder ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Continue to Checkout</span>
                <div className="flex items-center gap-2">
                  {totalAmount && (
                    <span className="px-3 py-1 bg-white/15 rounded-full text-[12px]">
                      {formatCurrency(totalAmount, selectedCountry.currency)}
                    </span>
                  )}
                  <ArrowRight className="h-5 w-5" />
                </div>
              </>
            )}
          </button>
        </div>
      </main>
      <Footer />
    </>
  )
}
