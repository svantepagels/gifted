# Swarm Task 1 — i18n routing for 9 first-wave locales

**Repo:** `svantepagels/gifted` (Next.js 14.2.18 App Router, TypeScript, Tailwind)
**Branch:** `feat/i18n-routing` (cut from `main`)
**PR target:** `main`
**Estimated effort:** medium (1–2 hours)

## Why

Phase 1 of the SEM go-to-market needs the site to serve **locale-specific URLs** so we can:
- Run language-targeted Google/Bing Ads landing on `/fi-FI/...`, `/ar-AE/...`, etc.
- Emit correct `hreflang` so Google indexes the right variant per market.
- Set the `<html lang>` attribute correctly for each locale (required for clean Lighthouse + assistive tech).
- Force currency, payment-method matrix, and copy variants from the URL — not from IP geolocation.

**Reference research:** `research/02-niche-heatmap-findings.md` and the report PDF at `research/report/Gifted-SEM-niche-heatmap-2026-05-09.pdf` in the same repo's `research/sem-niche-heatmap` branch (PR #3).

## What

Implement Next.js App Router internationalized routing for these 9 first-wave locales:

| Locale | Language | Country | Currency | Notes |
|--------|----------|---------|----------|-------|
| `fi-FI` | Finnish | Finland | EUR | **Primary launch market** — tier-4 cheap CPC, Stripe-1 |
| `en-IE` | English | Ireland | EUR | English-as-second-language overflow market |
| `en-AU` | English | Australia | AUD | Antipodean overflow (lower CPC than US/UK) |
| `ar-AE` | Arabic | UAE | AED | Tier-3 Arabic CPC, RTL |
| `ar-SA` | Arabic | Saudi Arabia | SAR | Same Arabic ad pool, Mada payment |
| `pl-PL` | Polish | Poland | PLN | Tier-3 cheap CPC, Stripe-1 |
| `el-GR` | Greek | Greece | EUR | Tier-3 cheap CPC, Stripe-1 |
| `en-MT` | English | Malta | EUR | Niche tier-2 English market |
| `en-NZ` | English | New Zealand | NZD | Antipodean overflow |

**Default locale:** `en-IE` (the most common English-EUR combination — keeps prices in EUR for the default browser, avoids US-bias).

## Concrete deliverables

### 1. Locale config (`lib/i18n/config.ts`)

```ts
export const locales = ['fi-FI','en-IE','en-AU','ar-AE','ar-SA','pl-PL','el-GR','en-MT','en-NZ'] as const
export type Locale = typeof locales[number]
export const defaultLocale: Locale = 'en-IE'

export const localeMeta: Record<Locale, {
  language: string         // ISO 639 — 'fi', 'en', 'ar', 'pl', 'el'
  country: string          // ISO 3166 — 'FI', 'IE', 'AU', 'AE', 'SA', 'PL', 'GR', 'MT', 'NZ'
  currency: string         // 'EUR', 'AUD', 'AED', 'SAR', 'PLN', 'NZD'
  direction: 'ltr' | 'rtl' // 'rtl' for ar-AE, ar-SA, else 'ltr'
  displayName: string      // 'Suomi (Finland)', 'العربية (الإمارات)', etc. — in the locale's own language
  hreflang: string         // == locale string, e.g. 'fi-FI'
}>
```

### 2. URL routing

- Migrate the App Router tree from `app/...` to `app/[locale]/...`.
- `app/[locale]/layout.tsx` reads `params.locale`, validates against `locales`, sets `<html lang={locale} dir={direction}>`.
- `app/[locale]/page.tsx` is the homepage.
- `app/[locale]/gift-card/[slug]/page.tsx` is the product detail.
- `app/[locale]/checkout/...` and `app/[locale]/success/...` ship with the move.
- `generateStaticParams()` on the locale layout returns one entry per locale.

### 3. Middleware locale negotiation (`middleware.ts`)

