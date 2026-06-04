# ARCHITECT SPEC — Terms & Conditions Page (`/terms-conditions`)

**Project:** gifted-project (Next.js 14 App Router, i18n via `[locale]` segment)
**Author:** Architect agent
**Date:** 2026-06-04
**Status:** Ready for Coder implementation

---

## 1. Objective

Add a static **Terms & Conditions** page at `/[locale]/terms-conditions`, with content adapted from Ding's T&C (https://www.ding.com/terms-conditions/) but rewritten for:

- **Gifted Tech, LLC** (Delaware LLC) — not Ezetop/Ding (Ireland)
- A **gift-card marketplace** product — not airtime top-up / Vouchers / auto top-up
- **Delaware / US** governing law — not Irish law
- Correct legal identifiers (EIN, address) from the company's legal docs

The page must be linked from the **footer on every page** and match the existing site design (same shell as `cookie-policy`).

---

## 2. CRITICAL CONTEXT — Footer already links to a DIFFERENT path (must reconcile)

The footer (`components/layout/Footer.tsx`) **already** renders a "Terms of Service" link, but it points to **`/terms`**, and **no page exists there** (it is currently a dead 404 link). The task requires the route to be **`/terms-conditions`**.

**DECISION (implement exactly this):**

1. Create the page at **`app/[locale]/terms-conditions/page.tsx`** (route `/[locale]/terms-conditions`).
2. **Update the footer link** to point to `/terms-conditions` instead of `/terms`, so the existing "Terms of Service" footer entry resolves to the new page (this fixes the dead link AND satisfies "linked from the footer on every page" — the Footer is rendered by every page via Header/Footer composition).
3. **Update the footer label** i18n key `footer.company.terms` from "Terms of Service" → **"Terms & Conditions"** in `lib/i18n/messages/en.json` only (matches the page title and the task wording). Do **not** touch the non-English JSON files' `footer.company.terms` values (they already say the localized equivalent of "Terms"/"Terms & Conditions" and we are not translating page content in this task).

> Do NOT create a separate `/terms` page. There is exactly one terms page, at `/terms-conditions`, and the footer points to it.

---

## 3. File-level deliverables (exhaustive)

| # | Action | Path | Type |
|---|--------|------|------|
| 1 | **CREATE** | `app/[locale]/terms-conditions/page.tsx` | Server Component (static) |
| 2 | **EDIT** | `components/layout/Footer.tsx` | change `href('/terms')` → `href('/terms-conditions')` |
| 3 | **EDIT** | `lib/i18n/messages/en.json` | change value of `footer.company.terms` to `"Terms & Conditions"` |

No other files change. No middleware change is required (see §8). No new dependencies.

---

## 4. Page component — EXACT specification

**File:** `app/[locale]/terms-conditions/page.tsx`

This is a **server component**, modeled 1:1 on `app/[locale]/cookie-policy/page.tsx`. Match its structure exactly:

### 4.1 Imports (exact)
```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { isLocale, locales, type Locale } from '@/lib/i18n/config'
import { localeHref } from '@/lib/i18n/href'
```
(Drop the `ConsentPreferencesLink` import that cookie-policy uses — not needed here.)

### 4.2 Static-generation directives (exact, required)
```tsx
export const dynamic = 'force-static'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
```

### 4.3 Metadata (exact)
```tsx
export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'The terms and conditions governing your use of Gifted and the purchase of gift cards through our marketplace.',
  robots: { index: true, follow: true },
}

const LAST_UPDATED = '2026-06-04'
```
> The layout template appends `" | Gifted"`, so the browser title becomes `Terms & Conditions | Gifted`. Do not hard-code the suffix.

### 4.4 Component signature + guard (exact)
```tsx
interface TermsConditionsProps {
  params: { locale: string }
}

export default function TermsConditionsPage({ params }: TermsConditionsProps) {
  if (!isLocale(params.locale)) notFound()
  const locale: Locale = params.locale
  const href = (path: string) => localeHref(locale, path)

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <article className="prose prose-slate max-w-none">
          {/* h1 + last-updated + sections (see §5) */}
        </article>
      </main>
      <Footer />
    </>
  )
}
```

### 4.5 Styling rules (match cookie-policy EXACTLY — do not invent classes)

