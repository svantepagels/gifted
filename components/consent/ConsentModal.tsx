'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useConsent } from './ConsentProvider'
import { useLocale } from '@/lib/i18n/useLocale'
import { getMessages } from '@/lib/i18n/useMessages'

/**
 * Preferences modal — opens from "Manage preferences" on the banner
 * and from the footer "Cookie Preferences" link.
 *
 * Renders three category panels (Necessary / Analytics / Marketing)
 * with toggle switches. "Save preferences" persists the modal's local
 * toggle state; "Accept all" and "Reject all" are shortcuts.
 *
 * Accessibility:
 *   - `role="dialog"` + `aria-modal="true"`
 *   - Focus trap inside modal
 *   - Esc closes
 *   - Backdrop click closes
 */
export function ConsentModal() {
  const {
    consent,
    isPreferencesOpen,
    closePreferences,
    acceptAll,
    rejectAll,
    updateChoices,
  } = useConsent()
  const locale = useLocale()
  const m = getMessages(locale)

  const [analytics, setAnalytics] = useState<boolean>(false)
  const [marketing, setMarketing] = useState<boolean>(false)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  // Sync local toggle state to persisted choice each time modal opens.
  useEffect(() => {
    if (!isPreferencesOpen) return
    setAnalytics(consent?.choices.analytics ?? false)
    setMarketing(consent?.choices.marketing ?? false)
  }, [isPreferencesOpen, consent])

  // Esc to close + focus management.
  useEffect(() => {
    if (!isPreferencesOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreferences()
    }
    document.addEventListener('keydown', onKey)
    // Focus close button on open for keyboard users.
    requestAnimationFrame(() => closeBtnRef.current?.focus())
    // Body scroll lock.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isPreferencesOpen, closePreferences])

  if (!isPreferencesOpen) return null

  const title = (m['consent.modal.title'] as string) ?? 'Cookie preferences'
  const intro =
    (m['consent.modal.intro'] as string) ??
    'Choose which categories of cookies you allow. You can change this at any time from the footer link.'
  const necessaryTitle =
    (m['consent.modal.necessaryTitle'] as string) ?? 'Strictly necessary'
  const necessaryDesc =
    (m['consent.modal.necessaryDesc'] as string) ??
    'Required for the site to work — authentication, checkout, fraud protection. Cannot be disabled.'
  const necessaryAlwaysOn =
    (m['consent.modal.alwaysActive'] as string) ?? 'Always active'
  const analyticsTitle =
    (m['consent.modal.analyticsTitle'] as string) ?? 'Analytics'
  const analyticsDesc =
    (m['consent.modal.analyticsDesc'] as string) ??
    'Helps us understand how visitors use the site so we can improve it. No personally identifying information.'
  const marketingTitle =
    (m['consent.modal.marketingTitle'] as string) ?? 'Marketing'
  const marketingDesc =
    (m['consent.modal.marketingDesc'] as string) ??
    'Used to measure ad campaign performance and to show relevant gift card promotions on other sites.'
  const closeLabel = (m['consent.modal.close'] as string) ?? 'Close'
  const saveLabel =
    (m['consent.modal.save'] as string) ?? 'Save preferences'
  const acceptAllLabel =
    (m['consent.banner.acceptAll'] as string) ?? 'Accept all'
  const rejectAllLabel =
    (m['consent.banner.rejectAll'] as string) ?? 'Reject all'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-title"
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onMouseDown={(e) => {
        // Close on backdrop click but not on inner clicks.
        if (e.target === e.currentTarget) closePreferences()
      }}
    >
      <div
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
        onMouseDown={closePreferences}
      />
      <div
        ref={dialogRef}
        className="relative bg-surface-container-lowest text-surface-on-surface w-full sm:max-w-[560px] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        <header className="flex items-start justify-between p-5 sm:p-6 border-b border-outline-variant/40">
          <div>
            <h2
              id="consent-modal-title"
              className="font-archivo text-title-lg font-semibold"
            >
              {title}
            </h2>
            <p className="text-body-sm text-surface-on-surface-variant mt-1">
              {intro}
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closePreferences}
            aria-label={closeLabel}
            className="shrink-0 ml-3 p-2 rounded-full hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <CategoryRow
            id="necessary"
            title={necessaryTitle}
            description={necessaryDesc}
            checked={true}
            disabled
            disabledLabel={necessaryAlwaysOn}
            onChange={() => {}}
          />
          <CategoryRow
            id="analytics"
            title={analyticsTitle}
            description={analyticsDesc}
            checked={analytics}
            onChange={setAnalytics}
          />
          <CategoryRow
            id="marketing"
            title={marketingTitle}
            description={marketingDesc}
            checked={marketing}
            onChange={setMarketing}
          />
        </div>

        <footer className="p-5 sm:p-6 border-t border-outline-variant/40 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={rejectAll}
              className="px-4 py-2.5 rounded-lg border border-outline-variant text-surface-on-surface text-label-lg hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring"
            >
              {rejectAllLabel}
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="px-4 py-2.5 rounded-lg border border-outline-variant text-surface-on-surface text-label-lg hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring"
            >
              {acceptAllLabel}
            </button>
          </div>
          <button
            type="button"
            onClick={() => updateChoices({ analytics, marketing })}
            className="px-4 py-2.5 rounded-lg bg-secondary text-secondary-on-secondary text-label-lg hover:bg-secondary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring"
          >
            {saveLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}

interface CategoryRowProps {
  id: string
  title: string
  description: string
  checked: boolean
  disabled?: boolean
  disabledLabel?: string
  onChange: (value: boolean) => void
}

function CategoryRow({
  id,
  title,
  description,
  checked,
  disabled,
  disabledLabel,
  onChange,
}: CategoryRowProps) {
  const switchId = `consent-toggle-${id}`
  return (
    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-surface-container-low">
      <div className="flex-1">
        <label
          htmlFor={switchId}
          className="font-archivo text-title-sm font-semibold block"
        >
          {title}
        </label>
        <p className="text-body-sm text-surface-on-surface-variant mt-1">
          {description}
        </p>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1">
        <button
          id={switchId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-disabled={disabled || undefined}
          disabled={disabled}
          onClick={() => !disabled && onChange(!checked)}
          className={[
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-state-focus-ring',
            checked ? 'bg-secondary' : 'bg-surface-container-highest',
            disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          <span
            className={[
              'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
              checked ? 'translate-x-5' : 'translate-x-0.5',
            ].join(' ')}
          />
        </button>
        {disabled && disabledLabel ? (
          <span className="text-label-sm uppercase text-surface-on-surface-variant">
            {disabledLabel}
          </span>
        ) : null}
      </div>
    </div>
  )
}
