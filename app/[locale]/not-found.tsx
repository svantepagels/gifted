import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Search } from 'lucide-react'

/**
 * 404 page for paths inside a valid locale that don't match a route.
 * English-only — translated copy is reserved for the
 * product-specific not-found at `[locale]/gift-card/[slug]/not-found.tsx`.
 */
export default function LocaleNotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-surface-container-high rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-surface-on-surface-variant" />
          </div>
          <h1 className="font-archivo-black text-[32px] md:text-[40px] uppercase tracking-tight text-surface-on-surface">
            404
          </h1>
          <p className="text-body-lg text-surface-on-surface-variant">
            Page not found.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
