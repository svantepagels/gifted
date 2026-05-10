/**
 * English sentinel strings — must NOT appear on a non-English page.
 *
 * Curated subset of the user-visible strings in `lib/i18n/messages/en.json`.
 * If any of these phrases leak through on a fi-FI / pl-PL / el-GR / ar-*
 * page, that's a missing translation. We curate (rather than auto-derive)
 * because some keys are short ambiguous tokens ("Buy", "All") that match
 * common substrings even in translated text.
 */
export const ENGLISH_SENTINELS: readonly string[] = [
  'Browse all gift cards',
  'Buy Digital',
  'Gift Cards',
  'Frequently asked questions',
  'Pick a denomination',
  'Buy now',
  'Why buy from Gifted',
  'Instant delivery',
  'No account needed',
  'Secure checkout',
  'Codes delivered to your inbox',
  'Card payments protected by Stripe',
  'Search brands',
  'Product Not Found',
  'Back to home',
  'Brand not available in this region',
  'Instant Digital Delivery',
  'View all denominations',
] as const

/**
 * Tokens that legitimately appear in English form on every page (the
 * brand wordmark, product brand names, etc.). The leak-detector ignores
 * any sentinel match that contains *only* allowlisted tokens.
 */
export const ALLOWLIST_TOKENS: readonly string[] = [
  'GIFTED',
  'Gifted',
  'Stripe',
] as const
