import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { locales, defaultLocale } from '@/lib/i18n/config'

/**
 * Matches any path that contains a "." — i.e. a file with an extension
 * such as `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, or any asset
 * served from `/public/*`. We never localize these.
 */
const PUBLIC_FILE = /\.(.*)$/

function getLocaleFromRequest(req: NextRequest): string {
  const headers = { 'accept-language': req.headers.get('accept-language') ?? '' }
  let languages: string[] = []
  try {
    languages = new Negotiator({ headers }).languages()
  } catch {
    languages = []
  }
  // Negotiator returns ['*'] when no Accept-Language header is sent (a
  // common case for health-check probes and curl). intl-localematcher
  // rejects '*' with a RangeError, so filter it out before matching.
  languages = languages.filter((l) => l && l !== '*')
  if (languages.length === 0) {
    return defaultLocale
  }
  try {
    return matchLocale(
      languages,
      locales as unknown as string[],
      defaultLocale
    )
  } catch {
    return defaultLocale
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API, _next internals, and any file with an extension.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  // If pathname already has a supported locale prefix, pass through.
  const pathnameHasLocale = (locales as readonly string[]).some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  )
  if (pathnameHasLocale) return NextResponse.next()

  // Otherwise, negotiate from Accept-Language and 308-redirect.
  const locale = getLocaleFromRequest(req)
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return NextResponse.redirect(url, 308)
}

export const config = {
  // Matcher is the first line of defence; the if-block in middleware()
  // is the belt-and-braces. Together they guarantee API/static paths
  // are never touched.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
