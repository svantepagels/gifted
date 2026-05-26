'use client'

import Link from 'next/link'
import { useConsent } from './ConsentProvider'
import { useLocale } from '@/lib/i18n/useLocale'
import { localeHref } from '@/lib/i18n/href'
import { getMessages } from '@/lib/i18n/useMessages'

/**
 * First-visit consent banner.
 *
 * Visible iff the provider has mounted (post-hydration) AND no consent
 * is persisted. Non-blocking: rendered as a card pinned bottom on
 * mobile / bottom-right on desktop with `aria-live="polite"`.
 *
 * GDPR/UK GDPR alignment:
 *   - "Reject All" is given equal visual weight to "Accept All"
 *     (same size, same row, no dark pattern).
 *   - Banner cannot be dismissed without a choice (Esc / outside click
 *     are no-ops) — clicking through is required.
 *   - Default state on first visit is "rejected" until the user
 *     actively chooses; nothing is loaded by default.
 */
export function ConsentBanner() {
  const { consent, mounted, acceptAll, rejectAll, openPreferences } =
    useConsent()
  const locale = useLocale()
  const m = getMessages(locale)
  const cookiePolicyHref = localeHref(locale, '/cookie-policy')

  // SSR + first-paint guard — see ConsentProvider for rationale.
  if (!mounted) return null
  if (consent) return null

  // Use English fallbacks so the banner works regardless of locale
  // file having the new keys yet. Translatable copy can be added to
  // `lib/i18n/messages/*.json` later (see docs/cookie-consent.md).
  const title = (m['consent.banner.title'] as string) ?? 'We value your privacy'
  const body =
    (m['consent.banner.body'] as string) ??
    'We use cookies to enhance your browsing experience and analyze traffic. You can accept all, reject non-essential cookies, or manage your preferences.'
  const linkLabel =
    (m['consent.banner.policyLink'] as string) ?? 'Cookie Policy'
  const acceptLabel =
    (m['consent.banner.acceptAll'] as string) ?? 'Accept all'
  const rejectLabel =
    (m['consent.banner.rejectAll'] as string) ?? 'Reject all'
  const manageLabel =
    (m['consent.banner.managePreferences'] as string) ?? 'Manage preferences'

  return (
    <div
      role="dialog"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-body"
      aria-live="polite"
      className="fixed z-[9999] bottom-0 inset-x-0 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-w-[480px] p-3 sm:p-0"
    >
      <div className="bg-surface-container-lowest text-surface-on-surface border border-outline-variant/40 rounded-xl shadow-2xl p-5 sm:p-6">
        <h2
          id="consent-banner-title"
          className="font-archivo text-title-md sm:text-title-lg font-semibold mb-2"
        >
          {title}
        </h2>
        <p
          id="consent-banner-body"
          className="text-body-sm sm:text-body-md text-surface-on-surface-variant mb-4"
        >
          {body}{' '}
          <Link
            href={cookiePolicyHref}
            className="underline text-secondary hover:text-secondary-hover"
          >
            {linkLabel}
          </Link>
          .
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            type="button"
            onClick={rejectAll}
            className="order-2 sm:order-1 flex-1 px-4 py-2.5 rounded-lg border border-outline-variant text-surface-on-surface text-label-lg hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring"
          >
            {rejectLabel}
          </button>
          <button
            type="button"
            onClick={openPreferences}
            className="order-3 sm:order-2 flex-1 px-4 py-2.5 rounded-lg text-secondary text-label-lg hover:bg-state-hover transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring"
          >
            {manageLabel}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="order-1 sm:order-3 flex-1 px-4 py-2.5 rounded-lg bg-secondary text-secondary-on-secondary text-label-lg hover:bg-secondary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring"
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
