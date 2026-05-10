'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { formatCurrencyForLocale } from '@/lib/i18n/format-currency'
import { Input } from '@/components/shared/Input'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages, t } from '@/lib/i18n/useMessages'

interface AmountSelectorProps {
  product: GiftCardProduct
  currency: string
  selectedAmount: number | null
  onAmountChange: (amount: number) => void
}

export function AmountSelector({
  product,
  currency,
  selectedAmount,
  onAmountChange,
}: AmountSelectorProps) {
  const locale = useLocale()
  const m = getMessages(locale)
  const [customAmount, setCustomAmount] = useState('')
  const [customError, setCustomError] = useState('')

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setCustomError('')

    const num = parseFloat(value)
    if (isNaN(num)) {
      setCustomError(m['pdp.amount.errorInvalid'])
      return
    }

    if (product.denominationRange) {
      if (num < product.denominationRange.min) {
        setCustomError(
          t(m, 'pdp.amount.errorMin', {
            amount: formatCurrencyForLocale(product.denominationRange.min, currency, locale),
          })
        )
        return
      }
      if (num > product.denominationRange.max) {
        setCustomError(
          t(m, 'pdp.amount.errorMax', {
            amount: formatCurrencyForLocale(product.denominationRange.max, currency, locale),
          })
        )
        return
      }
    }

    onAmountChange(num)
  }

  if (product.denominationType === 'FIXED' && product.fixedDenominations) {
    return (
      <div>
        <label className="block text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
          {m['pdp.amount.selectHeading']}
        </label>
        <div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3"
          role="radiogroup"
          aria-label={m['pdp.amount.selectHeading']}
          data-testid="amount-selector-grid"
        >
          {product.fixedDenominations.map((denom) => {
            const isSelected = selectedAmount === denom.value
            const formatted = formatCurrencyForLocale(denom.value, currency, locale)

            return (
              <motion.button
                key={denom.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={formatted}
                onClick={() => onAmountChange(denom.value)}
                data-testid="amount-card"
                data-amount={denom.value}
                className={`
                  flex items-center justify-center text-center break-words
                  min-h-[64px] sm:min-h-[80px] p-3 sm:p-4
                  rounded-lg border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-secondary bg-secondary/5'
                    : 'border-outline-variant hover:border-surface-on-surface-variant'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-surface-on-surface leading-tight">
                  {formatted}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  if (product.denominationType === 'RANGE' && product.denominationRange) {
    return (
      <div>
        <label className="block text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-2">
          {m['pdp.amount.enterHeading']}
        </label>
        <p className="text-label-md text-surface-on-surface-variant mb-4">
          {t(m, 'pdp.amount.range', {
            min: formatCurrencyForLocale(product.denominationRange.min, currency, locale),
            max: formatCurrencyForLocale(product.denominationRange.max, currency, locale),
          })}
        </p>
        <Input
          type="number"
          value={customAmount}
          onChange={(e) => handleCustomAmountChange(e.target.value)}
          placeholder={t(m, 'pdp.amount.placeholder', {
            example: String(product.denominationRange.min),
          })}
          min={product.denominationRange.min}
          max={product.denominationRange.max}
          step={product.denominationRange.step || 1}
          error={customError}
          data-testid="amount-range-input"
        />
      </div>
    )
  }

  return null
}
