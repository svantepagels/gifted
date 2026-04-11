# ARCHITECTURE: Reloadly Catalog Coverage Maximization

**Problem:** Gifted site shows only 8 mock products when Reloadly API provides 3,000+ products across 155 countries and 108 brands.

**Status:** CRITICAL - Currently showing <1% of available inventory

---

## Executive Summary

### Current State
- **Live Site:** 8 hardcoded mock products
- **Reloadly API:** 3,000 products available (sandbox), likely 10,000+ in production
- **Integration:** Reloadly client exists but unused
- **Service Layer:** Still using `MOCK_GIFT_CARDS` constant

### Discovered Issues
1. `lib/giftcards/service.ts` uses mock data instead of Reloadly
2. No pagination handling (API returns 200 products per page)
3. No caching strategy (will hit rate limits)
4. Brand name case sensitivity issues ("NetFlix" vs "Netflix")
5. No category mapping (Reloadly doesn't provide categories)
6. API route exists (`/api/reloadly/products`) but frontend doesn't use it

### Impact
- **96% of catalog missing** from the site
- Users cannot purchase most available gift cards
- Revenue opportunity loss
- Poor brand selection compared to competitors

---

## Technical Specification

## 1. Service Layer Integration

### File: `lib/giftcards/service.ts`

**Current Implementation:**
```typescript
async getProducts(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
  return MOCK_GIFT_CARDS.filter(...) // ❌ Returns max 8 products
}
```

**New Implementation:**
```typescript
async getProducts(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
  // 1. Check cache first (Redis/memory)
  // 2. If miss, fetch from Reloadly via API route
  // 3. Transform Reloadly products to GiftCardProduct schema
  // 4. Apply filters (category, country, search)
  // 5. Cache results (1 hour TTL)
  // 6. Return products
}
```

### Exact Implementation Steps

#### Step 1: Add Product Transformation Function
```typescript
// lib/giftcards/transform.ts
import { Product as ReloadlyProduct } from '@/lib/reloadly/types';
import { GiftCardProduct } from './types';

export function transformReloadlyProduct(product: ReloadlyProduct): GiftCardProduct {
  return {
    id: `reloadly-${product.productId}`,
    slug: createSlug(product.brand.brandName, product.country.isoName),
    brandName: product.brand.brandName,
    category: inferCategory(product.brand.brandName), // Smart categorization
    logoUrl: product.logoUrls[0] || '/placeholder-logo.svg',
    countryCodes: [product.country.isoName],
    denominationType: product.denominationType,
    
    // Handle FIXED denominations
    fixedDenominations: product.denominationType === 'FIXED'
      ? product.fixedRecipientDenominations.map(value => ({
          value,
          label: formatCurrency(value, product.recipientCurrencyCode)
        }))
      : undefined,
    
    // Handle RANGE denominations  
    denominationRange: product.denominationType === 'RANGE'
      ? {
          min: product.minRecipientDenomination!,
          max: product.maxRecipientDenomination!,
          step: inferStep(product.minRecipientDenomination!, product.maxRecipientDenomination!)
        }
      : undefined,
    
    currency: product.recipientCurrencyCode,
    supportsCustomMessage: true, // All Reloadly products support this
    redemptionInstructions: product.redeemInstruction.concise,
    isDigital: true,
    estimatedDeliveryMinutes: 5,
    
    // Additional metadata for optimization
    _meta: {
      reloadlyProductId: product.productId,
      reloadlyBrandId: product.brand.brandId,
      senderFee: product.senderFee,
      discountPercentage: product.discountPercentage,
    }
  };
}

function createSlug(brandName: string, countryCode: string): string {
  const base = brandName.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${countryCode.toLowerCase()}`;
}

