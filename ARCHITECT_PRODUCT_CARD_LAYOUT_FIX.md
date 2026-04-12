# ARCHITECT DELIVERABLE: Product Card Layout Fix

**Task:** Fix Gifted product card layouts to move category pill above brand name and shorten category labels

**Project:** `/Users/administrator/.openclaw/workspace/gifted-project`

**Date:** 2026-04-12

---

## Executive Summary

This specification defines the exact changes required to improve the product card layout by:
1. Moving the category pill from beside the brand name to above it
2. Shortening long category names to max 12 characters
3. Improving visual hierarchy and reducing layout crowding
4. Ensuring responsive behavior across mobile (390px) and desktop viewports

---

## Affected Files

### Primary Files to Modify (4 files total)

1. **`/Users/administrator/.openclaw/workspace/gifted-project/lib/giftcards/transform.ts`**
   - Function: `inferCategory()`
   - Changes: Update category name return values to shortened versions
   - Lines affected: ~42, ~57, ~67, ~72

2. **`/Users/administrator/.openclaw/workspace/gifted-project/components/browse/ProductCard.tsx`**
   - Component: ProductCard
   - Changes: Layout restructure, move category pill position, update categoryColors key
   - Lines affected: ~30 (categoryColors object), ~97-120 (Product Info section)

3. **`/Users/administrator/.openclaw/workspace/gifted-project/components/shared/CategoryChips.tsx`**
   - Object: `categoryConfig`
   - Changes: Update `entertainment` key to `media` for icon/color mapping
   - Lines affected: ~12-38 (categoryConfig object)

4. **`/Users/administrator/.openclaw/workspace/gifted-project/components/layout/Footer.tsx`**
   - Component: Footer
   - Changes: Update category link from "Entertainment" to "Media"
   - Lines affected: ~25-26 (category link)

---

## Category Name Mapping Changes

### File: `lib/giftcards/transform.ts`

**Function:** `inferCategory(brandName: string): string`

**Current → New Mappings:**

| Current Category | New Category | Max Characters | Rationale |
|------------------|--------------|----------------|-----------|
| `Entertainment` | `Media` | 5 chars | Shorter, clearer for streaming/content |
| `Tech & Apps` | `Tech` | 4 chars | Removes redundant "& Apps" |
| `Food & Drink` | `Food` | 4 chars | Primary use case, simpler |
| `Beauty & Fashion` | `Beauty` | 6 chars | More common search term |
| `Shopping` | `Shopping` | 8 chars | No change (already concise) |
| `Gaming` | `Gaming` | 6 chars | No change (already concise) |
| `Travel` | `Travel` | 6 chars | No change (already concise) |
| `Lifestyle` | `Lifestyle` | 9 chars | No change (already concise) |
| `Other` | `Other` | 5 chars | No change (fallback category) |

**Implementation:**

```typescript
// In inferCategory() function, update all return statements:

// Line ~42: Entertainment → Media
if (/spotify|netflix|hulu|disney|hbo|apple music|youtube|paramount|deezer|pandora|tidal|soundcloud/i.test(name)) {
  return 'Media'; // Changed from 'Entertainment'
}

// Line ~47: Gaming (no change)
if (/steam|xbox|playstation|nintendo|roblox|fortnite|league of legends|epic|pubg|mobile legends|blizzard|ea|rockstar|ubisoft|valorant|apex|cod|minecraft|clash/i.test(name)) {
  return 'Gaming';
}

// Line ~52: Shopping (no change)
if (/amazon|target|ebay|etsy|walmart|best buy|home depot|lowe|zalando|otto|asos|ikea|costco|whole foods/i.test(name)) {
  return 'Shopping';
}

// Line ~57: Food & Drink → Food
if (/starbucks|mcdonald|burger|subway|domino|pizza|dunkin|chipotle|panera|uber eats|doordash|grubhub|seamless/i.test(name)) {
  return 'Food'; // Changed from 'Food & Drink'
}

// Line ~62: Travel (no change)
if (/uber|lyft|airbnb|booking|expedia|hotels|airline|southwest|delta|united|marriott|hilton/i.test(name)) {
  return 'Travel';
}

// Line ~67: Beauty & Fashion → Beauty
if (/sephora|ulta|nike|adidas|foot locker|gap|old navy|abercrombie|h&m|zara|macy|nordstrom/i.test(name)) {
  return 'Beauty'; // Changed from 'Beauty & Fashion'
}

// Line ~72: Tech & Apps → Tech
if (/app store|itunes|google play|paypal|crypto|apple|microsoft|samsung|huawei/i.test(name)) {
  return 'Tech'; // Changed from 'Tech & Apps'
}

// Line ~77: Other (no change)
return 'Other';
```

