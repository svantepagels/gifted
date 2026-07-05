/**
 * Brand catalog — source of truth for the landing-page generator.
 *
 * Hand-curated list of 20 brands, ordered roughly by SEO value
 * (see research/scoring/cells-scored-v3.csv — top brands by max
 * per-cell `seo_net_usd`). The exact ordering here drives the
 * "Popular gift cards in {country}" homepage block.
 *
 * Brand-name matching strategy (see ../landing-pages/slug.ts):
 *   1. Exact productId hit (rare — productIds are per country × brand
 *      and unstable; we leave reloadlyProductIds: [] by default).
 *   2. Substring match against `reloadlyBrandAliases` after lowercasing
 *      + ASCII normalisation.
 *
 * IMPORTANT: `lib/giftcards/transform.ts` already normalises raw
 * Reloadly brand names ("NetFlix" → "Netflix", "App Store & iTunes"
 * → "Apple", "Playstation" → "PlayStation", "Google play" → "Google
 * Play"). Each alias list below MUST contain at least one
 * post-normalisation form so the matcher works on the transformed
 * stream.
 */

import type { BrandConfig } from './types'

export const BRANDS: BrandConfig[] = [
  {
    slug: 'netflix',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['netflix'],
    displayName: {
      en: 'Netflix',
      'fi-FI': 'Netflix',
      'ar-AE': 'نتفلكس',
      'ar-SA': 'نتفلكس',
      'pl-PL': 'Netflix',
      'el-GR': 'Netflix',
    },
    category: 'streaming',
    accentGradient: 'from-category-entertainment to-purple-400',
  },
  {
    slug: 'steam',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['steam'],
    displayName: {
      en: 'Steam',
      'fi-FI': 'Steam',
      'ar-AE': 'ستيم',
      'ar-SA': 'ستيم',
      'pl-PL': 'Steam',
      'el-GR': 'Steam',
    },
    category: 'gaming',
    accentGradient: 'from-category-gaming to-pink-400',
  },
  {
    slug: 'app-store-itunes',
    // After transform.ts, "App Store & iTunes" becomes "Apple". Match both.
    reloadlyProductIds: [],
    reloadlyBrandAliases: [
      'apple',
      'app store & itunes',
      'app store and itunes',
      'itunes',
    ],
    displayName: {
      en: 'App Store & iTunes',
      'fi-FI': 'App Store & iTunes',
      'ar-AE': 'آب ستور وآيتيونز',
      'ar-SA': 'آب ستور وآيتيونز',
      'pl-PL': 'App Store & iTunes',
      'el-GR': 'App Store & iTunes',
    },
    category: 'app-store',
    accentGradient: 'from-blue-500 to-purple-500',
  },
  {
    slug: 'playstation',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['playstation', 'sony playstation'],
    displayName: {
      en: 'PlayStation',
      'fi-FI': 'PlayStation',
      'ar-AE': 'بلايستيشن',
      'ar-SA': 'بلايستيشن',
      'pl-PL': 'PlayStation',
      'el-GR': 'PlayStation',
    },
    category: 'gaming',
    accentGradient: 'from-blue-600 to-blue-400',
  },
  {
    slug: 'fortnite',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['fortnite', 'epic games', 'v-bucks'],
    displayName: {
      en: 'Fortnite',
      'fi-FI': 'Fortnite',
      'ar-AE': 'فورت نايت',
      'ar-SA': 'فورت نايت',
      'pl-PL': 'Fortnite',
      'el-GR': 'Fortnite',
    },
    category: 'gaming',
    accentGradient: 'from-category-gaming to-pink-400',
  },
  {
    slug: 'xbox',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['xbox', 'microsoft xbox', 'xbox live'],
    displayName: {
      en: 'Xbox',
      'fi-FI': 'Xbox',
      'ar-AE': 'إكس بوكس',
      'ar-SA': 'إكس بوكس',
      'pl-PL': 'Xbox',
      'el-GR': 'Xbox',
    },
    category: 'gaming',
    accentGradient: 'from-green-600 to-green-400',
  },
  {
    slug: 'mobile-legends',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['mobile legends', 'mobile legends bang bang', 'mlbb'],
    displayName: {
      en: 'Mobile Legends',
      'fi-FI': 'Mobile Legends',
      'ar-AE': 'موبايل ليجندز',
      'ar-SA': 'موبايل ليجندز',
      'pl-PL': 'Mobile Legends',
      'el-GR': 'Mobile Legends',
    },
    category: 'gaming',
    accentGradient: 'from-amber-500 to-pink-500',
  },
  {
    slug: 'world-of-warcraft',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['world of warcraft', 'wow', 'blizzard'],
    displayName: {
      en: 'World of Warcraft',
      'fi-FI': 'World of Warcraft',
      'ar-AE': 'وورلد أوف واركرافت',
      'ar-SA': 'وورلد أوف واركرافت',
      'pl-PL': 'World of Warcraft',
      'el-GR': 'World of Warcraft',
    },
    category: 'gaming',
    accentGradient: 'from-amber-600 to-red-500',
  },
  {
    slug: 'amazon',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['amazon', 'amazon.com'],
    displayName: {
      en: 'Amazon',
      'fi-FI': 'Amazon',
      'ar-AE': 'أمازون',
      'ar-SA': 'أمازون',
      'pl-PL': 'Amazon',
      'el-GR': 'Amazon',
    },
    category: 'retail',
    accentGradient: 'from-orange-500 to-yellow-500',
  },
  {
    slug: 'twitch',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['twitch'],
    displayName: {
      en: 'Twitch',
      'fi-FI': 'Twitch',
      'ar-AE': 'تويتش',
      'ar-SA': 'تويتش',
      'pl-PL': 'Twitch',
      'el-GR': 'Twitch',
    },
    category: 'streaming',
    accentGradient: 'from-purple-600 to-purple-400',
  },
  {
    slug: 'flixbus',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['flixbus'],
    displayName: {
      en: 'FlixBus',
      'fi-FI': 'FlixBus',
      'ar-AE': 'فليكس باص',
      'ar-SA': 'فليكس باص',
      'pl-PL': 'FlixBus',
      'el-GR': 'FlixBus',
    },
    category: 'retail',
    accentGradient: 'from-green-500 to-emerald-400',
  },
  {
    slug: 'talabat',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['talabat'],
    displayName: {
      en: 'Talabat',
      'fi-FI': 'Talabat',
      'ar-AE': 'طلبات',
      'ar-SA': 'طلبات',
      'pl-PL': 'Talabat',
      'el-GR': 'Talabat',
    },
    category: 'retail',
    accentGradient: 'from-orange-500 to-red-400',
  },
  {
    slug: 'starzplay',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['starzplay', 'starz play'],
    displayName: {
      en: 'STARZPLAY',
      'fi-FI': 'STARZPLAY',
      'ar-AE': 'ستارز بلاي',
      'ar-SA': 'ستارز بلاي',
      'pl-PL': 'STARZPLAY',
      'el-GR': 'STARZPLAY',
    },
    category: 'streaming',
    accentGradient: 'from-fuchsia-600 to-pink-500',
  },
  {
    slug: 'nintendo-eshop',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['nintendo eshop', 'nintendo', 'nintendo switch'],
    displayName: {
      en: 'Nintendo eShop',
      'fi-FI': 'Nintendo eShop',
      'ar-AE': 'نينتندو إي شوب',
      'ar-SA': 'نينتندو إي شوب',
      'pl-PL': 'Nintendo eShop',
      'el-GR': 'Nintendo eShop',
    },
    category: 'gaming',
    accentGradient: 'from-red-600 to-red-400',
  },
  {
    slug: 'google-play',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['google play', 'google play store'],
    displayName: {
      en: 'Google Play',
      'fi-FI': 'Google Play',
      'ar-AE': 'جوجل بلاي',
      'ar-SA': 'جوجل بلاي',
      'pl-PL': 'Google Play',
      'el-GR': 'Google Play',
    },
    category: 'app-store',
    accentGradient: 'from-blue-500 to-green-500',
  },
  {
    slug: 'spotify',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['spotify', 'spotify premium'],
    displayName: {
      en: 'Spotify',
      'fi-FI': 'Spotify',
      'ar-AE': 'سبوتيفاي',
      'ar-SA': 'سبوتيفاي',
      'pl-PL': 'Spotify',
      'el-GR': 'Spotify',
    },
    category: 'streaming',
    accentGradient: 'from-green-500 to-emerald-400',
  },
  {
    slug: 'ea-play',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['ea play', 'electronic arts', 'ea sports'],
    displayName: {
      en: 'EA Play',
      'fi-FI': 'EA Play',
      'ar-AE': 'إي إيه بلاي',
      'ar-SA': 'إي إيه بلاي',
      'pl-PL': 'EA Play',
      'el-GR': 'EA Play',
    },
    category: 'gaming',
    accentGradient: 'from-red-600 to-orange-500',
  },
  {
    slug: 'riot-points',
    reloadlyProductIds: [],
    reloadlyBrandAliases: [
      'riot',
      'riot games',
      'league of legends',
      'valorant',
      'riot points',
    ],
    displayName: {
      en: 'Riot Points',
      'fi-FI': 'Riot Points',
      'ar-AE': 'ريوت بوينتس',
      'ar-SA': 'ريوت بوينتس',
      'pl-PL': 'Riot Points',
      'el-GR': 'Riot Points',
    },
    category: 'gaming',
    accentGradient: 'from-red-500 to-pink-500',
  },
  {
    slug: 'roblox',
    reloadlyProductIds: [],
    reloadlyBrandAliases: ['roblox'],
    displayName: {
      en: 'Roblox',
      'fi-FI': 'Roblox',
      'ar-AE': 'روبلوكس',
      'ar-SA': 'روبلوكس',
      'pl-PL': 'Roblox',
      'el-GR': 'Roblox',
    },
    category: 'gaming',
    accentGradient: 'from-red-600 to-yellow-500',
  },
]

const BY_SLUG: ReadonlyMap<string, BrandConfig> = new Map(
  BRANDS.map((b) => [b.slug, b])
)

/** Look up a brand by slug. Case-insensitive. */
export function getBrandBySlug(slug: string): BrandConfig | undefined {
  return BY_SLUG.get(slug.toLowerCase())
}

/** Display name for a brand in a locale, falling back to en, then to slug. */
export function brandDisplayName(brand: BrandConfig, locale: string): string {
  return brand.displayName[locale] ?? brand.displayName.en ?? brand.slug
}
