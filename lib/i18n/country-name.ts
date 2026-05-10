import type { Locale } from './config'

/**
 * Localize a country name using the platform `Intl.DisplayNames` API.
 *
 * Falls back to the raw ISO code when the runtime can't translate
 * (older browsers, unknown codes, or when Intl.DisplayNames throws).
 *
 * Used in:
 *  - `components/shared/CountrySelector.tsx`
 *  - `components/product/ProductHero.tsx`
 *
 * Reloadly's catalog ships English country names. We keep the English
 * name on the underlying object (for sorting and as a search fallback)
 * and only run it through this helper at display time.
 */
export function localizedCountryName(
  locale: Locale | string,
  countryCode: string
): string {
  if (!countryCode) return ''
  const code = countryCode.toUpperCase()
  try {
    const dn = new Intl.DisplayNames([locale], { type: 'region' })
    return dn.of(code) ?? code
  } catch {
    return code
  }
}
