/**
 * Brand-name matching helpers used by the viability filter.
 *
 * The Reloadly catalog has unstable brand names ("NetFlix" vs "Netflix")
 * and per-(brand × country) productIds. We match by brand-name aliases
 * after a strong normalisation pass — strip diacritics, lowercase, collapse
 * non-alphanumerics to spaces.
 *
 * Note: by the time products reach this matcher they've already been
 * processed by `lib/giftcards/transform.ts` which rewrites several raw
 * Reloadly brand names (e.g. "App Store & iTunes" → "Apple"). Each
 * BrandConfig.reloadlyBrandAliases list includes both raw and post-
 * transform forms so matching is robust either way.
 */

import type { BrandConfig } from './types'
import type { GiftCardProduct } from '@/lib/giftcards/types'

/**
 * Normalise a string for matching: lowercase, strip diacritics, collapse
 * any run of non-alphanumeric characters into a single space, trim.
 */
export function normaliseBrandName(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Best-effort match: does this Reloadly product belong to the given brand?
 *
 * Order:
 *   1. Reloadly product-ID hit (rare; we leave reloadlyProductIds empty
 *      because IDs are per country × brand and unstable).
 *   2. Exact normalised-name match against an alias.
 *   3. Substring match (so "Netflix" matches "NetFlix" but also catches
 *      brand-name variants like "Netflix Premium").
 */
export function productMatchesBrand(
  product: Pick<GiftCardProduct, 'brandName' | '_meta'>,
  brand: BrandConfig
): boolean {
  const reloadlyId = product._meta?.reloadlyProductId
  if (
    typeof reloadlyId === 'number' &&
    brand.reloadlyProductIds.includes(reloadlyId)
  ) {
    return true
  }

  const productNorm = normaliseBrandName(product.brandName ?? '')
  if (!productNorm) return false

  for (const alias of brand.reloadlyBrandAliases) {
    const aliasNorm = normaliseBrandName(alias)
    if (!aliasNorm) continue
    if (productNorm === aliasNorm) return true
    if (productNorm.includes(aliasNorm)) return true
    if (aliasNorm.includes(productNorm)) return true
  }
  return false
}

/**
 * Pick the matching products for a brand from a per-country product list.
 *
 * Preference order:
 *   1. Products whose `countryCodes` includes the target country
 *   2. Products marked `_meta.global === true`
 *   3. Anything we matched (last-resort)
 *
 * Returns an empty array when no products match.
 */
export function findProductsForBrand(
  products: GiftCardProduct[],
  brand: BrandConfig,
  countryCode: string
): GiftCardProduct[] {
  const matches = products.filter((p) => productMatchesBrand(p, brand))
  if (matches.length === 0) return []

  const country = countryCode.toUpperCase()
  const inCountry = matches.filter((p) =>
    (p.countryCodes ?? []).includes(country)
  )
  if (inCountry.length) return inCountry

  const global = matches.filter((p) => p._meta?.global === true)
  if (global.length) return global

  return matches
}
