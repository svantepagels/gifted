/**
 * Simple In-Memory Cache
 * 
 * Provides TTL-based caching for product catalog and other data.
 * In production, replace with Redis (Upstash) for distributed caching.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private hitCount = 0;
  private missCount = 0;
  
  /**
   * Get cached value if exists and not expired
   * 
   * @param key Cache key
   * @param ttl Time-to-live in milliseconds
   * @returns Cached value or null if expired/not found
   */
  get<T>(key: string, ttl: number): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.missCount++;
      return null;
    }
    
    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    this.hitCount++;
    return entry.data as T;
  }
  
  /**
   * Set cache value
   * 
   * @param key Cache key
   * @param data Data to cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
  
  /**
   * Check if key exists and is valid
   */
  has(key: string, ttl: number): boolean {
    return this.get(key, ttl) !== null;
  }
  
  /**
   * Invalidate specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
  
  /**
   * Get cache statistics
   */
  stats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;
    
    return {
      size: this.cache.size,
      hits: this.hitCount,
      misses: this.missCount,
      total,
      hitRate: hitRate.toFixed(2) + '%',
    };
  }
  
  /**
   * Get all keys currently in cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Export singleton instance
export const productCache = new SimpleCache();

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  ALL_PRODUCTS: 60 * 60 * 1000,      // 1 hour
  COUNTRY_PRODUCTS: 60 * 60 * 1000,  // 1 hour
  CATEGORIES: 2 * 60 * 60 * 1000,    // 2 hours
  SINGLE_PRODUCT: 2 * 60 * 60 * 1000, // 2 hours
  SEARCH_RESULTS: 15 * 60 * 1000,    // 15 minutes
} as const;

/**
 * Cache key generators
 */
export const CacheKeys = {
  allProducts: () => 'products:all',
  countryProducts: (code: string) => `products:country:${code.toUpperCase()}`,
  categories: () => 'categories:all',
  product: (slug: string) => `product:${slug}`,
  searchResults: (query: string) => `search:${query.toLowerCase()}`,
} as const;
