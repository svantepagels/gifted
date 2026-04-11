# Reloadly Catalog Integration - Implementation Guide

## Quick Start

This guide shows you how to replace the mock data with real Reloadly catalog integration.

---

## Files Created

✅ **New Files:**
1. `lib/giftcards/transform.ts` - Product transformation and category inference
2. `lib/giftcards/cache.ts` - In-memory caching layer
3. `lib/giftcards/service-reloadly.ts` - Reloadly-integrated service

✅ **Modified Files:**
1. `lib/reloadly/client.ts` - Added pagination methods

---

## Step-by-Step Implementation

### Step 1: Test Reloadly Integration

Before deploying, verify the integration works:

```bash
# Test that Reloadly API is accessible and pagination works
npx tsx test-reloadly-direct.ts
```

**Expected output:**
```
✅ Total products: 3000
✅ US products: 48
✅ Categories: Gaming, Entertainment, Shopping, etc.
```

### Step 2: Backup Current Service

```bash
# Backup the current mock-based service
cp lib/giftcards/service.ts lib/giftcards/service-mock.ts.bak
```

### Step 3: Replace Service with Reloadly Version

```bash
# Replace current service with Reloadly-integrated version
cp lib/giftcards/service-reloadly.ts lib/giftcards/service.ts
```

Alternatively, manually merge the changes by copying the implementation from `service-reloadly.ts` into `service.ts`.

### Step 4: Update Type Definitions

Add `_meta` field to `GiftCardProduct` interface:

```typescript
// lib/giftcards/types.ts

export interface GiftCardProduct {
  id: string
  slug: string
  brandName: string
  category: string
  logoUrl: string
  countryCodes: string[]
  denominationType: 'FIXED' | 'RANGE'
  fixedDenominations?: { value: number; label: string }[]
  denominationRange?: { min: number; max: number; step?: number }
  currency: string
  supportsCustomMessage: boolean
  redemptionInstructions: string
  isDigital: boolean
  estimatedDeliveryMinutes: number
  
  // NEW: Metadata for Reloadly integration
  _meta?: {
    reloadlyProductId: number
    reloadlyBrandId: number
    senderFee: number
    discountPercentage: number
    global: boolean
  }
}
```

### Step 5: Test Locally

```bash
# Install dependencies (if needed)
npm install

# Run dev server
npm run dev
```

Visit http://localhost:3000 and verify:

- [ ] Products load (should see more than 8)
- [ ] Search works
- [ ] Category filtering works
- [ ] Country filtering works (try `?country=US`)
- [ ] Product detail pages load

### Step 6: Check Cache Performance

Add a debug endpoint to monitor cache:

```typescript
// app/api/debug/cache-stats/route.ts
import { NextResponse } from 'next/server';
import { giftCardService } from '@/lib/giftcards/service';

export async function GET() {
  const stats = giftCardService.getCacheStats();
  return NextResponse.json(stats);
}
```

Visit http://localhost:3000/api/debug/cache-stats to see:
```json
{
  "size": 3,
  "hits": 145,
  "misses": 3,
  "total": 148,
  "hitRate": "97.97%"
}
```

### Step 7: Deploy to Staging

```bash
# Commit changes
git add .
git commit -m "feat: integrate Reloadly catalog (3,000+ products)"

# Push to staging branch
git push origin main

# Deploy to Vercel
vercel --prod
```

### Step 8: Verify Production

After deployment:

1. **Check product count:**
   - Open homepage
   - Verify more than 8 products show
   - Expected: ~3,000 in sandbox, ~10,000+ in production

2. **Test filtering:**
   - Select different categories
   - Try country filter: `?country=US`
   - Verify search works

3. **Monitor errors:**
   - Check Vercel logs
   - Check Sentry for errors
   - Monitor Reloadly API quota

4. **Performance:**
   - Page should load in <3 seconds
   - Cache hit rate should be >80%

---

## Environment Variables

### Current (Sandbox)
```bash
RELOADLY_ENVIRONMENT=sandbox
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
```

### Production (When Ready)
```bash
RELOADLY_ENVIRONMENT=production
RELOADLY_CLIENT_ID=<your-production-client-id>
RELOADLY_CLIENT_SECRET=<your-production-client-secret>
```

Add to Vercel:
```bash
vercel env add RELOADLY_ENVIRONMENT production <<< "production"
vercel env add RELOADLY_CLIENT_ID production <<< "your-production-id"
vercel env add RELOADLY_CLIENT_SECRET production <<< "your-production-secret"
```

---

## Rollback Plan

If something goes wrong:

### Option 1: Revert via Git
```bash
git revert HEAD
git push origin main
```

### Option 2: Restore Mock Service
```bash
cp lib/giftcards/service-mock.ts.bak lib/giftcards/service.ts
git commit -am "rollback: restore mock service"
git push origin main
```

### Option 3: Feature Flag (Emergency)
Add to `.env.local`:
```bash
FALLBACK_TO_MOCK=true
```

The service will automatically fall back to mock data on Reloadly API errors.

---

## Monitoring

### Key Metrics to Watch

1. **Product Count**
   - Expected: 3,000+ (sandbox), 10,000+ (production)
   - Alert if drops below 2,900

2. **API Errors**
   - Monitor 401 (auth failure)
   - Monitor 429 (rate limit)
   - Monitor 5xx (Reloadly downtime)

3. **Cache Hit Rate**
   - Expected: >80%
   - Alert if <50%

4. **Page Load Time**
   - Expected: <3 seconds
   - Alert if >5 seconds

### Sentry Alerts

