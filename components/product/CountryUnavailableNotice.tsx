'use client'

import { AlertCircle, ArrowRight } from 'lucide-react'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages, t } from '@/lib/i18n/useMessages'

interface CountryUnavailableNoticeProps {
  countryName: string
  availableCountryCount: number
  onBrowseAll: () => void
}

/**
 * Shown on the PDP when the user's selected country isn't in the
 * product's `countryCodes` array. We don't 404 or redirect (stable
 * URLs matter for SEO) — instead the purchase UI is replaced with
 * this notice and a link back to the catalog.
 *
 * The user can switch country via the Header `CountrySelector`, so
 * we deliberately don't include another country switcher here.
 */
export function CountryUnavailableNotice({
  countryName,
  availableCountryCount,
  onBrowseAll,
}: CountryUnavailableNoticeProps) {
  const locale = useLocale()
  const m = getMessages(locale)

  return (
    <div
      role="alert"
      data-testid="country-unavailable-notice"
      className="bg-surface-container-lowest border border-error/40 rounded-lg p-6 space-y-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          className="h-6 w-6 text-error flex-shrink-0 mt-0.5"
          aria-hidden
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-title-md font-archivo text-surface-on-surface mb-1">
            {t(m, 'pdp.unavailable.title', { country: countryName })}
          </h3>
          <p className="text-body-md text-surface-on-surface-variant">
            {t(m, 'pdp.unavailable.body', {
              country: countryName,
              count: String(availableCountryCount),
            })}
          </p>
        </div>
      </div>
      <button
        onClick={onBrowseAll}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-md bg-secondary text-secondary-on-secondary text-label-lg hover:bg-secondary-hover transition-colors"
      >
        {m['pdp.unavailable.cta']}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
