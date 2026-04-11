# RESEARCHER: Production Deployment & Monitoring Recommendations

**Date:** 2026-04-11  
**Scope:** Post-deployment monitoring, optimization, and scaling strategies  
**Context:** Reloadly catalog integration for Gifted platform

---

## 🚀 Production Deployment Strategy

### Phase 1: Staging Deployment (Day 1)

**Objective:** Validate integration in production-like environment

#### Pre-Deploy Checklist

```bash
# 1. Run verification script
cd /Users/administrator/.openclaw/workspace/gifted-project
npx tsx verify-catalog-integration.ts

# 2. Check environment variables
vercel env pull .env.production

# 3. Deploy to preview
vercel --preview

# 4. Run smoke tests
npm run test:e2e -- --grep "catalog"
```

#### Validation Criteria

- [ ] Product count >2,900
- [ ] Search returns results
- [ ] Category filters work
- [ ] Country filters work
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Cache statistics accessible

### Phase 2: Canary Deployment (Day 2)

**Objective:** Deploy to small percentage of production traffic

#### Vercel Configuration

```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=3600, stale-while-revalidate=7200"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/",
      "has": [
        {
          "type": "cookie",
          "key": "beta-catalog",
          "value": "true"
        }
      ],
      "destination": "/beta"
    }
  ]
}
```

**Enable for 10% of traffic:**
```bash
# Set up feature flag
vercel env add ENABLE_RELOADLY_CATALOG production
# Value: true

# Monitor for 24 hours
```

#### Monitoring During Canary

**Key Metrics to Watch:**

1. **Error Rate**
   - Target: <1%
   - Alert threshold: >5%
   - Monitor via Sentry

2. **Response Time**
   - Target: <3 seconds (p95)
   - Alert threshold: >5 seconds
   - Monitor via Vercel Analytics

3. **Cache Hit Rate**
   - Target: >80%
   - Alert threshold: <60%
   - Monitor via custom endpoint

4. **API Usage**
   - Target: <100 Reloadly API calls/hour
   - Alert threshold: >500 calls/hour
   - Monitor via logs

### Phase 3: Full Production (Day 3-7)

**Objective:** Roll out to 100% of traffic

```bash
# Deploy to production
git push origin main
vercel --prod

# Monitor for 7 days
# Rollback plan ready
```

---

## 📊 Monitoring & Observability

### 1. Cache Performance Monitoring

#### Create Debug Endpoint

```typescript
// app/api/debug/cache-stats/route.ts
import { NextResponse } from 'next/server';
import { giftCardService } from '@/lib/giftcards/service';

export async function GET() {
  const stats = giftCardService.getCacheStats();
  
  return NextResponse.json({
    ...stats,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}

// Protect in production:
export const runtime = 'edge';
export const revalidate = 0;
```

**Sample Response:**
```json
{
  "size": 156,
  "hits": 8542,
  "misses": 234,
  "total": 8776,
  "hitRate": "97.33%",
  "timestamp": "2026-04-11T18:30:00.000Z",
  "uptime": 86400
}
```

#### Cache Monitoring Script

```typescript
// scripts/monitor-cache.ts
async function monitorCache() {
  const response = await fetch('https://gifted.vercel.app/api/debug/cache-stats');
  const stats = await response.json();
  
  // Alert if hit rate drops below 80%
  if (parseFloat(stats.hitRate) < 80) {
    await fetch('SLACK_WEBHOOK_URL', {
      method: 'POST',
      body: JSON.stringify({
        text: `⚠️ Cache hit rate dropped to ${stats.hitRate}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Cache Performance Alert*\n\nHit rate: ${stats.hitRate}\nTotal requests: ${stats.total}\nCache size: ${stats.size}`,
            },
          },
        ],
      }),
    });
  }
}

// Run every 5 minutes
setInterval(monitorCache, 5 * 60 * 1000);
```

### 2. Reloadly API Usage Tracking

#### Add Logging to Client

```typescript
// lib/reloadly/client.ts (enhancement)
export class ReloadlyClient {
  private static apiCallCount = 0;
  private static lastReset = Date.now();
  
  private async getAccessToken(): Promise<string> {
    // ... existing code ...
    
    // Track API calls
    ReloadlyClient.apiCallCount++;
    
    // Reset counter every hour
    const now = Date.now();
    if (now - ReloadlyClient.lastReset > 60 * 60 * 1000) {
      console.log(`[Reloadly] API calls last hour: ${ReloadlyClient.apiCallCount}`);
      ReloadlyClient.apiCallCount = 0;
      ReloadlyClient.lastReset = now;
    }
    
    // Alert if excessive
    if (ReloadlyClient.apiCallCount > 500) {
      console.warn('[Reloadly] High API usage detected!');
    }
    
    return this.accessToken;
  }
  
  static getStats() {
    return {
      callCount: this.apiCallCount,
      period: 'last-hour',
      resetAt: new Date(this.lastReset).toISOString(),
    };
  }
}
```

### 3. Product Search Analytics