---

## ProductCard Component Layout Changes

### File: `components/browse/ProductCard.tsx`

**Current Structure (lines ~97-118):**

```tsx
{/* Product Info */}
<div className="p-5 flex-1 flex flex-col">
  {/* Brand Name & Category */}
  <div className="flex items-start justify-between gap-3 mb-3">
    <h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors duration-300 font-semibold">
      {product.brandName}
    </h3>
    
    {/* Category Badge with Icon */}
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${categoryStyle.bg}`}>
      <CategoryIcon className={`w-3.5 h-3.5 ${categoryStyle.text}`} />
      <span className={`text-[11px] font-medium ${categoryStyle.text} capitalize`}>
        {product.category}
      </span>
    </div>
  </div>

  {/* Price Display */}
  <p className="text-headline-sm font-archivo text-primary mb-3">
    {priceDisplay}
  </p>

  {/* Delivery Info */}
  <div className="mt-auto flex items-center gap-3 text-label-md text-surface-on-surface-variant">
    {/* ... */}
  </div>
</div>
```

**New Structure:**

```tsx
{/* Product Info */}
<div className="p-5 flex-1 flex flex-col">
  {/* Category Badge with Icon - MOVED ABOVE BRAND NAME */}
  <div className="mb-2 flex items-start">
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${categoryStyle.bg} whitespace-nowrap`}>
      <CategoryIcon className={`w-3.5 h-3.5 ${categoryStyle.text} flex-shrink-0`} />
      <span className={`text-[11px] font-medium ${categoryStyle.text}`}>
        {product.category}
      </span>
    </div>
  </div>

  {/* Brand Name */}
  <h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors duration-300 font-semibold mb-3">
    {product.brandName}
  </h3>

  {/* Price Display */}
  <p className="text-headline-sm font-archivo text-primary mb-3">
    {priceDisplay}
  </p>

  {/* Delivery Info */}
  <div className="mt-auto flex items-center gap-3 text-label-md text-surface-on-surface-variant">
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${categoryStyle.text}`} />
      <span>Digital delivery</span>
    </div>
    <span className="text-surface-on-surface-variant/40">•</span>
    <span>~5 min</span>
  </div>
