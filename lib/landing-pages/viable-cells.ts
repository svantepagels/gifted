/**
 * Build-time viability filter — for a given locale, returns the brands
 * that exist in the Reloadly catalog for that locale's country.
 *
 * Caching: wrapped in `react.cache` so a single build invocation only
 * hits Reloadly once per (locale, countryCode). `react.cache` is the
 * Next 14 supported pattern for memoizing non-fetch functions across
 * `generateStaticParams` / `generateMetadata` / page render — it
 * sidesteps the long-standing "incrementalCache missing" invariant
 * with `unstable_cache` (vercel/next.js#50765, #70085).
 *
 * With `dynamicParams = false` on the page, every page is prebuilt and
 * `react.cache` is sufficient — no need for cross-request persistence.
 *
 * If Reloadly is unavailable at build time (auth fail, network error),
 * we degrade gracefully: only globally-available fallback brands ship
 * for that locale. This avoids exploding the build but logs a warning.
 */

import 'server-only'
import { cache } from 'react'
import { type Locale, localeMeta } from '@/lib/i18n/config'
import { giftCardService } from '@/lib/giftcards/service'
import { BRANDS } from './brands'
import { findProductsForBrand } from './slug'
import type { BrandConfig } from './types'
import type { GiftCardProduct } from '@/lib/giftcards/types'

/**
 * Brand slugs that ship even when no per-country Reloadly SKU is
 * available. Crypto Voucher is genuinely global, so its landing page
 * is meaningful in every locale.
 */
const GLOBAL_FALLBACK_SLUGS: ReadonlyArray<string> = ['crypto-voucher']

export interface ViableCell {
  brand: BrandConfig
  /** Resolved Reloadly products for this brand × country. May be empty
   *  for global-fallback brands when no per-country SKU exists. */
  products: GiftCardProduct[]
  /** Currency to display denominations in. Taken from the first product
   *  if any; otherwise from `localeMeta[locale].currency`. */
  primaryCurrency: string
}

/**
 * Build-time getter — used by `generateStaticParams()` and inside the
 * page render. Memoised with `react.cache` so 9 locales × N pages
 * still only hit Reloadly 9× per build (once per locale-country).
 */
export const getViableCellsForLocale = cache(
  async (locale: Locale): Promise<ViableCell[]> => {
    const meta = localeMeta[locale]
    const country = meta.country.toUpperCase()

    let products: GiftCardProduct[] = []
    try {
      products = await giftCardService.getProducts({ countryCode: country })
    } catch (err) {
      // Reloadly unavailable at build time → fall back to global brands only.
      // eslint-disable-next-line no-console
      console.warn(
        `[landing-pages] Reloadly fetch failed for ${country} (${locale}):`,
        err instanceof Error ? err.message : err
      )
      products = []
    }

    const cells: ViableCell[] = []
    for (const brand of BRANDS) {
      const matched = findProductsForBrand(products, brand, country)
      if (matched.length > 0) {
        cells.push({
          brand,
          products: matched,
          primaryCurrency: matched[0].currency || meta.currency,
        })
        continue
      }
      if (GLOBAL_FALLBACK_SLUGS.includes(brand.slug)) {
        cells.push({
          brand,
          products: [],
          primaryCurrency: meta.currency,
        })
      }
    }
    return cells
  }
)

/**
 * Convenience: list of all locales where a given brand is viable.
 * Used by `generateMetadata` to emit `<link rel="alternate" hreflang>`.
 *
 * Iterates locales sequentially because each call to
 * `getViableCellsForLocale` is `react.cache`-memoised, so we do at
 * most 9 Reloadly fetches per build.
 */
export async function viableLocalesForBrand(
  brandSlug: string,
  candidateLocales: ReadonlyArray<Locale>
): Promise<Locale[]> {
  const out: Locale[] = []
  for (const loc of candidateLocales) {
    const cells = await getViableCellsForLocale(loc)
    if (cells.some((c) => c.brand.slug === brandSlug)) out.push(loc)
  }
  return out
}
