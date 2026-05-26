/**
 * Script-loading helpers gated by consent.
 *
 * Today the site doesn't load any analytics or marketing scripts — but
 * this module is the single seam where future scripts get added so the
 * consent check can never be forgotten. To add a new gated script:
 *
 *   1. Add a loader function below (idempotent — use the
 *      `loadedFlags` set so re-renders don't double-load).
 *   2. Call it from `ConsentEffectRunner` (see ConsentProvider.tsx) for
 *      the right category.
 *   3. Document the script + cookie it sets in `docs/cookie-consent.md`
 *      and on `/cookie-policy`.
 */

const loadedFlags = new Set<string>()

/**
 * Generic guard — returns true once the named script has been loaded
 * in this page lifetime and otherwise marks it as loaded.
 *
 * Use as: `if (alreadyLoaded('vercel-analytics')) return;`
 */
export function alreadyLoaded(name: string): boolean {
  if (loadedFlags.has(name)) return true
  loadedFlags.add(name)
  return false
}

/**
 * Imperative dynamic loader for a script tag. Wrapped in a Promise so
 * callers can await ready-state; idempotent via `alreadyLoaded`.
 */
export function injectScript(
  name: string,
  src: string,
  attrs: Record<string, string> = {}
): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve()
  if (alreadyLoaded(name)) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.async = true
    el.src = src
    el.dataset.consentScript = name
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    el.onload = () => resolve()
    el.onerror = () =>
      reject(new Error(`Failed to load consent-gated script: ${name}`))
    document.head.appendChild(el)
  })
}

/**
 * Remove any tags we previously injected for a given category. Used
 * when a user revokes consent mid-session. SDKs that set cookies of
 * their own won't fully un-set them — that's a known limitation
 * documented in `docs/cookie-consent.md`.
 */
export function removeInjectedScripts(): void {
  if (typeof document === 'undefined') return
  document
    .querySelectorAll<HTMLScriptElement>('script[data-consent-script]')
    .forEach((s) => s.parentElement?.removeChild(s))
  loadedFlags.clear()
}

/**
 * Set the global flag used by other modules that ask "may I send
 * analytics?". Components that own their own lifecycles (e.g.
 * `<Analytics />` from `@vercel/analytics`) should be conditionally
 * rendered based on consent state; this flag is for ad-hoc inline
 * tracking calls.
 */
export function setConsentFlags(consent: {
  analytics: boolean
  marketing: boolean
}): void {
  if (typeof window === 'undefined') return
  ;(window as unknown as Record<string, unknown>).__gifted_consent = {
    analytics: !!consent.analytics,
    marketing: !!consent.marketing,
  }
}
