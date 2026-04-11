# Quick Implementation Reference
## Gifted Enhancement - File-by-File Guide

**Read ENHANCEMENT_ARCHITECTURE.md for complete specifications.**  
This is a condensed checklist for rapid implementation.

---

## Priority Order

**Phase 1: Reloadly Foundation (Critical Path)**
1. Authentication & API Client
2. Type Definitions
3. Adapter Implementation
4. Service Layer Updates

**Phase 2: UI Enhancements**
5. Typography System
6. Color & Animation Libraries
7. Component Updates

**Phase 3: Testing & Polish**
8. E2E Tests
9. Manual QA
10. Deployment

---

## Phase 1: Reloadly Integration

### 1.1 Environment Setup

**Action:** Create `.env.local` from `.env.example`

```bash
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
RELOADLY_API_URL=https://giftcards.reloadly.com
RELOADLY_AUTH_URL=https://auth.reloadly.com
RELOADLY_SANDBOX=false
```

### 1.2 New Files to Create

| File | Purpose | Lines |
|------|---------|-------|
| `lib/reloadly/auth.ts` | OAuth2 token management | ~150 |
| `lib/reloadly/client.ts` | HTTP client with auth | ~120 |
| `lib/reloadly/types.ts` | TypeScript interfaces for Reloadly API | ~100 |

**Templates:** See ENHANCEMENT_ARCHITECTURE.md § 2.1-2.2

### 1.3 Files to Update

| File | Changes | Key Updates |
|------|---------|-------------|
| `lib/giftcards/reloadly-adapter.ts` | Replace mock with real implementation | Add all 6 methods (getCountries, getProductsByCountry, etc.) |
| `lib/giftcards/service.ts` | Toggle between Reloadly/mock | Add `USE_RELOADLY` environment check |
| `lib/giftcards/types.ts` | Add Reloadly-specific fields | Add `reloadlyProductId`, `reloadlyFee`, `reloadlyDiscount` |
| `lib/orders/service.ts` | Implement Reloadly order placement | Add `createReloadlyOrder()` method |

**Templates:** See ENHANCEMENT_ARCHITECTURE.md § 2.3-2.5

---

## Phase 2: UI Enhancements

### 2.1 Typography (4 files)

**Update:**

1. **`app/layout.tsx`**
   - Replace Archivo_Black with Archivo variable
   - Add Playfair Display local font
   - Update HTML class names

2. **`tailwind.config.ts`**
   - Add new `fontFamily` entries
   - Add new `fontSize` scale (hero, display-xl, headline-xl, etc.)
   - Add `fontWeight` utilities

3. **Download fonts** (optional, if using Playfair)
   ```bash
   mkdir -p public/fonts
   # Download PlayfairDisplay-Regular.woff2 & PlayfairDisplay-Bold.woff2
   ```

**Templates:** See ENHANCEMENT_ARCHITECTURE.md § 1.1

### 2.2 Colors (1 file)

**Update: `tailwind.config.ts`**

Add to `theme.extend.colors`:
- `accent` (purple, pink, orange, cyan variations)
- `category` (shopping, entertainment, food, travel, gaming, lifestyle)
- `state` (hover, pressed, focus, focus-ring)
- `gradient.from` and `gradient.to`

Add to `theme.extend.backgroundImage`:
- Gradient presets (gradient-purple, gradient-pink, etc.)
- Mesh gradient (mesh-purple)
- Shimmer effect

**Templates:** See ENHANCEMENT_ARCHITECTURE.md § 1.2

### 2.3 Animations (3 new files)

**Create:**

| File | Purpose | Exports |
|------|---------|---------|
| `lib/animations/variants.ts` | Framer Motion variant library | fadeIn, fadeInUp, cardHover, buttonHover, etc. |
| `lib/animations/useScrollAnimation.ts` | Scroll trigger hook | `useScrollAnimation()` |
| `components/shared/PageTransition.tsx` | Page transition wrapper | `<PageTransition>` component |

**Update: `app/layout.tsx`**
- Wrap `{children}` with `<PageTransition>`

**Templates:** See ENHANCEMENT_ARCHITECTURE.md § 1.3

### 2.4 Component Updates (4 files)

**Priority Components:**

1. **`components/browse/HeroSection.tsx`**
   - Add mesh gradient background
   - Add animated badge
   - Add scroll indicator
   - Add parallax effect

2. **`components/browse/ProductCard.tsx`**
   - Add category-specific gradient bar
   - Add enhanced hover with tilt
   - Add instant delivery badge
   - Add category color badge

3. **`components/shared/SearchBar.tsx`**
   - Add search icon animation
   - Add focus ring
   - Add clear button animation

4. **`components/shared/CategoryChips.tsx`**
   - Add category icons (from lucide-react)
   - Add category colors
   - Add horizontal scroll with gradient fades

**Templates:** See ENHANCEMENT_ARCHITECTURE.md § 1.4

---

## Phase 3: Frontend Integration

### 3.1 Server Components

**Update: `app/page.tsx`**

```typescript
import { giftCardService } from '@/lib/giftcards/service'

export default async function HomePage() {
  const products = await giftCardService.getGiftCards()
  
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <SearchAndFilters />
        <ProductGridWrapper initialProducts={products} />
        <TrustSection />
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  )
}

export const revalidate = 3600 // ISR: revalidate hourly
```

### 3.2 Client Components

**Create: `components/browse/ProductGridWrapper.tsx`**

Client component that:
- Receives `initialProducts` from server
- Filters by country/category/search (client-side)
- Uses `staggerContainer` animation