</div>
```

---

## Detailed Change Breakdown

### 1. Category Pill Positioning

**Before:**
- Positioned in `flex items-start justify-between` container with brand name
- Takes up right side of container, competing for horizontal space

**After:**
- Positioned in its own container above brand name
- Uses `inline-flex` to only take up width of content
- Parent uses `flex items-start` to left-align the pill

**CSS Classes Added:**
- `whitespace-nowrap` - Prevents category text from wrapping to multiple lines
- `flex-shrink-0` on icon - Prevents icon from shrinking
- `inline-flex` on pill container - Pill only takes needed width

### 2. Visual Hierarchy (Top to Bottom)

**New order:**
1. **Instant badge** (top right, absolute positioned)
2. **Brand initial circle** (logo placeholder in aspect-video container)
3. **Category pill** ← NEW POSITION (line ~97)
4. **Brand name** (line ~106)
5. **Price range** (line ~111)
6. **Digital delivery info** (line ~116)

### 3. Spacing Adjustments

**Category pill container:**
- `mb-2` (margin-bottom: 0.5rem / 8px) - Space between category and brand name

**Brand name:**
- `mb-3` (margin-bottom: 0.75rem / 12px) - Space between brand name and price

**Consistent padding:**
- Outer container maintains `p-5` (padding: 1.25rem / 20px)

### 4. One-Line Category Guarantee

**Constraints:**
- Max category name length: 12 characters (actual max is 9 with "Lifestyle")
- `whitespace-nowrap` prevents wrapping
- Category names are all single words except one ("Lifestyle")
- Icon is `flex-shrink-0` to prevent compression
- Pill uses `inline-flex` to avoid stretching

**Mobile (390px) Verification:**
- Longest category "Lifestyle" (9 chars) + icon + padding = ~100px
- Card width at 390px viewport ≈ 350px (accounting for page margins)
- Category pill max width ≈ 28% of card width - safe margin

---

## Category Icon Mapping

**No changes required** - Current icons work well with shortened names:

| Category | Icon | Lucide Component |
|----------|------|------------------|
| Media | Film | `Film` |
| Gaming | Gamepad2 | `Gamepad2` |
| Shopping | ShoppingBag | `ShoppingBag` |
| Food | Utensils | `Utensils` |
| Travel | Plane | `Plane` |
| Beauty | Heart | `Heart` |
| Tech | ShoppingBag | `ShoppingBag` (fallback) |
| Lifestyle | Heart | `Heart` |
| Other | ShoppingBag | `ShoppingBag` (fallback) |

**Note:** Icons are already mapped by category key (lowercase) in `categoryIcons` object (line ~19-26).

---

## Category Color Mapping

**No changes required** - Colors remain the same:

```typescript
const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  shopping: {
    bg: 'bg-category-shopping/10',
    text: 'text-category-shopping',
    gradient: 'from-category-shopping to-blue-400',
  },
  entertainment: { // Will now be 'media' key
    bg: 'bg-category-entertainment/10',
    text: 'text-category-entertainment',
    gradient: 'from-category-entertainment to-purple-400',
  },
  food: { // Already lowercase
    bg: 'bg-category-food/10',
    text: 'text-category-food',
    gradient: 'from-category-food to-orange-400',
  },
  travel: {
    bg: 'bg-category-travel/10',
    text: 'text-category-travel',
    gradient: 'from-category-travel to-cyan-400',
  },
  gaming: {
    bg: 'bg-category-gaming/10',
    text: 'text-category-gaming',
    gradient: 'from-category-gaming to-pink-400',
  },
  lifestyle: {
    bg: 'bg-category-lifestyle/10',
    text: 'text-category-lifestyle',
    gradient: 'from-category-lifestyle to-green-400',
  },
};
```

**Action Required:** Update the `entertainment` key to `media`:

```typescript
const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
  // ... other categories ...
  media: { // Changed from 'entertainment'
    bg: 'bg-category-entertainment/10', // Keep same Tailwind class
    text: 'text-category-entertainment', // Keep same Tailwind class
    gradient: 'from-category-entertainment to-purple-400', // Keep same Tailwind class
  },
  // ... other categories ...
};
```

**Rationale:** The Tailwind classes (`category-entertainment`) are defined in `tailwind.config.ts` and don't need to change. Only the JavaScript object key changes to match the new category name.

---

## CategoryChips Component Update

### File: `components/shared/CategoryChips.tsx`

**Current Object (line ~12-38):**

```typescript
const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  all: { /* ... */ },
  shopping: { /* ... */ },
  entertainment: { // ← NEEDS UPDATE
    icon: Film,
    color: 'text-category-entertainment',
    bg: 'bg-category-entertainment hover:bg-category-entertainment/90',
  },
  food: { /* ... */ },
  travel: { /* ... */ },
  gaming: { /* ... */ },
  lifestyle: { /* ... */ },
};
```

**Updated Object:**

```typescript
const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  all: { /* ... */ },
  shopping: { /* ... */ },
  media: { // Changed from 'entertainment'
    icon: Film,
    color: 'text-category-entertainment', // Tailwind class unchanged
    bg: 'bg-category-entertainment hover:bg-category-entertainment/90', // Tailwind class unchanged
  },
  food: { /* ... */ },
  travel: { /* ... */ },
  gaming: { /* ... */ },
  lifestyle: { /* ... */ },
};
```

**Why this change is needed:**

The CategoryChips component uses `category.toLowerCase()` to look up the config:
```typescript
const categoryKey = category.toLowerCase(); // "Media" → "media"
const config = categoryConfig[categoryKey] || categoryConfig.all;
```

When the category name changes from "Entertainment" to "Media", the lookup key changes from `"entertainment"` to `"media"`. The config object key must match.

**Note:** The Tailwind classes (`text-category-entertainment`, `bg-category-entertainment`) remain unchanged because they reference the color palette defined in `tailwind.config.ts`, which we're not modifying.

---

## Responsive Behavior

### Mobile (390px viewport)

**Card container:**
- Full width minus page margins (typically 16px each side)
- Effective card width: ~358px

**Category pill:**
- Max width: ~100px (Lifestyle + icon + padding)
- Left-aligned within card
- Single line guaranteed

**Brand name:**
- Full width available
- May wrap to 2-3 lines if long (no change from current)

**Price:**
- Full width available
- Typically single line

### Desktop (≥768px viewport)

**Card container:**
- Grid layout (typically 2-4 columns depending on breakpoint)
- Width determined by grid column width

**Category pill:**
- Same max width (~100px)
- More comfortable spacing from brand name

**All elements:**
- More breathing room
- Same layout hierarchy maintained

---

## Implementation Checklist

### Phase 1: Category Name Changes

- [ ] Open `/Users/administrator/.openclaw/workspace/gifted-project/lib/giftcards/transform.ts`
- [ ] Update `inferCategory()` function line ~42: `return 'Media'` (was `Entertainment`)
- [ ] Update `inferCategory()` function line ~57: `return 'Food'` (was `Food & Drink`)
- [ ] Update `inferCategory()` function line ~67: `return 'Beauty'` (was `Beauty & Fashion`)
- [ ] Update `inferCategory()` function line ~72: `return 'Tech'` (was `Tech & Apps`)
- [ ] Verify all other categories remain unchanged
- [ ] Save file

### Phase 2: ProductCard Layout Changes

- [ ] Open `/Users/administrator/.openclaw/workspace/gifted-project/components/browse/ProductCard.tsx`
- [ ] Update `categoryColors` object (line ~30): Change `entertainment:` key to `media:`
- [ ] Locate Product Info section (starts line ~97)
- [ ] Replace lines ~99-115 with new structure:
  - [ ] Remove `flex items-start justify-between` container
  - [ ] Create new category pill container with `mb-2`
  - [ ] Add `inline-flex`, `whitespace-nowrap` to pill
  - [ ] Add `flex-shrink-0` to CategoryIcon
  - [ ] Move brand name `<h3>` below category pill
  - [ ] Add `mb-3` to brand name
  - [ ] Ensure price and delivery info remain unchanged
- [ ] Remove `capitalize` class from category span (line ~112) - not needed for all-caps abbreviations
- [ ] Save file

### Phase 2.5: CategoryChips Component Update

- [ ] Open `/Users/administrator/.openclaw/workspace/gifted-project/components/shared/CategoryChips.tsx`
- [ ] Update `categoryConfig` object (line ~12): Change `entertainment:` key to `media:`
- [ ] Verify icon (Film) and color classes remain unchanged
- [ ] Save file

### Phase 2.6: Footer Category Link Update

- [ ] Open `/Users/administrator/.openclaw/workspace/gifted-project/components/layout/Footer.tsx`
- [ ] Update line 25: Change `href="/?category=Entertainment"` to `href="/?category=Media"`
- [ ] Update line 26: Change link text from `Entertainment` to `Media`
- [ ] Save file

### Phase 3: Verification

- [ ] Run `npm run dev` to start development server
- [ ] Open `http://localhost:3000` in browser
- [ ] Verify category pills appear above brand names
- [ ] Check all category names are shortened (Media, Food, Beauty, Tech, etc.)
- [ ] Test mobile viewport (390px) - category pills should not wrap
- [ ] Test desktop viewport - layout should be cleaner and less crowded
- [ ] Verify category colors still work correctly
- [ ] Check hover states still function
- [ ] Test with different category types (Media, Gaming, Food, Shopping, etc.)

