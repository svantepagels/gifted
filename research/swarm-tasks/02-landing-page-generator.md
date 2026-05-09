# Swarm Task 2 — Per-locale × per-brand landing-page generator

**Repo:** `svantepagels/gifted` (Next.js 14.2.18 App Router, TypeScript)
**Branch:** `feat/landing-page-generator` (cut from `feat/i18n-routing` once Task 1 is merged — DO NOT START until Task 1 is in)
**PR target:** `main`
**Estimated effort:** large (3–5 hours)

## Why — this is the SEO compounding engine

The research model (PR #3) says paid SEM at $2 fixed margin clears the math for only ~9 cells globally — total addressable ~$1.9k/yr. **Layering SEO landing pages on top raises effective click capture from ~2% to ~10%, taking the same cells from $1.9k/yr → ~$9.5k/yr** (and to $39k/yr with the email loop).

These pages are the moat:
- They turn long-tail (e.g. "netflix lahjakortti suomi") into organic capture so we don't have to outbid on every keyword.
- They give Google something to index per locale × per brand combination — currently we have nothing per-locale beyond the homepage.
- They self-finance once indexed: **negative marginal cost per page**, ~$66/mo organic value per page in the Finnish-Netflix case.

**The Reloadly catalog has 1,118 unique (country × brand) cells.** Across 9 locales we generate at most ~5,000 pages — well within Next's static-generation budget at build time.

## What

A landing-page generator that creates **one route per (locale × brand)**:

- URL pattern: `/{locale}/buy/{brand-slug}`
- Example: `/fi-FI/buy/netflix`, `/ar-AE/buy/amazon`, `/pl-PL/buy/steam`
- Uses `generateStaticParams` to pre-render every viable cell at build time.
- Each page is a buy-now landing optimized for the keyword `[brand] gift card [country/language]`.

## Concrete deliverables

### 1. Brand catalog source of truth

Create `lib/landing-pages/brands.ts` that exports a curated brand list with:

```ts
export interface BrandConfig {
  slug: string                    // 'netflix', 'app-store-itunes', 'steam'
  reloadlyProductIds: number[]    // Reloadly product IDs that this brand maps to
  displayName: Record<string, string>  // Per-locale displayed brand name (Netflix, Steam, App Store/iTunes...)
  category: 'streaming' | 'gaming' | 'retail' | 'app-store' | 'gift'
  description: Record<string, string>  // 50-100 word per-locale marketing description
  keywords: Record<string, string[]>   // Per-locale list of keyword seeds for meta + JSON-LD
}
```

Initial population: the **top 20 brands** from the research (`research/scoring/cells-scored-v3.csv`, sorted by `seo_net_monthly`). At minimum:

`netflix, steam, app-store-itunes, playstation, fortnite, xbox, mobile-legends, world-of-warcraft, crypto-voucher, amazon, twitch, flixbus, talabat, starzplay, nintendo-eshop, google-play, spotify, ea-play, riot-points, roblox`

Per-brand × per-locale `displayName` and `description` are hand-written for fi-FI, ar-AE/SA (Arabic), pl-PL, el-GR. en-* shares one English copy. Use natural-language phrasing — these will be the H1 and meta description.

### 2. Cell viability filter (build-time)

Create `lib/landing-pages/viable-cells.ts` that, given the brand catalog and a locale, returns the brands that exist in the Reloadly catalog for that locale's country.

```ts
export async function getViableCellsForLocale(locale: Locale): Promise<BrandConfig[]>
```

Logic:
1. Resolve `locale → country code` from `lib/i18n/config.ts`.
2. Query Reloadly client (`lib/reloadly/client.ts`) for products available in that country.
3. Match against `brands.ts` `reloadlyProductIds`.
4. Return the intersection — these are the brands we can sell to that locale.

For locales whose country isn't in Reloadly, return the brand list filtered to globally-available SKUs (e.g. Crypto Voucher).

**Cache the result during build.** Use `unstable_cache` or a simple build-time JSON snapshot; do NOT call Reloadly on every static page generation.

### 3. The page route

Create `app/[locale]/buy/[brand]/page.tsx`:

```tsx
export async function generateStaticParams() {
  const params = []
  for (const locale of locales) {
    const brands = await getViableCellsForLocale(locale)
    for (const brand of brands) {
      params.push({ locale, brand: brand.slug })
    }
  }
  return params
}

export async function generateMetadata({ params }) {
  // Title: "Buy {BrandName} Gift Card | Instant Delivery | Gifted"
  //   localized: "Osta {BrandName} -lahjakortti | Heti toimitus | Gifted"
  // Description: from brands.ts description[locale]
  // OpenGraph image: brand logo (resolved via Reloadly logo URL)
  // canonical: '/{locale}/buy/{brand}'
  // alternates.languages: every locale where this brand is viable, with hreflang
}

export default async function BrandLandingPage({ params }) {
  // Fetch the actual products (denominations) for this brand × country from Reloadly
  // Render:
  //   <Header /> (existing)
  //   <BrandHero brand={brand} locale={locale} /> — H1, brand logo, 1-line value prop
  //   <DenominationGrid products={products} /> — buy buttons per denomination ($10 / $25 / $50 / $100)
  //   <FeatureBenefits /> — instant delivery, no signup, secure payment (3-4 bullets)
  //   <FAQ brand={brand} locale={locale} /> — 4-6 Q&A in JSON-LD-ready format
  //   <Footer />
}
```

### 4. Components

Build these new components in `components/landing/`:
- `BrandHero.tsx` — hero with brand logo (left), H1 + 1-line description + denomination quick-buy chips (right)
- `DenominationGrid.tsx` — responsive 2/3/4-col grid of denomination cards with "Buy now" CTAs
- `FeatureBenefits.tsx` — 3-up icon grid: instant delivery, no signup needed, secure Stripe checkout
- `FAQ.tsx` — accessible accordion (use existing pattern from `components/` or build with `<details>` for zero-JS)

All components are mobile-first (Svante's hard requirement) and use the existing Tailwind brand tokens.

### 5. Per-locale copy authoring

Hand-write the brand × locale copy for the **top 7 cells from the research**:

| Cell | Copy needed |
|------|-------------|
| fi-FI × Netflix | hero, description, FAQ |
| fi-FI × Steam | hero, description, FAQ |
| fi-FI × App Store/iTunes | hero, description, FAQ |
| fi-FI × PlayStation | hero, description, FAQ |
| fi-FI × Fortnite | hero, description, FAQ |
| ar-AE × Amazon | hero, description, FAQ |
| pl-PL × Netflix | hero, description, FAQ |

For all other (locale × brand) combinations, ship with English fallback + a `// TODO: translate` comment. We can author the rest in batch later — the structural plumbing is the gate, not the copy.

### 6. Internal linking

Update the **homepage** (`app/[locale]/page.tsx`) to include a "Popular gift cards in {country}" section with cards linking to `/[locale]/buy/[brand]` for the top 8 viable brands in that locale. This is the internal-link signal Google needs to crawl the new pages.

### 7. Acceptance criteria

- [ ] `pnpm build` succeeds and reports the expected page count (~500–5000 static pages depending on viable-cell count).
- [ ] `/fi-FI/buy/netflix` renders correctly: localized H1, FI denominations in EUR, Finnish description, FAQ in Finnish.
- [ ] `/ar-AE/buy/amazon` renders RTL with Arabic copy and AED denominations.
- [ ] `/pl-PL/buy/netflix` renders Polish copy and PLN denominations.
- [ ] Each page has a unique `<title>`, `<meta description>`, and OG image.
- [ ] `/[locale]/buy/non-existent-brand` returns 404.
- [ ] Homepage shows a "Popular gift cards" section linking to viable brand pages in the user's locale.
- [ ] Lighthouse SEO score ≥ 95 on `/fi-FI/buy/netflix`.
- [ ] Lighthouse Performance score ≥ 80 on mobile (3G throttle) — target 90+.
- [ ] Build time stays under 10 minutes on Vercel (acceptable for this volume of static pages).

## Out of scope

- Schema.org JSON-LD markup, sitemap, hreflang tags, robots.txt — those are **Task 3 (SEO scaffolding)**. This task only handles routes + content.
- Stripe payment-method matrix per country (deferred).
- A/B testing different hero variants (later).
- Email capture popup (later, separate task).

## Dependencies

⚠️ **Do not start this task until Task 1 (i18n routing) is merged.** This task assumes `app/[locale]/...` already exists.

## Files to read first

1. `app/gift-card/[slug]/page.tsx` (post-Task-1: `app/[locale]/gift-card/[slug]/page.tsx`) — the existing product detail page; this task's `[brand]` page is a sibling pattern
2. `lib/reloadly/client.ts` and `lib/reloadly/types.ts` — Reloadly SDK
3. `lib/giftcards/service.ts` — existing data layer; the new generator should use it where possible
4. `research/scoring/cells-scored-v3.csv` (in `research/sem-niche-heatmap` branch) — source of truth for which (locale × brand) combos are worth generating

## PR description template

```md
Implements Phase 1 task #2 from the SEM niche heatmap research (PR #3).

Adds a per-locale × per-brand landing-page generator. New route:
`/{locale}/buy/{brand-slug}` (e.g. `/fi-FI/buy/netflix`, `/ar-AE/buy/amazon`).

- ~N static pages generated at build time (one per viable cell)
- Per-locale Reloadly catalog filtering
- Hand-translated copy for top 7 cells (Finnish + Polish + Arabic Amazon)
- English fallback for all other cells (TODO: translate in batch)
- Homepage gets internal-link section to top 8 brands per locale

This is the SEO compounding engine described in the research — flips us from
~2% paid-only click capture to ~10% combined paid+organic.
SEO scaffolding (schema, sitemap, hreflang) ships in PR #N (Task 3).
```
