'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { browserOrderStorage } from '@/lib/orders/browser-storage'
import { fetchOrder, processOrder } from '@/lib/orders/api'
import { Order } from '@/lib/orders/types'
import { formatCurrencyForLocale } from '@/lib/i18n/format-currency'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/useLocale'
import { localeHref } from '@/lib/i18n/href'
import { getMessages } from '@/lib/i18n/useMessages'

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const locale = useLocale()
  const m = getMessages(locale)

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        router.push(localeHref(locale, '/'))
        return
      }

      try {
        const cached = browserOrderStorage.load()
        if (cached && cached.id === orderId) {
          setOrder(cached)
          setIsLoading(false)
        }

        const orderData = await fetchOrder(orderId)

        if (!orderData) {
          router.push(localeHref(locale, '/'))
          return
        }

        if (!orderData.reloadlyProductId) {
          alert(m['checkout.error.productConfig'])
          router.push(localeHref(locale, '/'))
          return
        }

        setOrder(orderData)
      } catch {
        router.push(localeHref(locale, '/'))
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, router, locale])

  const handleSubmit = async (email: string) => {
    if (!order) return

    await processOrder(order.id, email)

    browserOrderStorage.clear()

    router.push(localeHref(locale, `/success?orderId=${order.id}`))
  }

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-body-lg text-surface-on-surface-variant">{m['checkout.loading']}</p>
          </div>
        </main>
      </>
    )
  }

  if (!order) {
    return null
  }

  const fmt = (n: number) => formatCurrencyForLocale(n, order.currency, locale)

  return (
    <>
      <Header />
      <main className="min-h-screen pb-8 md:pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Back Button */}
            <Link
              href={localeHref(locale, `/gift-card/${order.productId}`)}
              className="inline-flex items-center gap-2 text-body-md text-surface-on-surface-variant hover:text-surface-on-surface transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {m['checkout.backToProduct']}
            </Link>

            <h1 className="font-archivo-black text-[2.25rem] leading-[1.2] tracking-[-0.02em] text-surface-on-surface mb-8 uppercase">
              {m['checkout.title']}
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Order Review */}
              <div className="bg-surface-container-lowest rounded-lg p-6">
                <h2 className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
                  {m['checkout.orderReview.heading']}
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
                      {fmt(order.amount)}
                    </p>
                  </div>
                </div>

                {order.deliveryMethod === 'gift' && order.recipientEmail && (
                  <div className="mb-6 pb-6 border-b border-outline-variant">
                    <h4 className="text-label-md text-surface-on-surface-variant mb-2">
                      {m['checkout.giftRecipient.heading']}
                    </h4>
                    <p className="text-body-md text-surface-on-surface mb-2">
                      {order.recipientEmail}
                    </p>
                    {order.giftMessage && (
                      <div className="mt-3 p-3 bg-surface-container rounded-md">
                        <p className="text-label-md text-surface-on-surface-variant mb-1">
                          {m['checkout.giftRecipient.message']}
                        </p>
                        <p className="text-body-md text-surface-on-surface italic">
                          &ldquo;{order.giftMessage}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 text-body-md">
                  <div className="flex justify-between">
                    <span className="text-surface-on-surface-variant">{m['checkout.summary.amount']}</span>
                    <span className="text-surface-on-surface">{fmt(order.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-on-surface-variant">{m['checkout.summary.serviceFee']}</span>
                    <span className="text-surface-on-surface">{fmt(order.serviceFee)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-outline-variant font-medium text-title-md">
                    <span className="text-surface-on-surface">{m['checkout.summary.total']}</span>
                    <span className="text-surface-on-surface">{fmt(order.total)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-secondary/5 rounded-md flex items-start gap-2">
                  <Shield className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-label-md text-surface-on-surface">
                    {m['checkout.security.note']}
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
  // The Suspense fallback runs before locale hooks resolve, so it has to use
  // a generic spinner; the Loading text below is rendered by CheckoutContent
  // once the locale is known.
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          </div>
        </main>
      </>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
