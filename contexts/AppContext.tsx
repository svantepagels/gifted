'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Country } from '@/lib/countries/types'
import { FALLBACK_COUNTRIES } from '@/lib/countries/fallback'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { DeliveryMethod } from '@/lib/orders/types'

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

export function AppProvider({ children, countries }: AppProviderProps) {
  // Memoize the effective list so identity is stable across renders.
  const effectiveCountries = React.useMemo<Country[]>(
    () => (countries && countries.length > 0 ? countries : FALLBACK_COUNTRIES),
    [countries]
  )

  const initialDefault = React.useMemo<Country>(
    () =>
      effectiveCountries.find((c) => c.code === 'US') ??
      effectiveCountries[0] ??
      FALLBACK_COUNTRIES[0],
    [effectiveCountries]
  )

  const [selectedCountry, setSelectedCountryState] =
    useState<Country>(initialDefault)
  const [cart, setCart] = useState<CartState>(EMPTY_CART)

  // Load saved country from localStorage on mount, validating against
  // the dynamic country list. Re-run if the list changes.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedCountryCode = localStorage.getItem('selectedCountry')
    if (!savedCountryCode) return
    const upper = savedCountryCode.toUpperCase()
    const country = effectiveCountries.find((c) => c.code === upper)
    if (country) {
      setSelectedCountryState(country)
    }
  }, [effectiveCountries])

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', country.code)
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
