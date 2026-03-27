import { Order } from '@/lib/orders/types'
import { formatCurrency } from '@/lib/utils/currency'
import { CheckCircle, Copy, Mail } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'

interface SuccessSummaryProps {
  order: Order
}

export function SuccessSummary({ order }: SuccessSummaryProps) {
  const handleCopyCode = () => {
    if (order.fulfillment?.cardCode) {
      navigator.clipboard.writeText(order.fulfillment.cardCode)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
          {/* Halo effect - radial gradient ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#62DF7D]/20 via-[#62DF7D]/10 to-transparent"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-radial from-[#62DF7D]/30 via-[#62DF7D]/15 to-transparent"></div>
          {/* Inner circle */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#62DF7D]/20">
            <CheckCircle className="h-10 w-10 text-[#009842]" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-archivo-black text-[2.25rem] leading-[1.2] tracking-[-0.02em] text-surface-on-surface mb-2 uppercase">
          YOUR GIFT CARD IS READY!
        </h1>
        <p className="text-body-lg text-surface-on-surface-variant">
          Order #{order.id}
        </p>
      </div>
      
      {/* Gift Card Details */}
      <div className="bg-surface-container-lowest rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4 mb-6 pb-6 border-b border-outline-variant">
          <div className="w-16 h-16 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
            <span className="text-headline-md font-archivo text-surface-on-surface-variant">
              {order.productName[0]}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-archivo text-title-lg text-surface-on-surface mb-1">
              {order.productName}
            </h2>
            <p className="text-headline-md font-archivo text-secondary">
              {formatCurrency(order.amount, order.currency)}
            </p>
          </div>
        </div>
        
        {order.fulfillment && (
          <div className="space-y-4">
            <div>
              <label className="block text-label-md text-surface-on-surface-variant mb-2">
                Gift Card Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-surface-container rounded-md font-mono text-title-md text-surface-on-surface">
                  {order.fulfillment.cardCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3 rounded-md bg-surface-container-low hover:bg-surface-container transition-colors"
                  aria-label="Copy code"
                >
                  <Copy className="h-5 w-5 text-surface-on-surface-variant" />
                </button>
              </div>
            </div>
            
            {order.fulfillment.pin && (
              <div>
                <label className="block text-label-md text-surface-on-surface-variant mb-2">
                  PIN
                </label>
                <div className="px-4 py-3 bg-surface-container rounded-md font-mono text-title-md text-surface-on-surface">
                  {order.fulfillment.pin}
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-secondary/5 rounded-md">
          <div className="flex items-start gap-2">
            <Mail className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
            <div className="text-label-md text-surface-on-surface">
              {order.deliveryMethod === 'gift' && order.recipientEmail
                ? `Gift card details have been sent to ${order.recipientEmail}`
                : `Confirmation email sent to ${order.customerEmail}`
              }
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Details */}
      <div className="bg-surface-container-lowest rounded-lg p-6 mb-8">
        <h3 className="font-archivo text-title-md text-surface-on-surface mb-4">
          Order Details
        </h3>
        <div className="space-y-2 text-body-md">
          <div className="flex justify-between">
            <span className="text-surface-on-surface-variant">Amount</span>
            <span className="text-surface-on-surface">
              {formatCurrency(order.amount, order.currency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-on-surface-variant">Service Fee</span>
            <span className="text-surface-on-surface">
              {formatCurrency(order.serviceFee, order.currency)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-outline-variant font-medium">
            <span className="text-surface-on-surface">Total Paid</span>
            <span className="text-surface-on-surface">
              {formatCurrency(order.total, order.currency)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/" className="flex-1">
          <Button variant="primary" fullWidth>
            Buy Another Gift Card
          </Button>
        </Link>
        <Button variant="secondary" fullWidth className="sm:flex-none sm:px-8">
          View Order
        </Button>
      </div>
    </div>
  )
}
