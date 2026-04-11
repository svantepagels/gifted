export type DenominationType = 'FIXED' | 'RANGE'

export interface FixedDenomination {
  value: number
  label: string
}

export interface DenominationRange {
  min: number
  max: number
  step?: number
}

export interface GiftCardProduct {
  id: string
  slug: string
  brandName: string
  category: string
  logoUrl: string
  countryCodes: string[] // Countries where this product is available
  denominationType: DenominationType
  fixedDenominations?: FixedDenomination[]
  denominationRange?: DenominationRange
  currency: string // Primary currency
  supportsCustomMessage: boolean
  redemptionInstructions: string
  termsUrl?: string
  isDigital: boolean
  estimatedDeliveryMinutes: number
  _meta?: {
    reloadlyProductId?: number
    reloadlyBrandId?: number
    senderFee?: number
    discountPercentage?: number
    global?: boolean
  }
}

export interface GiftCardFilters {
  search?: string
  category?: string
  countryCode?: string
}
