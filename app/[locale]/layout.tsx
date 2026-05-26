import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Archivo, Inter } from 'next/font/google'
import { AppProvider } from '@/contexts/AppContext'
import { ConsentProvider } from '@/components/consent/ConsentProvider'
import { ConsentBanner } from '@/components/consent/ConsentBanner'
import { ConsentModal } from '@/components/consent/ConsentModal'
import { getAllCountries } from '@/lib/countries/data'
import {
  locales,
  isLocale,
  localeMeta,
  type Locale,
} from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/useMessages'
import '../globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-archivo',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0A1320',
}

/**
 * Pre-render every locale shell at build time.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/**
 * Per-locale SEO metadata (title, description, OpenGraph, Twitter card).
 *
 * Resolved at build/render time from the locale's message JSON. en-*
 * locales share `en.json`; everything else maps to its own file.
 */
export async function generateMetadata({
  params,
}: {
  params: { locale: string }
}): Promise<Metadata> {
  if (!isLocale(params.locale)) return {}
  const locale: Locale = params.locale
  const meta = localeMeta[locale]
  const m = getMessages(locale)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gifted.app'

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: m['meta.home.title'],
      template: '%s | Gifted',
    },
    description: m['meta.home.description'],
    applicationName: 'Gifted',
    keywords: ['gift cards', 'digital gifts', 'online shopping'],
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/icon', type: 'image/png', sizes: '32x32' },
      ],
      apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      siteName: 'Gifted',
      title: m['meta.home.ogTitle'],
      description: m['meta.home.ogDescription'],
      locale: meta.hreflang,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: m['meta.home.ogTitle'],
      description: m['meta.home.ogDescription'],
      images: ['/twitter-image'],
    },
  }
}

interface LocaleLayoutProps {
  children: ReactNode
  params: { locale: string }
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  if (!isLocale(params.locale)) {
    notFound()
  }
  const locale: Locale = params.locale
  const meta = localeMeta[locale]

  // Build-time-generated full country list (every Reloadly country
  // with at least one redeemable product). Memoised via react.cache,
  // so this runs once per build regardless of how many locales render.
  const countries = await getAllCountries()

  return (
    <html
      lang={meta.hreflang}
      dir={meta.direction}
      className={`${archivo.variable} ${inter.variable}`}
    >
      <body>
        <ConsentProvider>
          <AppProvider countries={countries}>{children}</AppProvider>
          <ConsentBanner />
          <ConsentModal />
        </ConsentProvider>
      </body>
    </html>
  )
}
