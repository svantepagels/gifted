'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Country } from '@/lib/countries/types'
import { FALLBACK_COUNTRIES } from '@/lib/countries/fallback'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { DeliveryMethod } from '@/lib/orders/types'
import {
  buildCountryCookieString,
  COUNTRY_COOKIE_NAME,
} from '@/lib/countries/cookie'

interface CartState {
  product: GiftCardProduct | null
  amount: number | null
  deliveryMethod: DeliveryMethod
  recipientEmail?: string
  giftMessage?: string
  customerEmail?: string
}

interface AppContextValue {
  // Country list — full set of redeemable countries, generated at
  // build time from the Reloadly catalog and passed in via the server
  // layout. Falls back to the hardcoded list if `countries` prop is
  // omitted (e.g. in tests).
  countries: Country[]

  // Country selection
  selectedCountry: Country
  setSelectedCountry: (country: Country) => void

  // Cart state
  cart: CartState
  setCartProduct: (product: GiftCardProduct) => void
  setCartAmount: (amount: number) => void
  setCartDeliveryMethod: (method: DeliveryMethod) => void
  setCartGiftDetails: (email?: string, message?: string) => void
  setCartCustomerEmail: (email: string) => void
  clearCart: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

const EMPTY_CART: CartState = {
  product: null,
  amount: null,
  deliveryMethod: 'self',
}

interface AppProviderProps {
  children: React.ReactNode
  /** Full redeemable country list — provided by the server layout. */
  countries?: Country[]
}

/**
 * Read the `gifted_country` cookie via `document.cookie`.
 * Returns the uppercased ISO-2 code or undefined.
 */
function readCountryCookie(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const re = new RegExp(`(?:^|;\\s*)${COUNTRY_COOKIE_NAME}=([A-Za-z]{2})`)
  const match = document.cookie.match(re)
  return match?.[1]?.toUpperCase()
}

/**
 * Resolves the initial selected country using a deterministic priority:
 *  1. `localStorage.selectedCountry` (explicit user choice)
 *  2. `gifted_country` cookie (geo-IP bootstrap from middleware)
 *  3. `US` (sensible default)
 *  4. First entry in the list
 *  5. `FALLBACK_COUNTRIES[0]` (defensive — empty list)
 *
 * Server-side renders fall through to #3/#4/#5 (no window) so they
 * match the static prerender. The browser then upgrades the state in
 * a `useEffect` if a persisted value was found.
 */
function resolveInitialCountry(list: Country[]): Country {
  if (typeof window !== 'undefined') {
    const ls = window.localStorage
      .getItem('selectedCountry')
      ?.toUpperCase()
    const fromLs = ls ? list.find((c) => c.code === ls) : undefined
    if (fromLs) return fromLs

    const cookieCode = readCountryCookie()
    const fromCookie = cookieCode
      ? list.find((c) => c.code === cookieCode)
      : undefined
    if (fromCookie) return fromCookie
  }
  return (
    list.find((c) => c.code === 'US') ??
    list[0] ??
    FALLBACK_COUNTRIES[0]
  )
}

export function AppProvider({ children, countries }: AppProviderProps) {
  // Memoize the effective list so identity is stable across renders.
  const effectiveCountries = React.useMemo<Country[]>(
    () => (countries && countries.length > 0 ? countries : FALLBACK_COUNTRIES),
    [countries]
  )

  // The lazy initializer keeps SSR/CSR consistent: on the server pass,
  // `window` is undefined so we always pick US/first/fallback. The
  // mount effect below then upgrades from localStorage/cookie if
  // present, which causes at most one re-render before paint.
  const [selectedCountry, setSelectedCountryState] = useState<Country>(() =>
    resolveInitialCountry(
      countries && countries.length > 0 ? countries : FALLBACK_COUNTRIES
    )
  )
  const [cart, setCart] = useState<CartState>(EMPTY_CART)

  // On mount (and whenever the country list changes), resolve the
  // initial country from persisted values. This is the path that
  // honors localStorage + cookie on the client.
  useEffect(() => {
    const resolved = resolveInitialCountry(effectiveCountries)
    setSelectedCountryState(resolved)
  }, [effectiveCountries])

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country)
    if (typeof window !== 'undefined') {
      // localStorage is the source of truth for explicit choice.
      try {
        localStorage.setItem('selectedCountry', country.code)
      } catch {
        // localStorage may be unavailable in some sandboxed contexts;
        // the cookie write below is the fallback persistence layer.
      }
      // Mirror to cookie so middleware-side reads stay in sync and
      // the choice survives in localStorage-restricted contexts.
      try {
        document.cookie = buildCountryCookieString(country.code)
      } catch {
        // document.cookie writes are best-effort; never throw.
      }
    }
  }

  const setCartProduct = (product: GiftCardProduct) => {
    setCart((prev) => ({ ...prev, product, amount: null }))
  }

  const setCartAmount = (amount: number) => {
    setCart((prev) => ({ ...prev, amount }))
  }

  const setCartDeliveryMethod = (method: DeliveryMethod) => {
    setCart((prev) => ({ ...prev, deliveryMethod: method }))
  }

  const setCartGiftDetails = (email?: string, message?: string) => {
    setCart((prev) => ({ ...prev, recipientEmail: email, giftMessage: message }))
  }

  const setCartCustomerEmail = (email: string) => {
    setCart((prev) => ({ ...prev, customerEmail: email }))
  }

  const clearCart = () => {
    setCart(EMPTY_CART)
  }

  return (
    <AppContext.Provider
      value={{
        countries: effectiveCountries,
        selectedCountry,
        setSelectedCountry,
        cart,
        setCartProduct,
        setCartAmount,
        setCartDeliveryMethod,
        setCartGiftDetails,
        setCartCustomerEmail,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
