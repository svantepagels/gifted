/**
 * Build-time generator for the country selector list.
 *
 * Returns every country that has at least one redeemable product in the
 * live Reloadly catalog. A country qualifies if its ISO code appears as
 * `product.country.isoName` on at least one product in the global
 * `/products` listing.
 *
 * Memoized with `react.cache` so the same build invocation hits the
 * Reloadly API only once per process. Same pattern used by
 * `lib/landing-pages/viable-cells.ts`.
 *
 * Failure modes (all degrade gracefully — never fail the build):
 *   - Reloadly auth fails / network error      → FALLBACK_COUNTRIES
 *   - /countries returns empty / malformed     → FALLBACK_COUNTRIES
 *   - Product list yields zero country codes   → FALLBACK_COUNTRIES
 */

import 'server-only'
import { cache } from 'react'
import { reloadlyClient } from '@/lib/reloadly/client'
import { productCache, CacheTTL, CacheKeys } from '@/lib/giftcards/cache'
import { transformReloadlyProduct } from '@/lib/giftcards/transform'
import { filterOpenLoopGiftCards } from '@/lib/giftcards/compliance'
import { FALLBACK_COUNTRIES } from './fallback'
import type { GiftCardProduct } from '@/lib/giftcards/types'
import type { Country } from './types'

/**
 * Module-level promise cache. `react.cache` only memoises within a
 * single React render tree, so during `next build` every static route
 * would re-fetch the Reloadly catalog and blow past the 60s
 * static-page-generation timeout. A worker-process-scoped Promise
 * makes the catalog fetch effectively free for every page after the
 * first one in the same worker.
 */
let cachedPromise: Promise<Country[]> | null = null

/**
 * ISO 3166-1 alpha-2 → emoji flag (regional indicator symbols).
 * 0x1F1E6 + (letter index 0..25) per character.
 */
function isoToEmojiFlag(iso: string): string {
  if (!iso || iso.length !== 2) return '🏳️'
  const cc = iso.toUpperCase()
  const a = cc.charCodeAt(0)
  const b = cc.charCodeAt(1)
  if (a < 65 || a > 90 || b < 65 || b > 90) return '🏳️'
  return String.fromCodePoint(0x1f1e6 + (a - 65), 0x1f1e6 + (b - 65))
}

async function buildRedeemableCountries(): Promise<Country[]> {
  try {
    // 1. Master country list (richer metadata: currency, symbol).
    const allCountries = await reloadlyClient.getCountries()
    if (!Array.isArray(allCountries) || allCountries.length === 0) {
      console.warn(
        '[build-countries] Reloadly /countries returned no entries — using fallback'
      )
      return FALLBACK_COUNTRIES
    }

    // 2. All products across every page. We deliberately bypass
    //    giftCardService.getProducts({}) because it deduplicates by
    //    brand — that would drop the country diversity we need.
    //    Read straight from the same `productCache` it populates, so
    //    if landing-page rendering already filled the cache during
    //    this build the second hit is free.
    let products: GiftCardProduct[] | null = productCache.get<GiftCardProduct[]>(
      CacheKeys.allProducts(),
      CacheTTL.ALL_PRODUCTS
    )
    if (!products) {
      const raw = await reloadlyClient.getAllProductsComplete()
      // Compliance: this writes to the exact cache key GiftCardService
      // trusts — never populate it with unfiltered products
      // (see lib/giftcards/compliance.ts).
      products = filterOpenLoopGiftCards(raw.map(transformReloadlyProduct))
      productCache.set(CacheKeys.allProducts(), products)
    }

    const codesWithProducts = new Set<string>()
    for (const p of products) {
      // GiftCardProduct exposes `countryCodes[]` (set by
      // transformReloadlyProduct), one entry per country the SKU is
      // redeemable in.
      const codes = p.countryCodes ?? []
      for (const code of codes) {
        if (code) codesWithProducts.add(code.toUpperCase())
      }
    }

    if (codesWithProducts.size === 0) {
      console.warn(
        '[build-countries] No product/country mappings found — using fallback'
      )
      return FALLBACK_COUNTRIES
    }

    // 3. Intersect: keep only countries that have at least one product.
    const redeemable: Country[] = allCountries
      .filter((c) => c?.isoName && codesWithProducts.has(c.isoName.toUpperCase()))
      .map((c) => ({
        code: c.isoName.toUpperCase(),
        name: c.name,
        currency: c.currencyCode,
        currencySymbol: c.currencySymbol || c.currencyCode,
        flag: isoToEmojiFlag(c.isoName),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en'))

    if (redeemable.length === 0) {
      console.warn(
        '[build-countries] Intersection of /countries and /products is empty — using fallback'
      )
      return FALLBACK_COUNTRIES
    }

    console.log(
      `[build-countries] Generated ${redeemable.length} redeemable countries from Reloadly (env=${process.env.RELOADLY_ENVIRONMENT ?? 'sandbox'})`
    )
    return redeemable
  } catch (err) {
    console.warn(
      '[build-countries] Failed to fetch from Reloadly — using fallback:',
      err instanceof Error ? err.message : err
    )
    return FALLBACK_COUNTRIES
  }
}

export const getRedeemableCountries = cache(async (): Promise<Country[]> => {
  if (!cachedPromise) {
    cachedPromise = buildRedeemableCountries()
  }
  return await cachedPromise
})
