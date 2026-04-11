# RESEARCHER: Quick Reference Card for CODER

## 🎯 Three Bugs, Three Fixes

### Bug #1: Duplicates on Homepage
**File**: `lib/giftcards/service.ts`  
**Add Method** (around line 110):
```typescript
private deduplicateByBrand(products: GiftCardProduct[]): GiftCardProduct[] {
  const brandMap = new Map<string, GiftCardProduct>();
  products.forEach(product => {
    const brandKey = product.brandName.toLowerCase().trim();
    if (!brandMap.has(brandKey)) {
      brandMap.set(brandKey, product);
    } else {
      const existing = brandMap.get(brandKey)!;
      if (product.countryCodes.length > existing.countryCodes.length) {
        brandMap.set(brandKey, product);
      }
    }
  });
  return Array.from(brandMap.values());
}
```

**Update `getProducts()` method** (around line 25):
```typescript
// After filtering, before return:
if (!filters?.countryCode) {
  filtered = this.deduplicateByBrand(filtered);
}
return filtered;
```

---

### Bug #2: Pagination Stops Too Early
**File**: `lib/reloadly/client.ts`  
**Add Interface** (top of file):
```typescript
interface PaginatedResponse<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}
```

**Add Method** (around line 100):
```typescript
async getAllProductsPaginatedWithMeta(
  page: number = 0,
  size: number = 200
): Promise<PaginatedResponse<Product>> {
  const token = await this.getAccessToken();
  const response = await fetch(
    `${this.baseUrl}/products?page=${page}&size=${Math.min(size, 200)}`,
    { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch products page ${page}: ${await response.text()}`);
  }
  const data = await response.json();
  return {
    content: data.content || [],
    pageable: data.pageable || { pageNumber: page, pageSize: size },
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 1,
    last: data.last ?? true,
    first: data.first ?? (page === 0),
  };
}
```

**File**: `lib/giftcards/service.ts`  
**Update `fetchAllReloadlyProducts()`** (around line 60):
```typescript
private async fetchAllReloadlyProducts(): Promise<any[]> {
  let allProducts: any[] = [];
  let page = 0;
  let hasMore = true;
  const maxPages = 100;
  
  while (hasMore && page < maxPages) {
    try {
      console.log(`[Reloadly] Fetching page ${page + 1}...`);
      const response = await reloadlyClient.getAllProductsPaginatedWithMeta(page, 200);
      allProducts = allProducts.concat(response.content);
      
      // ✅ FIX: Use response.last instead of length check
      hasMore = !response.last && response.content.length > 0;
      page++;
      
      console.log(
        `[Reloadly] Page ${page}: ${response.content.length} products, ` +
        `total: ${allProducts.length}, hasMore: ${hasMore}`
      );
    } catch (error) {
      console.error(`[Reloadly] Failed to fetch page ${page}:`, error);
      hasMore = false;
    }
  }
  
  console.log(`[Reloadly] Finished! Total: ${allProducts.length} products`);
  return allProducts;
}
```

---

### Bug #3: Blank Page on Product Detail
**File**: `lib/giftcards/service.ts`  
**Update `getProductBySlug()`** (around line 90):
```typescript
async getProductBySlug(slug: string): Promise<GiftCardProduct | null> {
  const cacheKey = CacheKeys.product(slug);
  const cached = productCache.get<GiftCardProduct>(cacheKey, CacheTTL.SINGLE_PRODUCT);
  if (cached) {
    console.log(`[Cache] Hit: product ${slug}`);
    return cached;
  }
  
  console.log(`[Cache] Miss: product ${slug}`);
  const products = await this.getAllProductsCached();
  console.log(`[getProductBySlug] Searching '${slug}' in ${products.length} products`);
  
  const product = products.find(p => p.slug === slug) || null;
  
  if (!product) {
    console.error(`[getProductBySlug] NOT FOUND: ${slug}`);
    console.log('[getProductBySlug] Sample slugs:', products.slice(0, 5).map(p => p.slug));
  } else {
    console.log(`[getProductBySlug] Found: ${product.brandName}`);
    productCache.set(cacheKey, product);
  }
  
  return product;
}
```

**File**: `app/gift-card/[slug]/page.tsx`  
**Update `loadProduct()`** (around line 25):
```typescript
async function loadProduct() {
  try {
    const slug = params.slug as string;
    console.log('[ProductDetail] Loading slug:', slug);
    
    const data = await giftCardService.getProductBySlug(slug);
    
    if (!data) {
      console.error('[ProductDetail] Product not found:', slug);
      alert(`Product not found: ${slug}`);
      router.push('/');
      return;
    }
    
    console.log('[ProductDetail] Loaded:', data.brandName);
    
    if (!data.countryCodes.includes(selectedCountry.code)) {
      console.warn('[ProductDetail] Not available in', selectedCountry.name);
      alert(`${data.brandName} not available in ${selectedCountry.name}`);
      router.push('/');
      return;
    }
    
    setProduct(data);
    setCartProduct(data);
  } catch (error) {
    console.error('[ProductDetail] Error:', error);
    alert('Failed to load product');
    router.push('/');
  } finally {
    setIsLoading(false);
  }
}
```

---

## ⚡ Quick Test Commands

```bash
# Development
npm run dev
# Open http://localhost:3000
# Open browser console (F12)
# Check for logs:
# - [Reloadly] Fetching page 1...
# - [ProductDetail] Loading slug: ...

# Production Build
npm run build
# Should complete without errors

# Deploy
git add .
git commit -m "fix: resolve duplicate products, pagination, and blank page bugs"
git push origin main
vercel --prod --yes
```

---

## ✅ Success Indicators

After fixes:
- Console shows "Fetching page 1... 2... 3..." up to ~50-100 pages
- Homepage shows 100+ unique brands (no duplicates)
- Product detail pages always load (or show error, never blank)
- Total products: 5000-10000+ instead of ~400

---

## 📚 Full Documentation

- **Complete Research**: `RESEARCHER_BUG_FIX_CONTEXT.md`
- **Executive Summary**: `RESEARCHER_EXECUTIVE_SUMMARY.md`
- **Architecture Spec**: See ARCHITECT output above

---

**Ready to code!** 🚀