- Page `<h1>`: `className="font-archivo text-3xl sm:text-4xl font-bold mb-2"`
- "Last updated" line: `<p className="text-body-sm text-surface-on-surface-variant mb-8">Last updated: {LAST_UPDATED}</p>`
- Each section wrapper: `<section className="mb-8">`
- Section `<h2>`: `className="font-archivo text-title-lg font-semibold mb-3"`
- Sub-heading `<h3>` (if needed): `className="font-archivo text-title-md font-semibold mt-5 mb-2"`
- Body paragraph: `<p className="text-body-md">` (use `mt-3` on follow-on paragraphs within a section)
- Lists: `<ul className="list-disc pl-6 text-body-md mt-2 space-y-1">`
- Inner-site links (e.g. to Privacy / Cookie Policy): `className="underline text-secondary hover:text-secondary-hover"` and use `href('/...')` via `Link`
- External links: `<a href="..." target="_blank" rel="noopener noreferrer" className="underline text-secondary hover:text-secondary-hover">`
- Use HTML entities for typography exactly as cookie-policy does: `&rsquo;` `&mdash;` `&ldquo;`/`&rdquo;` (or `&quot;`). **Do not paste raw curly quotes** — keep the source ASCII-safe like the existing file.

> These are all real Tailwind tokens already used in `cookie-policy/page.tsx`. Do not introduce new color/spacing tokens.

---

## 5. CONTENT — adapted T&C body (write this verbatim into the page)

Rewrite Ding's 26 sections into the following structure. **All Ding-specific facts have been swapped for Gifted's.** This is the authoritative content; the Coder should render each numbered item as a `<section>` with an `<h2>` `N. Title` and the body paragraphs/lists below it.

### Global term substitutions already applied
- "Ding" / "Ezetop Unlimited Company" → **Gifted / Gifted Tech, LLC**
- "Top-up" / "airtime" / "Vouchers" / "Products" → **gift cards** (digital gift cards / "Gift Cards")
- "Applications" (their apps) → **the Gifted website ("Site")** (no mobile app exists; do not reference app stores or auto top-up)
- Irish registration / Dublin address / VAT → **Delaware LLC, EIN 36-5179655, Dover DE address**
- "laws of Ireland" / "courts of Ireland" → **laws of the State of Delaware, USA**
- Remove: Auto top-up section, Nauta/Cuba references, mobile-operator references, app-store references, EU Consumer Cancellation Regulations 2013 (Irish-specific), European ODR platform link.
- Contact email → **`support@gifted.app`** (placeholder consistent with `NEXT_PUBLIC_SITE_URL` default `https://gifted.app`). State explicitly in final output that this email is a placeholder pending Gifted's real support address.

### Section body (write exactly this copy)

**Intro paragraph (above section 1, inside the article, after the last-updated line):**
> Please read these Terms carefully before accessing or using the Gifted website and our services. By using the Site, you expressly agree to be bound by these Terms. If you do not agree to these Terms, you must not use the Site or purchase gift cards through it.

**1. Introduction**
> Gifted is an online marketplace operated by Gifted Tech, LLC that facilitates the purchase of prepaid digital gift cards (&ldquo;Gift Cards&rdquo;) issued by third-party brands and retailers. These gift cards are fulfilled through third-party gift-card suppliers. Your access to and use of the Gifted website (the &ldquo;Site&rdquo;) and our services (together, the &ldquo;Services&rdquo;) are subject to your acceptance of these terms and conditions (the &ldquo;Agreement&rdquo; or &ldquo;Terms&rdquo;). By using the Site, you expressly agree to be bound by these Terms. You should keep a copy of these Terms for your records.

**2. Information About Us**
> The Site is operated, and the Services are provided, by **Gifted Tech, LLC** (&ldquo;Gifted&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo; or &ldquo;our&rdquo;), a limited liability company formed under the laws of the State of Delaware, USA, with U.S. Employer Identification Number (EIN) **36-5179655**. Our business and mailing address is **1111B S Governors Ave, Suite 91924, Dover, DE 19904, USA**. You can contact us using the details in Section 18 (Customer Care &amp; Contact Information) below.

**3. Eligibility and Guest Checkout**
> Gifted does not currently require you to create an account; purchases are made as a guest by providing the information requested at checkout, including a valid email address and payment details. You agree that all information you provide will be truthful, accurate and complete, and you are responsible for keeping it up to date. You must be at least 18 years old (or the age of majority in your jurisdiction) to purchase a Gift Card. If you are using the Services on behalf of a company or other entity, you represent that you are authorised to accept these Terms on its behalf. You are responsible for all activity carried out using your email address and payment method in connection with the Services.

