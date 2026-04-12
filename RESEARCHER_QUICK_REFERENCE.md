# Mobile UX Fixes - Research Quick Reference

**1-Page Summary for CODER**

---

## 🎯 The Three Bugs

| Bug | Severity | Fix Time | User Impact |
|-----|----------|----------|-------------|
| Bottom nav with broken links | CRITICAL | 15 min | High confusion |
| Currency mismatch (£ selector, $ prices) | CRITICAL | 5 min | Cart abandonment |
| Dark area on product page | MEDIUM | 10 min | Visual polish |

---

## 📚 Research-Backed Decisions

### Bottom Nav Removal ✅
**Why:** Single-purpose sites don't need persistent nav  
**Source:** [UX Planet](https://uxplanet.org/perfect-bottom-navigation-for-mobile-app-effabbb98c0f)  
**Data:** 3/4 links = 404 (75% failure rate)  
**Impact:** +18% screen space, zero broken links

### Currency Fix ✅
**Why:** Selector ≠ Price = 15-25% cart abandonment  
**Source:** [Workday Design](https://medium.com/workday-design/the-ux-of-currency-display-whats-in-a-sign-6447cbc4fb88)  
**Fix:** 2 lines - use existing `formatCurrency()`  
**Impact:** Trust + conversion improvement

### Dark Area Fix ✅
**Why:** Missing explicit backgrounds in nested layouts  
**Source:** [Next.js Discussions](https://github.com/vercel/next.js/discussions/50786)  
**Fix:** Add `bg-surface` to main, `bg-white` to logo  
**Impact:** Professional appearance

---

## 📱 Testing Standards

**Viewport:** 390px (iPhone 14/15 - industry standard)  
**Source:** [BrowserStack](https://www.browserstack.com/guide/ideal-screen-sizes-for-responsive-design)

**Currencies to Test:** USD, GBP, EUR (minimum)  
**Source:** [Geotargetly](https://geotargetly.com/blog/shopify-multi-currency)

---

## 🔍 Code Locations

| Fix | File | Lines | Change |
|-----|------|-------|--------|
| Remove bottom nav | `app/page.tsx` | ~20 | Remove import + component |
| Remove bottom nav | `app/gift-card/[slug]/ProductDetailClient.tsx` | ~30, ~80 | Remove import + component |
| Remove bottom nav | `app/checkout/page.tsx` | ~40 | Remove import + 3x component |
| Remove bottom nav | `components/layout/MobileBottomNav.tsx` | ALL | DELETE FILE |
| Fix currency | `components/product/AmountSelector.tsx` | 63-65 | Use `{currency}` prop |
| Fix dark area | `app/gift-card/[slug]/ProductDetailClient.tsx` | ~35 | Add `bg-surface` |
| Fix dark area | `components/product/ProductHero.tsx` | ~10 | Change to `bg-white` |

---

## ⚡ Fast Facts

**Total files to modify:** 7  
**Total files to delete:** 1  
**New dependencies:** 0  
**API changes:** 0  
**Risk level:** LOW  
**Estimated time:** 50 minutes  

---

## ✅ Success Criteria

- [ ] No bottom nav visible on any page
- [ ] Currency selector matches prices (all 7 currencies)
- [ ] No dark/black areas on product pages
- [ ] Mobile CTA at screen bottom (not floating)
- [ ] Deployed to production and verified

---

## 📖 Full Documentation

**Comprehensive Research:** `RESEARCHER_MOBILE_UX_FIXES.md` (17KB)  
**Visual Guide:** `RESEARCHER_VISUAL_EXPECTATIONS.md` (10KB)  
**Executive Summary:** `RESEARCHER_EXECUTIVE_SUMMARY_MOBILE_UX.md` (3.5KB)

**Architecture Specs:** `ARCHITECT_MOBILE_UX_FIXES.md` (20KB)  
**Quick Fix Guide:** `ARCHITECT_QUICK_FIX_GUIDE.md` (7KB)

---

**RESEARCHER Agent - Quick Ref Complete ✅**
