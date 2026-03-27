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

export function calculateServiceFee(amount: number): number {
  // Simple 5% + $1 fee structure
  // TODO: Replace with actual fee calculation logic
  const percentageFee = amount * 0.05
  const fixedFee = 1.00
  return Math.round((percentageFee + fixedFee) * 100) / 100
}
