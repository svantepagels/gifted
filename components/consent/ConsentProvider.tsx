'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CONSENT_VERSION } from '@/lib/consent/constants'
import { readConsent, writeConsent } from '@/lib/consent/storage'
import { setConsentFlags, removeInjectedScripts } from '@/lib/consent/scripts'
import type {
  ConsentChoices,
  ConsentContextValue,
  ConsentState,
} from './consent-types'

const ConsentContext = createContext<ConsentContextValue | undefined>(undefined)

const REJECT_ALL_CHOICES: ConsentChoices = {
  necessary: true,
  analytics: false,
  marketing: false,
}

const ACCEPT_ALL_CHOICES: ConsentChoices = {
  necessary: true,
  analytics: true,
  marketing: true,
}

function buildState(choices: ConsentChoices): ConsentState {
  return {
    version: CONSENT_VERSION,
    timestamp: Date.now(),
    choices,
    hasInteracted: true,
  }
}

/**
 * Root provider — wraps the app (inside `AppProvider`) so any client
 * component can call `useConsent()`.
 *
 * SSR-safe: on the server `consent` is always `null` and `mounted` is
 * `false`; we only read localStorage inside `useEffect`. Consumers that
 * conditionally render based on consent must check `mounted` to avoid
 * hydration mismatches (banner does this internally).
 */
export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)

  // Mount: read persisted choice (or leave null → banner shows).
  useEffect(() => {
    setMounted(true)
    const stored = readConsent()
    if (stored) setConsent(stored)
  }, [])

  // Mirror consent into a window flag for ad-hoc tracking callers and
  // tear down any injected scripts whose category was just disabled.
  useEffect(() => {
    if (!mounted) return
    if (!consent) {
      setConsentFlags({ analytics: false, marketing: false })
      return
    }
    setConsentFlags({
      analytics: consent.choices.analytics,
      marketing: consent.choices.marketing,
    })
    // If the user just turned everything off, clean up old tags. Future
    // loaders should be invoked from a dedicated `ConsentEffectRunner`
    // when their respective category is on.
    if (!consent.choices.analytics && !consent.choices.marketing) {
      removeInjectedScripts()
    }
  }, [mounted, consent])

  const persist = useCallback((choices: ConsentChoices) => {
    const next = buildState(choices)
    writeConsent(next)
    setConsent(next)
  }, [])

  const acceptAll = useCallback(() => {
    persist(ACCEPT_ALL_CHOICES)
    setIsPreferencesOpen(false)
  }, [persist])

  const rejectAll = useCallback(() => {
    persist(REJECT_ALL_CHOICES)
    setIsPreferencesOpen(false)
  }, [persist])

  const updateChoices = useCallback(
    (partial: Partial<ConsentChoices>) => {
      const base = consent?.choices ?? REJECT_ALL_CHOICES
      const merged: ConsentChoices = {
        necessary: true,
        analytics:
          partial.analytics !== undefined ? partial.analytics : base.analytics,
        marketing:
          partial.marketing !== undefined ? partial.marketing : base.marketing,
      }
      persist(merged)
      setIsPreferencesOpen(false)
    },
    [consent, persist]
  )

  const openPreferences = useCallback(() => setIsPreferencesOpen(true), [])
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), [])

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      hasDecided: !!consent?.hasInteracted,
      mounted,
      acceptAll,
      rejectAll,
      updateChoices,
      openPreferences,
      closePreferences,
      isPreferencesOpen,
    }),
    [
      consent,
      mounted,
      acceptAll,
      rejectAll,
      updateChoices,
      openPreferences,
      closePreferences,
      isPreferencesOpen,
    ]
  )

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  )
}

/**
 * Hook for consumers. Throws if used outside `<ConsentProvider>` so
 * the bug surfaces in dev instead of silently returning defaults.
 */
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext)
  if (!ctx) {
    throw new Error('useConsent must be used inside <ConsentProvider>')
  }
  return ctx
}
