import type { Metadata } from 'next'
import { Archivo_Black, Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-archivo-black',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable}`}>
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
