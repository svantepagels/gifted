'use client'

import { useState } from 'react'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { Clock } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'
import { categoryDisplayLabel } from '@/lib/i18n/category-label'
import { localizedCountryName } from '@/lib/i18n/country-name'

interface ProductHeroProps {
  product: GiftCardProduct
  /** ISO 3166-1 alpha-2 country code; localized for display via Intl.DisplayNames */
  countryCode: string
}

export function ProductHero({ product, countryCode }: ProductHeroProps) {
  const locale = useLocale()
  const m = getMessages(locale)
  const [logoFailed, setLogoFailed] = useState(false)
  const showLogo = Boolean(product.logoUrl) && !logoFailed

  const countryLabel = localizedCountryName(locale, countryCode)
  const categoryLabel = categoryDisplayLabel(product.category, m)

  return (
    <div className="bg-surface-container-lowest rounded-lg p-8">
      {/* Logo — mirrors ProductCard's image contract so card and detail use the same source */}
      <div className="w-32 h-32 mx-auto mb-6 rounded-lg bg-white border border-outline-variant flex items-center justify-center overflow-hidden p-4">
        {showLogo ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={product.logoUrl}
            alt={`${product.brandName} logo`}
            loading="eager"
            fetchPriority="high"
            onError={() => setLogoFailed(true)}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <span className="text-display-sm font-archivo text-surface-on-surface-variant">
            {product.brandName[0]}
          </span>
        )}
      </div>

      {/* Brand Name */}
      <h1 className="font-archivo text-headline-lg sm:text-display-sm text-surface-on-surface text-center mb-4">
        {product.brandName}
      </h1>

      {/* Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {countryLabel && (
          <span className="px-3 py-1 rounded-full bg-surface-container text-label-md text-surface-on-surface">
            {countryLabel}
          </span>
        )}
        <span className="px-3 py-1 rounded-full bg-surface-container text-label-md text-surface-on-surface">
          {categoryLabel}
        </span>
        <span className="px-3 py-1 rounded-full bg-tertiary-fixed-dim/20 text-label-md text-tertiary-container flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {m['pdp.badge.digitalDelivery']}
        </span>
      </div>

      {/* Localized "How to redeem" — replaces Reloadly's English-only
          per-product redemption string. Full per-brand instructions are
          delivered by Reloadly in the fulfillment email. */}
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-label-lg font-semibold text-surface-on-surface mb-1">
          {m['pdp.redemption.heading']}
        </h2>
        <p className="text-body-md text-surface-on-surface-variant">
          {m['pdp.redemption.generic']}
        </p>
      </div>
    </div>
  )
}
