# Quick Start: Catalog Integration (5 Minutes)

**Problem:** Site shows 8 products, Reloadly has 3,000+  
**Solution:** Replace mock service with Reloadly integration  
**Time:** <1 hour

---

## 1. Copy Files (2 min)

```bash
# These files are ready - just ensure they're in place
ls lib/giftcards/transform.ts      # ✅ NEW
ls lib/giftcards/cache.ts          # ✅ NEW
ls lib/giftcards/service-reloadly.ts   # ✅ NEW
```

## 2. Update Types (1 min)

Add to `lib/giftcards/types.ts`:

```typescript
export interface GiftCardProduct {
  // ... existing fields ...
  
  _meta?: {
    reloadlyProductId: number
    reloadlyBrandId: number
    senderFee: number
    discountPercentage: number
    global: boolean
  }
}
```

## 3. Replace Service (1 min)

```bash
cp lib/giftcards/service.ts lib/giftcards/service-backup.ts
cp lib/giftcards/service-reloadly.ts lib/giftcards/service.ts
```

## 4. Verify (1 min)

```bash
npx tsx verify-catalog-integration.ts
```

Expected: `✅ ALL TESTS PASSED! Ready to deploy.`

## 5. Test Locally (5 min)

```bash
npm run dev
```

Visit http://localhost:3000:
- [ ] See >8 products
- [ ] Search works
- [ ] Categories show 8+ options

## 6. Deploy (2 min)

```bash
git add .
git commit -m "feat: integrate Reloadly catalog (3,000+ products)"
git push origin main
vercel --prod
```

## 7. Verify Production

- [ ] Visit deployed URL
- [ ] Confirm >100 products visible
- [ ] No errors in Vercel logs

---

**Done!** 🎉

**Before:** 8 products  
**After:** 3,000+ products

---

**Full docs:**
- `ARCHITECT_HANDOFF_CATALOG.md` - Implementation guide
- `ARCHITECT_CATALOG_COVERAGE.md` - Technical architecture
- `IMPLEMENTATION_GUIDE.md` - Deployment details
