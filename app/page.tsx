import { Suspense } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/browse/HeroSection'
import { SearchBar } from '@/components/shared/SearchBar'
import { CategoryChips } from '@/components/shared/CategoryChips'
import { ProductGrid } from '@/components/browse/ProductGrid'
import { TrustSection } from '@/components/browse/TrustSection'
import { giftCardService } from '@/lib/giftcards/service'

async function getProducts(searchParams: { q?: string; category?: string; country?: string }) {
  return await giftCardService.getProducts({
    search: searchParams.q,
    category: searchParams.category,
    countryCode: searchParams.country,
  })
}

async function getCategories() {
  return await giftCardService.getCategories()
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; category?: string; country?: string }
}) {
  const [products, categories] = await Promise.all([
    getProducts(searchParams),
    getCategories(),
  ])
  
  return (
    <>
      <Header />
      <main className="min-h-screen pb-8 md:pb-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          
          <div className="mb-8">
            <Suspense fallback={<div className="h-12" />}>
              <SearchBar />
            </Suspense>
          </div>
          
          <div className="mb-8">
            <Suspense fallback={<div className="h-10" />}>
              <CategoryChips categories={categories} />
            </Suspense>
          </div>
          
          <div className="mb-16">
            <ProductGrid products={products} />
          </div>
          
          <TrustSection />
        </div>
      </main>
      <Footer />
    </>
  )
}