#### Track Popular Searches

```typescript
// lib/analytics/search-tracker.ts
export class SearchTracker {
  private static searches = new Map<string, number>();
  
  static track(query: string) {
    const normalized = query.toLowerCase().trim();
    const count = this.searches.get(normalized) || 0;
    this.searches.set(normalized, count + 1);
  }
  
  static getTopSearches(limit = 10) {
    return Array.from(this.searches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
  }
  
  static reset() {
    this.searches.clear();
  }
}

// In service:
async getProducts(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
  if (filters?.search) {
    SearchTracker.track(filters.search);
  }
  // ... rest of code
}
```

**Analytics Endpoint:**

```typescript
// app/api/analytics/search/route.ts
import { SearchTracker } from '@/lib/analytics/search-tracker';

export async function GET() {
  const topSearches = SearchTracker.getTopSearches(20);
  
  return NextResponse.json({
    searches: topSearches,
    totalSearches: topSearches.reduce((sum, s) => sum + s.count, 0),
    uniqueQueries: topSearches.length,
  });
}
```

### 4. Error Monitoring with Sentry

#### Enhanced Error Tracking

```typescript
// app/error.tsx (enhanced)
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry with context
    Sentry.captureException(error, {
      tags: {
        component: 'catalog',
        source: 'reloadly',
      },
      contexts: {
        reloadly: {
          apiCallCount: ReloadlyClient.getStats().callCount,
        },
        cache: giftCardService.getCacheStats(),
      },
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We're having trouble loading the gift card catalog.
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-2 rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

---

## 🔧 Performance Optimization

### 1. Implement Redis Cache (Production Scale)

**Recommended:** Upstash Redis (serverless-friendly)

#### Setup

```bash
# Install dependencies
npm install @upstash/redis

# Add to .env.production
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
```

#### Enhanced Cache Implementation

```typescript
// lib/giftcards/cache-redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisCache {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get<T>(key);
    return value;
  }
  
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redis.setex(key, ttlSeconds, value);
  }
  
  async has(key: string): Promise<boolean> {
    const exists = await redis.exists(key);
    return exists === 1;
  }
  
  async invalidate(key: string): Promise<void> {
    await redis.del(key);
  }
  
  async clear(): Promise<void> {
    await redis.flushdb();
  }
  
  async stats() {
    const info = await redis.info('stats');
    // Parse Redis INFO command output
    return {
      hits: parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0'),
      misses: parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0'),
    };
  }
}

export const productCache = new RedisCache();
```

**Benefits:**
- Shared cache across all Vercel instances
- Persistence across deployments
- Better hit rate
- Automatic eviction

### 2. Image Optimization

**Problem:** Reloadly logo URLs may be slow or broken

**Solution:** Cache images via Vercel Blob

```typescript
// lib/images/logo-cache.ts
import { put, head } from '@vercel/blob';

export async function cacheLogo(url: string): Promise<string> {
  // Generate cache key from URL
  const hash = Buffer.from(url).toString('base64url');
  const blobPath = `logos/${hash}.png`;
  
  // Check if already cached
  try {
    const blob = await head(blobPath);
    if (blob) return blob.url;
  } catch {
    // Not cached yet
  }
  
  // Fetch and cache
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  
  const blob = await put(blobPath, arrayBuffer, {
    access: 'public',
    contentType: 'image/png',
  });
  
  return blob.url;
}

// Use in transform:
export async function transformReloadlyProduct(product: ReloadlyProduct): Promise<GiftCardProduct> {
  const logoUrl = await cacheLogo(product.logoUrls[0]);
  
  return {
    // ... other fields
    logoUrl,
  };
}
```

### 3. Search Optimization

**Implement Fuzzy Search for Better Results**

```bash
npm install fuse.js
```

```typescript
// lib/giftcards/search.ts
import Fuse from 'fuse.js';

export function searchProducts(
  products: GiftCardProduct[],
  query: string
): GiftCardProduct[] {
  const fuse = new Fuse(products, {
    keys: ['brandName', 'category'],
    threshold: 0.3, // Allow some typos
    distance: 100,
  });
  
  const results = fuse.search(query);
  return results.map(r => r.item);
}

// In service:
if (filters?.search?.trim()) {
  filtered = searchProducts(filtered, filters.search);
}
```

---

## 🎯 Scaling Considerations

### When to Scale Up

**Indicators:**
1. Cache hit rate drops below 80%
2. API rate limit warnings
3. Page load time >3 seconds (p95)
4. User count >10,000 DAU

### Scaling Strategy

#### Level 1: Optimize Current Architecture (0-10k DAU)
- ✅ In-memory cache
- ✅ ISR with 1-hour revalidation
- ✅ Basic monitoring

#### Level 2: Distributed Cache (10k-100k DAU)
- 🔄 Upstash Redis
- 🔄 Vercel Edge Config
- 🔄 Product image CDN

#### Level 3: Database Sync (100k+ DAU)
- 🔄 Daily sync Reloadly → PostgreSQL
- 🔄 Serve from database (instant)
- 🔄 Background job for updates
- 🔄 Reloadly API only for orders

**Database Schema:**

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  reloadly_product_id INTEGER UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  logo_url TEXT,
  country_codes TEXT[] NOT NULL,
  denomination_type VARCHAR(10) NOT NULL,
  fixed_denominations JSONB,
  denomination_range JSONB,
  currency VARCHAR(10) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_category (category),
  INDEX idx_brand (brand_name),
  INDEX idx_countries (country_codes) USING GIN
);

-- Daily sync job (cron)
-- Compares Reloadly catalog with DB and updates
```