**Template:** See ENHANCEMENT_ARCHITECTURE.md § 2.6.2

---

## Testing Checklist

### Manual Testing

**Local Development:**
```bash
# 1. Install dependencies (if new packages added)
npm install

# 2. Run dev server
npm run dev

# 3. Test in browser
# - http://localhost:3000
# - Check hero animations
# - Check product card hovers
# - Check search functionality
# - Check category filtering
# - Check Reloadly product loading
```

**Visual Checks:**
- [ ] Hero mesh gradient renders
- [ ] Typography scales properly (mobile to desktop)
- [ ] Category chips show correct colors
- [ ] Product cards hover smoothly
- [ ] Search focus ring appears
- [ ] Products load from Reloadly (check network tab)

### E2E Testing

**Create Tests:**

1. **`e2e/visual-enhancements.spec.ts`**
   - Hero gradient test
   - Font size test
   - Hover animation test
   - Category color test
   - Search focus test

2. **`e2e/reloadly-integration.spec.ts`**
   - Product loading test
   - Product detail test
   - Country filter test

**Run Tests:**
```bash
npm run test:e2e
```

**Templates:** See ENHANCEMENT_ARCHITECTURE.md § 3.1-3.2

---

## Deployment

### Pre-Deployment Checklist

- [ ] All TypeScript compiles without errors
- [ ] All E2E tests pass
- [ ] `.env.local` has correct Reloadly credentials
- [ ] `next.config.mjs` has Reloadly image domains
- [ ] README.md updated with Reloadly setup instructions

### Vercel Deployment

**1. Set Environment Variables in Vercel Dashboard:**

```bash
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV
RELOADLY_API_URL=https://giftcards.reloadly.com
RELOADLY_AUTH_URL=https://auth.reloadly.com
RELOADLY_SANDBOX=false
```

**2. Deploy:**
```bash
git add .
git commit -m "feat: UI enhancements + Reloadly integration"
git push origin main
vercel --prod
```

**3. Verify:**
- [ ] Production build succeeds
- [ ] Products load from Reloadly
- [ ] All animations work
- [ ] No console errors

---

## Troubleshooting

### Reloadly Issues

**401 Unauthorized:**
- Check credentials in `.env.local`
- Verify credentials are correct (copy-paste from task)
- Check token expiry (auth.ts should auto-refresh)

**No Products Loading:**
- Check network tab for API calls
- Verify `RELOADLY_API_URL` is correct
- Check if sandbox mode is needed

**CORS Errors:**
- Reloadly API must be called server-side only
- Check that `giftCardService.getGiftCards()` is in server component
- Verify no direct `fetch` calls from client components

### Animation Issues

**Animations Not Running:**
- Verify Framer Motion is installed: `npm install framer-motion`
- Check variants are imported correctly
- Verify `initial` and `animate` props are set

**Janky Animations:**
- Use `will-change: transform` CSS hint
- Avoid animating `width`/`height` (use `scale` instead)
- Keep animations under 400ms

### Typography Issues

**Fonts Not Loading:**
- Verify Google Fonts import in `app/layout.tsx`
- Check CSS variable names match Tailwind config
- Clear Next.js cache: `rm -rf .next && npm run dev`

**Text Too Small/Large:**
- Check `clamp()` values in `tailwind.config.ts`
- Test on actual mobile device, not just dev tools
- Adjust min/max values in `fontSize` definitions

---

## Quick Command Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Run production build
npm run lint             # Lint code

# Testing
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # Run E2E tests in UI mode

# Deployment
vercel                   # Deploy to preview
vercel --prod            # Deploy to production

# Cleaning
rm -rf .next             # Clear Next.js cache
rm -rf node_modules      # Clear dependencies
npm install              # Reinstall dependencies
```

---

## File Summary

**New Files (6):**
- `lib/reloadly/auth.ts`
- `lib/reloadly/client.ts`
- `lib/reloadly/types.ts`
- `lib/animations/variants.ts`
- `lib/animations/useScrollAnimation.ts`
- `components/shared/PageTransition.tsx`
- `components/browse/ProductGridWrapper.tsx`
- `e2e/visual-enhancements.spec.ts`
- `e2e/reloadly-integration.spec.ts`

**Updated Files (11):**
- `.env.local` (create from .env.example)
- `app/layout.tsx`
- `app/page.tsx`
- `tailwind.config.ts`
- `lib/giftcards/reloadly-adapter.ts`
- `lib/giftcards/service.ts`
- `lib/giftcards/types.ts`
- `lib/orders/service.ts`
- `components/browse/HeroSection.tsx`
- `components/browse/ProductCard.tsx`
- `components/shared/SearchBar.tsx`
- `components/shared/CategoryChips.tsx`
- `README.md`

**Total Estimated LOC:** ~2,500 lines (including comments)

---

## Priority Decisions

**If Short on Time, Prioritize:**

1. ✅ **Critical:** Reloadly integration (auth + client + adapter)
2. ✅ **High:** Typography system (biggest visual impact)
3. ✅ **High:** HeroSection redesign
4. ✅ **Medium:** ProductCard enhancements
5. ✅ **Medium:** Animation library
6. ✅ **Low:** CategoryChips icons
7. ✅ **Low:** SearchBar animations

**Defer If Needed:**
- Playfair Display font (stick with Archivo)
- Gradient backgrounds (use solid colors)
- Scroll animations (keep simple fade-in)
- Page transitions (skip AnimatePresence)

---

**END OF QUICK REFERENCE**

See `ENHANCEMENT_ARCHITECTURE.md` for complete technical specifications.
