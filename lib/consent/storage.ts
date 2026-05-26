/**
 * localStorage read/write for cookie consent.
 *
 * All functions are SSR-safe (no-op on the server) and never throw —
 * a corrupt or quota-exceeded localStorage just returns `null` /
 * silently fails so the banner re-appears next visit.
 */

import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from './constants'
import type { ConsentState } from '@/components/consent/consent-types'

export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    if (parsed.version !== CONSENT_VERSION) return null
    if (!parsed.choices || typeof parsed.choices !== 'object') return null
    // Force necessary to true regardless of stored payload (defensive).
    return {
      version: CONSENT_VERSION,
      timestamp:
        typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
      choices: {
        necessary: true,
        analytics: !!parsed.choices.analytics,
        marketing: !!parsed.choices.marketing,
      },
      hasInteracted: !!parsed.hasInteracted,
    }
  } catch {
    return null
  }
}

export function writeConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* localStorage disabled / full — silently fail; banner re-shows. */
  }
}

export function clearConsent(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  } catch {
    /* noop */
  }
}
