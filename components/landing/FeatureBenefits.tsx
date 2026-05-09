/**
 * 3-up benefit grid: instant delivery, no signup, secure checkout.
 *
 * Server component. Strings come from the `landing.featureBenefits.*`
 * keys (added in Task 2 to all 6 locale message files).
 */

import { Zap, UserX, ShieldCheck } from 'lucide-react'
import type { Messages } from '@/lib/i18n/useMessages'

interface FeatureBenefitsProps {
  messages: Messages
}

const ICON_CLASSES = 'h-7 w-7 text-primary'

export function FeatureBenefits({ messages }: FeatureBenefitsProps) {
  const items = [
    {
      Icon: Zap,
      title: messages['landing.featureBenefits.instant.title'],
      body: messages['landing.featureBenefits.instant.body'],
    },
    {
      Icon: UserX,
      title: messages['landing.featureBenefits.noSignup.title'],
      body: messages['landing.featureBenefits.noSignup.body'],
    },
    {
      Icon: ShieldCheck,
      title: messages['landing.featureBenefits.secure.title'],
      body: messages['landing.featureBenefits.secure.body'],
    },
  ]

  return (
    <section
      className="my-12 md:my-16"
      aria-labelledby="feature-benefits-heading"
    >
      <h2
        id="feature-benefits-heading"
        className="font-archivo text-headline-md md:text-headline-lg text-surface-on-surface mb-6 md:mb-8"
      >
        {messages['landing.featureBenefits.heading']}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {items.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Icon className={ICON_CLASSES} aria-hidden="true" />
            </div>
            <h3 className="font-archivo text-headline-sm text-surface-on-surface mb-2">
              {title}
            </h3>
            <p className="font-inter text-body-md text-surface-on-surface-variant leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
