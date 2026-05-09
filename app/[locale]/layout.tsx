import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { Archivo, Inter, Playfair_Display } from 'next/font/google'
import { AppProvider } from '@/contexts/AppContext'
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
  title: 'GIFTED - Digital Gift Cards',
  description: 'Buy digital gift cards for brands you love. Instant delivery.',
  keywords: ['gift cards', 'digital gifts', 'online shopping'],
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

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isLocale(params.locale)) {
    notFound()
  }
  const locale: Locale = params.locale
  const meta = localeMeta[locale]

  return (
    <html
      lang={meta.hreflang}
      dir={meta.direction}
      className={`${archivo.variable} ${inter.variable} ${playfair.variable}`}
    >
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
