'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Home, Search } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'
import { localeHref } from '@/lib/i18n/href'

/**
 * Product Not Found Page
 *
 * Shown when a product slug doesn't exist in the catalog. Renders inside
 * the active locale; the copy is translated via `getMessages()`.
 *
 * Note: switched to `'use client'` because `not-found.tsx` does not
 * receive `params` in App Router 14, so we read the locale from the URL
 * via `useLocale()` instead of from server-side params.
 */
export default function ProductNotFound() {
  const locale = useLocale()
  const m = getMessages(locale)

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
            {m['notFound.title']}
          </h1>

          {/* Message */}
          <p className="text-body-lg text-surface-on-surface-variant">
            {m['notFound.message']}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href={localeHref(locale, '/')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-on-secondary rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-secondary-hover transition-all shadow-lg"
            >
              <Home className="w-5 h-5" />
              {m['notFound.homeCta']}
            </Link>

            <Link
              href={localeHref(locale, '/#categories')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-container-high text-surface-on-surface rounded-full font-archivo-black text-[14px] uppercase tracking-[1.5px] hover:bg-surface-container-highest transition-all"
            >
              <Search className="w-5 h-5" />
              {m['notFound.searchCta']}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
