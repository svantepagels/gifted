import type { CONSENT_VERSION } from '@/lib/consent/constants'

/**
 * The persisted consent record. Stored under
 * `CONSENT_STORAGE_KEY` in localStorage.
 *
 * `version` is checked at read time — values that don't match the
 * current `CONSENT_VERSION` are treated as missing and force the
 * banner to re-appear.
 */
export interface ConsentChoices {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export interface ConsentState {
  version: typeof CONSENT_VERSION
  timestamp: number
  choices: ConsentChoices
  hasInteracted: boolean
}

export interface ConsentContextValue {
  /**
   * Current persisted consent. `null` means "not yet decided" — banner
   * should be visible. Always `null` during SSR and the first client
   * render (before hydration).
   */
  consent: ConsentState | null
  /** True once the user has actively made any choice. */
  hasDecided: boolean
  /** True once the provider has mounted on the client (post-hydration). */
  mounted: boolean
  acceptAll: () => void
  rejectAll: () => void
  updateChoices: (choices: Partial<ConsentChoices>) => void
  openPreferences: () => void
  closePreferences: () => void
  isPreferencesOpen: boolean
}
