'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { ProductCard } from './ProductCard'
import { Search } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'

interface ProductGridProps {
  products: GiftCardProduct[]
  isLoading?: boolean
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const locale = useLocale()
  const m = getMessages(locale)
  const searchParams = useSearchParams()

  const q = (searchParams.get('q') || '').toLowerCase().trim()
  const category = (searchParams.get('category') || '').toLowerCase().trim()

  const visible = useMemo(() => {
    if (!q && !category) return products
    return products.filter((p) => {
      if (category && p.category?.toLowerCase() !== category) return false
      if (q) {
        const hay = p.brandName.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [products, q, category])

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-surface-container-low rounded-lg overflow-hidden">
              <div className="aspect-video bg-surface-container" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-surface-container rounded w-3/4" />
                <div className="h-4 bg-surface-container rounded w-1/2" />
                <div className="h-4 bg-surface-container rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <div className="py-24 text-center">
        <Search className="h-16 w-16 text-surface-on-surface-variant mx-auto mb-4 opacity-50" />
        <h3 className="font-archivo text-headline-md text-surface-on-surface mb-2">
          {m['browse.empty.title']}
        </h3>
        <p className="text-body-lg text-surface-on-surface-variant max-w-md mx-auto">
          {m['browse.empty.body']}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4">
      {visible.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          index={idx}
          priority={idx < 6}
        />
      ))}
    </div>
  )
}