### Phase 4: Testing & Deployment

- [ ] Run existing test suite: `npm run test` (if applicable)
- [ ] Test responsive breakpoints: 390px, 768px, 1024px, 1440px
- [ ] Verify no visual regressions on other pages
- [ ] Commit changes with message: `feat: improve product card layout - move category above brand name`
- [ ] Push to repository
- [ ] Deploy to Vercel: `vercel --prod --yes`
- [ ] Verify on production URL

---

## Visual Comparison

### Before (Current Layout)

```
┌─────────────────────────────────┐
│ [Instant]               (badge) │
│                                 │
│     ┌───────┐                   │
│     │  Logo │                   │
│     └───────┘                   │
│                                 │
│ Brand Name        [Entertainment]│
│                                 │
│ $10 - $100                      │
│                                 │
│ • Digital delivery  • ~5 min    │
└─────────────────────────────────┘
```

### After (New Layout)

```
┌─────────────────────────────────┐
│ [Instant]               (badge) │
│                                 │
│     ┌───────┐                   │
│     │  Logo │                   │
│     └───────┘                   │
│                                 │
│ [Media]                         │
│                                 │
│ Brand Name                      │
│                                 │
│ $10 - $100                      │
│                                 │
│ • Digital delivery  • ~5 min    │
└─────────────────────────────────┘
```

