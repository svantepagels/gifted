/**
 * Public country-data module.
 *
 * Server-side: `getAllCountries()` returns the build-time-generated list
 * of every country with at least one redeemable Reloadly product.
 *
 * Client-side: components must NOT import `getAllCountries` directly.
 * The list is loaded once at the layout level and passed through React
 * context (see `app/[locale]/layout.tsx` → `<AppProvider countries=…>`).
 *
 * The `findCountryByCode` helper is a pure synchronous list lookup and
 * is safe to call from either side.
 */

import 'server-only'
import type { Country } from './types'
import { getRedeemableCountries } from './build-countries'
import { FALLBACK_COUNTRIES } from './fallback'

export async function getAllCountries(): Promise<Country[]> {
  return await getRedeemableCountries()
}

/**
 * Best default country for first-time visitors:
 *   1. US (matches historical default), if present in the list
 *   2. otherwise the first alphabetical entry
 *   3. otherwise the first hardcoded fallback (always non-empty)
 */
export async function getDefaultCountryAsync(): Promise<Country> {
  const list = await getAllCountries()
  return (
    list.find((c) => c.code === 'US') ??
    list[0] ??
    FALLBACK_COUNTRIES[0]
  )
}

/**
 * Pure, synchronous lookup against an already-loaded country list.
 * Use this in client components: pass the list in via context/props.
 */
export function findCountryByCode(
  list: Country[],
  code: string
): Country | undefined {
  if (!code) return undefined
  const upper = code.toUpperCase()
  return list.find((c) => c.code === upper)
}
