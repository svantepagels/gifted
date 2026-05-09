/**
 * FAQ accordion — pure-CSS `<details>`/`<summary>` for zero-JS rendering.
 *
 * Server component. Renders all panels collapsed by default; users
 * toggle them with native browser interaction (works without JS,
 * plays nicely with screen readers, and avoids any state management).
 */

import { ChevronDown } from 'lucide-react'
import type { Messages } from '@/lib/i18n/useMessages'
import type { BrandCopy } from '@/lib/landing-pages/types'

interface FAQProps {
  items: BrandCopy['faq']
  messages: Messages
}

export function FAQ({ items, messages }: FAQProps) {
  if (!items.length) return null

  return (
    <section className="my-12 md:my-16" aria-labelledby="faq-heading">
      <h2
        id="faq-heading"
        className="font-archivo text-headline-md md:text-headline-lg text-surface-on-surface mb-6 md:mb-8"
      >
        {messages['landing.faq.heading']}
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-lg border border-outline-variant bg-surface-container-lowest p-4 md:p-5 transition-colors hover:border-primary/30 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="cursor-pointer flex items-center justify-between gap-4 text-body-lg font-medium text-surface-on-surface min-h-[48px]">
              <span>{item.question}</span>
              <ChevronDown
                className="h-5 w-5 flex-shrink-0 text-surface-on-surface-variant transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-body-md text-surface-on-surface-variant leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
