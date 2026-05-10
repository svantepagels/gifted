# Known Gaps — i18n & Locale QA

Tracking translation and locale-coverage gaps surfaced by the
`e2e/all-locales/*` suite that were **NOT fixed in `feat/e2e-all-locales`**.

This file is the canonical record. Pick items off it as we get authoritative
copy from product/marketing.

## Translation gaps — components still using English fallbacks

These components contain hardcoded English strings that haven't been
extracted into the message JSONs yet. The runtime leak test (sentinels in
`e2e/all-locales/sentinels.ts`) is currently scoped to the home page, so
these don't yet block the suite — but they will when we extend the leak
check to PDP / brand LP / checkout.

| Component | Strings still hardcoded | Notes |
|---|---|---|
| `components/browse/ProductCard.tsx:146` | `"Instant"` (badge label) | Trivial — add `product.instantBadge` key when next iteration extends sentinels |
| `components/browse/ProductGrid.tsx:37` | `"No gift cards found"` | Empty-state copy |
| `app/[locale]/layout.tsx:37,41,55,57,62,64` | `<title>` / `<meta description>` | "Gifted — Digital Gift Cards" + "Instant delivery worldwide" — not user-visible in the rendered DOM, but matters for SEO/social per locale |
| `components/product/OrderSummary.tsx` (button label `"Sign In"`) | conditional auth CTA | Out of scope — auth not wired |
| Brand landing page sub-components (FAQ bodies, hero descriptions) | Brand-specific marketing copy that's pulled from `lib/landing-pages/` data, not from message files | Not invented per spec §12 — needs marketing input |

## Translation gaps — message keys translated by a non-native speaker

The following keys were added to `lib/i18n/messages/{ar-AE,ar-SA,el-GR,pl-PL,fi-FI}.json`
during this PR using best-effort dictionary-level translations of UI primitives
(buttons, headings, trust badges, footer links). They should be reviewed by a
native speaker before launch:

- `trust.{instant,secure,perfect}.{title,description}`
- `footer.{products,support,company,stayInTouch}.*`
- `footer.tagline`
- `footer.copyright` (token interpolation `{year}`)
- `checkout.trust.{securePayment,instantDelivery}`

Confidence per locale:
- **fi-FI** — high (native-quality dictionary)
- **pl-PL** — high (modern Polish, idiomatic)
- **el-GR** — medium (formally correct, may sound textbook)
- **ar-AE / ar-SA** — medium (MSA used; both Gulf locales currently share copy — acceptable for launch but should be reviewed by a Gulf-Arabic native to confirm tone)

## Locale switcher persistence

The current locale switcher updates the URL prefix only — there is no
`NEXT_LOCALE` cookie write nor middleware preference. After a user explicitly
switches locale, hitting `/` (no prefix) will still re-detect from
`Accept-Language` rather than honoring their explicit choice.

The architecture spec called this out as "wire test in layout.spec.ts §4 OR
document if no persistence is implemented" — we documented rather than
implemented, since the cookie path needs a product decision (cookie name,
TTL, GDPR banner alignment, etc.) before code changes.

The suite's locale switcher test currently asserts the in-flight switch
works (URL changes correctly), not that it persists.

## Surfaces that return clean 404 instead of content

These pass the suite (the test allows either 200 or a clean 404), but a
production launch likely wants real content:

- `/robots.txt` — not present, returns 404
- `/sitemap.xml` — not present, returns 404

Both are pure infra additions; no translation work needed.

## RTL — bounding-box geometry not asserted

The RTL test currently asserts `<html dir="rtl">` and computed direction.
It does NOT assert bounding-box geometry (e.g. "locale switcher's left
edge < logo's right edge"). The architecture spec §6.3 listed this as
desirable; we deferred because the header layout uses `flex-row` with
logical Tailwind ordering and the existing `dir="rtl"` is sufficient to
get correct visual mirroring on every browser we tested. If a real RTL
regression appears later, add the geometry assertion then.

## Sentinel scope

`e2e/all-locales/sentinels.ts` currently runs the leak check on **the
home page only**. Extending it to PDP, brand landing page, checkout, and
404 will surface the items in §1 above. Tracked as a follow-up.
