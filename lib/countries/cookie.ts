/**
 * Constants + helpers for the persisted-country cookie.
 *
 * Client- AND server-safe (pure string helpers, no `document` /
 * `next/headers` dependencies). Used by:
 *  - `middleware.ts` to bootstrap geo → cookie on first request
 *  - `contexts/AppContext.tsx` to hydrate the initial country choice
 *    and to mirror the user's explicit selection
 *
 * The cookie complements `localStorage` — localStorage wins as the
 * source of truth for "user picked this", the cookie exists so that
 * geo-IP defaults can be applied middleware-side without a client
 * round trip, and so the choice survives in environments where
 * localStorage is sandboxed (some incognito modes).
 */

export const COUNTRY_COOKIE_NAME = 'gifted_country'
export const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/**
 * Returns the (uppercased) ISO 3166-1 alpha-2 code, or undefined if
 * the value is missing or doesn't match the two-letter pattern.
 */
export function parseCountryCookie(
  value: string | undefined
): string | undefined {
  if (!value) return undefined
  const v = value.trim().toUpperCase()
  return /^[A-Z]{2}$/.test(v) ? v : undefined
}

/**
 * Build a `document.cookie`-compatible cookie string for client-side
 * writes. Path=/, Lax, 1 year, not Secure-only so it survives
 * http → https handoff in preview deployments.
 */
export function buildCountryCookieString(code: string): string {
  const c = code.toUpperCase()
  return `${COUNTRY_COOKIE_NAME}=${c}; Path=/; Max-Age=${COUNTRY_COOKIE_MAX_AGE}; SameSite=Lax`
}
