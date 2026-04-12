import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Home, Search } from 'lucide-react'

/**
 * Product Not Found Page
 * 
 * Shown when a product slug doesn't exist in the catalog
 */
export default function ProductNotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          {/* Icon */}
          <div className="w-24 h-24 mx-auto bg-surface-container-high rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-surface-on-surface-variant" />
          </div>
          
          {/* Title */}
          <h1 className="font-archivo-black text-[32px] md:text-[40px] uppercase tracking-tight text-surface-on-surface">
            Product Not Found
          </h1>
          
          {/* Message */}
          <p className="text-body-lg text-surface-on-surface-variant">
            Sorry, we couldn't find the gift card you're looking for. 
            It may have been removed or is no longer available.
          </p>
          
          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-surface-on-primary rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-primary-hover transition-all shadow-lg"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            
            <Link
              href="/#categories"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-high text-surface-on-surface rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-surface-container-highest transition-all"
            >
              <Search className="w-5 h-5" />
              Browse Catalog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
