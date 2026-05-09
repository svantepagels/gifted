/**
 * i18n configuration — locale list, default, metadata, type guards.
 *
 * First-wave locales for SEM Phase 1 launch (per
 * research/02-niche-heatmap-findings.md). Adding/removing entries here
 * requires updates in:
 *   - middleware.ts (matcher works on all paths regardless)
 *   - lib/i18n/messages/<locale>.json (en-* locales share en.json)
 *   - lib/i18n/useMessages.ts (import map)
 */

export const locales = [
  'fi-FI',
  'en-IE',
  'en-AU',
  'ar-AE',
  'ar-SA',
  'pl-PL',
  'el-GR',
  'en-MT',
  'en-NZ',
] as const

export type Locale = (typeof locales)[number]

/**
 * Default locale for unmatched Accept-Language headers and as the
 * fallback inside utility helpers. en-IE keeps prices in EUR for the
 * common European browser default and avoids US-bias.
 */
export const defaultLocale: Locale = 'en-IE'

export interface LocaleMeta {
  /** ISO 639-1 language code, e.g. 'fi' */
  language: string
  /** ISO 3166-1 alpha-2 country code, e.g. 'FI' */
  country: string
  /** ISO 4217 currency code, e.g. 'EUR' */
  currency: string
  /** Layout direction */
  direction: 'ltr' | 'rtl'
  /**
   * Self-name in the locale's own language/script — shown in the
   * `<LocaleSwitcher>` dropdown.
   */
  displayName: string
  /** BCP 47 string equal to the locale id (used for hreflang). */
  hreflang: string
}

export const localeMeta: Record<Locale, LocaleMeta> = {
  'fi-FI': {
    language: 'fi',
    country: 'FI',
    currency: 'EUR',
    direction: 'ltr',
    displayName: 'Suomi (Suomi)',
    hreflang: 'fi-FI',
  },
  'en-IE': {
    language: 'en',
    country: 'IE',
    currency: 'EUR',
    direction: 'ltr',
    displayName: 'English (Ireland)',
    hreflang: 'en-IE',
  },
  'en-AU': {
    language: 'en',
    country: 'AU',
    currency: 'AUD',
    direction: 'ltr',
    displayName: 'English (Australia)',
    hreflang: 'en-AU',
  },
  'ar-AE': {
    language: 'ar',
    country: 'AE',
    currency: 'AED',
    direction: 'rtl',
    displayName: 'العربية (الإمارات)',
    hreflang: 'ar-AE',
  },
  'ar-SA': {
    language: 'ar',
    country: 'SA',
    currency: 'SAR',
    direction: 'rtl',
    displayName: 'العربية (السعودية)',
    hreflang: 'ar-SA',
  },
  'pl-PL': {
    language: 'pl',
    country: 'PL',
    currency: 'PLN',
    direction: 'ltr',
    displayName: 'Polski (Polska)',
    hreflang: 'pl-PL',
  },
  'el-GR': {
    language: 'el',
    country: 'GR',
    currency: 'EUR',
    direction: 'ltr',
    displayName: 'Ελληνικά (Ελλάδα)',
    hreflang: 'el-GR',
  },
  'en-MT': {
    language: 'en',
    country: 'MT',
    currency: 'EUR',
    direction: 'ltr',
    displayName: 'English (Malta)',
    hreflang: 'en-MT',
  },
  'en-NZ': {
    language: 'en',
    country: 'NZ',
    currency: 'NZD',
    direction: 'ltr',
    displayName: 'English (New Zealand)',
    hreflang: 'en-NZ',
  },
}

/** Type-guard for runtime values that may or may not be a Locale. */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

/**
 * Map a locale to the JSON message file basename.
 * All en-* locales share `en.json`; everything else maps to itself.
 */
export function messagesFileForLocale(locale: Locale): string {
  if (locale.startsWith('en-')) return 'en'
  return locale
}
