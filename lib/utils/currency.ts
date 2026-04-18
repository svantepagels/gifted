export function formatCurrency(
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    GBP: '£',
    EUR: '€',
    CAD: 'C$',
    AUD: 'A$',
    BRL: 'R$',
    MXN: 'MX$',
  }
  
  return symbols[currency] || currency
}

/**
 * Canonical service fee formula: 5% of the gift card amount + $1.
 *
 * This is the single source of truth — the client shows the fee, the server
 * validates the fee, and the checkout total uses this function. Do not
 * duplicate this calculation elsewhere.
 */
export function calculateServiceFee(amount: number): number {
  const percentageFee = amount * 0.05
  const fixedFee = 1.0
  return Math.round((percentageFee + fixedFee) * 100) / 100
}
