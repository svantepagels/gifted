import Link from 'next/link'
import Image from 'next/image'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

/**
 * 404 page for paths inside a valid locale that don't match a route.
 * English-only — translated copy is reserved for the
 * product-specific not-found at `[locale]/gift-card/[slug]/not-found.tsx`.
 */
export default function LocaleNotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center gap-6">
        <Image
          src="/brand/gifted-logo.svg"
          alt="Gifted"
          width={140}
          height={40}
          priority
          className="h-10 w-auto"
        />
        <h1 className="font-archivo-black text-[32px] md:text-[40px] uppercase tracking-tight text-surface-on-surface">
          404 — Page not found
        </h1>
        <p className="text-body-lg text-surface-on-surface-variant max-w-md">
          We couldn&apos;t find that page. It may have moved or never existed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-primary text-on-primary px-6 py-3 text-label-lg hover:opacity-90 transition-opacity"
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  )
}
