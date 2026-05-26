/**
 * Brand-logo marquee — infinite horizontal scroll between the hero
 * and the search bar on the homepage.
 *
 * Server component. Pulls real brand data via
 * `getViableCellsForLocale(locale)` (the same cached source
 * `PopularBrands` uses), so every logo links to a real
 * `/[locale]/buy/[slug]` landing page.
 *
 * Behavior (CSS-only, no client JS):
 * - Track contains two passes of the logo list side-by-side.
 * - Keyframe `marquee-scroll` translates the track by `-50%`, which
 *   is exactly one pass width → seamless loop.
 * - Pauses on hover (desktop / `hover: hover` only); continues on
 *   mobile.
 * - Pauses on `:focus-within` for keyboard users.
 * - Respects `prefers-reduced-motion` (animation off, manual scroll).
 *
 * If fewer than `MIN_LOGOS` viable brands exist, the component
 * returns `null` — a 3-logo marquee looks broken, better to hide it.
 */

import Link from 'next/link'
import Image from 'next/image'
import type { Locale } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/href'
import { type Messages } from '@/lib/i18n/useMessages'
import { brandDisplayName } from '@/lib/landing-pages/brands'
import { getViableCellsForLocale } from '@/lib/landing-pages/viable-cells'

const MAX_LOGOS = 20
const MIN_LOGOS = 4

interface BrandMarqueeProps {
  locale: Locale
  messages: Messages
}

export async function BrandMarquee({ locale, messages }: BrandMarqueeProps) {
  const cells = await getViableCellsForLocale(locale)
  const withLogos = cells
    .filter((c) => Boolean(c.products[0]?.logoUrl))
    .slice(0, MAX_LOGOS)

  if (withLogos.length < MIN_LOGOS) return null

  const ariaLabel =
    messages['landing.marquee.aria'] ?? 'Available gift card brands'

  // Two passes for seamless loop. aria-hidden on the duplicate so AT
  // doesn't read each brand twice.
  const passes = [
    { items: withLogos, ariaHidden: false },
    { items: withLogos, ariaHidden: true },
  ]

  return (
    <section
      aria-label={ariaLabel}
      className="marquee-section relative -mx-4 sm:-mx-6 lg:-mx-8 my-6 md:my-8 overflow-hidden"
    >
      {/* Edge fade masks — soft fade so logos don't pop in/out hard */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 z-10 bg-gradient-to-r from-surface-container-lowest to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 z-10 bg-gradient-to-l from-surface-container-lowest to-transparent"
      />

      <div className="marquee-track flex w-max items-center gap-6 md:gap-10 py-3 md:py-4">
        {passes.map((pass, passIdx) =>
          pass.items.map((cell, i) => {
            const logoUrl = cell.products[0]?.logoUrl
            if (!logoUrl) return null
            const display = brandDisplayName(cell.brand, locale)
            const href = localeHref(locale, `/buy/${cell.brand.slug}`)
            return (
              <Link
                key={`${passIdx}-${cell.brand.slug}-${i}`}
                href={href}
                aria-hidden={pass.ariaHidden || undefined}
                tabIndex={pass.ariaHidden ? -1 : 0}
                aria-label={`${display} gift cards`}
                className="marquee-logo group flex-shrink-0 inline-flex items-center justify-center h-12 md:h-16 px-2 md:px-3 rounded-lg bg-white border border-outline-variant hover:shadow-ambient-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <Image
                  src={logoUrl}
                  alt={pass.ariaHidden ? '' : `${display} logo`}
                  width={96}
                  height={48}
                  sizes="96px"
                  loading="lazy"
                  className="max-h-8 md:max-h-10 w-auto object-contain"
                />
              </Link>
            )
          })
        )}
      </div>
    </section>
  )
}
