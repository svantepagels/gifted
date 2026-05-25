import { NextRequest, NextResponse } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { locales, defaultLocale } from '@/lib/i18n/config'
import {
  COUNTRY_COOKIE_NAME,
  COUNTRY_COOKIE_MAX_AGE,
  parseCountryCookie,
} from '@/lib/countries/cookie'

/**
 * Matches any path that contains a "." — i.e. a file with an extension
 * such as `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, or any asset
 * served from `/public/*`. We never localize these.
 */
const PUBLIC_FILE = /\.(.*)$/

/**
 * Next.js file-convention metadata routes that live at the root of `app/`
 * (not under `app/[locale]/`). They have no file extension so the
 * `PUBLIC_FILE` regex does not catch them, but they must NEVER be
 * locale-redirected — browsers and OG/Twitter crawlers won't follow the
 * 308 and the favicon / social preview will silently break.
 */
const METADATA_ROUTES = new Set([
  '/icon',
  '/apple-icon',
  '/opengraph-image',
  '/twitter-image',
  '/manifest.webmanifest',
  '/sitemap.xml',
  '/robots.txt',
])

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

/**
 * If the `gifted_country` cookie isn't set yet, derive it from Vercel's
 * geo-IP data. On preview/prod, Vercel exposes both:
 *   - `req.geo.country` (typed) — preferred
 *   - `x-vercel-ip-country` request header — fallback for older runtimes
 *
 * We never overwrite an existing cookie. The client-side write (via
 * `setSelectedCountry`) is the source of truth once the user has
 * expressed a preference.
 */
function deriveGeoCountry(req: NextRequest): string | undefined {
  const existing = parseCountryCookie(req.cookies.get(COUNTRY_COOKIE_NAME)?.value)
  if (existing) return undefined

  // `geo` is non-standard but supplied by Vercel's edge runtime.
  const geoCountry =
    (req as unknown as { geo?: { country?: string } }).geo?.country ??
    req.headers.get('x-vercel-ip-country') ??
    undefined

  if (!geoCountry) return undefined
  const upper = geoCountry.toUpperCase()
  return /^[A-Z]{2}$/.test(upper) ? upper : undefined
}

function attachGeoCookie(
  res: NextResponse,
  geoCountry: string | undefined
): NextResponse {
  if (!geoCountry) return res
  res.cookies.set(COUNTRY_COOKIE_NAME, geoCountry, {
    maxAge: COUNTRY_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  })
  return res
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip API, _next internals, and any file with an extension.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname) ||
    METADATA_ROUTES.has(pathname)
  ) {
    return NextResponse.next()
  }

  // Compute the geo cookie once — same value attached to whichever
  // response we end up returning below.
  const geoCookieToSet = deriveGeoCountry(req)

  // If pathname already has a supported locale prefix, pass through.
  const pathnameHasLocale = (locales as readonly string[]).some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  )
  if (pathnameHasLocale) {
    return attachGeoCookie(NextResponse.next(), geoCookieToSet)
  }

  // Otherwise, negotiate from Accept-Language and 308-redirect.
  const locale = getLocaleFromRequest(req)
  const url = req.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  return attachGeoCookie(NextResponse.redirect(url, 308), geoCookieToSet)
}

export const config = {
  // Matcher is the first line of defence; the if-block in middleware()
  // is the belt-and-braces. Together they guarantee API/static paths
  // are never touched.
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
