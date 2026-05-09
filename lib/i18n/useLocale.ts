'use client'

import { usePathname } from 'next/navigation'
import { isLocale, defaultLocale, type Locale } from './config'

/**
 * Read the active locale from the URL on the client.
 *
 * Because middleware guarantees every public path starts with a valid
 * locale segment, the parse will succeed in normal use. The fallback to
 * `defaultLocale` is purely defensive (e.g. transitional renders during
 * router navigation).
 */
export function useLocale(): Locale {
  const pathname = usePathname() ?? ''
  const seg = pathname.split('/')[1] ?? ''
  return isLocale(seg) ? seg : defaultLocale
}
