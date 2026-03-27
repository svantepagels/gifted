import { Country } from './types'

export const COUNTRIES: Country[] = [
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    currencySymbol: '$',
    flag: '🇺🇸',
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    currencySymbol: '£',
    flag: '🇬🇧',
  },
  {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    currencySymbol: 'C$',
    flag: '🇨🇦',
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    currencySymbol: 'A$',
    flag: '🇦🇺',
  },
  {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇩🇪',
  },
  {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇫🇷',
  },
  {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇪🇸',
  },
  {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    currencySymbol: '€',
    flag: '🇮🇹',
  },
  {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    currencySymbol: 'R$',
    flag: '🇧🇷',
  },
  {
    code: 'MX',
    name: 'Mexico',
    currency: 'MXN',
    currencySymbol: 'MX$',
    flag: '🇲🇽',
  },
]

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code)
}

export function getDefaultCountry(): Country {
  return COUNTRIES[0] // US by default
}
