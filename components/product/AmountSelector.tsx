'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GiftCardProduct } from '@/lib/giftcards/types'
import { formatCurrency } from '@/lib/utils/currency'
import { Input } from '@/components/shared/Input'

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
  const [customAmount, setCustomAmount] = useState('')
  const [customError, setCustomError] = useState('')
  
  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setCustomError('')
    
    const num = parseFloat(value)
    if (isNaN(num)) {
      setCustomError('Please enter a valid amount')
      return
    }
    
    if (product.denominationRange) {
      if (num < product.denominationRange.min) {
        setCustomError(`Minimum amount is ${formatCurrency(product.denominationRange.min, currency)}`)
        return
      }
      if (num > product.denominationRange.max) {
        setCustomError(`Maximum amount is ${formatCurrency(product.denominationRange.max, currency)}`)
        return
      }
    }
    
    onAmountChange(num)
  }
  
  if (product.denominationType === 'FIXED' && product.fixedDenominations) {
    return (
      <div>
        <label className="block text-title-md font-archivo text-surface-on-surface mb-4">
          Select Amount
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {product.fixedDenominations.map((denom) => {
            const isSelected = selectedAmount === denom.value
            
            return (
              <motion.button
                key={denom.value}
                onClick={() => onAmountChange(denom.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-secondary bg-secondary/5'
                    : 'border-outline-variant hover:border-surface-on-surface-variant'
                  }
                `}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-headline-sm font-archivo text-surface-on-surface">
                  {formatCurrency(denom.value, currency)}
                </div>
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
        <label className="block text-title-md font-archivo text-surface-on-surface mb-2">
          Enter Amount
        </label>
        <p className="text-label-md text-surface-on-surface-variant mb-4">
          Between {formatCurrency(product.denominationRange.min, currency)} and{' '}
          {formatCurrency(product.denominationRange.max, currency)}
        </p>
        <Input
          type="number"
          value={customAmount}
          onChange={(e) => handleCustomAmountChange(e.target.value)}
          placeholder={`e.g. ${product.denominationRange.min}`}
          min={product.denominationRange.min}
          max={product.denominationRange.max}
          step={product.denominationRange.step || 1}
          error={customError}
        />
      </div>
    )
  }
  
  return null
}
