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

/**
 * Language-only options shown in <LocaleSwitcher>. One entry per
 * supported UI language. The dropdown switches LANGUAGE only; the
 * country/currency portion of the locale (and therefore the catalog
 * shown by <CountrySelector>) is preserved on language change.
 */
export const languages = [
  { code: 'en', displayName: 'English' },
  { code: 'fi', displayName: 'Suomi' },
  { code: 'ar', displayName: 'العربية' },
  { code: 'pl', displayName: 'Polski' },
  { code: 'el', displayName: 'Ελληνικά' },
] as const

export type LanguageCode = (typeof languages)[number]['code']

/**
 * For each supported UI language, the locale to use when the user
 * picks that language and the current locale's country is not
 * compatible with it. Picked to keep currency/region reasonable.
 */
export const defaultLocaleForLanguage: Record<LanguageCode, Locale> = {
  en: 'en-IE',
  fi: 'fi-FI',
  ar: 'ar-AE',
  pl: 'pl-PL',
  el: 'el-GR',
}

/**
 * Resolve which Locale to navigate to when the user picks `lang`
 * from the language dropdown while currently on `currentLocale`.
 *
 * Rule: if there exists a locale with this language AND the same
 * country as `currentLocale`, prefer it (keeps country/currency
 * stable). Otherwise fall back to `defaultLocaleForLanguage[lang]`.
 */
export function localeForLanguageChange(
  currentLocale: Locale,
  lang: LanguageCode,
): Locale {
  const currentCountry = localeMeta[currentLocale].country
  const sameCountry = (locales as readonly Locale[]).find(
    (l) =>
      localeMeta[l].language === lang &&
      localeMeta[l].country === currentCountry,
  )
  if (sameCountry) return sameCountry
  return defaultLocaleForLanguage[lang]
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
