'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { CountrySelector } from '@/components/shared/CountrySelector'
import { useApp } from '@/contexts/AppContext'

export function Header() {
  const { cart } = useApp()
  const hasItemInCart = cart.product && cart.amount

  return (
    <header
      aria-label="Main"
      className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur supports-[backdrop-filter]:bg-surface-container-lowest/80 border-b border-outline-variant"
    >
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="font-archivo-black text-[16px] leading-none tracking-tighter text-primary uppercase hover:opacity-80 transition-opacity"
          >
            GIFTED
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <CountrySelector />

            <button
              className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-5 w-5 text-surface-on-surface-variant" />
              {hasItemInCart && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-tertiary-container rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
