/**
 * Gift Card Service - Reloadly Integration
 * 
 * Fetches products from Reloadly API with caching and filtering.
 * Replace existing service.ts with this file once tested.
 */

import { reloadlyClient } from '@/lib/reloadly/client';
import { transformReloadlyProduct, extractCategories } from './transform';
import { productCache, CacheTTL, CacheKeys } from './cache';
import type { GiftCardProduct, GiftCardFilters } from './types';

export class GiftCardService {
  
  /**
   * Get products with optional filters
   * Uses caching to minimize API calls
   * FIXED: Now deduplicates by brand to avoid showing multiple country variants
   */
  async getProducts(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
    try {
      // If filtering by country, fetch country-specific products (no deduplication needed)
      if (filters?.countryCode) {
        return await this.getCountryProducts(filters.countryCode, filters);
      }
      
      // Otherwise, get all products (with caching)
      const allProducts = await this.getAllProductsCached();
      
      // Apply filters
      let filtered = this.filterProducts(allProducts, filters);
      
      // DEDUPLICATE by brand (keep first occurrence of each brand)
      filtered = this.deduplicateByBrand(filtered);
      
      return filtered;
      
    } catch (error) {
      console.error('Failed to fetch products:', error);
      
      // Fallback to mock data on error (optional)
      if (process.env.FALLBACK_TO_MOCK === 'true') {
        const { MOCK_GIFT_CARDS } = await import('./mock-data');
        return this.filterProducts(MOCK_GIFT_CARDS, filters);
      }
      
      throw error;
    }
  }
  
  /**
   * Get all products with caching
   */
  private async getAllProductsCached(): Promise<GiftCardProduct[]> {
    const cacheKey = CacheKeys.allProducts();
    
    // Check cache first
    const cached = productCache.get<GiftCardProduct[]>(cacheKey, CacheTTL.ALL_PRODUCTS);
    if (cached) {
      console.log('[Cache] Hit: all products');
      return cached;
    }
    
    console.log('[Cache] Miss: all products - fetching from Reloadly');
    
    // Fetch from Reloadly with pagination
    const reloadlyProducts = await this.fetchAllReloadlyProducts();
    
    // Transform to our schema
    const products = reloadlyProducts.map(transformReloadlyProduct);
    
    // Cache the results
    productCache.set(cacheKey, products);
    
    console.log(`[Reloadly] Fetched ${products.length} products`);
    
    return products;
  }
  
  /**
   * Get products for a specific country with caching
   */
  private async getCountryProducts(
    countryCode: string,
    filters?: GiftCardFilters
  ): Promise<GiftCardProduct[]> {
    const cacheKey = CacheKeys.countryProducts(countryCode);
    
    // Check cache
    const cached = productCache.get<GiftCardProduct[]>(cacheKey, CacheTTL.COUNTRY_PRODUCTS);
    if (cached) {
      console.log(`[Cache] Hit: ${countryCode} products`);
      return this.filterProducts(cached, filters);
    }
    
    console.log(`[Cache] Miss: ${countryCode} products - fetching from Reloadly`);
    
    // Fetch from Reloadly (no pagination needed for country-specific)
    const reloadlyProducts = await reloadlyClient.getProducts(countryCode.toUpperCase());
    
    // Transform to our schema
    const products = reloadlyProducts.map(transformReloadlyProduct);
    
    // Cache the results
    productCache.set(cacheKey, products);
    
    console.log(`[Reloadly] Fetched ${products.length} products for ${countryCode}`);
    
    // Apply additional filters
    return this.filterProducts(products, filters);
  }
  
  /**
   * Fetch all products from Reloadly with pagination
   * FIXED: Properly detects end of pagination using API response metadata
   */
  private async fetchAllReloadlyProducts(): Promise<any[]> {
    let allProducts: any[] = [];
    let page = 0;
    let hasMore = true;
    const maxPages = 100; // Safety limit increased to 100 pages (was 50)
    
    while (hasMore && page < maxPages) {
      try {
        console.log(`[Reloadly] Fetching page ${page + 1}...`);
        
        // Fetch page with pagination metadata
        const response = await reloadlyClient.getAllProductsPaginatedWithMeta(page, 200);
        
        allProducts = allProducts.concat(response.content);
        
        // Check if this is the last page using pagination metadata
        hasMore = !response.last && response.content.length > 0;
        page++;
        
        console.log(`[Reloadly] Page ${page}: fetched ${response.content.length} products, ` +
                    `total so far: ${allProducts.length}, ` +
                    `hasMore: ${hasMore}`);
        
      } catch (error) {
        console.error(`[Reloadly] Failed to fetch page ${page}:`, error);
        hasMore = false; // Stop on error
      }
    }
    
    if (page >= maxPages) {
      console.warn(`[Reloadly] Stopped at page ${maxPages} (safety limit)`);
    }
    
    console.log(`[Reloadly] Finished! Total products fetched: ${allProducts.length} across ${page} pages`);
    
    return allProducts;
  }
  