**4. Your Data**
> Gifted complies with applicable data-protection law with respect to personal data it holds about you. Data we collect as part of the Services is handled in accordance with our Privacy Policy and Cookie Policy, which explain how we use and protect your information. We recommend you read both carefully. *(Render &ldquo;Privacy Policy&rdquo; as a `Link` to `href('/privacy')` and &ldquo;Cookie Policy&rdquo; as a `Link` to `href('/cookie-policy')`.)*

**5. Use of the Services and Cost**
> You agree to use the Site and Services solely in accordance with these Terms and applicable law. You may not use the Site or Services: (i) in violation of any law, statute, rule or regulation; (ii) in connection with any illegal, fraudulent, offensive or otherwise improper activity; or (iii) in any manner that encourages, promotes, facilitates or instructs others to do so.
>
> When purchasing a Gift Card, you select the brand and the denomination (face value) you wish to buy and enter the recipient's delivery email address where applicable. It is your responsibility to ensure the information you enter — including the recipient email address and the denomination — is correct. The total amount payable (inclusive of any applicable taxes and fees) is displayed clearly before you confirm your order; proceeding with the order at that point is entirely optional. A processing or service fee may apply and, where the Gift Card is denominated in a currency other than the currency of your payment method, the amount charged will be subject to the applicable foreign-exchange rate on the payment date.
>
> Gift Cards are delivered upon successful payment, usually by email to the address you provide. Occasionally there may be a short delay before our third-party supplier delivers the Gift Card. Because a Gift Card can be redeemed immediately once delivered, **a Gift Card cannot be cancelled, refunded or exchanged once it has been delivered**, except as required by applicable law or as set out in Section 6. To avoid a Gift Card being sent to the wrong address, please confirm that the recipient details you have entered are correct before completing your purchase. Gifted may limit the number or value of Gift Cards that can be purchased, including over a given time period, and other limits or exclusions may apply from time to time.

**6. Refunds and Order Errors**
> Because Gift Cards are delivered electronically and can be redeemed immediately, all sales are final once a Gift Card has been delivered. If your order fails, is not delivered, or you are charged for an order that was not fulfilled, contact us using the details in Section 18 and we will investigate and, where appropriate, issue a refund or re-deliver the Gift Card. Where the issuing brand's own terms provide additional rights (for example in the case of a faulty or non-functioning Gift Card), those terms apply in addition to this Section.

**7. Transactions and Payment**
> You may pay for Gift Cards using the payment methods made available at checkout (which may include major credit and debit cards and other supported methods). Any payment method you use must have a valid billing address and a valid issuing bank or payment-services provider. Upon receipt of a complete and authorised order, Gifted will charge your chosen payment method and submit an electronic request to the relevant third-party supplier to issue the Gift Card for the benefit of the recipient you nominate.
>
> You authorise Gifted to charge your chosen payment method for any order you submit through the Site. Gifted may carry out fraud, security and identity-verification checks as it considers appropriate or as required by law, and may decline or cancel any order it reasonably believes to be fraudulent, unauthorised, or in breach of these Terms. All charges arising from an order you have authorised are your responsibility. Gifted's liability for the non-delivery or defective delivery of a Gift Card, subject to your compliance with these Terms and absent fraud, misrepresentation or negligence on your part, is strictly limited to the amount paid for that Gift Card.

**8. Promotions**
> From time to time Gifted or its partners may run promotions on the Site. Such promotions may be subject to additional terms and conditions, which will be displayed clearly at the time. Gifted is not responsible for promotions run by third parties, and you should make your own enquiries with the relevant party before relying on any such promotion. You agree to use any promotion in good faith and not to misuse any promotional code.

**9. Third-Party Gift Cards and Suppliers**
> Gift Cards available through Gifted are issued by third-party brands and supplied through third-party gift-card distributors. Each Gift Card is subject to the issuing brand's own terms and conditions, including any expiry dates, redemption restrictions and territorial limitations. Gifted does not control and is not responsible for the goods, services, availability, redemption or terms of any third-party brand, and does not warrant the accuracy or completeness of third-party information shown on the Site. You should review the issuing brand's terms before purchasing and before redeeming a Gift Card. The issuing brand and/or supplier is responsible for all aspects of the Gift Card it provides.

