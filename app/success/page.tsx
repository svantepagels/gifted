'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SuccessSummary } from '@/components/success/SuccessSummary'
import { orderRepository } from '@/lib/orders/mock-repository'
import { browserOrderStorage } from '@/lib/orders/browser-storage'
import { Order } from '@/lib/orders/types'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        router.push('/')
        return
      }
      
      try {
        // Try repository first (contains completed order status)
        let orderData = await orderRepository.getById(orderId)
        
        // Fallback to browser storage if repository doesn't have it
        // (Can happen during page refresh right after checkout completion)
        if (!orderData) {
          console.log('[Success] Order not in repository, trying browser storage')
          orderData = browserOrderStorage.load()
          
          // Validate order ID matches
          if (orderData && orderData.id !== orderId) {
            console.warn('[Success] Order ID mismatch')
            orderData = null
          }
        }
        
        if (!orderData || orderData.status !== 'completed') {
          console.error('[Success] Order not found or not completed:', orderId)
          router.push('/')
          return
        }
        
        console.log('[Success] Order loaded:', orderData.id)
        setOrder(orderData)
      } catch (error) {
        console.error('[Success] Failed to load order:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadOrder()
  }, [orderId, router])
  
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
      <main className="min-h-screen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SuccessSummary order={order} />
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function SuccessPage() {
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
      <SuccessContent />
    </Suspense>
  )
}