**Key Improvements:**
1. Category pill has dedicated space (not competing with brand name)
2. Brand name more prominent (full width, not sharing row)
3. Shorter category names easier to scan
4. Cleaner visual hierarchy
5. Less horizontal crowding

---

## Edge Cases & Considerations

### 1. Very Long Brand Names

**Scenario:** Brand name like "PlayStation Store Gift Card"

**Behavior:**
- Category pill takes ~100px
- Brand name wraps naturally to 2-3 lines
- Layout remains stable (flex-col handles wrapping)

**No special handling required** - current text wrapping works fine

### 2. Missing Category Data

**Scenario:** Product has `category: 'Other'` or undefined category

**Behavior:**
- Falls back to `categoryColors.shopping` (default)
- Shows "Other" label
- Uses shopping icon (ShoppingBag)

**No changes required** - current fallback logic works:
```typescript
const categoryStyle = categoryColors[category] || categoryColors.shopping;
const CategoryIcon = categoryIcons[category] || ShoppingBag;
```

### 3. Future Category Additions

**Process for adding new categories:**

1. Add pattern matching in `inferCategory()` function
2. Return short category name (max 12 chars)
3. Add category key to `categoryColors` object with color scheme
4. Add category key to `categoryIcons` object with appropriate Lucide icon
5. Add corresponding Tailwind color classes to `tailwind.config.ts` if new color needed

### 4. Category URL Filtering

**Impact:** Category names used in URLs (e.g., `/?category=Entertainment`)

**Action Required:** Update any URL generation or filtering logic to use new names:

**Files to check:**
- Search codebase for `category=Entertainment`, `category=Food & Drink`, etc.
- Update to new names: `category=Media`, `category=Food`, etc.

**Command to find affected files:**
```bash
cd /Users/administrator/.openclaw/workspace/gifted-project
grep -r "category=Entertainment\|category=Food & Drink\|category=Beauty & Fashion\|category=Tech & Apps" --include="*.ts" --include="*.tsx" app/ components/ lib/
```

**Expected files:**
- `components/layout/Footer.tsx` (line ~56 based on earlier grep)
- Potentially filter components or category navigation

**Update pattern:**
```typescript
// Before
<Link href="/?category=Entertainment">

// After
<Link href="/?category=Media">
```

---

## Testing Matrix

| Test Case | Viewport | Expected Result | Pass/Fail |
|-----------|----------|-----------------|-----------|
| Category pill position | 390px | Above brand name | [ ] |
| Category pill position | 1440px | Above brand name | [ ] |
| Category text length | All | Single line, no wrap | [ ] |
| Media category | All | Shows "Media" not "Entertainment" | [ ] |
| Food category | All | Shows "Food" not "Food & Drink" | [ ] |
| Beauty category | All | Shows "Beauty" not "Beauty & Fashion" | [ ] |
| Tech category | All | Shows "Tech" not "Tech & Apps" | [ ] |
| Category colors | All | Correct color scheme applied | [ ] |
| Category icons | All | Correct icon displayed | [ ] |
| Brand name wrapping | 390px | Wraps naturally if long | [ ] |
| Hover state | All | Secondary color on brand name | [ ] |
| Instant badge position | All | Top right, unaffected | [ ] |
| Price display | All | Correct formatting | [ ] |
| Delivery info | All | Bottom, mt-auto spacing | [ ] |

---

## Performance Considerations

**No performance impact expected:**

