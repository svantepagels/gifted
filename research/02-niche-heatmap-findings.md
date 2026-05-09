# Gifted — Niche heatmap & SEM viability (2026-05-09)

Strategy locked: **profitable RoAS at $2 fixed margin, premium positioning, overflow + underserved niches, global scope, no preconceived geography.**

This document is the answer to "where can SEM actually be profitable for us?"

## TL;DR

**At a strict $2 margin with SEM-only and conservative assumptions, the answer is uncomfortable: ~9 viable cells globally, ~$160/mo net, ~$1.9k/yr.** The business is real but very small.

**The business case improves materially under three plausible conditions** — any of which makes the project worth doing, all three combined make it a $30–50k/yr side business at modest scale:

1. **SEO landing-page leverage (~10% long-tail capture vs. 2% SEM-only):** $790/mo → $9.5k/yr
2. **Email loop adding $0.90 effective margin (30% repeat × 1.5 LTV):** $415/mo → $5k/yr
3. **Reloadly commercial terms putting actual margin at $3–4** (still well below industry leaders): $490–$1,077/mo → $6–13k/yr SEM-only, $7–14k/yr with SEO

**With all three (margin=$2.90, SEM+SEO, 1.0x search volume): ~44 viable cells, ~$3,250/mo net, ~$39k/yr.**

The geographic answer is unambiguous: **Finland is the unicorn**, MENA Arabic (UAE/SA) and small-language Europe (Poland/Greece) are the secondary plays, and *almost everything else either fails the math or fails Stripe*.

---

## Methodology

1. Pulled full Reloadly sandbox catalog: **2,961 SKUs across 169 countries, dominated by gaming (69%)**.
2. Aggregated to **1,118 unique (country × brand) cells** — the SEM targeting unit.
3. Joined each cell with:
    - **Primary language(s)** for ad copy
    - **Stripe payment-rail tier** (1 = native, 2 = present-but-limited, 3 = cross-border-only, 4 = effectively absent)
    - **Language CPC tier** (calibrated against Q4-2025 Google Ads benchmarks: tier-1 English/German/French = $1.20 head; tier-4 Finnish/Slovak/Croatian = $0.10 head)
    - **Country search-market tier** (US/UK = 6x, DE/FR/etc = 1x baseline, smaller markets scaled down)
    - **Brand reference search volume** in tier-2 baseline market (manually calibrated for top brands; e.g. Amazon = 40k head/mo, Steam = 35k, Netflix = 25k)
    - **Brand gift-fit tier** (A = premium retail, B = utility, C = gaming/crypto)
4. Modeled CVR by intersection of brand-tier × language-tier × Stripe-tier (premium retail in cheap-language Stripe-1 = 6%, gaming in tier-1 language Stripe-2 = ~2.1%, etc.)
5. Computed break-even CPC = margin × CVR. A cell is *math-profitable* if long-tail CPC ≤ break-even CPC.
6. Assumed realistic click capture: 2% of long-tail searches (SEM-only) or 10% (with SEO landing pages).
7. Verdict: **GO-PRIORITY / GO / WATCH / WATCH-SEO / SKIP-{VOLUME,MATH,STRIPE}**.

All inputs and outputs in `gifted-research/scoring/cells-scored-v3.csv`.

---

## Why the math is so tight

| CVR | Break-even CPC at $2 margin |
|---|---|
| 2% | $0.04 |
| 4% | $0.08 |
| 6% | $0.12 |
| 8% | $0.16 |

Long-tail CPCs by language tier:

| Language tier | Head CPC | Long-tail CPC |
|---|---|---|
| 1 (en/de/fr/it/es/ja) | $1.20 | $0.42 |
| 2 (nl/pt/ko/tr/sv/da/no/he) | $0.55 | $0.19 |
| 3 (pl/cs/el/ro/hu/vi/th/id/ar/ru) | $0.20 | $0.07 |
| 4 (fi/et/lv/lt/sk/sl/hr/bg/sr/sq/bn/km) | $0.10 | $0.04 |

**You can only afford long-tail bids in tier-3 and tier-4 languages, and only when CVR is at the upper end (≥4%).**  Tier-1 and tier-2 markets are mathematically locked out — **including Sweden/Norway/Denmark, your home turf, where Nordic CPCs are tier-2 and CVRs are mid-range.**