---

## 🚨 Incident Response Playbook

### Scenario 1: Rate Limit Exceeded

**Symptoms:**
- API returns 429 errors
- "API rate limit exceeded" message

**Immediate Actions:**
1. Check cache hit rate (`/api/debug/cache-stats`)
2. Temporarily increase cache TTL to 6 hours
3. Enable fallback to mock data (`FALLBACK_TO_MOCK=true`)
4. Contact Reloadly support for rate limit increase

**Prevention:**
- Monitor API call frequency
- Alert at 80% of rate limit
- Implement exponential backoff

### Scenario 2: Reloadly API Down

**Symptoms:**
- 500/503 errors from Reloadly
- Timeout errors

**Immediate Actions:**
1. Activate fallback to mock data
2. Serve stale cache (remove TTL check)
3. Display banner: "Some products may be temporarily unavailable"
4. Monitor Reloadly status page

**Code:**

```typescript
// Enhanced error handling in service
try {
  const reloadlyProducts = await reloadlyClient.getAllProductsPaginated(page, 200);
} catch (error) {
  console.error('[Reloadly] API error:', error);
  
  // Try to serve stale cache
  const staleCache = productCache.get(cacheKey, Infinity); // No TTL check
  if (staleCache) {
    console.warn('[Reloadly] Serving stale cache due to API error');
    return staleCache;
  }
  
  // Ultimate fallback: mock data
  if (process.env.FALLBACK_TO_MOCK === 'true') {
    const { MOCK_GIFT_CARDS } = await import('./mock-data');
    return MOCK_GIFT_CARDS;
  }
  
  throw error;
}
```

### Scenario 3: High Memory Usage

**Symptoms:**
- Vercel function timeouts
- Out of memory errors

**Immediate Actions:**
1. Clear in-memory cache: `giftCardService.clearCache()`
2. Reduce cache size (limit products stored)
3. Switch to Redis cache

**Long-term Fix:**
- Implement Redis (distributed cache)
- Use Vercel Edge Functions (smaller memory footprint)

---

## 📈 Success Metrics Dashboard

### Week 1 KPIs

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Product Count | >2,900 | - | 🔄 Pending |
| Error Rate | <1% | - | 🔄 Pending |
| Cache Hit Rate | >80% | - | 🔄 Pending |
| Page Load (p95) | <3s | - | 🔄 Pending |
| API Calls/Hour | <100 | - | 🔄 Pending |
| User Search Success | >95% | - | 🔄 Pending |

### Month 1 KPIs

| Metric | Target | Status |
|--------|--------|--------|
| Product Catalog Coverage | 100% | 🔄 In Progress |
| Search Accuracy | >95% | 🔄 In Progress |
| Mobile Performance (Lighthouse) | >90 | 🔄 In Progress |
| Conversion Rate | +20% vs mock | 🔄 Tracking |

---

## 🔗 Resources

### Monitoring Tools

1. **Vercel Analytics**
   - https://vercel.com/analytics
   - Track real user metrics (RUM)

2. **Sentry**
   - Error tracking
   - Performance monitoring
   - Already configured

3. **Upstash Console**
   - Redis monitoring
   - Cache statistics

4. **Custom Dashboards**
   - `/api/debug/cache-stats` - Cache performance
   - `/api/analytics/search` - Search trends

### Documentation

1. **Vercel ISR Guide**
   - https://vercel.com/docs/incremental-static-regeneration

2. **Upstash Redis**
   - https://upstash.com/docs/redis

3. **Next.js Performance**
   - https://nextjs.org/docs/app/building-your-application/optimizing

---

## ✅ Final Recommendations

### Critical Path (Do First)

1. ✅ Deploy Architect's code with type fix
2. 📊 Set up basic monitoring (/api/debug/cache-stats)
3. 🚨 Configure error alerts (Sentry)
4. 📈 Track initial metrics (Week 1 dashboard)

### Next Priorities (Week 2-3)

1. 🎯 Optimize search with Fuse.js
2. 🖼️ Implement image caching
3. 🚀 Add ISR for better performance
4. 📊 Analyze search trends

### Future Enhancements (Month 2+)

1. ☁️ Migrate to Redis cache
2. 🗄️ Consider database sync for scale
3. 🤖 Add ML-based recommendations
4. 🌍 Multi-language support

---

**Status:** ✅ COMPLETE  
**Ready For:** CODER implementation  
**Last Updated:** 2026-04-11
