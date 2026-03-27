'use client'

import { GiftCardProduct } from '@/lib/giftcards/types'
import { ProductCard } from './ProductCard'
import { Search } from 'lucide-react'

interface ProductGridProps {
  products: GiftCardProduct[]
  isLoading?: boolean
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
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
  
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <Search className="h-16 w-16 text-surface-on-surface-variant mx-auto mb-4 opacity-50" />
        <h3 className="font-archivo text-headline-md text-surface-on-surface mb-2">
          No gift cards found
        </h3>
        <p className="text-body-lg text-surface-on-surface-variant max-w-md mx-auto">
          Try adjusting your filters or search query to find the perfect gift card.
        </p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
