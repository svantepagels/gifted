'use client'

import { useConsent } from './ConsentProvider'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'

/**
 * Footer link that re-opens the preferences modal.
 *
 * Styled to look like a plain link so it slots into the existing
 * footer link list. Rendered as a `<button>` (no href) because it
 * controls modal state, not navigation — keeps Lighthouse + screen
 * readers honest.
 */
export function ConsentPreferencesLink({
  className = 'text-label-lg hover:text-surface-container-lowest transition-colors',
}: {
  className?: string
}) {
  const { openPreferences } = useConsent()
  const locale = useLocale()
  const m = getMessages(locale)
  const label =
    (m['footer.cookiePreferences'] as string) ?? 'Cookie preferences'

  return (
    <button
      type="button"
      onClick={openPreferences}
      className={className}
    >
      {label}
    </button>
  )
}