  /**
   * Apply filters to product list
   */
  private filterProducts(
    products: GiftCardProduct[],
    filters?: GiftCardFilters
  ): GiftCardProduct[] {
    let filtered = products;
    
    // Filter by country (if not already filtered)
    if (filters?.countryCode) {
      filtered = filtered.filter(p =>
        p.countryCodes.includes(filters.countryCode!.toUpperCase())
      );
    }
    
    // Filter by category
    if (filters?.category && filters.category !== 'All') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    // Filter by search query (fuzzy match on brand name and category)
    if (filters?.search?.trim()) {
      const query = filters.search.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const brandMatch = p.brandName.toLowerCase().includes(query);
        const categoryMatch = p.category.toLowerCase().includes(query);
        return brandMatch || categoryMatch;
      });
    }
    
    return filtered;
  }

  /**
   * Deduplicate products by brand, keeping only one variant per brand
   * Prioritizes products with more country coverage (more versatile)
   */
  private deduplicateByBrand(products: GiftCardProduct[]): GiftCardProduct[] {
    const brandMap = new Map<string, GiftCardProduct>();
    
    products.forEach(product => {
      const brandKey = product.brandName.toLowerCase().trim();
      
      // If brand not seen yet, add it
      if (!brandMap.has(brandKey)) {
        brandMap.set(brandKey, product);
      }
      // If we've seen this brand, keep the variant with more countries (more versatile)
      else {
        const existing = brandMap.get(brandKey)!;
        if (product.countryCodes.length > existing.countryCodes.length) {
          brandMap.set(brandKey, product);
        }
      }
    });
    
    return Array.from(brandMap.values());
  }
  
  /**
   * Get product by slug
   * FIXED: Added comprehensive logging for debugging blank page issues
   */
  async getProductBySlug(slug: string): Promise<GiftCardProduct | null> {
    const cacheKey = CacheKeys.product(slug);
    
    // Check cache
    const cached = productCache.get<GiftCardProduct>(cacheKey, CacheTTL.SINGLE_PRODUCT);
    if (cached) {
      console.log(`[Cache] Hit: product ${slug}`);
      return cached;
    }
    
    console.log(`[Cache] Miss: product ${slug} - searching in all products`);
    
    // Get all products and find by slug (use getAllProductsCached directly to include all variants)
    const allProducts = await this.getAllProductsCached();
    console.log(`[getProductBySlug] Searching for '${slug}' in ${allProducts.length} products`);
    
    const product = allProducts.find(p => p.slug === slug) || null;
    
    if (!product) {
      console.error(`[getProductBySlug] Product not found for slug: ${slug}`);
      console.log('[getProductBySlug] Sample slugs:', allProducts.slice(0, 5).map(p => p.slug));
    } else {
      console.log(`[getProductBySlug] Found: ${product.brandName}`);
      // Cache if found
      productCache.set(cacheKey, product);
    }
    
    return product;
  }
  
  /**
   * Get a product by its numeric Reloadly product ID.
   * Used by the order API route to server-validate denominations.
   */
  async getProductByReloadlyId(reloadlyProductId: number): Promise<GiftCardProduct | null> {
    const allProducts = await this.getAllProductsCached();
    return allProducts.find(p => p._meta?.reloadlyProductId === reloadlyProductId) || null;
  }

  /**
   * Get list of all categories
   */
  async getCategories(): Promise<string[]> {
    const cacheKey = CacheKeys.categories();
    
    // Check cache
    const cached = productCache.get<string[]>(cacheKey, CacheTTL.CATEGORIES);
    if (cached) {
      console.log('[Cache] Hit: categories');
      return cached;
    }
    
    console.log('[Cache] Miss: categories');
    
    // Get all products and extract categories
    const products = await this.getProducts();
    const categories = extractCategories(products);
    
    // Cache the results
    productCache.set(cacheKey, categories);
    
    return categories;
  }
  
  /**
   * Clear all caches (useful for testing or manual refresh)
   */
  clearCache(): void {
    productCache.clear();
    console.log('[Cache] Cleared all caches');
  }
  
  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats() {
    return productCache.stats();
  }
}

// Singleton instance
export const giftCardService = new GiftCardService();