---

## Where the business is

### Tier 1 — Finland (THE outlier)

Finland is the only market with **all four favourable factors aligned**: tier-4 cheap Finnish-language CPC, tier-1 Stripe coverage, EU-Schengen logistics, and a Reloadly catalog that includes Netflix, App Store/iTunes, Steam, PlayStation, Xbox, Fortnite, and 28 other SKUs.

| Brand (Finland, fi) | Searches/mo | CPC | Break-even CPC | Net SEM-only | Net SEM+SEO |
|---|---|---|---|---|---|
| Netflix | 25,000 | $0.035 | $0.120 | $33 | $164 |
| Steam | 35,000 | $0.035 | $0.090 | $27 | $135 |
| App Store & iTunes | 10,000 | $0.035 | $0.120 | $13 | $66 |
| PlayStation | 15,000 | $0.035 | $0.090 | $12 | $58 |
| Fortnite | 30,000 | $0.035 | $0.080 | $19 | $95 |
| ... 7+ more cells with positive headroom |

**Finland alone is ~$104/mo SEM-only or ~$520/mo with SEO landing pages.**

### Tier 2 — UAE / Saudi Arabia (Arabic SEM)

Arabic is tier-3 CPC (~$0.20 head, $0.07 long-tail). UAE/SA are Stripe-tier-2 — works but with friction (CVR penalty). Reloadly has 39 (UAE) and 27 (SA) SKUs respectively, including Amazon, App Store/iTunes, Google Play, Anghami, STARZPLAY, Jawaker, talabat.

**Combined ~$26/mo SEM-only, ~$132/mo with SEO.** Not the headline play, but an interesting Arabic-language overflow lane that runs separately from European campaigns.

### Tier 3 — Greece, Poland (small-language Europe)

Greek and Polish are tier-3 CPC, both Stripe-1. Catalog is thin (Netflix, FlixBus in PL; Netflix, Twitch in GR), so very few cells clear the bar.

**Each contributes ~$14/mo SEM-only, ~$70/mo with SEO.** Combined with Finland and MENA, this is the entire economically-viable footprint.

### Everywhere else fails

- **US/UK/DE/FR/IT/ES/JP** — language CPC too high. Even 8% CVR doesn't get to $0.42 long-tail CPC. **Skipped on math.**
- **Nordic non-FI (SE/NO/DK)** — language CPC tier-2 ($0.19 long-tail), and Reloadly has near-zero retail catalog anyway. **Skipped on inventory + math.**
- **CEE (Czech/Slovak/Slovenian/Croatian/Bulgarian/Estonian/Latvian/Lithuanian)** — language is tier-4 cheap, Stripe is tier-1, *but Reloadly has zero retail catalog.* **Skipped on inventory.**
- **MENA non-Gulf (Egypt/Morocco/Tunisia/Algeria)** — Arabic CPC works, but Stripe is tier-3 cross-border-only. **Skipped on Stripe friction.**
- **Sub-Saharan Africa, Central Asia, Pakistan, Bangladesh** — Stripe doesn't really work. **Skipped on Stripe.**
- **LatAm Spanish (MX, AR, CO, CL, PE)** — Spanish CPC is tier-1 ($0.42 long-tail) which is too expensive at our CVR/margin. **Skipped on math.** (Brazil Portuguese is tier-2 same problem.)

---

## Sensitivities (the bull case)

The strict $2 SEM-only number is small. But three plausible levers stack:

| Scenario | Margin | Capture | Annual net |
|---|---|---|---|
| **Strict (base case)** | $2.00 | 2% (SEM-only) | $1,896 |
| With email loop | $2.90 | 2% (SEM-only) | $4,992 |
| With SEO landing pages | $2.00 | 10% (SEM+SEO) | $9,480 |
| Both | $2.90 | 10% (SEM+SEO) | $38,976 |
| Both + slightly better Reloadly margin | $4.00 | 10% (SEM+SEO) | $81,780 |

**Implication:** the project is shape-of-a-business under any combination of these levers. SEM-only at $2 is too thin. SEO is mandatory; email loop is mandatory; chasing Reloadly margin past $2 is highly leveraged.

