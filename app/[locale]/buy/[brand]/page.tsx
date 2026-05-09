import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BrandHero } from '@/components/landing/BrandHero'
import { DenominationGrid } from '@/components/landing/DenominationGrid'
import { FeatureBenefits } from '@/components/landing/FeatureBenefits'
import { FAQ } from '@/components/landing/FAQ'
import {
  locales,
  isLocale,
  localeMeta,
  type Locale,
} from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/useMessages'
import {
  getViableCellsForLocale,
  viableLocalesForBrand,
} from '@/lib/landing-pages/viable-cells'
import { getBrandBySlug, brandDisplayName } from '@/lib/landing-pages/brands'
import { resolveCopy } from '@/lib/landing-pages/copy'

interface BrandPageProps {
  params: { locale: string; brand: string }
}

/**
 * Pre-render every viable (locale × brand) cell at build time.
 * Any (locale, brand) combination not enumerated here returns a hard
 * 404 thanks to `dynamicParams = false` below — predictable build
 * output, no surprise dynamic renders.
 */
export async function generateStaticParams() {
  const out: Array<{ locale: string; brand: string }> = []
  for (const locale of locales) {
    const cells = await getViableCellsForLocale(locale)
    for (const cell of cells) {
      out.push({ locale, brand: cell.brand.slug })
    }
  }
  return out
}

export const dynamicParams = false
export const revalidate = 3600

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  if (!isLocale(params.locale)) return {}
  const locale: Locale = params.locale
  const brand = getBrandBySlug(params.brand)
  if (!brand) return {}

  const cells = await getViableCellsForLocale(locale)
  const cell = cells.find((c) => c.brand.slug === brand.slug)
  if (!cell) return {}

  const { copy } = resolveCopy(locale, brand.slug)
  const meta = localeMeta[locale]
  const displayName = brandDisplayName(brand, locale)

  // Build alternates: every locale where this brand is viable, plus
  // an x-default pointing at the canonical English baseline (en-IE).
  const viableLocales = await viableLocalesForBrand(brand.slug, locales)
  const languages: Record<string, string> = {}
  for (const altLocale of viableLocales) {
    languages[altLocale] = `/${altLocale}/buy/${brand.slug}`
  }
  // x-default: prefer en-IE if it's viable; otherwise the first viable locale.
  const xDefaultLocale: Locale = viableLocales.includes('en-IE')
    ? 'en-IE'
    : viableLocales[0] ?? locale
  languages['x-default'] = `/${xDefaultLocale}/buy/${brand.slug}`

  // Defensive: never emit an empty description (Lighthouse SEO ding).
  const description =
    copy.description ||
    `Buy a ${displayName} gift card with instant digital delivery via email.`

  return {
    title: copy.heroTitle,
    description,
    keywords: copy.keywords,
    alternates: {
      canonical: `/${locale}/buy/${brand.slug}`,
      languages,
    },
    openGraph: {
      title: copy.heroTitle,
      description,
      type: 'website',
      locale: meta.hreflang,
      images: cell.products[0]?.logoUrl
        ? [{ url: cell.products[0].logoUrl, alt: `${displayName} gift card` }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.heroTitle,
      description,
    },
  }
}

export default async function BrandLandingPage({ params }: BrandPageProps) {
  if (!isLocale(params.locale)) notFound()
  const locale: Locale = params.locale
  const brand = getBrandBySlug(params.brand)
  if (!brand) notFound()

  const cells = await getViableCellsForLocale(locale)
  const cell = cells.find((c) => c.brand.slug === brand.slug)
  if (!cell) notFound()

  const messages = getMessages(locale)
  const { copy } = resolveCopy(locale, brand.slug)
  const displayName = brandDisplayName(brand, locale)
  const heroLogoUrl = cell.products[0]?.logoUrl

  return (
    <>
      <Header />
      <main className="min-h-screen pb-16">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <BrandHero
            brand={brand}
            displayName={displayName}
            copy={copy}
            heroLogoUrl={heroLogoUrl}
            primaryProduct={cell.products[0]}
            primaryCurrency={cell.primaryCurrency}
          />
          <DenominationGrid
            products={cell.products}
            brand={brand}
            displayName={displayName}
            locale={locale}
            messages={messages}
            primaryCurrency={cell.primaryCurrency}
          />
          <FeatureBenefits messages={messages} />
          <FAQ items={copy.faq} messages={messages} />
        </div>
      </main>
      <Footer />
    </>
  )
}