**10. Your Obligations**
> You are responsible, at your own expense, for the equipment, devices and internet connection needed to access the Site, and for any charges your provider applies for that access. You must comply with these Terms in order to reduce the risk of unauthorised use of the Site and harm to you, Gifted or others. To the fullest extent permitted by law, you will be liable for any loss, cost, damage or liability suffered by Gifted or any third party as a result of your breach of these Terms.

**11. Your Contributions**
> If you send Gifted any feedback, suggestions, ideas or other materials relating to the Site or Services, you agree that Gifted may use, reproduce, publish, modify, adapt and share them, free of charge and without restriction, subject to Gifted's obligations under our Privacy Policy.

**12. Intellectual Property Rights**
> &ldquo;Intellectual Property Rights&rdquo; means all copyright, patents, registered and unregistered trademarks, design rights, database rights and any other intellectual-property rights anywhere in the world. You may access, view and use the Site solely for the purpose of using the Services and in accordance with these Terms. Except where otherwise stated, the Intellectual Property Rights in and the contents of the Site are owned by Gifted Tech, LLC or its licensors. You may not reproduce, copy, modify, adapt or distribute any part of the Site (including any graphics or trademarks) without our prior written consent, other than as needed for your personal, non-commercial use of the Services. Gifted owns all Intellectual Property Rights in the name &ldquo;GIFTED&rdquo; and any accompanying logo, and in the Gifted domain names. Third-party brand names and logos shown on the Site are the property of their respective owners and are used to identify the Gift Cards available for purchase.

**13. Suspension and Withdrawal of Services**
> These Terms apply to every Gift Card you purchase through the Site. Gifted may suspend, restrict or withdraw your access to the Site or the Services: (i) on reasonable prior notice; (ii) immediately where you breach, or Gifted reasonably believes you are in breach of, these Terms; (iii) immediately where Gifted reasonably believes you have used the Site or Services in violation of any law, or in connection with any illegal, fraudulent or improper activity, or in breach of any limits Gifted has set; or (iv) as needed for maintenance, security or to address a technical issue (see Section 14). Gifted is not responsible for any loss you may incur as a result of an order not being processed following such suspension or withdrawal. You may stop using the Services at any time.

**14. Availability, Security and Maintenance**
> Gifted aims to keep the Site available but does not guarantee uninterrupted access. From time to time it may be necessary, for maintenance (planned or emergency), upgrades, security or other reasons, to make all or part of the Site or Services temporarily unavailable, to delay new features, or to change security or verification procedures, using reasonable efforts to minimise inconvenience. You acknowledge that electronic communications and the internet are not always secure and may be intercepted or delayed; while Gifted (and its suppliers) put appropriate security measures in place, Gifted cannot guarantee the absolute confidentiality of communications sent over such media. Gifted bears no liability where such events occur.

**15. Force Majeure**
> Gifted shall not be liable for, or in breach of, its obligations under these Terms where performance is prevented or delayed by any event beyond its reasonable control, including acts of God, fire, flood, war, civil unrest, government action, embargo, failure of any computer, network, payment or settlement system, telecommunications failure, inability to obtain supplies, or labour disputes.

**16. Limitation of Liability**
> Gifted bears no responsibility for any use of the Site or Services in connection with any unauthorised, illegal, fraudulent or improper activity. Save as set out in Section 7, to the fullest extent permitted by law Gifted and its members, managers, employees, officers and agents exclude all liability for any loss or damage of any kind (including any direct, indirect, incidental, special, consequential, exemplary or punitive loss, or any loss of income, money, data or goodwill) arising out of or in connection with your use of the Site, the Gift Cards or the Services. Nothing in these Terms limits liability for death or personal injury caused by our negligence, for fraud, or for any other liability that cannot lawfully be excluded. Where Gifted is liable, that liability is strictly limited to the amount you paid for the Gift Card(s) giving rise to the claim. The Site, the Services and their content are provided &ldquo;as is&rdquo; and, to the fullest extent permitted by law, Gifted makes no warranties as to their availability or fitness for any particular purpose.