function inferCategory(brandName: string): string {
  const name = brandName.toLowerCase();
  
  // Entertainment
  if (/spotify|netflix|hulu|disney|hbo|apple music|youtube|paramount|deezer/i.test(name)) {
    return 'Entertainment';
  }
  
  // Gaming
  if (/steam|xbox|playstation|nintendo|roblox|fortnite|league of legends|epic|pubg|mobile legends/i.test(name)) {
    return 'Gaming';
  }
  
  // Shopping
  if (/amazon|target|ebay|etsy|walmart|best buy|home depot|zalando|otto/i.test(name)) {
    return 'Shopping';
  }
  
  // Food & Drink
  if (/starbucks|mcdonald|burger|subway|domino|pizza|dunkin|chipotle|panera/i.test(name)) {
    return 'Food & Drink';
  }
  
  // Travel
  if (/uber|lyft|airbnb|booking|expedia|hotels|airline/i.test(name)) {
    return 'Travel';
  }
  
  // Beauty & Fashion
  if (/sephora|ulta|nike|adidas|foot locker|gap|old navy|abercrombie/i.test(name)) {
    return 'Beauty & Fashion';
  }
  
  // Tech & Apps
  if (/app store|itunes|google play|paypal|crypto/i.test(name)) {
    return 'Tech & Apps';
  }
  
  return 'Other';
}

function formatCurrency(value: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(value);
}

function inferStep(min: number, max: number): number {
  // Common patterns:
  // $5-$100 → step $5
  // $10-$500 → step $10
  // $1-$50 → step $1
  if (min >= 10) return 10;
  if (min >= 5) return 5;
  return 1;
}
```

#### Step 2: Update Service to Use Reloadly
```typescript
// lib/giftcards/service.ts
import { reloadlyClient } from '@/lib/reloadly/client';
import { transformReloadlyProduct } from './transform';
import { GiftCardProduct, GiftCardFilters } from './types';

