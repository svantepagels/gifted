/**
 * Reloadly Product Transformation
 * 
 * Transforms Reloadly API product schema to our internal GiftCardProduct schema.
 * Handles denomination types, category inference, and formatting.
 */

import type { Product as ReloadlyProduct } from '@/lib/reloadly/types';
import type { GiftCardProduct } from './types';

/**
 * Transform a Reloadly product to our internal schema
 */
export function transformReloadlyProduct(product: ReloadlyProduct): GiftCardProduct {
  return {
    id: `reloadly-${product.productId}`,
    slug: createSlug(product.brand.brandName, product.country.isoName, product.productId),
    brandName: normalizeBrandName(product.brand.brandName),
    category: inferCategory(product.brand.brandName),
    logoUrl: product.logoUrls[0] || '/placeholder-logo.svg',
    countryCodes: [product.country.isoName],
    denominationType: product.denominationType,
    
    // Handle FIXED denominations
    fixedDenominations: product.denominationType === 'FIXED' && product.fixedRecipientDenominations
      ? product.fixedRecipientDenominations.map(value => ({
          value,
          label: formatCurrency(value, product.recipientCurrencyCode),
        }))
      : undefined,
    
    // Handle RANGE denominations
    denominationRange: product.denominationType === 'RANGE' && product.minRecipientDenomination
      ? {
          min: product.minRecipientDenomination,
          max: product.maxRecipientDenomination!,
          step: inferStep(product.minRecipientDenomination, product.maxRecipientDenomination!),
        }
      : undefined,
    
    currency: product.recipientCurrencyCode,
    supportsCustomMessage: true, // All Reloadly products support sender name/message
    redemptionInstructions: product.redeemInstruction?.concise || 'Redeem according to brand instructions',
    isDigital: true,
    estimatedDeliveryMinutes: 5,
    
    // Store metadata for order processing
    _meta: {
      reloadlyProductId: product.productId,
      reloadlyBrandId: product.brand.brandId,
      senderFee: product.senderFee,
      discountPercentage: product.discountPercentage,
      global: product.global,
    }
  };
}

/**
 * Create a URL-friendly slug from brand name, country, and product ID
 */
function createSlug(brandName: string, countryCode: string, productId: number): string {
  const brandSlug = brandName
    .toLowerCase()
    .normalize('NFD') // Normalize unicode characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
  
  return `${brandSlug}-${countryCode.toLowerCase()}-${productId}`;
}

/**
 * Normalize brand names (fix common inconsistencies)
 */
function normalizeBrandName(brandName: string): string {
  // Fix common brand name variations
  const normalizations: Record<string, string> = {
    'NetFlix': 'Netflix',
    'NETFLIX': 'Netflix',
    'App Store & iTunes': 'Apple',
    'Google play': 'Google Play',
    'Playstation': 'PlayStation',
  };
  
  return normalizations[brandName] || brandName;
}

/**
 * Infer product category from brand name
 * 
 * Uses pattern matching against common brand keywords.
 * Categories match those defined in CATEGORIES constant.
 */
export function inferCategory(brandName: string): string {
  const name = brandName.toLowerCase();
  
  // Entertainment (Streaming, Music, Media)
  if (/spotify|netflix|hulu|disney|hbo|apple music|youtube|paramount|deezer|pandora|tidal|soundcloud/i.test(name)) {
    return 'Media';
  }
  
  // Gaming (Platforms, Games, In-game Currency)
  if (/steam|xbox|playstation|nintendo|roblox|fortnite|league of legends|epic|pubg|mobile legends|blizzard|ea|rockstar|ubisoft|valorant|apex|cod|minecraft|clash/i.test(name)) {
    return 'Gaming';
  }
  
  // Shopping (Retail, E-commerce, General Stores)
  if (/amazon|target|ebay|etsy|walmart|best buy|home depot|lowe|zalando|otto|asos|ikea|costco|whole foods/i.test(name)) {
    return 'Shopping';
  }
  
  // Food & Drink (Restaurants, Coffee, Food Delivery)
  if (/starbucks|mcdonald|burger|subway|domino|pizza|dunkin|chipotle|panera|uber eats|doordash|grubhub|seamless/i.test(name)) {
    return 'Food';
  }
  
  // Travel (Rideshare, Hotels, Airlines, Booking)
  if (/uber|lyft|airbnb|booking|expedia|hotels|airline|southwest|delta|united|marriott|hilton/i.test(name)) {
    return 'Travel';
  }
  
  // Beauty & Fashion (Cosmetics, Apparel, Footwear)
  if (/sephora|ulta|nike|adidas|foot locker|gap|old navy|abercrombie|h&m|zara|macy|nordstrom/i.test(name)) {
    return 'Beauty';
  }
  
  // Tech & Apps (App Stores, Digital Services, Crypto)
  if (/app store|itunes|google play|paypal|crypto|apple|microsoft|samsung|huawei/i.test(name)) {
    return 'Tech';
  }
  
  // Default category for unrecognized brands
  return 'Other';
}

/**
 * Format currency value with proper symbol and locale
 */
function formatCurrency(value: number, currencyCode: string): string {
  // Handle common currency codes
  const locale = getCurrencyLocale(currencyCode);
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    // Fallback for unsupported currency codes
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

/**
 * Get appropriate locale for currency code
 */
function getCurrencyLocale(currencyCode: string): string {
  const localeMap: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'de-DE',
    'GBP': 'en-GB',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
    'JPY': 'ja-JP',
    'CNY': 'zh-CN',
    'INR': 'en-IN',
    'BRL': 'pt-BR',
    'MXN': 'es-MX',
  };
  
  return localeMap[currencyCode] || 'en-US';
}

/**
 * Infer appropriate step value for RANGE denomination type
 * 
 * Examples:
 * - $1-$50 → step $1
 * - $5-$100 → step $5  
 * - $10-$500 → step $10
 * - $25-$1000 → step $25
 */
function inferStep(min: number, max: number): number {
  const range = max - min;
  
  // For small ranges, use $1 steps
  if (range <= 50) return 1;
  
  // For medium ranges, use $5 steps
  if (range <= 200) return 5;
  
  // For large ranges, use $10 or $25 steps
  if (range <= 500) return 10;
  
  return 25;
}

/**
 * Get all unique categories from a list of products
 */
export function extractCategories(products: GiftCardProduct[]): string[] {
  const categories = new Set(products.map(p => p.category));
  const sorted = Array.from(categories).sort();
  
  // Always include 'All' as first option
  return ['All', ...sorted];
}

/**
 * Get category distribution statistics
 */
export function getCategoryStats(products: GiftCardProduct[]): Record<string, number> {
  const stats: Record<string, number> = {};
  
  products.forEach(product => {
    const category = product.category;
    stats[category] = (stats[category] || 0) + 1;
  });
  
  return stats;
}
