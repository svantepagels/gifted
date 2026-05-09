/**
 * Type definitions for the per-locale × per-brand landing-page generator.
 *
 * Two collaborating maps:
 *   - BrandConfig    — what the brand IS (catalog metadata, alias matching)
 *   - BrandCopy      — what the brand SAYS (per-locale hero/desc/FAQ)
 *
 * BrandConfig lives in `brands.ts`; BrandCopy lives in `copy.ts`.
 */

export type BrandSlug =
  | 'netflix'
  | 'steam'
  | 'app-store-itunes'
  | 'playstation'
  | 'fortnite'
  | 'xbox'
  | 'mobile-legends'
  | 'world-of-warcraft'
  | 'crypto-voucher'
  | 'amazon'
  | 'twitch'
  | 'flixbus'
  | 'talabat'
  | 'starzplay'
  | 'nintendo-eshop'
  | 'google-play'
  | 'spotify'
  | 'ea-play'
  | 'riot-points'
  | 'roblox'

export type BrandCategory =
  | 'streaming'
  | 'gaming'
  | 'retail'
  | 'app-store'
  | 'gift'

export interface BrandConfig {
  /** URL-safe slug used in /buy/[brand]. Lowercase, hyphenated, ASCII. */
  slug: BrandSlug
  /**
   * Optional canonical Reloadly product IDs. Empty in practice — productIds
   * are per-(brand × country), so we match by aliases.
   */
  reloadlyProductIds: number[]
  /**
   * Reloadly brand-name aliases that should match this brand
   * (case-insensitive, normalised). Includes both raw Reloadly forms
   * and post-`transform.ts` normalised forms (e.g. 'apple' for App Store).
   */
  reloadlyBrandAliases: string[]
  /**
   * Per-locale displayed brand name. Falls back to displayName.en.
   */
  displayName: Record<string, string>
  category: BrandCategory
  /**
   * Tailwind gradient class pair for hero accent. Matches existing
   * category gradients (see ProductCard.tsx categoryColors).
   */
  accentGradient: string
}

export interface BrandCopy {
  /** Page H1, ~50–70 chars. e.g. "Buy Netflix Gift Card in Finland". */
  heroTitle: string
  /** 1-line hero subtitle, ~80–140 chars. */
  heroSubtitle: string
  /** 50–100 word marketing description used for body + meta description. */
  description: string
  /** Keyword seeds for <meta name="keywords"> + future JSON-LD. 4–8 strings. */
  keywords: string[]
  /** 4–6 Q&A items rendered as a <details>/<summary> accordion. */
  faq: Array<{ question: string; answer: string }>
}
