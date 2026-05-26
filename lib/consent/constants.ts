/**
 * Cookie consent constants.
 *
 * Bumping CONSENT_VERSION invalidates any persisted consent and forces
 * a fresh banner display — use when the categories, policy, or vendors
 * change in a way that requires re-consent under GDPR / UK GDPR.
 */

export const CONSENT_STORAGE_KEY = 'gifted_cookie_consent_v1'
export const CONSENT_VERSION = 1 as const

export type ConsentCategory = 'necessary' | 'analytics' | 'marketing'

export const TOGGLEABLE_CATEGORIES: ReadonlyArray<Exclude<ConsentCategory, 'necessary'>> = [
  'analytics',
  'marketing',
] as const
