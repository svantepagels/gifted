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
import { giftCardService } from '@/lib/giftcards/service'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { useApp } from '@/contexts/AppContext'
import { DeliveryMethod } from '@/lib/orders/types'
import { orderRepository } from '@/lib/orders/mock-repository'
import { calculateServiceFee, formatCurrency } from '@/lib/utils/currency'
import { ArrowRight, Loader2 } from 'lucide-react'

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
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  
  useEffect(() => {
    async function loadProduct() {
      try {
        const slug = params.slug as string
        console.log('[ProductDetail] Loading product with slug:', slug)
        
        const data = await giftCardService.getProductBySlug(slug)
        
        if (!data) {
          console.error('[ProductDetail] Product not found for slug:', slug)
          alert(`Product not found: ${slug}`)
          router.push('/')
          return
        }
        
        console.log('[ProductDetail] Product loaded:', data.brandName)
        
        // Check if product is available in selected country
        if (!data.countryCodes.includes(selectedCountry.code)) {
          console.warn(
            `[ProductDetail] Product ${data.brandName} not available in ${selectedCountry.name}`
          )
          alert(`${data.brandName} is not available in ${selectedCountry.name}. ` +
                `Please select a different country.`)
          router.push('/')
          return
        }
        
        setProduct(data)
        setCartProduct(data)
      } catch (error) {
        console.error('[ProductDetail] Failed to load product:', error)
        alert('Failed to load product. Please try again.')
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
    if (!product || !selectedAmount || isCreatingOrder) return
    
    // Validate gift details if sending as gift
    if (deliveryMethod === 'gift' && !recipientEmail) {
      alert('Please enter recipient email address')
      return
    }
    
    // Create order
    setIsCreatingOrder(true)
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
      setIsCreatingOrder(false)
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
  
  const totalAmount = selectedAmount ? selectedAmount + calculateServiceFee(selectedAmount) : null
  const canContinue = product && selectedAmount && (deliveryMethod === 'self' || recipientEmail) && !isCreatingOrder
  
  return (
    <>
      <Header />
      <main className="min-h-screen pb-36 md:pb-8">
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
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-surface-on-primary rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-primary-hover transition-all disabled:bg-surface-container-high disabled:text-surface-on-surface-variant disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
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
                      <span className="ml-2 px-3 py-1 bg-surface-on-primary/10 rounded-full">
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
        <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant z-30">
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="w-full flex items-center justify-between px-6 py-4 bg-primary text-surface-on-primary rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-primary-hover transition-all disabled:bg-surface-container-high disabled:text-surface-on-surface-variant disabled:cursor-not-allowed shadow-lg disabled:shadow-none"
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
                    <span className="px-3 py-1 bg-surface-on-primary/10 rounded-full text-[12px]">
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
      <MobileBottomNav />
    </>
  )
}
