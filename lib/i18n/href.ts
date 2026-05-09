import type { Locale } from './config'
import { defaultLocale } from './config'

/**
 * Prefix an in-app path with the current locale.
 *
 * Rules:
 * - External URLs (http://, https://, mailto:, tel:) are returned unchanged.
 * - Pure query/hash fragments (`?...`, `#...`) are returned unchanged so
 *   they stay relative to the current page.
 * - Absolute in-app paths (`/foo`, `/?q=x`) gain the locale prefix.
 * - The bare root `/` becomes `/<locale>`.
 *
 * Falls back to `defaultLocale` when no locale is provided — defensive
 * only; in practice every caller knows its locale via `useLocale()` or
 * `params.locale`.
 */
export function localeHref(
  locale: Locale | string | undefined,
  path: string
): string {
  const loc = locale ?? defaultLocale
  if (!path) return `/${loc}`
  if (/^(https?:|mailto:|tel:)/i.test(path)) return path
  if (path.startsWith('?') || path.startsWith('#')) return path
  if (path === '/') return `/${loc}`
  if (path.startsWith('/')) return `/${loc}${path}`
  return path
}
