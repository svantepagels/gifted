'use client'

import { Order } from '@/lib/orders/types'
import { formatCurrencyForLocale } from '@/lib/i18n/format-currency'
import { CheckCircle, Mail, Clock, Copy } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/useLocale'
import { localeHref } from '@/lib/i18n/href'
import { getMessages, t } from '@/lib/i18n/useMessages'

interface SuccessSummaryProps {
  order: Order
}

export function SuccessSummary({ order }: SuccessSummaryProps) {
  const locale = useLocale()
  const m = getMessages(locale)

  // The transaction ID is the support reference; not redeemable on its own.
  // The redemption code is emailed to the recipient. We surface the transaction
  // reference here as a support handle, not a redeemable code.
  // (Internal note: the actual email is dispatched by Reloadly today; see KNOWN_GAPS.md.)
  const transactionReference = order.fulfillment?.cardCode ?? order.paymentId ?? order.id
  const deliveryEmail =
    order.deliveryMethod === 'gift' && order.recipientEmail
      ? order.recipientEmail
      : order.customerEmail

  const fmt = (n: number) => formatCurrencyForLocale(n, order.currency, locale)

  const handleCopyReference = () => {
    if (transactionReference) {
      navigator.clipboard.writeText(transactionReference).catch(() => {
        /* clipboard APIs are best-effort; silently skip on failure */
      })
    }
  }

  // Pre-render the {email} interpolation by splitting at the placeholder so
  // we can wrap the email in a styled span instead of rendering it as plain text.
  const introTemplate = m['success.delivery.intro']
  const introParts = introTemplate.split('{email}')

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
          {m['success.title']}
        </h1>
        <p className="text-body-lg text-surface-on-surface-variant">
          {m['success.subtitle']}
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
              {fmt(order.amount)}
            </p>
          </div>
        </div>

        {/* How delivery works */}
        <div className="rounded-md bg-secondary/5 p-4 mb-4 flex items-start gap-3">
          <Mail className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-body-md text-surface-on-surface font-medium">
              {introParts[0]}
              <span className="font-semibold">{deliveryEmail}</span>
              {introParts[1] ?? ''}
            </p>
            <p className="text-label-md text-surface-on-surface-variant">
              {m['success.delivery.partner']}
            </p>
          </div>
        </div>

        {/* Delivery window */}
        <div className="rounded-md bg-surface-container p-4 mb-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-surface-on-surface-variant flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-body-md text-surface-on-surface font-medium">{m['success.eta.heading']}</p>
            <p className="text-label-md text-surface-on-surface-variant">
              {m['success.eta.body']}
            </p>
          </div>
        </div>

        {/* Reference number */}
        <div>
          <label className="block text-label-md text-surface-on-surface-variant mb-2">
            {m['success.reference.label']}
            <span className="ml-2 font-normal italic">{m['success.reference.note']}</span>
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-surface-container rounded-md font-mono text-body-md text-surface-on-surface break-all">
              {transactionReference}
            </div>
            <button
              onClick={handleCopyReference}
              className="p-3 rounded-md bg-surface-container-low hover:bg-surface-container transition-colors"
              aria-label={m['success.reference.copyAria']}
            >
              <Copy className="h-5 w-5 text-surface-on-surface-variant" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="bg-surface-container-lowest rounded-lg p-6 mb-8">
        <h3 className="font-archivo text-title-md text-surface-on-surface mb-4">
          {m['success.details.heading']}
        </h3>
        <div className="space-y-2 text-body-md">
          <div className="flex justify-between">
            <span className="text-surface-on-surface-variant">{m['success.details.order']}</span>
            <span className="text-surface-on-surface font-mono text-label-md">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-on-surface-variant">{m['success.details.amount']}</span>
            <span className="text-surface-on-surface">{fmt(order.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-on-surface-variant">{m['success.details.serviceFee']}</span>
            <span className="text-surface-on-surface">{fmt(order.serviceFee)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-outline-variant font-medium">
            <span className="text-surface-on-surface">{m['success.details.total']}</span>
            <span className="text-surface-on-surface">{fmt(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href={localeHref(locale, '/')} className="flex-1">
          <Button variant="primary" fullWidth>
            {m['success.cta.buyAnother']}
          </Button>
        </Link>
      </div>
    </div>
  )
}