When a user hits `/` (no locale prefix):
1. Read `Accept-Language` header.
2. Match against `locales` using `@formatjs/intl-localematcher` (already supported by Next).
3. 308-redirect to `/<best-matching-locale>/` (or `/<defaultLocale>/` if no match).

Skip middleware for `/api/*`, `/_next/*`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml`, `/public/*`.

### 4. Language switcher

Add a minimal `<LocaleSwitcher>` component in `components/shared/LocaleSwitcher.tsx` that:
- Renders a dropdown with `displayName` for each locale.
- On change, swaps the locale segment in the current pathname and pushes the new URL.
- Lives in the existing `Header` component (top-right, beside any existing nav).

### 5. RTL handling

For `ar-AE` and `ar-SA`:
- `<html dir="rtl">` set on the layout.
- Add `direction-rtl:` Tailwind variants where layout flips matter (only the most obvious places — header, nav, product card chevrons; the rest can come in a polish pass).
- Verify the existing `framer-motion` slides aren't directional-broken in RTL.

### 6. Translation scaffolding (NOT full translation)

Create `lib/i18n/messages/{locale}.json` with **English placeholders for all locales except `en-*` and `fi-FI`**:
- All en-* locales share `messages/en.json`.
- `fi-FI` gets a hand-translated `messages/fi-FI.json` for the homepage hero, search placeholder, category names, and "Buy" CTA — about 30 strings. Use professional-quality Finnish (run through DeepL + sanity-check).
- `ar-AE`, `ar-SA`, `pl-PL`, `el-GR` get `messages/{locale}.json` with English strings as TODO placeholders (separate translation pass later).

Wire a tiny `useMessages(locale)` hook (no need for next-intl unless trivial) that imports the right JSON.

### 7. Acceptance criteria

- [ ] `pnpm build` and `pnpm dev` both succeed with no new TypeScript errors.
- [ ] Visiting `/` redirects to `/<negotiated-locale>/` (308) based on `Accept-Language`.
- [ ] Visiting `/fi-FI/`, `/ar-AE/`, `/pl-PL/` etc. all render the homepage with the right `<html lang>` and `<html dir>`.
- [ ] Visiting `/fi-FI/gift-card/<some-slug>` works (uses existing `[slug]` page logic).
- [ ] Locale switcher in header changes URL correctly.
- [ ] Lighthouse SEO score on `/fi-FI/` is unchanged or higher vs current `/`.
- [ ] `/xx-YY/` for unknown locale 404s cleanly.
- [ ] Existing E2E tests (Playwright) pass — update test paths to include locale segment if needed.
- [ ] Sentry source maps still upload correctly (the existing `next.config.mjs` Sentry wrapper must keep working).

## Out of scope

- Full translation copy (only Finnish gets full translation; rest are English placeholders).
- SEO metadata per locale — handled in **Task 3 (SEO scaffolding)**.
- Per-locale Reloadly catalog filtering — handled in **Task 2 (landing-page generator)**.
- Stripe payment-method matrix per country — separate phase 1 task (deferred per Svante).

## Files to read first (in repo)

1. `next.config.mjs` — Sentry wrapper, no existing i18n config
2. `app/layout.tsx` — root layout, currently no locale awareness
3. `app/page.tsx`, `app/gift-card/[slug]/page.tsx` — current page patterns
4. `lib/countries/data.ts` — existing country list (may overlap with locale country codes)
5. `components/layout/Header.tsx` — where the locale switcher goes

## PR description template

```md
Implements Phase 1 task #1 from the SEM niche heatmap research (PR #3).

Adds Next.js App Router internationalized routing for 9 first-wave locales:
fi-FI, en-IE (default), en-AU, ar-AE, ar-SA, pl-PL, el-GR, en-MT, en-NZ.

- App tree moved to `app/[locale]/...`
- Middleware does Accept-Language negotiation on `/`
- RTL support for Arabic locales
- Locale switcher in header
- Finnish hand-translated; other non-English are placeholder TODOs

Closes the i18n piece of the launch infrastructure. Next up: per-locale × per-brand
landing-page generator (Task 2).
```
