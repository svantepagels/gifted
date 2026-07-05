/**
 * Compliance filter — open-loop / stored-value product exclusion.
 *
 * WHY THIS EXISTS (do not "clean up"): our Stripe application states that
 * Gifted sells CLOSED-LOOP third-party gift cards only (Amazon, Spotify,
 * App Store, ...). Open-loop network cards (Visa / Mastercard / American
 * Express / Discover prepaid), stored-value crypto products (Binance,
 * Crypto Voucher, bitcoin/ethereum top-ups) and "prepaid debit"-style
 * products must therefore never surface in the catalog NOR be orderable —
 * their presence would contradict our own compliance representation.
 *
 * Enforcement layers (defense in depth):
 *   1. Catalog ingestion — GiftCardService filters right after transform,
 *      before caching, so every display surface (grid, search, categories,
 *      PDP, brand landing pages, SEO/hreflang) sees a clean catalog.
 *   2. Raw passthrough — GET /api/reloadly/products filters the raw list.
 *   3. Fulfillment boundary — POST /api/orders and POST /api/reloadly/order
 *      reject open-loop products with 403 even for hand-crafted requests.
 *
 * Matching strategy: normalized TOKEN matching (not raw substring), same
 * normalization pass as `normaliseBrandName` in lib/landing-pages/slug.ts
 * (lowercase, strip diacritics, collapse non-alphanumerics to spaces).
 * Token-exact equality keeps false positives out: "Televisa" (token
 * `televisa`) and "Discovery+" (token `discovery`) do NOT match `visa` /
 * `discover`. Name-pattern matching is deliberate — brand names/ids differ
 * between Reloadly sandbox and production, so hard-coded product ids would
 * not be portable. Any blocklist addition MUST come with negative tests in
 * lib/giftcards/__tests__/compliance.test.ts.
 */

import type { GiftCardProduct } from './types';
import type { Product as ReloadlyProduct } from '@/lib/reloadly/types';

/**
 * Single tokens that mark a product as open-loop / stored-value when they
 * appear as a whole token in the brand or product name.
 *
 * Note: generic standalone `prepaid` is deliberately NOT blocked — legit
 * closed-loop cards are commonly described as "prepaid" (e.g. Spotify).
 */
export const BLOCKED_TOKENS: ReadonlyArray<string> = [
  'visa',
  'mastercard',
  'amex',
  'binance',
  'crypto',
  'cryptovoucher',
  'bitcoin',
  'ethereum',
  'vanilla',
  'discover',
  'paysafecard',
  'neosurf',
  'flexepin',
  'astropay',
];

/**
 * Consecutive-token sequences that mark a product as open-loop even when
 * no single blocked token matches.
 */
export const BLOCKED_TOKEN_SEQUENCES: ReadonlyArray<ReadonlyArray<string>> = [
  ['american', 'express'],
  ['master', 'card'],
  ['crypto', 'voucher'],
  ['prepaid', 'debit'],
  ['prepaid', 'visa'],
  ['prepaid', 'mastercard'],
  ['virtual', 'prepaid'],
];

/**
 * Normalize a name for matching: lowercase, strip diacritics, collapse any
 * run of non-alphanumeric characters into a single space, trim.
 * (Mirrors `normaliseBrandName` in lib/landing-pages/slug.ts — kept local
 * so this compliance module has zero dependencies on landing-page code.)
 */
function normalizeForMatching(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function nameIsBlocked(name: string): boolean {
  const tokens = normalizeForMatching(name).split(' ').filter(Boolean);
  if (tokens.length === 0) return false;

  if (tokens.some(token => BLOCKED_TOKENS.includes(token))) {
    return true;
  }

  for (const sequence of BLOCKED_TOKEN_SEQUENCES) {
    for (let i = 0; i + sequence.length <= tokens.length; i++) {
      if (sequence.every((token, j) => tokens[i + j] === token)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * True when a product is open-loop / stored-value and must be excluded
 * from display AND fulfillment. Checks every name we have — raw Reloadly
 * products carry both `brand.brandName` and `productName`; transformed
 * products only carry `brandName`.
 */
export function isOpenLoopProduct(names: {
  brandName?: string | null;
  productName?: string | null;
}): boolean {
  return [names.brandName, names.productName].some(
    name => typeof name === 'string' && nameIsBlocked(name)
  );
}

/**
 * Filter transformed catalog products (Layer 1 — catalog ingestion).
 */
export function filterOpenLoopGiftCards(products: GiftCardProduct[]): GiftCardProduct[] {
  return products.filter(p => !isOpenLoopProduct({ brandName: p.brandName }));
}

/**
 * Filter raw Reloadly products (Layer 2 — raw API passthrough).
 */
export function filterOpenLoopReloadlyProducts(products: ReloadlyProduct[]): ReloadlyProduct[] {
  return products.filter(
    p => !isOpenLoopProduct({ brandName: p.brand?.brandName, productName: p.productName })
  );
}
