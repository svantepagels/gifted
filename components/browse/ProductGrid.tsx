'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { ProductCard } from './ProductCard'
import { Search } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages, t } from '@/lib/i18n/useMessages'
import { useApp } from '@/contexts/AppContext'
import { localizedCountryName } from '@/lib/i18n/country-name'

interface ProductGridProps {
  products: GiftCardProduct[]
  isLoading?: boolean
}

export function ProductGrid({ products, isLoading = false }: ProductGridProps) {
  const locale = useLocale()
  const m = getMessages(locale)
  const searchParams = useSearchParams()
  const { selectedCountry } = useApp()

  const q = (searchParams.get('q') || '').toLowerCase().trim()
  const category = (searchParams.get('category') || '').toLowerCase().trim()
  const countryCode = selectedCountry.code.toUpperCase()

  const visible = useMemo(() => {
    return products.filter((p) => {
      // Country availability — a product whose `countryCodes` array
      // doesn't include the user's selected country is hidden.
      // Defensive: missing/empty list also hides (Reloadly catalog
      // always sets this, but guard against malformed input).
      const codes = p.countryCodes ?? []
      const matchesCountry = codes.some(
        (c) => c.toUpperCase() === countryCode
      )
      if (!matchesCountry) return false

      if (category && p.category?.toLowerCase() !== category) return false
      if (q && !p.brandName.toLowerCase().includes(q)) return false
      return true
    })
  }, [products, q, category, countryCode])

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
    // When the empty state is caused by country filtering alone (no
    // search query, no category filter), show a country-specific
    // message. Otherwise fall back to the generic "no match" copy.
    const isCountryOnlyEmpty = !q && !category
    if (isCountryOnlyEmpty) {
      const countryName =
        localizedCountryName(locale, selectedCountry.code) ||
        selectedCountry.name
      return (
        <div className="py-24 text-center" data-testid="empty-state-country">
          <Search className="h-16 w-16 text-surface-on-surface-variant mx-auto mb-4 opacity-50" />
          <h3 className="font-archivo text-headline-md text-surface-on-surface mb-2">
            {t(m, 'browse.empty.countryTitle', { country: countryName })}
          </h3>
          <p className="text-body-lg text-surface-on-surface-variant max-w-md mx-auto">
            {m['browse.empty.countryBody']}
          </p>
        </div>
      )
    }
    return (
      <div className="py-24 text-center" data-testid="empty-state-generic">
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
