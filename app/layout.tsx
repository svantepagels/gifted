import type { Metadata } from 'next'
import { Archivo, Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${playfair.variable}`}>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