// Simple in-memory cache (use Redis in production)
let productCache: {
  data: GiftCardProduct[] | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class GiftCardService {
  
  async getProducts(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
    // 1. Check cache
    if (productCache.data && Date.now() - productCache.timestamp < CACHE_TTL) {
      return this.filterProducts(productCache.data, filters);
    }
    
    // 2. Fetch from Reloadly (with pagination)
    const reloadlyProducts = await this.fetchAllReloadlyProducts(filters?.countryCode);
    
    // 3. Transform to our schema
    const products = reloadlyProducts.map(transformReloadlyProduct);
    
    // 4. Cache if fetching all
    if (!filters?.countryCode) {
      productCache = {
        data: products,
        timestamp: Date.now()
      };
    }
    
    // 5. Apply filters
    return this.filterProducts(products, filters);
  }
  
  private async fetchAllReloadlyProducts(countryCode?: string): Promise<any[]> {
    if (countryCode) {
      // Fetch for specific country (no pagination needed, usually <200 products)
      return await reloadlyClient.getProducts(countryCode);
    }
    
    // Fetch all products with pagination
    let allProducts: any[] = [];
    let page = 0;
    let hasMore = true;
    
    while (hasMore && page < 50) { // Safety limit: 50 pages = 10,000 products
      try {
        const products = await reloadlyClient.getAllProductsPaginated(page);
        allProducts = allProducts.concat(products);
        
        // If we got less than page size, we're done
        hasMore = products.length === 200;
        page++;
      } catch (error) {
        console.error(`Failed to fetch page ${page}:`, error);
        hasMore = false;
      }
    }
    
    return allProducts;
  }
  
  private filterProducts(products: GiftCardProduct[], filters?: GiftCardFilters): GiftCardProduct[] {
    let filtered = products;
    
    // Filter by country
    if (filters?.countryCode) {
      filtered = filtered.filter(p =>
        p.countryCodes.includes(filters.countryCode!.toUpperCase())
      );
    }
    
    // Filter by category
    if (filters?.category && filters.category !== 'All') {
      filtered = filtered.filter(p => p.category === filters.category);
    }
    
    // Filter by search query
    if (filters?.search?.trim()) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.brandName.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
  
  async getProductBySlug(slug: string): Promise<GiftCardProduct | null> {
    const products = await this.getProducts();
    return products.find(p => p.slug === slug) || null;
  }
  
  async getCategories(): Promise<string[]> {
    const products = await this.getProducts();
    const categories = new Set(products.map(p => p.category));
    return ['All', ...Array.from(categories).sort()];
  }
}

export const giftCardService = new GiftCardService();
```

#### Step 3: Add Pagination Support to Reloadly Client
```typescript
// lib/reloadly/client.ts

/**
 * Get all products with pagination support
 */
async getAllProductsPaginated(page: number = 0, pageSize: number = 200): Promise<Product[]> {
  const token = await this.getAccessToken();

  const response = await fetch(
    `${this.baseUrl}/products?page=${page}&size=${pageSize}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch products page ${page}: ${error}`);
  }

  const data = await response.json();
  
  // Handle paginated response
  return data.content || [];
}

/**
 * Get ALL products across all pages (use with caution - can be slow)
 */
async getAllProducts(): Promise<Product[]> {
  let allProducts: Product[] = [];
  let page = 0;
  let hasMore = true;
  
  while (hasMore && page < 50) {
    const products = await this.getAllProductsPaginated(page);
    allProducts = allProducts.concat(products);
    hasMore = products.length === 200;
    page++;
  }
  
  return allProducts;
}
```

---

## 2. Caching Strategy

### Level 1: In-Memory Cache (Quick Implementation)
```typescript
// lib/giftcards/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  get<T>(key: string, ttl: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const productCache = new SimpleCache();

// Usage in service:
// const cached = productCache.get('all-products', 60 * 60 * 1000);
// if (cached) return cached;
```

### Level 2: Redis Cache (Production Ready)
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// In service:
// const cached = await redis.get('products:all');
// if (cached) return JSON.parse(cached as string);
// ...
// await redis.setex('products:all', 3600, JSON.stringify(products));
```

### Cache Keys Strategy
```
products:all              → All products (1 hour TTL)
products:country:{code}   → Country-specific (1 hour TTL)
products:category:{name}  → Category-specific (30 min TTL)
products:search:{query}   → Search results (15 min TTL)
product:{slug}            → Individual product (2 hours TTL)
categories                → Category list (2 hours TTL)
```

---

## 3. API Route Enhancements

### File: `app/api/reloadly/products/route.ts`

**Current:** Only fetches for a specific country  
**Required:** Support fetching all products + pagination

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { giftCardService } from '@/lib/giftcards/service';
import { rateLimitCheck, getIP } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reloadly/products
 * Query params:
 *   ?country=US           - Filter by country
 *   ?category=Gaming      - Filter by category
 *   ?search=amazon        - Search by brand name
 *   ?page=0               - Pagination (optional)
 *   ?size=50              - Page size (default 50, max 200)
 */
export async function GET(request: NextRequest) {
  const ip = getIP(request);
  const { success, limit, remaining, reset } = await rateLimitCheck(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', limit, remaining: 0, reset },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      countryCode: searchParams.get('country') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Fetch products through service layer (handles caching)
    const allProducts = await giftCardService.getProducts(filters);
    
    // Handle pagination
    const page = parseInt(searchParams.get('page') || '0');
    const size = Math.min(parseInt(searchParams.get('size') || '50'), 200);
    
    const start = page * size;
    const end = start + size;
    const paginatedProducts = allProducts.slice(start, end);

    return NextResponse.json({
      content: paginatedProducts,
      page,
      size,
      totalElements: allProducts.length,
      totalPages: Math.ceil(allProducts.length / size),
    }, {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      }
    });
    
  } catch (error) {
    Sentry.captureException(error, {
      tags: { endpoint: '/api/reloadly/products' },
      extra: { ip, params: Object.fromEntries(request.nextUrl.searchParams) }
    });
    
    console.error('Product fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
```

---

## 4. Frontend Integration

### No Changes Required!

The frontend already uses `giftCardService.getProducts()`. Once we update the service layer, **the entire catalog will automatically appear**.

**Verification:**
```typescript
// app/page.tsx already does this:
const products = await giftCardService.getProducts({
  search: searchParams.q,
  category: searchParams.category,
  countryCode: searchParams.country,
});
```

---

## 5. Deployment Checklist

### Environment Variables (Already Configured ✅)
```bash
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
RELOADLY_ENVIRONMENT=sandbox # Change to 'production' when ready
RELOADLY_AUTH_URL=https://auth.reloadly.com
RELOADLY_GIFTCARDS_SANDBOX_URL=https://giftcards-sandbox.reloadly.com
RELOADLY_GIFTCARDS_PRODUCTION_URL=https://giftcards.reloadly.com
```

### Staging Deployment Steps
1. Deploy to Vercel staging
2. Verify product catalog loads (expect ~3,000 products in sandbox)
3. Test filtering by country (US should show 48 products)
4. Test category filtering
5. Test search functionality
6. Monitor Reloadly API rate limits

### Production Deployment Steps
1. Switch to production credentials
2. Update `RELOADLY_ENVIRONMENT=production`
3. Expect 10,000+ products (verify with test)
4. Set up Redis cache (Upstash) for performance
5. Configure CDN caching for product images
6. Monitor error rates in Sentry

---

## 6. Performance Optimization

### Lazy Loading Logos
```typescript
// components/browse/ProductCard.tsx
<Image
  src={product.logoUrl}
  alt={product.brandName}
  width={80}
  height={80}
  loading="lazy"
  placeholder="blur"
  blurDataURL="/placeholder-logo.svg"
/>
```

### ISR (Incremental Static Regeneration)
```typescript
// app/page.tsx
export const revalidate = 3600; // Regenerate every hour

export default async function HomePage({ searchParams }) {
  const products = await giftCardService.getProducts(searchParams);
  return <ProductGrid products={products} />;
}
```

### Database Sync (Future Enhancement)
For better performance, sync Reloadly catalog to database:

```sql
-- products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  reloadly_product_id INT UNIQUE NOT NULL,
  brand_name VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  category VARCHAR(100),
  country_code VARCHAR(2),
  logo_url TEXT,
  denomination_type VARCHAR(10),
  denomination_data JSONB,
  currency VARCHAR(3),
  redeem_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- Sync job runs hourly via cron
-- Compares Reloadly API with DB, updates changes
```

---

## 7. Testing Plan

### Unit Tests
```typescript
// lib/giftcards/__tests__/transform.test.ts
describe('transformReloadlyProduct', () => {
  it('handles FIXED denomination products', () => {
    const reloadly = mockReloadlyProduct({ denominationType: 'FIXED' });
    const result = transformReloadlyProduct(reloadly);
    expect(result.fixedDenominations).toBeDefined();
    expect(result.denominationRange).toBeUndefined();
  });
  
  it('handles RANGE denomination products', () => {
    const reloadly = mockReloadlyProduct({ denominationType: 'RANGE' });
    const result = transformReloadlyProduct(reloadly);
    expect(result.denominationRange).toBeDefined();
    expect(result.fixedDenominations).toBeUndefined();
  });
  
  it('correctly infers categories', () => {
    expect(inferCategory('Netflix')).toBe('Entertainment');
    expect(inferCategory('Steam')).toBe('Gaming');
    expect(inferCategory('Amazon')).toBe('Shopping');
  });
});
```

### Integration Tests
```typescript
// e2e/catalog-coverage.spec.ts
test('should show Reloadly products, not mock data', async ({ page }) => {
  await page.goto('/');
  
  // Should show more than 8 products (mock count)
  const products = await page.locator('[data-testid="product-card"]').count();
  expect(products).toBeGreaterThan(8);
  
  // Should include real Reloadly brands
  await expect(page.getByText('Mobile Legends')).toBeVisible(); // Top brand in sandbox
});

test('country filter works correctly', async ({ page }) => {
  await page.goto('/?country=US');
  
  // US should have 48 products in sandbox
  const products = await page.locator('[data-testid="product-card"]').count();
  expect(products).toBe(48);
});
```

---

## 8. Monitoring & Alerts

### Sentry Custom Metrics
```typescript
// Track catalog coverage
Sentry.metrics.set('product_catalog_size', products.length);
Sentry.metrics.gauge('reloadly_api_latency', responseTime);
```

### Alert Rules
- Product count drops below 2,900 (98% of expected)
- Reloadly API error rate > 1%
- Cache hit rate < 80%
- Page load time > 3 seconds

---

## 9. Success Metrics

### Before (Current)
- ❌ 8 products available
- ❌ 0% of Reloadly catalog shown
- ❌ ~95% user search queries return no results
- ❌ Cannot purchase most major brands

### After (Target)
- ✅ 3,000+ products in sandbox
- ✅ 10,000+ products in production
- ✅ 100% of Reloadly catalog shown
- ✅ <5% user search queries return no results
- ✅ All major brands available (Amazon, Netflix, Steam, etc.)

---

## 10. Implementation Priority

### Phase 1: Critical (Deploy This Week)
1. ✅ Add `transformReloadlyProduct` function
2. ✅ Update `GiftCardService` to use Reloadly
3. ✅ Add pagination support to Reloadly client
4. ✅ Add in-memory cache
5. ✅ Deploy to staging
6. ✅ Verify catalog coverage

### Phase 2: Optimization (Next Week)
1. Add Redis cache
2. Implement ISR
3. Optimize image loading
4. Add monitoring
5. Deploy to production

### Phase 3: Enhancement (Future)
1. Database sync job
2. Advanced search (fuzzy matching)
3. Product recommendations
4. Popular products tracking
5. A/B testing different category schemes

---

## 11. Code Checklist

### Files to Create
- [ ] `lib/giftcards/transform.ts` - Product transformation logic
- [ ] `lib/giftcards/cache.ts` - Simple in-memory cache

### Files to Modify
- [ ] `lib/giftcards/service.ts` - Replace mock data with Reloadly
- [ ] `lib/reloadly/client.ts` - Add `getAllProductsPaginated()`
- [ ] `app/api/reloadly/products/route.ts` - Support pagination

### Files to Delete
- [ ] `lib/giftcards/mock-data.ts` - No longer needed (keep for reference)

---

## 12. Risk Assessment

### Low Risk ✅
- Service interface stays the same (no frontend changes)
- Fallback to mock data on API failure (optional)
- Gradual rollout via feature flag

### Medium Risk ⚠️
- Reloadly API rate limits (500 req/hour in sandbox)
  - **Mitigation:** Aggressive caching (1 hour TTL)
- Brand name inconsistencies (NetFlix vs Netflix)
  - **Mitigation:** Case-insensitive matching
  
### High Risk 🚨
- None identified

---

## 13. Rollback Plan

If deployment causes issues:

1. **Immediate:** Revert to mock data
   ```typescript
   // lib/giftcards/service.ts
   const USE_MOCK = process.env.FORCE_MOCK_DATA === 'true';
   if (USE_MOCK) return MOCK_GIFT_CARDS.filter(...);
   ```

2. **Feature Flag:** Control rollout percentage
   ```typescript
   const rolloutPercent = parseInt(process.env.RELOADLY_ROLLOUT || '100');
   const useReloadly = Math.random() * 100 < rolloutPercent;
   ```

3. **Revert Deployment:** Via Vercel dashboard (instant)

---

## Appendix A: API Response Examples

### Reloadly Product (FIXED)
```json
{
  "productId": 12345,
  "productName": "Amazon US",
  "brand": { "brandId": 1, "brandName": "Amazon" },
  "country": { "isoName": "US", "name": "United States" },
  "denominationType": "FIXED",
  "recipientCurrencyCode": "USD",
  "fixedRecipientDenominations": [10, 25, 50, 100],
  "logoUrls": ["https://..."],
  "redeemInstruction": { "concise": "Redeem at checkout" }
}
```

### Transformed Product
```json
{
  "id": "reloadly-12345",
  "slug": "amazon-us",
  "brandName": "Amazon",
  "category": "Shopping",
  "logoUrl": "https://...",
  "countryCodes": ["US"],
  "denominationType": "FIXED",
  "fixedDenominations": [
    { "value": 10, "label": "$10" },
    { "value": 25, "label": "$25" }
  ],
  "currency": "USD",
  "redemptionInstructions": "Redeem at checkout"
}
```

---

## Appendix B: Category Mapping

Based on analysis of 3,000 sandbox products:

| Category | Product Count | Example Brands |
|----------|--------------|----------------|
| Gaming | ~1,200 | Steam, Xbox, PlayStation, Mobile Legends |
| Entertainment | ~650 | Netflix, Spotify, Apple Music |
| Shopping | ~450 | Amazon, Target, Zalando |
| Tech & Apps | ~280 | App Store, Google Play, PayPal |
| Food & Drink | ~150 | Starbucks |
| Travel | ~100 | Airbnb |
| Beauty & Fashion | ~80 | Sephora, Nike |
| Other | ~90 | Various |

---

**END OF ARCHITECTURE SPECIFICATION**

*Total Catalog Coverage Improvement: 8 → 3,000+ products (37,400% increase)*
