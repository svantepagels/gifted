'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils/currency'

interface ProductCardProps {
  product: GiftCardProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { selectedCountry } = useApp()
  
  // Get the first available denomination or range minimum
  const priceDisplay = product.denominationType === 'FIXED' && product.fixedDenominations
    ? `From ${formatCurrency(product.fixedDenominations[0].value, selectedCountry.currency)}`
    : product.denominationRange
    ? `${formatCurrency(product.denominationRange.min, selectedCountry.currency)} - ${formatCurrency(product.denominationRange.max, selectedCountry.currency)}`
    : ''
  
  return (
    <Link href={`/gift-card/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="group"
      >
        <div className="bg-surface-container-lowest rounded-lg overflow-hidden shadow-ambient hover:shadow-ambient-lg transition-shadow duration-300">
          {/* Logo Container */}
          <div className="aspect-video bg-surface-container flex items-center justify-center p-8">
            <div className="w-full h-full flex items-center justify-center">
              {/* Placeholder for logo - in production would use Next Image */}
              <div className="w-24 h-24 rounded-lg bg-surface-container-low flex items-center justify-center">
                <span className="text-headline-sm font-archivo text-surface-on-surface-variant">
                  {product.brandName[0]}
                </span>
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors">
                {product.brandName}
              </h3>
              <span className="px-2 py-1 rounded text-label-sm bg-surface-container-low text-surface-on-surface-variant whitespace-nowrap">
                {product.category}
              </span>
            </div>
            
            <p className="text-body-md text-surface-on-surface-variant mb-3">
              {priceDisplay}
            </p>
            
            <div className="flex items-center gap-2 text-label-md text-tertiary-container">
              <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
              <span>Instant delivery</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
