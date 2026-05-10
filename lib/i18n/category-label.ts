import type { Messages } from './useMessages'

/**
 * Map a Reloadly catalog category (English) to its localized label.
 *
 * Categories emitted today by `lib/giftcards/transform.ts inferCategory()`:
 *   Gaming, Shopping, Food, Travel, Beauty, Tech, Other,
 *   Media, Lifestyle, Entertainment, All
 *
 * Falls back to the raw category string when no key exists — agents
 * adding new categories MUST add a matching `categories.<key>` entry
 * in every message JSON.
 *
 * Replaces the per-component `categoryDisplayLabel` / `categoryLabel`
 * functions previously duplicated in:
 *   - components/browse/ProductCard.tsx
 *   - components/shared/CategoryChips.tsx
 */
export function categoryDisplayLabel(category: string, m: Messages): string {
  switch ((category || '').toLowerCase()) {
    case 'all':
      return m['categories.all']
    case 'shopping':
      return m['categories.shopping']
    case 'media':
      return m['categories.media']
    case 'food':
      return m['categories.food']
    case 'travel':
      return m['categories.travel']
    case 'gaming':
      return m['categories.gaming']
    case 'lifestyle':
      return m['categories.lifestyle']
    case 'beauty':
      return m['categories.beauty']
    case 'tech':
      return m['categories.tech']
    case 'entertainment':
      return m['categories.entertainment']
    case 'other':
      return m['categories.other']
    default:
      return category
  }
}
