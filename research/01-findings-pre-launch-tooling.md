# Gifted SEM strategy — pre-launch research findings (2026-05-09)

## Source
- Reloadly **sandbox** API (production API key not yet enabled — needs upgrading)
- Endpoint: `https://giftcards-sandbox.reloadly.com`
- Pulled: 2,961 products, 169 supported countries
- Caveat: production catalog can differ from sandbox; numbers below are sandbox-derived

## Headline catalog reality

- **2,961 SKUs** total — but **41% (1,218) are Fortnite alone**
- Category mix: **69% Gaming, 18% Shopping, 9% Crypto**, 2% Entertainment, <1% everything else
- Real consumer/retail brand count (excluding gaming/crypto): **140 brands, 364 SKUs**
- Top retail brands by SKU count: Netflix (18), Tinder (16), Paysafe (14), App Store/iTunes (11), Amazon (11), Nike (10), Ticketmaster (9), Sephora (9), Swarovski (9), Zalando (8), Decathlon (8), Nintendo (7)
- **Only 2 "global" SKUs** (PUBG). Everything else is country-bound.

## The underserved-niches plan vs catalog reality

The original plan: target underserved geographies/languages where CPCs are cheap.

**The problem the data exposes:**

| Country | Non-gaming SKUs | Note |
|---|---|---|
| Sweden | 0 | Reloadly lists 2 SKUs, both gaming/crypto |
| Norway | 0 | Country supported, **zero SKUs** |
| Denmark | 0 | 1 SKU, gaming |
| Finland | 3 | iTunes, Netflix, Swarovski only |
| Switzerland | 0 | Country supported, **zero SKUs** |
| Iceland | 0 | Zero |
| New Zealand | 0 | Zero |
| Czech Rep, Hungary, Slovakia, Slovenia, Croatia, Bulgaria, Estonia, Latvia, Lithuania, Luxembourg | 0 each | All zero non-gaming |
| Greece | 2 | Netflix, Twitch |
| Poland | 2 | FlixBus, Netflix |
| Romania | 0 (18 gaming) |  |
| Turkey | 0 (16 gaming) |  |
| South Africa | 0 (16 gaming) |  |

**Plain reading:** the "underserved Northern European / Eastern European / Nordic" thesis is mostly **not buyable on Reloadly's catalog as it stands**. There is essentially nothing to sell into Sweden, Norway, Denmark, Switzerland, the Baltics, or most of CEE.

Where there *is* coverage outside US/UK/DE/FR/IT/ES:
- **Austria** (38 SKUs, including Amazon, Zalando, Calzedonia, Ticketmaster) — strong
- **Netherlands** (35 SKUs, Amazon, Zalando, Mango)
- **Belgium** (34 SKUs)
- **Ireland** (37 SKUs, Tesco, iTunes)
- **Portugal** (36 SKUs, Mango, Sephora, Rituals)
- **Finland** (33 SKUs but only 3 retail)
- **UAE / Saudi Arabia / Bahrain / Oman** (20–39 SKUs each, MENA Arabic-language opportunity)
- **Thailand** (21), **Philippines** (19) — SEA
- **Brazil** (95 — but huge Stripe + competition issues)
- **Greece** (27 — but mostly gaming)

## Strategic implications

1. **The "overflow + underserved Nordic" lane is mostly closed by inventory.** Sweden, Norway, Denmark, Switzerland — the geographies where you might think CPCs are cheap and competition thin — have **no Reloadly product**. SEM with no product to sell is impossible.

2. **The viable underserved lanes given current inventory:**
   - **MENA Arabic-language** — UAE/SA/BH/OM with 80+ combined SKUs, Arabic SEM is genuinely thin, Stripe works in UAE/SA via local rails
   - **Iberian + Greek + Polish + Finnish** consumer SEM — small but real catalogs, low CPC, low competition
   - **Austrian / Irish / Belgian** "tier-1.5" markets — full retail catalogs, German/English/French/Dutch ad copy, lower CPCs than DE/UK proper
   - **Brazilian Portuguese** — biggest local catalog (95 SKUs) but Stripe BR is gnarly

3. **Gaming is the elephant in the room.** 69% of SKUs are gaming/crypto. If you're willing to lean into gaming, the lane changes completely:
   - Fortnite V-Bucks across 100+ countries → genuine global SEM play
   - Steam / Roblox / Xbox / PlayStation → high search intent, predictable CVR, but CPC is competitive
   - $2 margin on a $50 V-Bucks card is plausible if Reloadly discount is ≥4%
   - Caveat: gaming buyers skew younger, payment-method mismatches more common, fraud rates higher

4. **For "premium / not-price-leader" positioning, the catalog's strongest fit is:**
   - iTunes / App Store (geo-flexible, every market)
   - Netflix (every market, gift-as-gift use case)
   - Amazon (where available — DE/AT/IT/FR/ES/UK/US)
   - Nike / Sephora / Zalando / Decathlon (lifestyle gifting)
   - Smartbox / Tinder / Ticketmaster (experiential gifting, less price-comparison)

## Practical conclusion: you don't need paid SEM-research tools yet

For pre-launch desk research with this catalog:

- **Free tools cover everything you need** for the next 2–4 weeks:
  - Google Keyword Planner (free, all you need for search volume + CPC by country/language)
  - Google Trends (relative interest, seasonality)
  - Bing Webmaster Tools + Microsoft Ads Keyword Planner (free, second opinion + Bing volumes)
  - Manual SERP checks via incognito + VPN/proxy for ~50 niche combos
  - The Reloadly catalog dump (just produced) → `inventory-matrix.csv`
- **Skip serper.dev and DeepL for now.** Won't matter until launch.
- **Skip Ahrefs/Semrush.** Won't matter at all at $2 margin.

## Tools/access actually needed for pre-launch research

### Already in hand
- ✅ Reloadly sandbox API access (creds in `gifted-project/.env.local`)
- ✅ Local catalog dump (2,961 SKUs, `gifted-research/raw/products.json`)
- ✅ Inventory matrix CSV (`gifted-research/inventory-matrix.csv`)

### Need to set up (free, ~30 min total)
- [ ] Google Ads account (or just Keyword Planner — free, no spend required)
- [ ] Microsoft Ads / Bing Ads account (free)
- [ ] Reloadly **production** API access — sandbox catalog may differ from real

### Need clarification from Svante
- [ ] Production Reloadly catalog vs sandbox — does the production account have a richer SKU list, or is sandbox representative? This **completely changes** which markets are buyable.
- [ ] Stripe-supported destination markets confirmed — assume Stripe Atlas US LLC structure?
- [ ] Reloadly affiliate margin per brand (the 1.5–6% range varies wildly by brand; need to know which brands hit your $2 floor at typical denominations)

## Next research steps (no new tooling needed)

Once Svante confirms (a) production catalog parity and (b) Reloadly margin schedule, I can produce:

1. **Niche heatmap CSV** — top 50 (brand × country × language) cells scored on `(reloadly_available, stripe_payable, search_volume, cpc, serp_weakness)`
2. **Top-10 launch plan** — ad groups, landing-page slug plan (likely needs `/[locale]-[country]/[brand]/` routing PR), expected CVR/CPC/RoAS at $2 margin, with confidence intervals
3. **i18n strategy** — which locales to bake into Next.js i18n routing first (likely en-IE, en-AU, en-NZ, de-AT, fr-BE, nl-BE, pt-PT, el-GR, ar-AE, ar-SA, fi-FI, pl-PL — *not* the Nordic markets, because there's no inventory)