### What could make it bigger
- **Reloadly margin negotiation**: if Reloadly's commercial terms net you $3.50–4.00 average (not impossible — you'd be subsidizing $1.50–2.00 of their take into your CPC), the entire economic model unlocks 5–10x more cells.
- **Search-volume model is conservative**: I used Q4-2025 Keyword Planner anchors and may be undercounting long-tail by 30–50% for less-researched markets like Finland/UAE. A 2x search-volume revision pushes the all-three-levers scenario past $80k/yr.
- **Repeat-buyer rate >30%**: Gift cards have known high re-purchase. If repeat is 50%, effective margin loop pushes higher.

### What could kill it
- **Reloadly margin worse than $2** (e.g. they pay 2-3% on a $50 card = $1.00–$1.50 actual): math closes for nearly all cells.
- **CVR overestimate**: if our CVRs are 2x too generous (very plausible — these are aspirational), break-even CPC halves and even Finland gets thin.
- **Direct CPC competition from Reloadly's own white-label brands or Apple/Walmart-direct**: real CPCs run higher than my estimates.

---

## Recommended action

### Phase 0 — pre-launch desk research (NOW, $0 cost)
- ✅ Reloadly catalog dump (done — `gifted-research/raw/`)
- ✅ Cell scoring + heatmap (this doc + `cells-scored-v3.csv`)
- [ ] Validate top-30 cells against actual Google Keyword Planner data (~2 hours; free)
- [ ] Validate top-10 cells against actual SERPs to confirm SERP-weakness assumption (~1 hour; free)
- [ ] Confirm or revise Reloadly per-brand commercial terms with Svante's account contact (the single biggest unknown)

### Phase 1 — pre-launch product work
- [ ] Implement Next.js i18n routing for **fi-FI, en-IE, en-AU, ar-AE, ar-SA, pl-PL, el-GR, en-MT, en-NZ** (9 locales for first-wave coverage)
- [ ] Build a **per-locale × per-brand landing-page generator** (`getStaticProps` + Reloadly catalog) — this is the SEO compounding engine that turns 2% SEM-only capture into 10% SEM+SEO
- [ ] Add Product/Offer/Breadcrumb schema, sitemap, robots, hreflang
- [ ] Email-capture as primary KPI alongside checkout; gift-card-launch popup, 5% off code as carrot
- [ ] Stripe payment-method matrix per country (Sofort, iDEAL, Bancontact, Apple Pay, Google Pay, Mada for SA, etc.)

### Phase 2 — soft launch (first $300 SEM spend)
- [ ] Launch only on Finland × top-5 brands (Netflix, Steam, App Store, PlayStation, Fortnite) on Bing Ads first (cheaper CPCs to validate funnel)
- [ ] Spend cap: $300/mo. Optimize CVR. Confirm or refute the model.
- [ ] If Finland validates: extend to UAE/SA (Arabic) and Greece/Poland in month 2.
- [ ] If Finland *doesn't* validate (real CVR < 3%, CPC > $0.05): the entire thesis at $2 margin is wrong, and the product needs to either add affiliate revenue, raise margin via fees, or pivot.

---

## Files in this research bundle

- `raw/products.json` — full 2,961-SKU dump
- `raw/countries.json` — 169 supported countries
- `inventory-matrix.csv` — every (brand × country) row including denominations
- `scoring/cells-base.csv` — 1,118 (country × brand) base cells with structural metadata
- `scoring/cells-scored-v3.csv` — same with full scoring + verdicts (the canonical output)
- `01-findings-pre-launch-tooling.md` — earlier write-up on tooling needs
- `02-niche-heatmap-findings.md` — this doc

## Appendix: full scoring summary

| Verdict | Cells |
|---|---|
| GO-PRIORITY | 0 (no cell clears $200/mo SEM-only at $2 margin) |
| GO | 0 |
| WATCH | 3 (Finland: Netflix, Steam, Fortnite) |
| WATCH-SEO | 6 (Finland: iTunes, PlayStation, Xbox; PL/GR: Netflix; UAE/SA: Amazon) |
| SKIP-VOLUME | 66 (math works but capture too small to matter) |
| SKIP-MATH | 620 (CPC > break-even) |
| SKIP-STRIPE | 423 (Stripe rails effectively absent) |
| **TOTAL** | **1,118** |
