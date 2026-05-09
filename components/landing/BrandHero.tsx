'use client'

/**
 * Brand landing-page hero — the H1 plus a brand logo card and (optional)
 * quick-buy denomination chips that anchor-jump to the DenominationGrid
 * section below.
 *
 * Mirrors HeroSection.tsx and ProductHero.tsx visually so the landing
 * pages feel like first-class members of the existing site rather than
 * SEO afterthoughts.
 *
 * Logo: bare `<img>` (not `next/image`) — matches the rest of the codebase
 * for Reloadly logos and avoids the loader bundle. Hero image gets
 * `loading="eager"` and `fetchPriority="high"` for LCP.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/animations/variants'
import { formatCurrency } from '@/lib/utils/currency'
import type { BrandConfig, BrandCopy } from '@/lib/landing-pages/types'
import type { GiftCardProduct } from '@/lib/giftcards/types'

interface BrandHeroProps {
  brand: BrandConfig
  /** Display name resolved from `brandDisplayName(brand, locale)`. */
  displayName: string
  copy: BrandCopy
  heroLogoUrl?: string
  /** First product (used to derive quick-buy denominations). May be empty. */
  primaryProduct?: GiftCardProduct
  primaryCurrency: string
}

export function BrandHero({
  brand,
  displayName,
  copy,
  heroLogoUrl,
  primaryProduct,
  primaryCurrency,
}: BrandHeroProps) {
  const [logoFailed, setLogoFailed] = useState(false)
  const showLogo = Boolean(heroLogoUrl) && !logoFailed

  const quickBuy = pickQuickBuyAmounts(primaryProduct)

  return (
    <section className="relative overflow-hidden py-8 md:py-12 lg:py-16">
      {/* Subtle brand-accent gradient backdrop (mobile only — keeps desktop clean) */}
      <div
        className={`absolute inset-0 -mx-4 sm:-mx-6 bg-gradient-to-br ${brand.accentGradient} opacity-[0.06] md:hidden`}
        aria-hidden="true"
      />

      <div className="relative grid grid-cols-1 md:grid-cols-12 md:gap-8 items-center">
        {/* Logo card — order first on mobile so the visual anchor is up top */}
        <div className="order-1 md:order-2 md:col-span-5 mb-6 md:mb-0 flex md:justify-end">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-white border border-outline-variant shadow-ambient flex items-center justify-center overflow-hidden p-4 md:p-6">
            {showLogo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={heroLogoUrl}
                alt={`${displayName} gift card logo`}
                loading="eager"
                fetchPriority="high"
                onError={() => setLogoFailed(true)}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span
                className="text-display-md md:text-display-lg font-archivo text-surface-on-surface-variant"
                aria-hidden="true"
              >
                {(displayName[0] ?? '?').toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Copy column */}
        <div className="order-2 md:order-1 md:col-span-7 text-start">
          <motion.h1
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
            className="font-archivo text-display-sm md:text-display-md lg:text-display-lg text-surface-on-surface uppercase leading-[0.95] tracking-tight mb-3 md:mb-4"
          >
            {copy.heroTitle}
          </motion.h1>

          <p className="font-inter text-body-lg md:text-headline-sm text-surface-on-surface-variant max-w-xl leading-relaxed mb-5 md:mb-6">
            {copy.heroSubtitle}
          </p>

          {quickBuy.length > 0 && (
            <div
              className="flex flex-wrap gap-2 md:gap-3"
              aria-label="Quick-buy denominations"
            >
              {quickBuy.map((amount) => (
                <a
                  key={amount}
                  href="#denominations"
                  className="inline-flex items-center justify-center min-h-[44px] px-4 md:px-5 rounded-full bg-surface-container-lowest border border-outline-variant text-label-md md:text-body-md font-medium text-primary hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  {formatCurrency(amount, primaryCurrency)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Pick up to three sensible "quick buy" denominations from the primary
 * product. For FIXED, take min/mid/max. For RANGE, return an empty list
 * (custom amount is handled in the grid). Returns sorted, deduplicated.
 */
function pickQuickBuyAmounts(product?: GiftCardProduct): number[] {
  if (!product) return []
  if (product.denominationType === 'FIXED' && product.fixedDenominations) {
    const values = product.fixedDenominations.map((d) => d.value)
    if (values.length === 0) return []
    if (values.length <= 3) return [...values].sort((a, b) => a - b)
    const sorted = [...values].sort((a, b) => a - b)
    const min = sorted[0]
    const max = sorted[sorted.length - 1]
    const mid = sorted[Math.floor(sorted.length / 2)]
    return Array.from(new Set([min, mid, max]))
  }
  return []
}
