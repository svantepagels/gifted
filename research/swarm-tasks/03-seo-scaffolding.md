# Swarm Task 3 — SEO scaffolding (schema, sitemap, robots, hreflang)

**Repo:** `svantepagels/gifted` (Next.js 14.2.18 App Router, TypeScript)
**Branch:** `feat/seo-scaffolding` (cut from `feat/landing-page-generator` once Task 2 is merged — DO NOT START until Tasks 1 and 2 are in)
**PR target:** `main`
**Estimated effort:** small-to-medium (1–2 hours)

## Why

Tasks 1 and 2 produce thousands of locale × brand landing pages. Without SEO scaffolding, **Google won't crawl them in the right languages, won't surface them as rich results, and won't connect them as alternates**. We need:

- **JSON-LD schema** (`Product`, `Offer`, `BreadcrumbList`, `FAQPage`) so each landing page is eligible for rich results (price snippet, breadcrumb breadcrumbs in SERP, FAQ accordions in SERP).
- **`sitemap.xml`** declaring every locale × brand page, so Google indexes the long tail without waiting for organic discovery.
- **`robots.txt`** that allows crawling and points to the sitemap.
- **`hreflang` alternates** so Google knows `/fi-FI/buy/netflix` and `/en-IE/buy/netflix` are equivalents in different languages — without this, the locales fight each other for ranking.

This task closes the loop on the SEO compounding strategy. Without it, Tasks 1 and 2 are scaffolding without a roof.

## What

### 1. JSON-LD on landing pages

Update `app/[locale]/buy/[brand]/page.tsx` (created in Task 2) to embed JSON-LD via Next's `<Script type="application/ld+json">` pattern.

Each landing page emits **four schema blocks**:

#### a. `Product` + nested `Offer`

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Netflix Gift Card",
  "image": "https://gifted.app/brands/netflix.png",
  "description": "Buy a Netflix gift card and stream...",
  "brand": { "@type": "Brand", "name": "Netflix" },
  "offers": [
    {
      "@type": "Offer",
      "price": "10.00",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://gifted.app/fi-FI/buy/netflix?denom=10"
    },
    { "...": "one Offer per denomination available in this country" }
  ]
}
```

#### b. `BreadcrumbList`

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://gifted.app/fi-FI" },
    { "@type": "ListItem", "position": 2, "name": "Buy gift cards", "item": "https://gifted.app/fi-FI/buy" },
    { "@type": "ListItem", "position": 3, "name": "Netflix", "item": "https://gifted.app/fi-FI/buy/netflix" }
  ]
}
```

(Localize "Home", "Buy gift cards" per locale using `lib/i18n/messages/{locale}.json`.)

#### c. `FAQPage` — sourced from the FAQ component data

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "How fast is delivery?", "acceptedAnswer": { "@type": "Answer", "text": "Instant — within 60 seconds..." } }
  ]
}
```

#### d. `Organization` (in root layout, not per-page)

Add to `app/[locale]/layout.tsx` once:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Gifted",
  "url": "https://gifted.app",
  "logo": "https://gifted.app/logo.png",
  "sameAs": []
}
```

### 2. `sitemap.xml`

Create `app/sitemap.ts` (Next 14 native sitemap support):

