import { Order } from '@/lib/orders/types'
import { formatCurrency } from '@/lib/utils/currency'
import { CheckCircle, Mail, Clock, Copy } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'

interface SuccessSummaryProps {
  order: Order
}

export function SuccessSummary({ order }: SuccessSummaryProps) {
  // The transaction ID is the reference the support team uses to look up an
  // order at Reloadly. It is NOT a redeemable code — the code is emailed
  // directly to the recipient by Reloadly. See fulfillment handling in
  // /app/api/reloadly/order/route.ts.
  const transactionReference = order.fulfillment?.cardCode ?? order.paymentId ?? order.id
  const deliveryEmail =
    order.deliveryMethod === 'gift' && order.recipientEmail
      ? order.recipientEmail
      : order.customerEmail

  const handleCopyReference = () => {
    if (transactionReference) {
      navigator.clipboard.writeText(transactionReference).catch(() => {
        /* clipboard APIs are best-effort; silently skip on failure */
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-[#62DF7D]/20 via-[#62DF7D]/10 to-transparent"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-radial from-[#62DF7D]/30 via-[#62DF7D]/15 to-transparent"></div>
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[#62DF7D]/20">
            <CheckCircle className="h-10 w-10 text-[#009842]" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-archivo-black text-[2.25rem] leading-[1.2] tracking-[-0.02em] text-surface-on-surface mb-2 uppercase">
          ORDER CONFIRMED
        </h1>
        <p className="text-body-lg text-surface-on-surface-variant">
          Your gift card is on its way.
        </p>
      </div>

      {/* Product + delivery */}
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

        {/* How delivery works */}
        <div className="rounded-md bg-secondary/5 p-4 mb-4 flex items-start gap-3">
          <Mail className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-body-md text-surface-on-surface font-medium">
              The gift card code will be emailed to{' '}
              <span className="font-semibold">{deliveryEmail}</span>.
            </p>
            <p className="text-label-md text-surface-on-surface-variant">
              The email comes directly from our fulfillment partner (Reloadly) and contains the
              redemption code, instructions, and any PIN.
            </p>
          </div>
        </div>

        {/* Delivery window */}
        <div className="rounded-md bg-surface-container p-4 mb-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-surface-on-surface-variant flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-body-md text-surface-on-surface font-medium">Expected arrival</p>
            <p className="text-label-md text-surface-on-surface-variant">
              Usually within 5 minutes. Occasionally up to 1 hour during peak times. If it
              hasn&apos;t arrived after an hour, check the spam folder or contact support with
              the reference number below.
            </p>
          </div>
        </div>

        {/* Reference number */}
        <div>
          <label className="block text-label-md text-surface-on-surface-variant mb-2">
            Reference number
            <span className="ml-2 font-normal italic">(for support only — not a redemption code)</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-surface-container rounded-md font-mono text-body-md text-surface-on-surface break-all">
              {transactionReference}
            </div>
            <button
              onClick={handleCopyReference}
              className="p-3 rounded-md bg-surface-container-low hover:bg-surface-container transition-colors"
              aria-label="Copy reference number"
            >
              <Copy className="h-5 w-5 text-surface-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-surface-container-lowest rounded-lg p-6 mb-8">
        <h3 className="font-archivo text-title-md text-surface-on-surface mb-4">
          Order details
        </h3>
        <div className="space-y-2 text-body-md">
          <div className="flex justify-between">
            <span className="text-surface-on-surface-variant">Order</span>
            <span className="text-surface-on-surface font-mono text-label-md">{order.id}</span>
          </div>
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
            <span className="text-surface-on-surface">Total</span>
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
      </div>
    </div>
  )
}
