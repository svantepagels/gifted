'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/shared/Button'
import { formatCurrency, calculateServiceFee } from '@/lib/utils/currency'
import { Shield, Zap } from 'lucide-react'

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
  
  const serviceFee = amount ? calculateServiceFee(amount) : 0
  const total = amount ? amount + serviceFee : 0
  const isComplete = amount !== null && amount > 0
  
  const handleContinue = () => {
    if (onContinue) {
      onContinue()
    } else {
      router.push('/checkout')
    }
  }
  
  return (
    <div className={`bg-surface-container-lowest rounded-lg p-6 ${sticky ? 'sticky top-24' : ''}`}>
      <h2 className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary mb-4">
        ORDER SUMMARY
      </h2>
      
      <div className="space-y-3 mb-6 pb-6 border-b border-outline-variant">
        <div className="flex justify-between text-body-md">
          <span className="text-surface-on-surface-variant">Gift Card</span>
          <span className="text-surface-on-surface font-medium">{productName}</span>
        </div>
        
        <div className="flex justify-between text-body-md">
          <span className="text-surface-on-surface-variant">Amount</span>
          <span className="text-surface-on-surface font-medium">
            {amount ? formatCurrency(amount, currency) : '—'}
          </span>
        </div>
        
        <div className="flex justify-between text-body-md">
          <span className="text-surface-on-surface-variant">Service Fee</span>
          <span className="text-surface-on-surface font-medium">
            {amount ? formatCurrency(serviceFee, currency) : '—'}
          </span>
        </div>
      </div>
      
      <div className="flex justify-between items-baseline mb-6">
        <span className="text-[18px] font-bold uppercase tracking-[1.5px] text-primary">TOTAL</span>
        <span className="text-[36px] font-extrabold text-primary">
          {amount ? formatCurrency(total, currency) : '—'}
        </span>
      </div>
      
      <Button
        fullWidth
        variant="primary"
        disabled={!isComplete}
        onClick={handleContinue}
        className="mb-3"
      >
        Continue as Guest
      </Button>
      
      <Button
        fullWidth
        variant="secondary"
        disabled={!isComplete}
        className="mb-6"
      >
        Sign In
      </Button>
      
      {/* Trust Indicators */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-label-md text-surface-on-surface-variant">
          <Shield className="h-4 w-4" />
          <span>Secure payment</span>
        </div>
        <div className="flex items-center gap-2 text-label-md text-surface-on-surface-variant">
          <Zap className="h-4 w-4" />
          <span>Instant delivery</span>
        </div>
      </div>
    </div>
  )
}
