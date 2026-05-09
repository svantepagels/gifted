/**
 * Tiny in-house messages loader.
 *
 * Server- and client-safe: despite the `useMessages` filename, `getMessages()`
 * is a plain function (not a React hook). Use it from server components
 * (`getMessages(params.locale)`) AND from client components paired with
 * `useLocale()` (`getMessages(useLocale())`).
 *
 * The returned object is shallow-merged over English so that any missing
 * key in a non-English file falls back to English instead of `undefined`.
 *
 * Keep this file in sync with `lib/i18n/messages/*.json` — adding a new
 * locale requires adding both a JSON file and an entry in `messageMap`.
 */

import type { Locale } from './config'
import { messagesFileForLocale } from './config'

import en from './messages/en.json'
import fiFI from './messages/fi-FI.json'
import arAE from './messages/ar-AE.json'
import arSA from './messages/ar-SA.json'
import plPL from './messages/pl-PL.json'
import elGR from './messages/el-GR.json'

export type Messages = typeof en
export type MessageKey = keyof Messages

const messageMap: Record<string, Messages> = {
  en: en as Messages,
  'fi-FI': fiFI as Messages,
  'ar-AE': arAE as Messages,
  'ar-SA': arSA as Messages,
  'pl-PL': plPL as Messages,
  'el-GR': elGR as Messages,
}

/**
 * Returns the messages dictionary for a given locale.
 * Shallow-merges over English so any missing key falls back to the
 * canonical English string instead of `undefined`.
 */
export function getMessages(locale: Locale): Messages {
  const file = messagesFileForLocale(locale)
  const dict = messageMap[file] ?? (en as Messages)
  return { ...(en as Messages), ...dict }
}

/**
 * Translate one key with optional `{placeholder}` substitution.
 * Used for the only string with substitutions today: `product.range`.
 */
export function t(
  messages: Messages,
  key: MessageKey,
  vars?: Record<string, string>
): string {
  let s: string = messages[key] ?? String(key)
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, v)
    }
  }
  return s
}
