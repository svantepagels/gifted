import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/browse/HeroSection'
import { SearchBar } from '@/components/shared/SearchBar'
import { CategoryChips } from '@/components/shared/CategoryChips'
import { ProductGrid } from '@/components/browse/ProductGrid'
import { TrustSection } from '@/components/browse/TrustSection'
import { PopularBrands } from '@/components/landing/PopularBrands'
import { giftCardService } from '@/lib/giftcards/service'
import { isLocale, type Locale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/useMessages'

// Make the home page statically rendered with ISR. Filtering by
// search/category is done client-side in ProductGrid using
// useSearchParams, so the server payload is the same for everyone.
export const dynamic = 'force-static'
export const revalidate = 600 // 10 min — Reloadly catalog rarely changes

interface HomePageProps {
  params: { locale: string }
}

export default async function HomePage({ params }: HomePageProps) {
  if (!isLocale(params.locale)) notFound()
  const locale: Locale = params.locale
  const messages = getMessages(locale)

  const [products, categories] = await Promise.all([
    giftCardService.getProducts({}),
    giftCardService.getCategories(),
  ])

  return (
    <>
      <Header />
      <main className="min-h-screen pb-16">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection messages={messages} />

          {/* Mobile-only stacked controls — preserves the original mobile fold layout */}
          <div className="md:hidden">
            <div className="mb-6">
              <Suspense fallback={<div className="h-12" />}>
                <SearchBar />
              </Suspense>
            </div>
            <div className="mb-6">
              <Suspense fallback={<div className="h-10" />}>
                <CategoryChips categories={categories} />
              </Suspense>
            </div>
          </div>

          {/* Tablet/desktop unified control bar — sticky under the header */}
          <div className="hidden md:block sticky top-16 md:top-20 z-30 bg-surface-container-lowest/95 backdrop-blur supports-[backdrop-filter]:bg-surface-container-lowest/80 border-b border-outline-variant -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-6">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 w-full max-w-[480px]">
                <Suspense fallback={<div className="h-11" />}>
                  <SearchBar compact />
                </Suspense>
              </div>
              <div className="flex-1 min-w-0">
                <Suspense fallback={<div className="h-10" />}>
                  <CategoryChips categories={categories} />
                </Suspense>
              </div>
            </div>
          </div>

          <div id="products" className="mb-16 scroll-mt-24">
            <ProductGrid products={products} />
          </div>

          {/* Internal-link block to per-locale brand landing pages. */}
          <Suspense fallback={null}>
            <PopularBrands locale={locale} messages={messages} />
          </Suspense>

          <TrustSection />
        </div>
      </main>
      <Footer />
    </>
  )
}
