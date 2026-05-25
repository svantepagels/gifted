/**
 * Homepage internal-link block — "Popular gift cards in {country}".
 *
 * Server component. Calls `getViableCellsForLocale(locale)` (cached at
 * build time via `react.cache`), takes the top 8 cells in catalogue
 * order, and renders a small grid of brand chips linking to
 * `/[locale]/buy/[brand]`. The internal-link signal is the SEO point
 * here — Google needs same-domain anchors to discover the new pages.
 */

import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/href'
import { t, type Messages } from '@/lib/i18n/useMessages'
import { brandDisplayName } from '@/lib/landing-pages/brands'
import { getViableCellsForLocale } from '@/lib/landing-pages/viable-cells'

interface PopularBrandsProps {
  locale: Locale
  messages: Messages
}

const COUNTRY_NAME: Record<Locale, string> = {
  'fi-FI': 'Suomi',
  'en-IE': 'Ireland',
  'en-AU': 'Australia',
  'ar-AE': 'الإمارات',
  'ar-SA': 'السعودية',
  'pl-PL': 'Polska',
  'el-GR': 'Ελλάδα',
  'en-MT': 'Malta',
  'en-NZ': 'New Zealand',
}

const MAX_TILES = 8

export async function PopularBrands({ locale, messages }: PopularBrandsProps) {
  const cells = await getViableCellsForLocale(locale)
  if (cells.length === 0) return null

  const top = cells.slice(0, MAX_TILES)

  return (
    <section
      className="my-12 md:my-16"
      aria-labelledby="popular-brands-heading"
    >
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2
          id="popular-brands-heading"
          className="font-archivo text-headline-md md:text-headline-lg text-surface-on-surface"
        >
          {t(messages, 'landing.popular.heading', {
            country: COUNTRY_NAME[locale],
          })}
        </h2>
        <Link
          href={localeHref(locale, '/#products')}
          className="hidden md:inline-flex items-center gap-1 text-body-md text-primary hover:underline whitespace-nowrap"
        >
          {messages['landing.popular.viewAll']}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 list-none p-0 m-0">
        {top.map(({ brand, products }) => {
          const logoUrl = products[0]?.logoUrl
          const display = brandDisplayName(brand, locale)
          const href = localeHref(locale, `/buy/${brand.slug}`)
          return (
            <li key={brand.slug}>
              <Link
                href={href}
                className="group flex flex-col items-center justify-center min-h-[112px] md:min-h-[140px] rounded-xl border border-outline-variant bg-surface-container-lowest hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all duration-200 p-3 md:p-4"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-white border border-outline-variant flex items-center justify-center overflow-hidden mb-2 md:mb-3 p-1.5">
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={`${display} logo`}
                      width={56}
                      height={56}
                      sizes="56px"
                      loading="lazy"
                      className="max-w-full max-h-full w-auto h-auto object-contain"
                    />
                  ) : (
                    <span
                      className="text-headline-sm font-archivo text-surface-on-surface-variant"
                      aria-hidden="true"
                    >
                      {(display[0] ?? '?').toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="font-inter text-body-md text-surface-on-surface text-center group-hover:text-primary transition-colors">
                  {display}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      <div className="mt-6 md:hidden text-center">
        <Link
          href={localeHref(locale, '/#products')}
          className="inline-flex items-center gap-1 text-body-md text-primary hover:underline"
        >
          {messages['landing.popular.viewAll']}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
