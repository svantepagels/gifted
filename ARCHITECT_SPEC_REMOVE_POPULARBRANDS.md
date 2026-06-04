# ARCHITECT SPEC — Remove "Popular gift cards in {country}" section

**Project:** Gifted (`/Users/administrator/.openclaw/workspace/gifted-project`)
**Stack:** Next.js (App Router, RSC), TypeScript, Tailwind CSS, Playwright e2e
**Goal:** Permanently remove the "Popular gift cards in {country}" homepage section (heading + brand-tile grid) for every country/region. Remove code/data tied *solely* to it. Leave the rest of the storefront layout intact and properly spaced.

---

## 1. What the section is

- **Component:** `components/landing/PopularBrands.tsx` — async server component. Renders a `<section aria-labelledby="popular-brands-heading">` with an `<h2 id="popular-brands-heading">` ("Popular gift cards in {country}") and a `<ul>` grid of up to 8 brand tiles (Netflix, Steam, App Store & iTunes, Fortnite, Xbox, …) each linking to `/[locale]/buy/[brand.slug]`.
- **Rendered in:** `app/[locale]/page.tsx` — imported at line 10, rendered at line ~95 inside a `<Suspense fallback={null}>`, between the `#products` ProductGrid block and `<TrustSection />`.

## 2. Dependency map (VERIFIED — do not remove shared code)

I grepped the whole repo (excluding `node_modules`). Findings:

| Symbol / file | Used by | Remove? |
|---|---|---|
| `components/landing/PopularBrands.tsx` (the component) | Only `app/[locale]/page.tsx` | **YES — delete file** |
| i18n key `landing.popular.heading` | Only `PopularBrands.tsx` | **YES — delete key from all 6 message files** |
| i18n key `landing.popular.viewAll` | Only `PopularBrands.tsx` | **YES — delete key from all 6 message files** |
| `lib/landing-pages/brands.ts` (`BRANDS`, `getBrandBySlug`, `brandDisplayName`) | `app/[locale]/buy/[brand]/page.tsx`, `components/landing/BrandMarquee.tsx`, `lib/__tests__/landing-pages.test.ts`, `lib/landing-pages/viable-cells.ts` (indirectly) | **NO — SHARED, keep as-is** |
| `lib/landing-pages/viable-cells.ts` (`getViableCellsForLocale`) | `app/[locale]/buy/[brand]/page.tsx`, `components/landing/BrandMarquee.tsx`, `lib/countries/build-countries.ts` | **NO — SHARED, keep as-is** |
| `COUNTRY_NAME` map (inside `PopularBrands.tsx`) | local to the file | dies with the file |
| `MAX_TILES` const (inside `PopularBrands.tsx`) | local to the file | dies with the file |

**Conclusion:** Only the component file + the two `landing.popular.*` i18n keys are tied *solely* to this section. `brands.ts` and `viable-cells.ts` are shared with the `/buy/[brand]` landing pages and the `BrandMarquee` and MUST be left untouched.

## 3. Exact edits

### Edit 3.1 — `app/[locale]/page.tsx`
1. **Delete the import** (line 10):
   ```ts
   import { PopularBrands } from '@/components/landing/PopularBrands'
   ```
2. **Delete the render block** (the comment + Suspense + component, ~lines 92–96):
   ```tsx
   {/* Internal-link block to per-locale brand landing pages. */}
   <Suspense fallback={null}>
     <PopularBrands locale={locale} messages={messages} />
   </Suspense>
   ```
   Remove all of the above lines. **Do not** remove the `import { Suspense } from 'react'` at the top — `Suspense` is still used by BrandMarquee, SearchBar, CategoryChips wrappers.

**Spacing note:** The element immediately before the removed block is the `#products` ProductGrid wrapper (`<div id="products" className="mb-16 scroll-mt-24">`), which already carries `mb-16` bottom spacing. The element immediately after is `<TrustSection />`. After removal, `#products` (mb-16) sits directly above `<TrustSection />` — spacing remains correct, no extra margin tweak needed. Verify visually; if a double-gap or collapse appears, the fix is **not** to add margin to page.tsx but to confirm TrustSection's own top spacing (do not modify TrustSection in this task unless a visible regression is confirmed).