```typescript
// Add custom metrics
import * as Sentry from '@sentry/nextjs';

Sentry.metrics.set('product_catalog_size', products.length);
Sentry.metrics.gauge('cache_hit_rate', hitRate);
```

---

## Testing Checklist

### Manual Testing

- [ ] Homepage loads with >8 products
- [ ] Search: "amazon" returns Amazon products
- [ ] Filter: "Gaming" category shows gaming products
- [ ] Filter: `?country=US` shows US products only
- [ ] Product detail page loads correctly
- [ ] Product detail shows correct denominations
- [ ] Categories list shows 8+ categories (not just "All, Shopping...")

### Automated Testing

```bash
# Run Playwright tests
npm run test:e2e

# Or run specific test
npx playwright test e2e/catalog-coverage.spec.ts
```

Expected test file (`e2e/catalog-coverage.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('should show Reloadly products instead of mock data', async ({ page }) => {
  await page.goto('/');
  
  // Should show more than 8 products
  const productCards = page.locator('[data-testid="product-card"]');
  const count = await productCards.count();
  
  expect(count).toBeGreaterThan(8);
  console.log(`✅ Found ${count} products (expected >8)`);
});

test('should show diverse categories', async ({ page }) => {
  await page.goto('/');
  
  // Should have multiple categories
  const categories = page.locator('[data-testid="category-chip"]');
  const count = await categories.count();
  
  expect(count).toBeGreaterThan(5); // More than just "All, Shopping, Gaming..."
  console.log(`✅ Found ${count} categories`);
});

test('US filter should work', async ({ page }) => {
  await page.goto('/?country=US');
  
  // Should show US products
  await expect(page.getByText('Amazon')).toBeVisible();
  await expect(page.getByText('Target')).toBeVisible();
});
```

---

## Performance Optimization

### Phase 1: In-Memory Cache (Current)
- ✅ Implemented in `cache.ts`
- ✅ 1-hour TTL for product catalog
- ⚠️  Does not persist across deployments
- ⚠️  Does not share across instances

### Phase 2: Redis Cache (Recommended for Production)

Install Upstash Redis:
```bash
npm install @upstash/redis
```

Create `lib/redis.ts`:
```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

Update service to use Redis:
```typescript
// lib/giftcards/service.ts

import { redis } from '@/lib/redis';

private async getAllProductsCached(): Promise<GiftCardProduct[]> {
  const cacheKey = 'products:all';
  
  // Try Redis first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }
  
  // Fetch from Reloadly
  const products = await this.fetchAllReloadlyProducts();
  
  // Cache in Redis (1 hour)
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
  
  return products;
}
```

### Phase 3: Database Sync (Future)

For even better performance, sync Reloadly catalog to database:
1. Run hourly cron job to fetch latest products
2. Store in PostgreSQL/Supabase
3. Serve from database (instant responses)
4. Update only when products change

---

## Troubleshooting

### Issue: "No products showing"

**Check:**
1. Environment variables set correctly
2. Reloadly API credentials valid
3. Check browser console for errors
4. Check Vercel logs

**Fix:**
```bash
# Verify env vars
vercel env ls

# Pull latest env
vercel env pull

# Restart dev server
npm run dev
```

### Issue: "Too many API requests (429)"

**Cause:** Hitting Reloadly rate limit  
**Fix:** Increase cache TTL or implement Redis

```typescript
// Increase TTL to 2 hours
export const CacheTTL = {
  ALL_PRODUCTS: 2 * 60 * 60 * 1000, // 2 hours
  // ...
};
```

### Issue: "Products not updating"

**Cause:** Cache not expiring  
**Fix:** Manual cache clear

```bash
# Add admin endpoint
# app/api/admin/clear-cache/route.ts

import { giftCardService } from '@/lib/giftcards/service';

export async function POST(request: Request) {
  const { authorization } = request.headers;
  
  // Simple auth check
  if (authorization !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  giftCardService.clearCache();
  return new Response('Cache cleared', { status: 200 });
}
```

Then call:
```bash
curl -X POST https://your-app.vercel.app/api/admin/clear-cache \
  -H "Authorization: Bearer your-admin-secret"
```

---

## Success Criteria

### ✅ Deployment is successful when:

1. **Product Count:** >2,900 products showing (98% of 3,000)
2. **Search Works:** Searching "steam" returns Steam products
3. **Filter Works:** Category filter shows correct products
4. **No Errors:** Zero errors in Sentry for 24 hours
5. **Performance:** Page loads in <3 seconds
6. **Cache:** Hit rate >80%

### 📊 Metrics Dashboard

Track in Vercel Analytics / PostHog:
- Total products available
- Most searched brands
- Most popular categories
- Conversion rate by category
- API error rate
- Cache hit rate

---

## Next Steps

After successful deployment:

1. **Monitor for 48 hours** - Watch for errors, performance issues
2. **Gather feedback** - Check user behavior, search patterns
3. **Optimize categories** - Refine category inference logic based on data
4. **Add Redis** - Upgrade caching for production scale
5. **Database sync** - Implement for better performance
6. **Analytics** - Track which products are most popular

---

## Support

**Issues?**
- Check Vercel logs: `vercel logs`
- Check Sentry: https://sentry.io
- Review Reloadly docs: https://developers.reloadly.com/

**Questions?**
- Refer to `ARCHITECT_CATALOG_COVERAGE.md` for detailed architecture
- Check `test-reloadly-direct.ts` for API examples

---

**READY TO DEPLOY?** ✅

Run the checklist above, test thoroughly, then deploy to production!
