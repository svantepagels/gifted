'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { ProductHero } from '@/components/product/ProductHero'
import { AmountSelector } from '@/components/product/AmountSelector'
import { DeliveryMethodToggle } from '@/components/product/DeliveryMethodToggle'
import { GiftDetailsForm } from '@/components/product/GiftDetailsForm'
import { OrderSummary } from '@/components/product/OrderSummary'
import { giftCardService } from '@/lib/giftcards/service'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { useApp } from '@/contexts/AppContext'
import { DeliveryMethod } from '@/lib/orders/types'
import { orderRepository } from '@/lib/orders/mock-repository'
import { calculateServiceFee } from '@/lib/utils/currency'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { selectedCountry, cart, setCartProduct, setCartAmount, setCartDeliveryMethod, setCartGiftDetails } = useApp()
  
  const [product, setProduct] = useState<GiftCardProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('self')
  const [recipientEmail, setRecipientEmail] = useState<string>()
  const [giftMessage, setGiftMessage] = useState<string>()
  
  useEffect(() => {
    async function loadProduct() {
      try {
        const slug = params.slug as string
        const data = await giftCardService.getProductBySlug(slug)
        
        if (!data) {
          router.push('/')
          return
        }
        
        // Check if product is available in selected country
        if (!data.countryCodes.includes(selectedCountry.code)) {
          alert(`${data.brandName} is not available in ${selectedCountry.name}. Please select a different country.`)
          router.push('/')
          return
        }
        
        setProduct(data)
        setCartProduct(data)
      } catch (error) {
        console.error('Failed to load product:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProduct()
  }, [params.slug, selectedCountry, router, setCartProduct])
  
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
    if (!product || !selectedAmount) return
    
    // Validate gift details if sending as gift
    if (deliveryMethod === 'gift' && !recipientEmail) {
      alert('Please enter recipient email address')
      return
    }
    
    // Create order
    try {
      const order = await orderRepository.create({
        productId: product.id,
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
      
      router.push(`/checkout?orderId=${order.id}`)
    } catch (error) {
      console.error('Failed to create order:', error)
      alert('Failed to create order. Please try again.')
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
        <MobileBottomNav />
      </>
    )
  }
  
  if (!product) {
    return null
  }
  
  return (
    <>
      <Header />
      <main className="min-h-screen pb-20 md:pb-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
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
            </div>
            
            {/* Order Summary - Desktop */}
            <div className="hidden lg:block">
              <OrderSummary
                productName={product.brandName}
                amount={selectedAmount}
                currency={selectedCountry.currency}
                onContinue={handleContinue}
                sticky
              />
            </div>
          </div>
        </div>
        
        {/* Order Summary - Mobile Fixed Bottom */}
        <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant z-30">
          <OrderSummary
            productName={product.brandName}
            amount={selectedAmount}
            currency={selectedCountry.currency}
            onContinue={handleContinue}
          />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  )
}
