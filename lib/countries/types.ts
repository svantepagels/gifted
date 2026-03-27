export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
  currency: string
  currencySymbol: string
  flag: string // emoji flag
}

export interface CurrencyFormat {
  symbol: string
  code: string
  locale: string
}
