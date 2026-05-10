import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Archivo, Inter, Playfair_Display } from 'next/font/google'
import { AppProvider } from '@/contexts/AppContext'
import { getAllCountries } from '@/lib/countries/data'
import {
  locales,
  isLocale,
  localeMeta,
  type Locale,
} from '@/lib/i18n/config'
import '../globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gifted.app'
  ),
  title: {
    default: 'Gifted — Digital Gift Cards',
    template: '%s | Gifted',
  },
  description:
    'Buy digital gift cards for brands you love. Instant delivery worldwide.',
  applicationName: 'Gifted',
  keywords: ['gift cards', 'digital gifts', 'online shopping'],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'Gifted',
    title: 'Gifted — Digital Gift Cards',
    description:
      'Buy digital gift cards for brands you love. Instant delivery worldwide.',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gifted — Digital Gift Cards',
    description:
      'Buy digital gift cards for brands you love. Instant delivery worldwide.',
    images: ['/twitter-image'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0A1320',
}

/**
 * Pre-render every locale shell at build time.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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
      className={`${archivo.variable} ${inter.variable} ${playfair.variable}`}
    >
      <body>
        <AppProvider countries={countries}>{children}</AppProvider>
      </body>
    </html>
  )
}