1. **Category name changes:** String values only, no computation change
2. **Layout restructure:** Same number of DOM elements, just reordered
3. **CSS classes:** Same number of Tailwind classes applied
4. **Responsive behavior:** No new media queries, existing breakpoints maintained

**Bundle size impact:** None (no new dependencies)

---

## Accessibility Considerations

### Current Accessibility (Maintained)

1. **Semantic HTML:** Category in `<div>`, brand name in `<h3>`
2. **Color contrast:** Category text meets WCAG AA on background
3. **Touch targets:** Category pill is informational, not interactive (no issue)
4. **Focus states:** Link wraps entire card (unchanged)

### No Accessibility Regressions

- Visual hierarchy change doesn't affect screen reader order (flex-col maintains DOM order)
- Category pill is non-interactive decoration (no focus management needed)
- Brand name remains primary heading in card
- All interactive elements maintain proper touch target sizes (44x44px minimum)

---

## Rollback Plan

**If issues arise post-deployment:**

### Quick Rollback (Git)

```bash
cd /Users/administrator/.openclaw/workspace/gifted-project
git log --oneline -5  # Find commit hash before changes
git revert <commit-hash>
git push origin main
vercel --prod --yes
```

### Manual Rollback

1. **Revert category names:**
   - Open `lib/giftcards/transform.ts`
   - Change `return 'Media'` back to `return 'Entertainment'`
   - Change `return 'Food'` back to `return 'Food & Drink'`
   - Change `return 'Beauty'` back to `return 'Beauty & Fashion'`
   - Change `return 'Tech'` back to `return 'Tech & Apps'`

2. **Revert layout:**
   - Open `components/browse/ProductCard.tsx`
   - Move category pill back into `flex justify-between` container with brand name
   - Remove `whitespace-nowrap`, `inline-flex` classes
   - Restore `capitalize` class on category span

3. **Deploy:**
   ```bash
   git commit -am "revert: rollback product card layout changes"
   git push origin main
   vercel --prod --yes
   ```

---

## Success Criteria

### Definition of Done

✅ **Functional Requirements:**
1. Category pill appears above brand name on all product cards
2. All category names are shortened (Media, Food, Beauty, Tech)
3. Category text does not wrap to multiple lines
4. Layout works correctly on mobile (390px) and desktop

✅ **Visual Requirements:**
1. Category pill left-aligned and properly spaced
2. Brand name has more prominence (full width)
3. Visual hierarchy matches specification (category → brand → price → delivery)
4. No layout shifts or jarring visual changes

✅ **Technical Requirements:**
1. No console errors or warnings
2. Existing tests pass (if applicable)
3. No performance regressions
4. Code follows existing patterns and style

✅ **Quality Assurance:**
1. Tested on multiple browsers (Chrome, Safari, Firefox)
2. Tested on real mobile devices (iOS, Android)
3. Verified category filtering still works with new names
4. Hover states and animations still function

---

## Post-Implementation Tasks

### Documentation Updates

- [ ] Update any user-facing documentation mentioning category names
- [ ] Update README if category examples are shown
- [ ] Update design system docs if category styling is documented

### Analytics Considerations

**Category tracking:** If analytics track category clicks/views, update event naming:
- Old: `category_view_entertainment`
- New: `category_view_media`

**Filter analytics:** Update category filter tracking to use new names

### Future Enhancements (Not in Scope)

1. **Category icons:** Consider custom SVG icons instead of Lucide for better brand consistency
2. **Category badge styling:** Explore more visual differentiation (solid backgrounds, shadows)
3. **Category animations:** Subtle entrance animations for category pills
4. **Category tooltips:** Show full category name on hover (if abbreviations cause confusion)

---

## Dependencies

**No new dependencies required**

**Existing dependencies used:**
- `framer-motion` - Hover animations (already installed)
- `lucide-react` - Category icons (already installed)
- `next/link` - Card linking (Next.js built-in)
- Tailwind CSS - Styling (already configured)

---

## Code Review Checklist

**Before submitting PR:**

