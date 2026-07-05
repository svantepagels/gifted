'use client'

/**
 * DenominationGrid — responsive 2/3/4-col grid of denomination cards
 * with "Buy now" CTAs. Each card links to the existing product detail
 * page (`/[locale]/gift-card/[slug]`) which handles checkout.
 *
 * Behaviour:
 *   - Empty `products` (global-fallback brands when no per-country
 *     SKU exists) → render a single "View all
 *     denominations" card linking to homepage search for the brand.
 *   - Mixed FIXED/RANGE: prefer the longest fixed list; fall back to
 *     range presets when no fixed denominations exist.
 *
 * Tap targets are `min-h-[48px]` to satisfy Lighthouse mobile audits
 * (see RESEARCH §5).
 */

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { formatCurrencyForLocale } from '@/lib/i18n/format-currency'
import { localeHref } from '@/lib/i18n/href'
import type { Locale } from '@/lib/i18n/config'
import type { Messages } from '@/lib/i18n/useMessages'
import type { BrandConfig } from '@/lib/landing-pages/types'
import type { GiftCardProduct } from '@/lib/giftcards/types'

interface DenominationGridProps {
  products: GiftCardProduct[]
  brand: BrandConfig
  displayName: string
  locale: Locale
  messages: Messages
  primaryCurrency: string
}

export function DenominationGrid({
  products,
  brand,
  displayName,
  locale,
  messages,
  primaryCurrency,
}: DenominationGridProps) {
  // Pick the best product to anchor the grid: prefer FIXED with the
  // longest denomination list, then any FIXED, then the first RANGE.
  const anchor = pickAnchorProduct(products)

  const fixedAmounts = useMemo(() => {
    if (!anchor || anchor.denominationType !== 'FIXED') return []
    return [...(anchor.fixedDenominations ?? [])]
      .map((d) => d.value)
      .sort((a, b) => a - b)
  }, [anchor])

  const rangePresets = useMemo(() => {
    if (!anchor || anchor.denominationType !== 'RANGE' || !anchor.denominationRange)
      return []
    const { min, max, step } = anchor.denominationRange
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return []
    const stepValue = step && step > 0 ? step : Math.max(1, Math.round((max - min) / 8))
    const candidates = [
      min,
      min + stepValue * 5,
      min + stepValue * 15,
      max,
    ].filter((v) => v >= min && v <= max)
    return Array.from(new Set(candidates)).sort((a, b) => a - b)
  }, [anchor])

  return (
    <section
      id="denominations"
      className="my-12 md:my-16 scroll-mt-24"
      aria-labelledby="denominations-heading"
    >
      <h2
        id="denominations-heading"
        className="font-archivo text-headline-md md:text-headline-lg text-surface-on-surface mb-6 md:mb-8"
      >
        {messages['landing.denominations.heading']}
      </h2>

      {/* No SKU at all — render a graceful fallback CTA. */}
      {!anchor ? (
        <FallbackCard
          locale={locale}
          messages={messages}
          brandSlug={brand.slug}
          displayName={displayName}
        />
      ) : fixedAmounts.length > 0 ? (
        <FixedGrid
          amounts={fixedAmounts}
          product={anchor}
          brand={brand}
          displayName={displayName}
          locale={locale}
          messages={messages}
          currency={primaryCurrency}
        />
      ) : (
        <RangeGrid
          amounts={rangePresets}
          product={anchor}
          brand={brand}
          displayName={displayName}
          locale={locale}
          messages={messages}
          currency={primaryCurrency}
        />
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

function pickAnchorProduct(products: GiftCardProduct[]): GiftCardProduct | undefined {
  if (products.length === 0) return undefined
  const fixedSorted = products
    .filter((p) => p.denominationType === 'FIXED')
    .sort(
      (a, b) =>
        (b.fixedDenominations?.length ?? 0) - (a.fixedDenominations?.length ?? 0)
    )
  if (fixedSorted.length > 0) return fixedSorted[0]
  return products[0]
}

interface DenomCardProps {
  amount: number
  currency: string
  href: string
  cta: string
  accent: string
  locale: Locale
}

function DenomCard({ amount, currency, href, cta, accent, locale }: DenomCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
    >
      <div className={`h-1 bg-gradient-to-r ${accent}`} aria-hidden="true" />
      <div className="flex flex-col flex-1 p-4 md:p-5">
        <div className="font-archivo text-headline-md md:text-headline-lg text-surface-on-surface mb-3">
          {formatCurrencyForLocale(amount, currency, locale)}
        </div>
        <div className="mt-auto">
          <span className="inline-flex items-center justify-center w-full min-h-[48px] h-12 rounded-full bg-secondary text-secondary-on-secondary text-[13px] font-medium uppercase tracking-[0.5px] group-hover:bg-secondary-hover transition-colors">
            {cta}
          </span>
        </div>
      </div>
    </Link>
  )
}

interface FixedGridProps {
  amounts: number[]
  product: GiftCardProduct
  brand: BrandConfig
  displayName: string
  locale: Locale
  messages: Messages
  currency: string
}

function FixedGrid({
  amounts,
  product,
  brand,
  displayName,
  locale,
  messages,
  currency,
}: FixedGridProps) {
  const cta = messages['landing.denominations.cta']
  const targetHref = localeHref(locale, `/gift-card/${product.slug}`)
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 list-none p-0 m-0">
      {amounts.map((amount) => (
        <li key={amount}>
          <DenomCard
            amount={amount}
            currency={currency}
            href={targetHref}
            cta={cta}
            accent={brand.accentGradient}
            locale={locale}
          />
        </li>
      ))}
    </ul>
  )
}

interface RangeGridProps {
  amounts: number[]
  product: GiftCardProduct
  brand: BrandConfig
  displayName: string
  locale: Locale
  messages: Messages
  currency: string
}

function RangeGrid({
  amounts,
  product,
  brand,
  displayName,
  locale,
  messages,
  currency,
}: RangeGridProps) {
  const cta = messages['landing.denominations.cta']
  const viewAll = messages['landing.denominations.viewAll']
  const targetHref = localeHref(locale, `/gift-card/${product.slug}`)
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 list-none p-0 m-0">
      {amounts.map((amount) => (
        <li key={amount}>
          <DenomCard
            amount={amount}
            currency={currency}
            href={targetHref}
            cta={cta}
            accent={brand.accentGradient}
            locale={locale}
          />
        </li>
      ))}
      <li>
        <Link
          href={targetHref}
          className="group flex flex-col rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest hover:border-primary hover:bg-primary/5 transition-all duration-200 p-4 md:p-5 min-h-[140px] items-center justify-center text-center"
        >
          <span className="font-inter text-body-md text-surface-on-surface-variant group-hover:text-primary">
            {viewAll}
          </span>
        </Link>
      </li>
    </ul>
  )
}

interface FallbackCardProps {
  locale: Locale
  messages: Messages
  brandSlug: string
  displayName: string
}

function FallbackCard({ locale, messages, brandSlug, displayName }: FallbackCardProps) {
  const href = localeHref(locale, `/?q=${encodeURIComponent(brandSlug)}`)
  return (
    <Link
      href={href}
      className="block rounded-xl border border-outline-variant bg-surface-container-lowest hover:shadow-ambient-lg transition-all duration-200 p-6 md:p-8 text-center min-h-[120px] flex items-center justify-center"
    >
      <div>
        <p className="font-archivo text-headline-sm text-surface-on-surface mb-2">
          {displayName}
        </p>
        <p className="font-inter text-body-md text-surface-on-surface-variant">
          {messages['landing.denominations.viewAll']} →
        </p>
      </div>
    </Link>
  )
}