**17. General Terms**
> **Variations.** Gifted may modify these Terms for commercial or legal reasons. Changes become effective fourteen (14) days after we post the updated Terms on the Site or otherwise notify you, and your continued use of the Services after that date constitutes acceptance. **Links to other websites.** The Site may link to third-party websites that Gifted does not control; Gifted is not responsible for their content, availability or practices, and you access them at your own risk. **Assignment.** You may not assign or transfer your rights or obligations under these Terms; Gifted may assign these Terms to an affiliate or successor. **Severability.** If any provision of these Terms is or becomes illegal, invalid or unenforceable, the remaining provisions continue in full force and effect. **Waiver.** No delay or failure by Gifted to exercise any right is a waiver of that right, and no waiver of any breach is a waiver of any subsequent breach.

**18. Governing Law and Disputes**
> These Terms, the Site and the provision of the Services are governed by the laws of the **State of Delaware, USA**, without regard to its conflict-of-laws rules. Subject to any mandatory consumer-protection rights available to you under the law of your country of residence, you agree that the state and federal courts located in the State of Delaware shall have exclusive jurisdiction over any claim or dispute arising out of or in connection with these Terms or your use of the Site or Services.

**19. Customer Care & Contact Information**
> If you have any questions about these Terms, a complaint, or need help with the Site or the Services, please contact us:
> - **Email:** `support@gifted.app`
> - **Postal address:** Gifted Tech, LLC, 1111B S Governors Ave, Suite 91924, Dover, DE 19904, USA
>
> Copyright line at the very bottom of the article: `© {currentYear} Gifted Tech, LLC. All rights reserved.` — render the year with `new Date().getFullYear()` in the server component (acceptable in a `force-static` page; it will be the build year, consistent with how the Footer computes its own year).

> **Renumbering note:** the Coder must use the section numbers exactly as above (1–19). The intro paragraph is NOT numbered. Do not keep Ding's original 1–26 numbering.

---

## 6. Footer edit — EXACT diff

**File:** `components/layout/Footer.tsx`

Find:
```tsx
            <li>
              <Link
                href={href('/terms')}
                className="text-label-lg hover:text-surface-container-lowest transition-colors"
              >
                {m['footer.company.terms']}
              </Link>
            </li>
```
Change `href('/terms')` → `href('/terms-conditions')`. Leave everything else (including `{m['footer.company.terms']}`) untouched.

> Note: `/privacy` in the footer remains a dead link — that is a pre-existing gap and **out of scope** for this task (the task is only the Terms & Conditions page). Do not "fix" it here. Flag it in the final output as a known follow-up.

---

## 7. i18n edit — EXACT diff

**File:** `lib/i18n/messages/en.json`

Find (around line 69):
```json
  "footer.company.terms": "Terms of Service",
```
Change the value to:
```json
  "footer.company.terms": "Terms & Conditions",
```

**Do NOT edit** `footer.company.terms` in any other locale JSON (`ar-AE`, `ar-SA`, `el-GR`, `fi-FI`, `pl-PL`). Those already carry the localized "Terms / Terms & Conditions" wording and we are not localizing the page content in this task. The English label change keeps the footer consistent with the page's English title.

> The page body itself is **English-only** for all locales in this task. The cookie-policy page set the same precedent (it renders English content regardless of locale). Do not attempt to translate the 19 sections. State this explicitly in the final output as an accepted limitation.

---

## 8. Routing / middleware — verification (no change needed)

- The page lives under `app/[locale]/terms-conditions/page.tsx`, so it inherits the `[locale]` segment and the `LocaleLayout` shell automatically.
- `middleware.ts` matcher is `['/((?!api|_next|.*\\..*).*)']` and redirects any path **without** a leading locale to the locale-prefixed version (same mechanism that already serves `/cookie-policy`). **No middleware edit is required** — a bare `/terms-conditions` will be redirected to `/<locale>/terms-conditions` exactly like `/cookie-policy` is today. Confirm this by testing both `/terms-conditions` and `/en-IE/terms-conditions` after build (see §10).
- `generateStaticParams()` returning all 9 locales means the page is pre-rendered for every locale at build time (`force-static`). This matches cookie-policy.

---

## 9. Data / schemas / APIs

**None.** This is a purely static content page. There are:
- No API endpoints, no fetches, no `useApp()` / context usage, no client state.
- No environment variables, no secrets, no Vercel env changes.
- No new npm dependencies.

The page is a server component with zero runtime data dependencies — it must build as fully static HTML for all 9 locales.

---

## 10. Acceptance criteria (Coder + Tester must verify ALL)

