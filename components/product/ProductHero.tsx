import { GiftCardProduct } from '@/lib/giftcards/types'
import { Clock } from 'lucide-react'

interface ProductHeroProps {
  product: GiftCardProduct
  countryName: string
}

export function ProductHero({ product, countryName }: ProductHeroProps) {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-8">
      {/* Logo */}
      <div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center">
        <span className="text-display-sm font-archivo text-surface-on-surface-variant">
          {product.brandName[0]}
        </span>
      </div>
      
      {/* Brand Name */}
      <h1 className="font-archivo text-headline-lg sm:text-display-sm text-surface-on-surface text-center mb-4">
        {product.brandName}
      </h1>
      
      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <span className="px-3 py-1 rounded-full bg-surface-container text-label-md text-surface-on-surface">
          {countryName}
        </span>
        <span className="px-3 py-1 rounded-full bg-surface-container text-label-md text-surface-on-surface">
          {product.category}
        </span>
        <span className="px-3 py-1 rounded-full bg-tertiary-fixed-dim/20 text-label-md text-tertiary-container flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Digital Delivery
        </span>
      </div>
      
      {/* Description */}
      <p className="text-body-md text-surface-on-surface-variant text-center max-w-md mx-auto">
        {product.redemptionInstructions}
      </p>
    </div>
  )
}