- [ ] All category names updated in `transform.ts`
- [ ] ProductCard layout restructured as specified
- [ ] `categoryColors` object key updated from `entertainment` to `media`
- [ ] No `capitalize` class on category span (removed)
- [ ] `whitespace-nowrap` added to category pill container
- [ ] `flex-shrink-0` added to CategoryIcon
- [ ] `inline-flex` used for pill container
- [ ] Spacing classes correct (`mb-2`, `mb-3`)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Code formatted with Prettier (if configured)
- [ ] Git commit message follows convention
- [ ] All test criteria in Testing Matrix passed

---

## Timeline Estimate

**Total effort:** ~1-2 hours

| Phase | Duration | Notes |
|-------|----------|-------|
| Code changes | 20 min | Simple text and layout changes |
| Local testing | 20 min | Test on dev server, multiple viewports |
| Fix any issues | 20 min | Buffer for unexpected issues |
| Category URL updates | 15 min | Update Footer and filter links |
| Final verification | 15 min | Cross-browser, real devices |
| Deployment | 10 min | Git commit, push, Vercel deploy |
| Post-deploy check | 10 min | Verify production site |

---

## Contact & Questions

**If issues arise during implementation:**

1. Check this specification for detailed instructions
2. Review git diff to ensure changes match specification
3. Test locally before deploying to production
4. Verify category mappings are consistent across all files

**Common mistakes to avoid:**

- ❌ Forgetting to update `categoryColors` object key from `entertainment` to `media`
- ❌ Leaving `capitalize` class on category span (looks weird with "MEDIA")
- ❌ Not adding `whitespace-nowrap` (category may wrap on narrow cards)
- ❌ Forgetting to update category URLs in Footer component
- ❌ Not testing on real mobile devices (only desktop browser resize)

---

## Appendix A: Complete File Diffs

### `components/layout/Footer.tsx`

```diff
@@ -23,8 +23,8 @@ export function Footer() {
                 </Link>
               </li>
               <li>
-                <Link href="/?category=Entertainment" className="text-label-lg hover:text-surface-container-lowest transition-colors">
-                  Entertainment
+                <Link href="/?category=Media" className="text-label-lg hover:text-surface-container-lowest transition-colors">
+                  Media
                 </Link>
               </li>
             </ul>
```

### `lib/giftcards/transform.ts`

```diff
@@ -39,7 +39,7 @@ export function inferCategory(brandName: string): string {
   
   // Entertainment (Streaming, Music, Media)
   if (/spotify|netflix|hulu|disney|hbo|apple music|youtube|paramount|deezer|pandora|tidal|soundcloud/i.test(name)) {
-    return 'Entertainment';
+    return 'Media';
   }
   
   // Gaming (Platforms, Games, In-game Currency)
@@ -54,12 +54,12 @@ export function inferCategory(brandName: string): string {
   
   // Food & Drink (Restaurants, Coffee, Food Delivery)
   if (/starbucks|mcdonald|burger|subway|domino|pizza|dunkin|chipotle|panera|uber eats|doordash|grubhub|seamless/i.test(name)) {
-    return 'Food & Drink';
+    return 'Food';
   }
   
   // Travel (Rideshare, Hotels, Airlines, Booking)
   if (/uber|lyft|airbnb|booking|expedia|hotels|airline|southwest|delta|united|marriott|hilton/i.test(name)) {
-    return 'Travel';
+    return 'Travel'; // No change
   }
   
   // Beauty & Fashion (Cosmetics, Apparel, Footwear)
   if (/sephora|ulta|nike|adidas|foot locker|gap|old navy|abercrombie|h&m|zara|macy|nordstrom/i.test(name)) {
-    return 'Beauty & Fashion';
+    return 'Beauty';
   }
   
   // Tech & Apps (App Stores, Digital Services, Crypto)
   if (/app store|itunes|google play|paypal|crypto|apple|microsoft|samsung|huawei/i.test(name)) {
-    return 'Tech & Apps';
+    return 'Tech';
   }
```

### `components/shared/CategoryChips.tsx`

```diff
@@ -12,7 +12,7 @@ interface CategoryChipsProps {
 const categoryConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
   all: { /* ... */ },
   shopping: { /* ... */ },
-  entertainment: {
+  media: {
     icon: Film,
     color: 'text-category-entertainment',
     bg: 'bg-category-entertainment hover:bg-category-entertainment/90',
   },
   food: { /* ... */ },
   travel: { /* ... */ },
   gaming: { /* ... */ },
   lifestyle: { /* ... */ },
 };
```

