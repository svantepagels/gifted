# Performance Architecture Spec — gifted-project-blue.vercel.app

**Audit date:** 2026-05-25
**Auditor:** Architect agent
**Target site:** https://gifted-project-blue.vercel.app
**Branch the Coder will work in:** `perf/core-web-vitals`

---

## 1. Measured Baseline (production, today)

### 1.1 Network / origin

Measured with `curl` from Stockholm against the live Vercel deployment:

| Metric | Root `/` → `/en-IE` (308) | `/en-IE` HTML | Notes |
|---|---|---|---|
| DNS + TCP + TLS | ~30 ms | — | Vercel edge healthy |
| TTFB | 162 ms | **400–600 ms** | HTML is dynamic, `x-vercel-cache: MISS` on every hit |
| Total (over HTTP/2) | 163 ms | 630–830 ms | |
| HTML uncompressed | — | **687 KB** | 161 `<img src="https://cdn.reloadly.com/...">` references inline |
| HTML compressed (br) | — | 43 KB | |
| Cache-Control on HTML | — | `private, no-cache, no-store, max-age=0, must-revalidate` | **No caching at the edge at all** |

### 1.2 JS payload (brotli wire bytes)

| Chunk | Wire (br) | Uncompressed | Notes |
|---|---|---|---|
| `282-*.js` | 102 KB | **336 KB** | Framework + framer-motion + lucide + AppContext |
| `fd9d1056-*.js` | 55 KB | 173 KB | React-DOM |
| `635-*.js` | 47 KB | 135 KB | Shared client |
| `polyfills-*.js` | 41 KB | 113 KB | **Loaded even on modern browsers** (Sentry's `transpileClientSDK: true` forces IE11 transpile) |
| `64-*.js` | 19 KB | 74 KB | Sentry client |
| `app/[locale]/page-*.js` | ~6 KB | 23 KB | Route-specific |
| **Total parsed JS (home)** | **~270 KB br** | **~870 KB raw** | |

### 1.3 Other

- **3 Google fonts loaded** (Archivo, Inter, Playfair) ⇒ **3 woff2 preloads = 120 KB**. All three are imported in the locale layout, but only Archivo and Inter are clearly used; Playfair is large and may be unused on home.
- **Sentry** is wired with `transpileClientSDK: true` and `widenClientFileUpload: true` — drags polyfills + adds runtime cost on every page.
- **`framer-motion`** (~60 KB gz of `282-*.js`) is in the main client bundle because `ProductCard` (rendered ~30× on home) is `'use client'` and imports `motion`.
- **`<img>` tags, not `next/image`.** 161 product/brand logos load full-resolution from `cdn.reloadly.com` with no optimisation, no responsive `srcset`, no `sizes`, no priority hints. `next/image` is imported only in Header/Footer/not-found.
- **`next.config.mjs` has empty `images.domains = []`** — `cdn.reloadly.com` isn't even allowed, which is why the codebase uses bare `<img>`.
- **Home is dynamically rendered** (no `revalidate`, no `dynamic = 'force-static'`) and depends on `giftCardService.getProducts()` which calls Reloadly. Cache exists in-process (`productCache`) but it's per-lambda-instance.
- **Sticky desktop control bar** uses `backdrop-filter: blur` which is expensive on mobile.

### 1.4 Estimated Core Web Vitals (before code-level Lighthouse run)

Based on payload sizes and the rendering pipeline, expected Lighthouse scores are roughly:

| Metric | Desktop | Mobile (390px, throttled) |
|---|---|---|
| LCP | 1.8–2.5 s | **4.5–6.5 s** (Poor) |
| FCP | 1.2–1.6 s | 2.8–3.5 s |
| TTFB | 0.4–0.6 s | 0.6–0.9 s |
| TBT | 200–400 ms | **800–1500 ms** (Poor) |
| CLS | likely OK (<0.1) | likely OK (<0.1) |
| INP | unknown — likely poor on first interaction (300+ ms) due to 270 KB JS parse | |
| Lighthouse Perf | ~70 | **~35–50** |

The user's complaint ("VERY slow page load") matches this profile: mobile users wait for ~870 KB of JS to parse plus ~160 unoptimised CDN images.

---

## 2. Top 3 Bottlenecks (ranked by impact)

### 🥇 #1 — Unoptimised images (highest LCP impact)

161 product logos are inlined as `<img src="https://cdn.reloadly.com/...">`:
- No `next/image` ⇒ no AVIF/WebP conversion, no responsive sizing, no lazy/eager hint other than naive `loading="lazy"`.
- LCP candidate on home is the first product card's logo, fetched at full resolution from Reloadly's CDN (no Vercel edge cache).
- `next.config.mjs` `images.domains = []` actively blocks fixing this.

**Estimated impact:** −1.5 to −2.5 s LCP on mobile, −300 to −600 KB transferred.

### 🥈 #2 — Oversized JS bundle (TBT/INP impact)

The shared `282-*.js` chunk is **336 KB raw / 102 KB br** and includes:
- `framer-motion` — used only for `ProductCard` hover and `HeroSection` fade-ins.
- `lucide-react` — likely tree-shaking-safe but worth verifying.
- `@sentry/nextjs` client + polyfills forced by `transpileClientSDK: true`.

**Easy wins:**
- Drop `framer-motion` from `ProductCard` (a one-line CSS `:hover` transform replaces it). This card renders 30× and is the hottest client component on the page.
- Remove `transpileClientSDK: true` in `next.config.mjs` (the codebase targets evergreen browsers; IE11 transpile drags polyfills in unconditionally).
- Audit `Playfair_Display` — if not visually used, drop it. Saves ~40 KB woff2 + 1 preload + 1 render-blocking font swap.

**Estimated impact:** −80 to −120 KB br on shared chunk, −300 to −500 ms TBT on mobile.

### 🥉 #3 — Zero edge caching of home HTML

Every `/en-IE` hit is `x-vercel-cache: MISS`, dynamically rendered, with `Cache-Control: no-store`. There's no per-user data on this page — the home page is a function of `(locale, optional ?q=, optional ?category=)`. It should be ISR or fully static.

**Fix:** add `export const revalidate = 600` to `app/[locale]/page.tsx` (and any of its sub-pages with no user state). The product catalog already has its own in-process cache; ISR layers on top.

**Estimated impact:** TTFB drops from 400–600 ms to **30–80 ms** (edge-cached HTML) for the 99% of requests that hit a warm region. Also frees the lambda from running Reloadly transforms on every render.

---

## 3. Required Fixes (priority-ordered, for the Coder)

### FIX A — Switch product/brand logos to `next/image` *(P0)*

**Files:**
- `next.config.mjs`
- `components/browse/ProductCard.tsx`
- `components/landing/PopularBrands.tsx`
- `components/landing/BrandHero.tsx`
- `components/product/ProductHero.tsx`
- `app/[locale]/gift-card/[slug]/ProductDetailClient.tsx`

**1. `next.config.mjs` — replace the `images` block:**

```js
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cdn.reloadly.com',
      pathname: '/**',
    },
  ],
  formats: ['image/avif', 'image/webp'],
  // Logos render at max 88×88 in cards, ~150×150 on PDP. Limit
  // the responsive widths the optimiser generates.
  imageSizes: [64, 96, 128, 192, 256],
  deviceSizes: [640, 750, 828, 1080, 1200],
},
```

**2. `components/browse/ProductCard.tsx` — replace the bare `<img>`:**

Replace lines 162–168 with:

```tsx
import Image from 'next/image'

// …inside the JSX:
{showLogo ? (
  <Image
    src={product.logoUrl}
    alt={`${product.brandName} logo`}
    width={88}
    height={88}
    sizes="(min-width: 1280px) 96px, (min-width: 768px) 96px, 128px"
    // First 6 cards above the fold on desktop, first 4 on mobile.
    // The Coder passes `priority` from the parent grid for index < 6.
    priority={priority}
    onError={() => setLogoFailed(true)}
    className="max-w-[88px] max-h-[88px] object-contain transform group-hover:scale-105 transition-transform duration-300"
  />
) : ( /* unchanged fallback */ )}
```

Add a `priority?: boolean` prop to `ProductCardProps`. In `ProductGrid.tsx` pass `priority={index < 6}` when mapping products.

**3. Apply the same `next/image` swap** in the other 4 files that currently render Reloadly logos with raw `<img>` (PopularBrands, BrandHero, ProductHero, ProductDetailClient). Pass appropriate `sizes` and `priority` only for above-the-fold elements.

**Acceptance:**
- `grep -rn '<img ' components/ app/ --include="*.tsx"` returns no matches that load `cdn.reloadly.com`.
- DevTools Network panel shows `image/avif` (or `webp` on Safari) responses from `/_next/image?...`.

---

### FIX B — ISR the home page and brand landing pages *(P0)*

**Files:**
- `app/[locale]/page.tsx`
- `app/[locale]/buy/[brand]/page.tsx` (already has `revalidate = 3600` — leave it)
- `app/[locale]/gift-card/[slug]/page.tsx` (already has `revalidate = 3600` — leave it)

**`app/[locale]/page.tsx` — add at top:**

```ts
export const dynamic = 'force-static'
export const revalidate = 600 // 10 minutes
```

Move filter-driven querying (`searchParams.q`, `searchParams.category`) to client-side: the page already fetches the full deduplicated catalog from the in-process cache; the search/category chips just need to be client-side filters over the same payload. (The `SearchBar` and `CategoryChips` components are already `'use client'` and call `useSearchParams()` — perfect.)

To make `force-static` valid the page must not read `searchParams` server-side. Refactor:

```tsx
// app/[locale]/page.tsx
export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage({ params }: { params: { locale: string } }) {
  if (!isLocale(params.locale)) notFound()
  const locale: Locale = params.locale
  const messages = getMessages(locale)

  const [products, categories] = await Promise.all([
    giftCardService.getProducts({}), // unfiltered — full catalog
    giftCardService.getCategories(),
  ])

  return (/* same JSX but pass all products to ProductGrid */)
}
```

Then `ProductGrid` reads `useSearchParams()` and filters in-memory client-side:

```tsx
'use client'
import { useSearchParams } from 'next/navigation'

export function ProductGrid({ products }: { products: GiftCardProduct[] }) {
  const search = useSearchParams()
  const q = search.get('q')?.toLowerCase() ?? ''
  const cat = search.get('category') ?? ''

  const visible = useMemo(() => {
    return products.filter((p) => {
      if (cat && p.category !== cat) return false
      if (q && !p.brandName.toLowerCase().includes(q)) return false
      return true
    })
  }, [products, q, cat])

  // …render visible.map(...)
}
```

**Acceptance:**
- `curl -sI .../en-IE` returns `cache-control: public, s-maxage=600, stale-while-revalidate=...` (or equivalent ISR header) and a subsequent hit shows `x-vercel-cache: HIT`.
- Searching/filtering on the home page still works without a server round-trip.

---

### FIX C — Remove `framer-motion` from `ProductCard` *(P1)*

This single change shrinks the shared client chunk significantly because `ProductCard` is one of the largest `'use client'` components that pulls in `motion`.

**`components/browse/ProductCard.tsx`:**

Replace the `import { motion } from 'framer-motion'` and the `<motion.*>` wrapper with a plain `<div>` plus Tailwind hover utilities. The card already has `group-hover:` classes — the framer-motion bit is the entrance fade-in, which can become a CSS class:

```css
/* app/globals.css */
@keyframes card-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-card-in { animation: card-in 250ms ease-out backwards; }
```

```tsx
<div
  className="animate-card-in"
  style={{ animationDelay: `${Math.min(index ?? 0, 12) * 30}ms` }}
>
  {/* card JSX */}
</div>
```

Do the same for `HeroSection.tsx` (the only other home-page motion user). After this, `framer-motion` will likely only be needed for a handful of non-home components — verify with:

```bash
grep -rn 'framer-motion' components/ app/ --include="*.tsx"
```

If only a couple of non-critical components remain, dynamic-import them:

```tsx
const AmountSelector = dynamic(() => import('@/components/product/AmountSelector'), { ssr: true })
```

**Acceptance:**
- `next build` output shows the home route's First Load JS dropped by at least 40 KB br.
- `ProductCard` still renders with hover scale and entrance animation.

---

### FIX D — Audit and trim font loading *(P1)*

**`app/[locale]/layout.tsx`:**

Currently loads 3 Google fonts (Archivo, Inter, Playfair) — all 3 generate `Link: rel=preload` headers. Each woff2 is 34–48 KB.

1. Check usage: `grep -rn 'font-playfair' components/ app/ --include="*.tsx"`. If Playfair is unused or only used on rare pages, drop it from the layout and only import in those routes.
2. Inter is loaded with default 100–900 weight range — restrict to needed weights:
   ```ts
   const inter = Inter({
     subsets: ['latin'],
     weight: ['400', '500', '600', '700'],
     variable: '--font-inter',
     display: 'swap',
   })
   ```
3. Same for Archivo (used for headings — likely needs only `400, 600, 700, 900`).

**Acceptance:**
- Network tab shows ≤2 woff2 preloads on the home route (or 3 if Playfair is genuinely used).
- Total font bytes ≤ 80 KB.

---

### FIX E — Remove Sentry `transpileClientSDK` and tighten config *(P1)*

**`next.config.mjs`:**

Remove these lines from the Sentry options:

```js
transpileClientSDK: true,   // ❌ remove — drags polyfills
widenClientFileUpload: true, // ❌ remove unless source maps require it; even then move to CI-only
```

Add to the base nextConfig:

```js
modularizeImports: {
  'lucide-react': {
    transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    preventFullImport: true,
  },
},
```

This ensures lucide icons are tree-shaken to per-icon files, which is the documented Next.js fix for that library.

**Acceptance:**
- After rebuild, `_next/static/chunks/polyfills-*.js` is either gone or reduced from 113 KB to ~30 KB (just runtime feature shims).
- No regression in Sentry error capture in production (verify Sentry dashboard).

---

### FIX F — Defer non-critical client work *(P2)*

1. **TrustSection** (below the fold) — wrap in `dynamic(() => import('@/components/browse/TrustSection'), { ssr: true, loading: () => null })` so its JS isn't in the initial client chunk. It only appears far below the viewport.
2. **PopularBrands** (also below the fold) — already in a `<Suspense>`; consider also `dynamic()` with `loading: null` to defer hydration.
3. **CountrySelector** in the header — heavy because it lists all countries with flags. Dynamic-import the modal portion so only the button is in the initial bundle.

**Acceptance:**
- Initial JS for `/[locale]` route drops by another 20–40 KB br.
- TrustSection and PopularBrands still render correctly after scroll.

---

### FIX G — Reduce backdrop-filter on mobile sticky bar *(P3)*

`app/[locale]/page.tsx` lines 60–71: the desktop sticky bar uses `backdrop-blur`. This is fine on desktop but is already hidden on mobile (`hidden md:block`), so this is OK. **No change needed — flagged for awareness if the design ever extends it to mobile.**

---

## 4. Workflow for the Coder

1. **Branch:** `git checkout -b perf/core-web-vitals`
2. **Baseline Lighthouse** (BEFORE):
   ```bash
   npx lighthouse https://gifted-project-blue.vercel.app/en-IE \
     --preset=desktop --output=json --output-path=./perf/before-desktop.json --quiet
   npx lighthouse https://gifted-project-blue.vercel.app/en-IE \
     --preset=mobile --output=json --output-path=./perf/before-mobile.json --quiet
   ```
   *(If `lighthouse` CLI is unavailable, use PageSpeed Insights API — the URL is `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=...&strategy=mobile`)*
3. **Apply fixes A → F in order**, committing after each one with a clear message.
4. **Local sanity:** `npm run build && npm run start` — confirm home renders, search works, filters work, product cards click through to PDP.
5. **Deploy preview:**
   ```bash
   vercel --yes
   ```
   This produces a preview URL like `gifted-project-blue-<hash>.vercel.app`.
6. **AFTER measurements** on the preview URL, save as `perf/after-desktop.json`, `perf/after-mobile.json`.
7. **Write `perf/RESULTS.md`** with a side-by-side table:

   | Metric | Before (desktop) | After (desktop) | Δ | Before (mobile) | After (mobile) | Δ |
   |---|---|---|---|---|---|---|
   | LCP | … | … | … | … | … | … |
   | FCP | … | … | … | … | … | … |
   | TTFB | … | … | … | … | … | … |
   | TBT | … | … | … | … | … | … |
   | CLS | … | … | … | … | … | … |
   | Performance score | … | … | … | … | … | … |
   | First Load JS (home) | 870 KB raw | … | … | — | — | — |
   | Image bytes (home) | ~2.5 MB | … | … | ~1.5 MB | … | … |

8. **Only merge to main if:**
   - Mobile LCP improved by ≥1.5 s, OR
   - Mobile Performance score improved by ≥15 points, AND
   - No regression in any existing functionality (catalog browse, PDP open, search, filter, checkout flow start).
9. **Commit & push:**
   ```bash
   git add -A
   git commit -m "perf: improve Core Web Vitals (next/image, ISR, drop framer-motion from ProductCard)"
   git push -u origin perf/core-web-vitals
   ```
   Then ask Svante to approve the merge.

---

## 5. Out of scope (intentionally)

- **Image hosting migration** off Reloadly's CDN. `next/image` already routes through Vercel's image optimizer, which caches optimised variants at the edge — this is sufficient.
- **Replacing `@sentry/nextjs`** with a lighter telemetry provider — too invasive for this pass.
- **Rewriting `framer-motion` everywhere** — only the home page critical path matters here. Other routes can keep it.
- **HTTP/3** — Vercel already serves H2 from arn1; H3 would help only on lossy connections.

---

## 6. Vercel-specific notes

- The page currently returns `cache-control: private, no-store` because Next.js correctly detects the page as dynamic (it reads `searchParams`). Fix B (ISR + client-side filtering) is what enables Vercel's edge cache to do its job. **Vercel hosting itself is not the cause — the cause is that the app opts out of caching.**
- `arn1` (Stockholm) is the edge region for us; lambda runs in `iad1` (Washington DC) — that's the ~250 ms gap visible in TTFB. ISR fully eliminates this for cache hits.
- No need for edge runtime. Standard Node lambda + ISR is the right tool for this catalog page.

---

## 7. Acceptance criteria (overall)

A merge to `main` is approved only if `perf/RESULTS.md` shows:

- **Mobile LCP ≤ 3.5 s** (Good or Needs Improvement, ideally Good)
- **Mobile Performance score ≥ 65** (up from estimated 35–50)
- **Desktop Performance score ≥ 90**
- **CLS still < 0.1** on both
- **TTFB on a warm region hit ≤ 200 ms** (proves ISR worked)
- All E2E tests in `playwright.config.ts` pass against the preview URL.

If after all fixes the numbers still don't meet these thresholds, the Coder writes up which bottleneck remained dominant and what the next step would be (e.g. switching the catalog to a lighter API representation, server-rendering only the first 12 cards and infinite-scrolling the rest, etc.).
