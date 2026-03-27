'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Country } from '@/lib/countries/types'
import { getDefaultCountry, getCountryByCode } from '@/lib/countries/data'
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<Country>(getDefaultCountry())
  const [cart, setCart] = useState<CartState>(EMPTY_CART)
  
  // Load country from localStorage on mount
  useEffect(() => {
    const savedCountryCode = localStorage.getItem('selectedCountry')
    if (savedCountryCode) {
      const country = getCountryByCode(savedCountryCode)
      if (country) {
        setSelectedCountryState(country)
      }
    }
  }, [])
  
  // Save country to localStorage when it changes
  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country)
    localStorage.setItem('selectedCountry', country.code)
  }
  
  const setCartProduct = (product: GiftCardProduct) => {
    setCart(prev => ({ ...prev, product, amount: null }))
  }
  
  const setCartAmount = (amount: number) => {
    setCart(prev => ({ ...prev, amount }))
  }
  
  const setCartDeliveryMethod = (method: DeliveryMethod) => {
    setCart(prev => ({ ...prev, deliveryMethod: method }))
  }
  
  const setCartGiftDetails = (email?: string, message?: string) => {
    setCart(prev => ({ ...prev, recipientEmail: email, giftMessage: message }))
  }
  
  const setCartCustomerEmail = (email: string) => {
    setCart(prev => ({ ...prev, customerEmail: email }))
  }
  
  const clearCart = () => {
    setCart(EMPTY_CART)
  }
  
  return (
    <AppContext.Provider
      value={{
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
