# Product Card Layout Fix - Quick Reference

**Created:** 2026-04-12  
**Architect:** Swarm ARCHITECT Agent  
**Task:** Move category pill above brand name & shorten category labels  

---

## 📋 Quick Summary

**What's changing:**
- Category pill moves from beside brand name → above brand name
- Long category names shortened: "Entertainment" → "Media", "Food & Drink" → "Food", etc.
- Cleaner layout with better visual hierarchy

**Files to modify:**
1. `lib/giftcards/transform.ts` - Category name mappings
2. `components/browse/ProductCard.tsx` - Card layout structure
3. `components/shared/CategoryChips.tsx` - Category filter chips config
4. `components/layout/Footer.tsx` - Category navigation link

---

## 🎯 Category Name Changes

| Old | New | Location |
|-----|-----|----------|
| `Entertainment` | `Media` | transform.ts:42 |
| `Food & Drink` | `Food` | transform.ts:57 |
| `Beauty & Fashion` | `Beauty` | transform.ts:67 |
| `Tech & Apps` | `Tech` | transform.ts:72 |

**All other categories** (Shopping, Gaming, Travel, Lifestyle, Other) → **No change**

---

## 🔧 Code Changes

### 1. Update Category Returns (transform.ts)

```typescript
// Line ~42
return 'Media'; // was 'Entertainment'

// Line ~57
return 'Food'; // was 'Food & Drink'

// Line ~67
return 'Beauty'; // was 'Beauty & Fashion'

// Line ~72
return 'Tech'; // was 'Tech & Apps'
```

### 2. Update CategoryColors Object (ProductCard.tsx ~line 30)

```typescript
// Change key from 'entertainment' to 'media'
const categoryColors = {
  // ...
  media: { // was 'entertainment'
    bg: 'bg-category-entertainment/10',
    text: 'text-category-entertainment',
    gradient: 'from-category-entertainment to-purple-400',
  },
  // ...
};
```

### 2.5 Update CategoryConfig Object (CategoryChips.tsx ~line 12)

```typescript
// Change key from 'entertainment' to 'media'
const categoryConfig = {
  // ...
  media: { // was 'entertainment'
    icon: Film,
    color: 'text-category-entertainment',
    bg: 'bg-category-entertainment hover:bg-category-entertainment/90',
  },
  // ...
};
```

### 2.6 Update Footer Category Link (Footer.tsx line 25-26)

```tsx
// Change Entertainment to Media
<Link href="/?category=Media" className="...">
  Media
</Link>
```

### 3. Restructure Product Info Section (ProductCard.tsx ~line 97)

**Replace this:**
```tsx
<div className="flex items-start justify-between gap-3 mb-3">
  <h3>{product.brandName}</h3>
  <div className={/* category pill */}>
    {/* ... */}
  </div>
</div>
```

**With this:**
```tsx
{/* Category first */}
<div className="mb-2 flex items-start">
  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${categoryStyle.bg} whitespace-nowrap`}>
    <CategoryIcon className={`w-3.5 h-3.5 ${categoryStyle.text} flex-shrink-0`} />
    <span className={`text-[11px] font-medium ${categoryStyle.text}`}>
      {product.category}
    </span>
  </div>
</div>

{/* Brand name second */}
<h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors duration-300 font-semibold mb-3">
  {product.brandName}
</h3>
```

**Key additions:**
- `whitespace-nowrap` on pill container
- `flex-shrink-0` on icon
- `inline-flex` on pill
- Remove `capitalize` class from span
- `mb-2` on category container, `mb-3` on brand name

---

## ✅ Testing Checklist

- [ ] Categories show shortened names (Media, Food, Beauty, Tech)
- [ ] Category pill appears **above** brand name on all cards
- [ ] Category text doesn't wrap (single line)
- [ ] Test mobile viewport (390px) - pills fit without wrapping
- [ ] Test desktop - cleaner layout confirmed
- [ ] Category colors still work
- [ ] Hover states functional
- [ ] No console errors

---

## 🚀 Deploy

```bash
cd /Users/administrator/.openclaw/workspace/gifted-project
git add .
git commit -m "feat: improve product card layout - move category above brand name"
git push origin main
vercel --prod --yes
```

---

## 📊 Visual Hierarchy (New Order)

1. Instant badge (top right)
2. Brand logo placeholder
3. **Category pill** ← NEW POSITION
4. Brand name
5. Price range
6. Digital delivery info

---

## 🔍 Verification Commands

```bash
# Check category returns
grep -n "return '" lib/giftcards/transform.ts

# Verify media key exists
grep "media:" components/browse/ProductCard.tsx

# Find any old category URLs
grep -rn "Entertainment\|Food & Drink" components/ app/

# Build check
npm run build
```

---

## ⚠️ Don't Forget

1. Update `categoryColors` key: `entertainment` → `media` (ProductCard.tsx)
2. Update `categoryConfig` key: `entertainment` → `media` (CategoryChips.tsx)
3. Remove `capitalize` class from category span
4. Add `whitespace-nowrap` to prevent wrapping
5. Add `flex-shrink-0` to icon
6. Test on **real mobile devices** (not just browser resize)

---

**Full specification:** See `ARCHITECT_PRODUCT_CARD_LAYOUT_FIX.md` for complete details, edge cases, and rollback plan.
