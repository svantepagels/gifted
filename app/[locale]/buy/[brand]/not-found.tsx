import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Search } from 'lucide-react'

/**
 * Branded 404 for a (locale × brand) combination that isn't in our
 * generateStaticParams output.
 *
 * Rendered when:
 *   - the brand slug is not in BRANDS, OR
 *   - the brand isn't viable for this locale's country.
 *
 * Copy stays English here (matches the parent `[locale]/not-found.tsx`
 * convention). Per-locale translation can come later once Task 3+ is
 * merged.
 */
export default function BrandNotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-surface-container-high rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-surface-on-surface-variant" />
          </div>
          <h1 className="font-archivo text-display-sm md:text-display-md uppercase tracking-tight text-surface-on-surface">
            Brand not available in this region
          </h1>
          <p className="text-body-lg text-surface-on-surface-variant">
            We couldn&apos;t find this brand for your locale. It may not be
            available in this country, or the URL might be wrong.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full bg-secondary text-secondary-on-secondary text-[13px] font-medium uppercase tracking-[0.5px] hover:bg-secondary-hover transition-colors"
          >
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