### `components/browse/ProductCard.tsx`

```diff
@@ -27,7 +27,7 @@ const categoryIcons: Record<string, React.ElementType> = {
 // Category Color Mapping (Tailwind classes)
 const categoryColors: Record<string, { bg: string; text: string; gradient: string }> = {
   shopping: { /* ... */ },
-  entertainment: {
+  media: {
     bg: 'bg-category-entertainment/10',
     text: 'text-category-entertainment',
     gradient: 'from-category-entertainment to-purple-400',
@@ -95,18 +95,20 @@ export function ProductCard({ product, index = 0 }: ProductCardProps) {
 
           {/* Product Info */}
           <div className="p-5 flex-1 flex flex-col">
-            {/* Brand Name & Category */}
-            <div className="flex items-start justify-between gap-3 mb-3">
-              <h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors duration-300 font-semibold">
-                {product.brandName}
-              </h3>
-              
-              {/* Category Badge with Icon */}
-              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${categoryStyle.bg}`}>
-                <CategoryIcon className={`w-3.5 h-3.5 ${categoryStyle.text}`} />
-                <span className={`text-[11px] font-medium ${categoryStyle.text} capitalize`}>
-                  {product.category}
-                </span>
-              </div>
+            {/* Category Badge with Icon */}
+            <div className="mb-2 flex items-start">
+              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${categoryStyle.bg} whitespace-nowrap`}>
+                <CategoryIcon className={`w-3.5 h-3.5 ${categoryStyle.text} flex-shrink-0`} />
+                <span className={`text-[11px] font-medium ${categoryStyle.text}`}>
+                  {product.category}
+                </span>
+              </div>
             </div>
+
+            {/* Brand Name */}
+            <h3 className="font-archivo text-title-lg text-surface-on-surface group-hover:text-secondary transition-colors duration-300 font-semibold mb-3">
+              {product.brandName}
+            </h3>
 
             {/* Price Display */}
```

---

## Appendix B: Category URL Updates

**Files requiring category URL updates:**

### `components/layout/Footer.tsx`

**Current file only has one category link (line 25-27):**

```diff
@@ -25,7 +25,7 @@
               </li>
               <li>
-                <Link href="/?category=Entertainment" className="text-label-lg hover:text-surface-container-lowest transition-colors">
-                  Entertainment
+                <Link href="/?category=Media" className="text-label-lg hover:text-surface-container-lowest transition-colors">
+                  Media
                 </Link>
               </li>
             </ul>
```

**Note:** The Footer currently only links to "Shopping" and "Entertainment" categories. Other categories (Food & Drink, Beauty & Fashion, Tech & Apps) are not present in the Footer, so only "Entertainment" → "Media" needs to be updated.

**Search command to find all occurrences:**
```bash
cd /Users/administrator/.openclaw/workspace/gifted-project
grep -rn "category=" --include="*.tsx" --include="*.ts" components/ app/ lib/ | grep -E "(Entertainment|Food & Drink|Beauty & Fashion|Tech & Apps)"
```

---

## Appendix C: Verification Commands

**Run these commands to verify changes:**

```bash
# 1. Navigate to project
cd /Users/administrator/.openclaw/workspace/gifted-project

# 2. Check category name changes in transform.ts
grep -n "return '" lib/giftcards/transform.ts | grep -E "(Media|Food|Beauty|Tech|Entertainment|Food & Drink|Beauty & Fashion|Tech & Apps)"

# 3. Verify categoryColors update in ProductCard
grep -A 3 "media:" components/browse/ProductCard.tsx

# 4. Check for any remaining old category URLs
grep -rn "category=Entertainment\|category=Food & Drink\|category=Beauty & Fashion\|category=Tech & Apps" components/ app/

# 5. Lint check
npm run lint

# 6. Type check
npm run type-check # or npx tsc --noEmit

# 7. Build check
npm run build
```

**Expected output:**
- No instances of old category names in URLs
- `media:` key exists in categoryColors object
- No TypeScript or lint errors
- Build completes successfully

---

**END OF SPECIFICATION**

This specification provides complete, actionable instructions for the Coder to implement the product card layout fix. All changes are explicitly defined with exact code snippets, file paths, line numbers, and verification steps.