1. **Route exists:** `app/[locale]/terms-conditions/page.tsx` created; visiting `/en-IE/terms-conditions` renders the page with Header + Footer + 19 numbered sections + intro paragraph.
2. **Footer link works on every page:** clicking "Terms & Conditions" in the footer (rendered on home, PDP, checkout, cookie-policy, etc.) navigates to `/<locale>/terms-conditions` — no 404. Verified on at least the home page and one product page.
3. **Footer label** reads **"Terms & Conditions"** in English locales (was "Terms of Service").
4. **No Ding references** remain anywhere in the rendered page: grep the built page / source for `Ding`, `Ezetop`, `Top-up`/`top-up`, `Voucher`, `airtime`, `Nauta`, `Ireland`, `Dublin`, `auto top-up`, `app store` — all must be **absent** (except where "gift card" legitimately replaces them).
5. **Correct Gifted legal facts present:** the rendered page contains the literal strings `Gifted Tech, LLC`, `Delaware`, `36-5179655`, and `1111B S Governors Ave, Suite 91924, Dover, DE 19904`.
6. **Governing law** is Delaware/USA, not Ireland.
7. **Design parity:** page visually matches cookie-policy (same container width `max-w-3xl`, same `font-archivo` headings, same `prose prose-slate`, same link colors). No new Tailwind tokens introduced.
8. **Metadata:** `<title>` renders as `Terms & Conditions | Gifted`; meta description present; `robots index,follow`.
9. **Build is clean:** `npm run build` succeeds with the new static route listed (look for `/[locale]/terms-conditions` as a `●` static / SSG route in the build output) and **zero new TypeScript or lint errors**.
10. **No regression:** `/cookie-policy` and the home page still build and render.

---

## 11. Build & verification commands (Coder runs these before handoff)

```bash
cd /Users/administrator/.openclaw/workspace/gifted-project

# Type-check + build (must succeed, must list the new static route)
npm run build

# Grep the generated source for forbidden Ding terms (should print NOTHING)
grep -RniE 'ding|ezetop|top-?up|voucher|airtime|nauta|ireland|dublin' \
  app/'[locale]'/terms-conditions/page.tsx | grep -vi 'gift' || echo "CLEAN: no Ding terms"

# Confirm required Gifted facts ARE present (should print matches)
grep -nE 'Gifted Tech, LLC|Delaware|36-5179655|1111B S Governors Ave' \
  app/'[locale]'/terms-conditions/page.tsx
```

Optional manual smoke test (if a dev server is run):
```bash
# Bare path should 307-redirect to a locale-prefixed path
curl -sI http://localhost:3000/terms-conditions | head -1
# Locale path should 200
curl -sI http://localhost:3000/en-IE/terms-conditions | head -1
```

---

## 12. Deployment

If the swarm pipeline deploys (per the deployment checklist in the task), the standard flow applies — **no env vars to add** (this change introduces none):

```bash
git add app/'[locale]'/terms-conditions/page.tsx components/layout/Footer.tsx lib/i18n/messages/en.json
git commit -m "feat: add Terms & Conditions page at /terms-conditions, link from footer"
git push origin main
vercel --prod --yes
```

After deploy, verify the production URL `/<locale>/terms-conditions` returns 200 and the footer link resolves. Report the deployment URL in the final output.

> The Coder should commit ONLY the three changed files plus this spec doc. Do not commit `node_modules`, `.next`, or unrelated working-tree changes.

---

## 13. Explicit uncertainties / assumptions (stated, not guessed)

1. **Support email `support@gifted.app` is a placeholder.** The legal docs do not contain a customer-support email. I derived the domain from `NEXT_PUBLIC_SITE_URL` default (`https://gifted.app`). **Flag to the human** that the real support address must replace it before the page is considered legally final.
2. **English-only content** for all 9 locales — consistent with the existing cookie-policy precedent. Localization of the T&C body is out of scope.
3. **`/privacy` is a pre-existing dead footer link** — not created or fixed here (out of scope).
4. **`/terms` → `/terms-conditions`** path reconciliation is an intentional decision (§2) to satisfy both "route at /terms-conditions" and "linked from footer on every page" while fixing the existing dead `/terms` link. There is no separate `/terms` page.
5. **This is not legal advice.** The content is an adaptation of Ding's structure with Gifted's facts; Gifted should have counsel review before relying on it. Note this in the final handoff.
