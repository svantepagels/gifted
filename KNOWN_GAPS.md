# Known Gaps — i18n & Locale QA

Tracking translation and locale-coverage gaps surfaced by the
`e2e/all-locales/*` suite.

This file is the canonical record. Pick items off it as we get authoritative
copy from product/marketing.

## ✅ Closed in `feat/i18n-deep-coverage`

- PDP: country pill (now uses `Intl.DisplayNames`), category pill, "Digital
  Delivery" badge, redemption block (replaced Reloadly's English-only API
  string with a localized `pdp.redemption.heading` + generic message + email
  reminder), `SELECT AMOUNT` / `ENTER AMOUNT` / range helper / placeholder /
  validation strings, `DELIVERY METHOD` / `For me` / `Send as gift`,
  `GIFT RECIPIENT` block, `CONTINUE TO CHECKOUT` CTA.
- Checkout: `Order review` panel, `YOUR INFORMATION` form, email labels and
  validation, security note, totals, submit button.
- Success page: full localization including reference-number block.
- Browse: `Instant` badge, `Digital delivery · ~5 min` line, `No gift cards
  found` empty state, all category chip labels (added `Beauty / Tech /
  Entertainment / Other`).
- Country selector: country names localized via `Intl.DisplayNames`,
  search placeholder + aria-label translated, no-match state translated,
  search now matches both English catalog name and localized name.
- Currency formatting: every `formatCurrency` call site migrated to
  `formatCurrencyForLocale` (locale-aware decimal separators — `€10,00`
  in fi-FI, `€10.00` in en-IE, `€10,00` in el-GR, etc.).
- SEO: `app/[locale]/layout.tsx` converted from static `metadata` to
  `generateMetadata` for per-locale `<title>`, `<meta description>`,
  OpenGraph, and Twitter card.
- Sentinel leak audit extended past the home page to cover PDP and brand
  landing page across all 5 non-English locales.

## Still open

### Brand-marketing copy in `lib/landing-pages/copy.ts`

Brand-specific marketing copy on `/[locale]/buy/[brand]` (FAQ bodies, hero
descriptions, "why this brand" blurbs) is still English-only by design.

This copy is **product/marketing input**, not engineering decisions. The
leak test on brand LPs (`/[locale]/buy/<slug>`) is scoped to allow up to 5
sentinel hits to accommodate this. Once marketing input arrives, the
allowance can drop to zero.

### Reloadly-supplied per-product redemption strings

The `redemptionInstructions` field on each Reloadly product is supplied
in English by the upstream API. We do **not** display it on PDP anymore —
we render a generic localized "How to redeem" message and remind the
buyer that the full per-brand instructions are delivered with the gift
card in the fulfillment email.

The fulfillment email itself is delivered by Reloadly and is currently
English-only. If we move email delivery in-house we can localize it; for
now this is upstream-controlled.

### Locale-switcher persistence (cookie / middleware)

The locale switcher still updates the URL prefix only. There is no
`NEXT_LOCALE` cookie write or middleware preference. After explicit
switching, hitting `/` (no prefix) re-detects from `Accept-Language`.

Needs a product decision (cookie name, TTL, GDPR banner alignment) before
implementation. The locale-switcher Playwright test asserts the in-flight
switch works, not that it persists.

### `robots.txt` / `sitemap.xml`

Both currently 404. Pure infra additions; no translation work needed.

### RTL geometry assertions

The RTL test currently asserts `<html dir="rtl">` and computed direction.
It does NOT assert bounding-box geometry (e.g. "locale switcher's left
edge < logo's right edge"). Header uses `flex-row` with logical Tailwind
ordering and current `dir="rtl"` is sufficient on tested browsers; add
geometry assertions if a real RTL regression appears.

### Translation confidence

Confidence ratings for the new key namespaces (`pdp.*`, `checkout.*`,
`success.*`, `categories.*`, `countrySelector.*`, `meta.home.*`,
`browse.productCard.*`, `browse.empty.*`, `orderSummary.*`):

- **fi-FI** — high (native-quality, idiomatic Finnish)
- **pl-PL** — high (modern Polish, idiomatic)
- **el-GR** — medium (formally correct, may sound textbook)
- **ar-AE / ar-SA** — medium (MSA, both Gulf locales currently share copy
  — acceptable for launch, should be reviewed by a Gulf-Arabic native)

### Sentinel coverage

`e2e/all-locales/sentinels.ts` runs the leak check on home, PDP, and
brand LP. It does NOT yet hit a real `/checkout` URL because that
requires a server-side `Order` record (created by the order API). When
we add a deterministic test order, extend the leak check there too.