### Edit 3.2 — Delete the component file
```
rm components/landing/PopularBrands.tsx
```
(Use `git rm` so it's staged.)

### Edit 3.3 — Remove the two i18n keys from ALL 6 message files
In each file, delete the two lines for `landing.popular.heading` and `landing.popular.viewAll`. Ensure JSON stays valid (no trailing comma / dangling comma issues — the key *before* them, `landing.denominations.viewAll`, and the key *after*, `landing.notFound.title`, must remain comma-correct).

Files (each currently has exactly 2 matching lines, verified):
- `lib/i18n/messages/en.json`
- `lib/i18n/messages/fi-FI.json`
- `lib/i18n/messages/ar-AE.json`
- `lib/i18n/messages/ar-SA.json`
- `lib/i18n/messages/pl-PL.json`
- `lib/i18n/messages/el-GR.json`

After editing, run `node -e "require('./lib/i18n/messages/en.json')"` (and for each file) or `jq . <file>` to confirm valid JSON.

> If the i18n layer has a strict type / key-completeness check (e.g. a `Messages` union type generated from `en.json`, or a test asserting all locales have identical keys), removing the keys from all 6 files keeps them consistent. If TypeScript build fails because a `Messages` type literal still lists `'landing.popular.heading'`/`'landing.popular.viewAll'`, grep for those string literals in `lib/i18n/` and remove them from the type too. **Check `lib/i18n/useMessages.ts` and any `*.d.ts` / type file for hardcoded key unions.**

### Edit 3.4 — e2e test `e2e/landing-pages.spec.ts` (lines ~158–166)
The test `'homepage shows PopularBrands block linking to landing pages'` asserts `a[href*="/en-IE/buy/"]` count > 0 on `/en-IE`. **The `BrandMarquee` component (kept) also renders these `/[locale]/buy/[slug]` links on the homepage**, so the *assertion* will still pass. But the test *name* now misrepresents what's under test.

**Action:** Rename the test to reflect the marquee as the internal-link source, and keep the assertion:
```ts
test('homepage exposes internal links to brand landing pages', async ({
  page,
}) => {
  await page.goto('/en-IE', { waitUntil: 'load' })
  // BrandMarquee renders anchors into /en-IE/buy/{brand}
  const links = page.locator('a[href*="/en-IE/buy/"]')
  expect(await links.count()).toBeGreaterThan(0)
})
```
Do NOT delete the test — the internal-link SEO signal is still present via the marquee and worth covering. If the Coder finds any other test (in `e2e/` or `lib/__tests__/`) asserting the `popular-brands-heading` id, the "Popular gift cards in" heading text, or `landing.popular.*` keys, those specific assertions must be removed.

## 4. Things NOT to touch
- `lib/landing-pages/brands.ts` — shared brand catalog.
- `lib/landing-pages/viable-cells.ts` — shared cell source.
- `components/landing/BrandMarquee.tsx` — separate homepage section, keep.
- `app/[locale]/buy/[brand]/page.tsx` — the brand landing pages, keep.
- `components/browse/TrustSection`, `ProductGrid`, `HeroSection`, etc.
- Docs / `.md` / `.txt` / `research/` references to PopularBrands are historical notes — leave them (out of scope; they don't affect rendering or build).

## 5. Verification (Coder must run)
1. `pwd` → `/Users/administrator/.openclaw/workspace/gifted-project`
2. `grep -rn "PopularBrands\|landing.popular" app components lib --include="*.tsx" --include="*.ts" --include="*.json" | grep -v node_modules` → **must return zero results** (component, import, render, i18n keys all gone).
3. JSON validity: `for f in lib/i18n/messages/*.json; do node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('OK $f')"; done`
4. `npx tsc --noEmit` (or `npm run build`) → no type errors. Confirm `brands.ts`/`viable-cells.ts` still resolve from their remaining consumers (`/buy/[brand]/page.tsx`, BrandMarquee).
5. `npm run build` → succeeds; `/[locale]` page renders without the section.
6. (If dev server available) Load `/en-IE` and confirm: heading "Popular gift cards in Ireland" is gone, the brand-tile grid is gone, marquee + ProductGrid + TrustSection still render with correct spacing (no large empty gap where the section was).

## 6. Deployment
Per swarm deployment checklist — only after all verification passes:
```
git add -A
git commit -m "feat: remove Popular gift cards section from storefront homepage"
git push origin main
vercel --prod --yes
```
No env-var changes are involved in this task. Report the deployment URL and confirm `/en-IE` no longer shows the section.
