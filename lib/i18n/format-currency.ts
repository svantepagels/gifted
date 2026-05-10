import type { Locale } from './config'

/**
 * Locale-aware currency formatter using `Intl.NumberFormat`.
 *
 * Uses the full BCP 47 locale (e.g. 'fi-FI' → '10,00 €' with comma
 * decimal; 'en-IE' → '€10.00'; 'ar-AE' → Arabic-numeral output).
 *
 * Replaces the older `formatCurrency` in `lib/utils/currency.ts` which
 * defaulted to `en-US` and produced US-style formatting on every
 * locale.
 *
 * Falls back to a plain `${currency} ${amount}` string when
 * Intl.NumberFormat throws (e.g. invalid currency codes in degraded
 * runtimes).
 */
export function formatCurrencyForLocale(
  amount: number,
  currency: string,
  locale: Locale | string
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}