```ts
import { MetadataRoute } from 'next'
import { locales } from '@/lib/i18n/config'
import { getViableCellsForLocale } from '@/lib/landing-pages/viable-cells'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://gifted.app'
  const urls: MetadataRoute.Sitemap = []

  // Homepage per locale
  for (const locale of locales) {
    urls.push({
      url: `${base}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${base}/${l}`])
        )
      }
    })
  }

  // Brand index per locale
  for (const locale of locales) {
    urls.push({
      url: `${base}/${locale}/buy`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  }

  // Brand detail per (locale × viable brand)
  for (const locale of locales) {
    const brands = await getViableCellsForLocale(locale)
    for (const brand of brands) {
      // hreflang alternates: every other locale where this brand is also viable
      const altLocales = await Promise.all(
        locales.map(async l => ({
          locale: l,
          viable: (await getViableCellsForLocale(l)).some(b => b.slug === brand.slug),
        }))
      )
      const alternates = Object.fromEntries(
        altLocales.filter(x => x.viable).map(x => [x.locale, `${base}/${x.locale}/buy/${brand.slug}`])
      )

      urls.push({
        url: `${base}/${locale}/buy/${brand.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: { languages: alternates },
      })
    }
  }

  return urls
}
```

If the sitemap exceeds 50,000 URLs (it shouldn't with our scope, but plan for growth), split into a sitemap index + per-locale sitemaps.

### 3. `robots.txt`

Create `app/robots.ts`:

```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/checkout/', '/success/'] },
    ],
    sitemap: 'https://gifted.app/sitemap.xml',
    host: 'https://gifted.app',
  }
}
```

(Disallow `/checkout/` and `/success/` — these are post-purchase pages, no SEO value, no need to crawl them.)

### 4. `hreflang` in page metadata

Update `generateMetadata` in `app/[locale]/page.tsx`, `app/[locale]/buy/page.tsx`, and `app/[locale]/buy/[brand]/page.tsx` to emit `alternates.languages`:

```ts
export async function generateMetadata({ params }) {
  const { locale, brand } = params
  const viableLocales = await getLocalesWhereBrandIsViable(brand)

  return {
    title: '...',
    description: '...',
    alternates: {
      canonical: `https://gifted.app/${locale}/buy/${brand}`,
      languages: Object.fromEntries(
        viableLocales.map(l => [l, `https://gifted.app/${l}/buy/${brand}`])
      ),
    },
  }
}
```

Next.js 14 emits these as `<link rel="alternate" hreflang="..." href="..." />` automatically — verify in the rendered HTML.

Always include an `x-default` pointing to the default-locale variant.

### 5. Open Graph + Twitter Card metadata

Per landing page:
- `og:title`, `og:description` (mirror the page title/description)
- `og:image` — brand logo at 1200×630 (compose at build time or use a `/api/og` route with `@vercel/og`)
- `og:locale` — set to the locale, plus `og:locale:alternate` for every other viable locale
- `twitter:card` = `summary_large_image`
- `twitter:title`, `twitter:description`, `twitter:image`

### 6. Acceptance criteria

- [ ] `pnpm build` succeeds with no new TS errors.
- [ ] `https://<deployment-url>/sitemap.xml` returns valid XML with 1 entry per (locale × viable brand) plus locale homepages and brand-index pages.
- [ ] `https://<deployment-url>/robots.txt` is accessible and points to sitemap.
- [ ] `/fi-FI/buy/netflix` rendered HTML contains:
  - [ ] `<script type="application/ld+json">` with `Product`, `BreadcrumbList`, `FAQPage` schema
  - [ ] `<link rel="alternate" hreflang="fi-FI" ...>` and equivalents for every other viable locale
  - [ ] `<link rel="alternate" hreflang="x-default" ...>` pointing to the default-locale variant
  - [ ] `<link rel="canonical" href="https://gifted.app/fi-FI/buy/netflix">`
  - [ ] `<meta property="og:locale" content="fi_FI">` and `og:locale:alternate` for the rest
- [ ] Google's [Rich Results Test](https://search.google.com/test/rich-results) on `/fi-FI/buy/netflix` shows: Product valid, BreadcrumbList valid, FAQ valid.
- [ ] [Schema validator](https://validator.schema.org/) shows no errors on any of the four schema blocks.
- [ ] Lighthouse SEO score ≥ 95 on `/fi-FI/buy/netflix`.
- [ ] Sitemap submitted to Google Search Console (note this in the PR for Svante to action manually post-merge).

## Out of scope

- Programmatic content optimization (A/B testing meta descriptions, etc.) — later.
- Backlink building, off-page SEO — different discipline.
- Setting up Google Search Console / Bing Webmaster — manual step for Svante.
- `image_sitemap` for product images — nice-to-have, do later.

## Dependencies

⚠️ **Do not start this task until Tasks 1 and 2 are merged.** Task 3 depends on `[locale]` routing existing AND on `[brand]` pages existing.

## Files to read first

1. `app/[locale]/buy/[brand]/page.tsx` (from Task 2) — where most schema lives
2. `lib/i18n/config.ts` (from Task 1) — locales source of truth
3. `lib/landing-pages/viable-cells.ts` (from Task 2) — for sitemap + hreflang generation
4. Next 14 docs: `app/sitemap.ts` and `app/robots.ts` are file-conventions

## PR description template

```md
Implements Phase 1 task #3 from the SEM niche heatmap research (PR #3).

Adds full SEO scaffolding on top of the locale routing (PR #N from Task 1) and
landing-page generator (PR #N from Task 2):

- JSON-LD: Product + Offer + BreadcrumbList + FAQPage on every landing page
- Organization schema in root layout
- `app/sitemap.ts` — generates sitemap.xml at build time covering all viable cells
- `app/robots.ts` — robots.txt allowing crawling, disallowing checkout/success
- hreflang alternates between all viable locales for every page
- OpenGraph + Twitter Card metadata per locale × per brand
- Canonical URLs explicitly set everywhere

Closes the SEO scaffolding piece. After merge, submit sitemap to Google Search
Console and Bing Webmaster Tools (manual, ~5 minutes).
```
