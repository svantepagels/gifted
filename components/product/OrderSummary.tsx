'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { calculateServiceFee } from '@/lib/utils/currency'
import { formatCurrencyForLocale } from '@/lib/i18n/format-currency'
import { Shield, Zap } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { localeHref } from '@/lib/i18n/href'
import { getMessages } from '@/lib/i18n/useMessages'

interface OrderSummaryProps {
  productName: string
  amount: number | null
  currency: string
  onContinue?: () => void
  sticky?: boolean
}

export function OrderSummary({
  productName,
  amount,
  currency,
  onContinue,
  sticky = false,
}: OrderSummaryProps) {
  const router = useRouter()
  const locale = useLocale()
  const m = getMessages(locale)

  const serviceFee = amount ? calculateServiceFee(amount) : 0
  const total = amount ? amount + serviceFee : 0
  const isComplete = amount !== null && amount > 0
  const fmt = (n: number) => formatCurrencyForLocale(n, currency, locale)

  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      router.push(localeHref(locale, '/checkout'))
    }
  }

  return (
    <div className={`bg-surface-container-lowest rounded-lg p-6 ${sticky ? 'sticky top-24' : ''}`}>
      <h2 className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
        {m['orderSummary.heading']}
      </h2>

      <div className="space-y-3 mb-6 pb-6 border-b border-outline-variant">
        <div className="flex justify-between text-body-md">
          <span className="text-surface-on-surface-variant">{m['orderSummary.giftCard']}</span>
          <span className="text-surface-on-surface font-medium">{productName}</span>
        </div>

        <div className="flex justify-between text-body-md">
          <span className="text-surface-on-surface-variant">{m['orderSummary.amount']}</span>
          <span className="text-surface-on-surface font-medium">
            {amount ? fmt(amount) : '—'}
          </span>
        </div>

        <div className="flex justify-between text-body-md">
          <span className="text-surface-on-surface-variant">{m['orderSummary.serviceFee']}</span>
          <span className="text-surface-on-surface font-medium">
            {amount ? fmt(serviceFee) : '—'}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-baseline mb-6">
        <span className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary">
          {m['orderSummary.total']}
        </span>
        <span className="text-[36px] font-extrabold text-primary">
          {amount ? fmt(total) : '—'}
        </span>
      </div>

      <Button
        fullWidth
        variant="primary"
        disabled={!isComplete}
        onClick={handleContinue}
        className="mb-3"
      >
        {m['orderSummary.continueAsGuest']}
      </Button>

      <Button
        fullWidth
        variant="secondary"
        disabled={!isComplete}
        className="mb-6"
      >
        {m['orderSummary.signIn']}
      </Button>

      {/* Trust Indicators */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-label-md text-surface-on-surface-variant">
          <Shield className="h-4 w-4" />
          <span>{m['checkout.trust.securePayment']}</span>
        </div>
        <div className="flex items-center gap-2 text-label-md text-surface-on-surface-variant">
          <Zap className="h-4 w-4" />
          <span>{m['checkout.trust.instantDelivery']}</span>
        </div>
      </div>
    </div>
  )
}
