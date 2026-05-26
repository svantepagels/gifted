# Cookie Consent Module

Lightweight, self-hosted GDPR / UK GDPR cookie consent for Gifted. No external SaaS dependency.

## 1. Why self-hosted?

For a small marketplace the legal requirements are well-defined and don't justify the cost / page weight of Cookiebot / OneTrust / Osano. The module implemented here is:

- ~5 KB gzipped including the modal (which is rendered inline today — see "Future work" for code-splitting).
- Loads no third-party scripts.
- Makes no network calls before consent.
- Owns its own UX, so we don't fight a vendor's styling.

It satisfies the GDPR + UK GDPR triad:

1. **Banner with equal-weight Reject / Accept** on first visit, non-dismissable.
2. **Granular categories** (Necessary / Analytics / Marketing) with Necessary locked on.
3. **Persisted choice** in `localStorage` with a versioned key, and a footer link to revisit.
4. **Script gating** — analytics & marketing scripts are not loaded until the matching consent is granted.

## 2. Architecture

```
components/consent/
├── ConsentProvider.tsx         React context + state + persistence
├── ConsentBanner.tsx           First-visit banner UI
├── ConsentModal.tsx            Preferences modal (toggles)
├── ConsentPreferencesLink.tsx  Footer "Cookie preferences" button
└── consent-types.ts            TypeScript types

lib/consent/
├── constants.ts                Storage key, version, category list
├── storage.ts                  SSR-safe localStorage read/write
└── scripts.ts                  Dynamic script-loading helpers
```

### Integration points

- **`app/[locale]/layout.tsx`** — wraps the app tree with `<ConsentProvider>` and renders `<ConsentBanner />` + `<ConsentModal />` once.
- **`components/layout/Footer.tsx`** — renders `<ConsentPreferencesLink />` alongside Terms / Privacy.
- **`app/[locale]/cookie-policy/page.tsx`** — the policy page the banner links to.

### Categories

| Category   | Toggleable | Default | What it gates                                        |
| ---------- | ---------- | ------- | ---------------------------------------------------- |
| Necessary  | No         | ON      | Country cookie, consent record, checkout/CSRF state  |
| Analytics  | Yes        | OFF     | Vercel Analytics + any future analytics (PostHog…)   |
| Marketing  | Yes        | OFF     | Ad pixels, retargeting (none today; reserved seam)   |

## 3. SSR / Hydration safety

The first paint on the server has no access to `localStorage`. To avoid hydration mismatches:

1. `ConsentProvider` initialises `consent = null` and `mounted = false`.
2. A `useEffect` flips `mounted = true` and reads `localStorage` after hydration.
3. `ConsentBanner` returns `null` while `!mounted`, so the server HTML and the first client render are identical.
4. After hydration the banner appears only if `consent === null`.

Result: no console warning, no flash of banner content on subsequent visits.

## 4. Using `useConsent()` in other components

```tsx
'use client'
import { useConsent } from '@/components/consent/ConsentProvider'

function MyComponent() {
  const { consent, mounted } = useConsent()
  if (!mounted) return null
  if (!consent?.choices.analytics) return null
  // safe to fire a tracking call
}
```

Always check `mounted` before reading `consent` if your component would otherwise render different output on server vs client.

## 5. Gating a new analytics or marketing script

There are two patterns. **Use pattern A** unless you have a good reason.

### Pattern A — conditional render

Best for scripts that ship as a React component (e.g. `@vercel/analytics/react`).

```tsx
'use client'
import { Analytics } from '@vercel/analytics/react'
import { useConsent } from '@/components/consent/ConsentProvider'

export function GatedAnalytics() {
  const { consent, mounted } = useConsent()
  if (!mounted) return null
  if (!consent?.choices.analytics) return null
  return <Analytics />
}
```

Then add `<GatedAnalytics />` once in `app/[locale]/layout.tsx`.

### Pattern B — imperative inject

For raw `<script src="…">` tags. Add a helper to `lib/consent/scripts.ts` and call it from a `useEffect` in a small client component:

```ts
// lib/consent/scripts.ts
export async function loadPostHog() {
  if (alreadyLoaded('posthog')) return
  await injectScript('posthog', 'https://us.posthog.com/static/array.js')
  // …additional init code…
}
```

```tsx
'use client'
import { useEffect } from 'react'
import { useConsent } from '@/components/consent/ConsentProvider'
import { loadPostHog } from '@/lib/consent/scripts'

export function GatedPostHog() {
  const { consent, mounted } = useConsent()
  useEffect(() => {
    if (!mounted) return
    if (consent?.choices.analytics) loadPostHog()
  }, [mounted, consent])
  return null
}
```

### Don't forget

1. Add the vendor + cookies they set to the **Cookie Policy page** (`app/[locale]/cookie-policy/page.tsx`).
2. If it sets cookies, update the table in this doc.
3. Test the no-consent path: in incognito, with Reject All, the script must **not** fire (verify in DevTools → Network).

## 6. Forcing re-consent after policy changes

Bump `CONSENT_VERSION` in `lib/consent/constants.ts`. The `readConsent()` helper checks the version and returns `null` if it doesn't match, which makes the banner reappear for every existing visitor. Use this whenever:

- A new vendor is added under an existing category.
- A new category is introduced.
- The policy materially changes.

Also update `LAST_UPDATED` in `app/[locale]/cookie-policy/page.tsx`.

## 7. Testing checklist

Manual smoke test (do this on prod after deploy):

1. Open <https://gifted-project-blue.vercel.app> in an incognito window.
2. Banner appears at the bottom with three buttons (Reject All / Manage preferences / Accept all). Reject and Accept have equal visual weight.
3. Open DevTools → Application → Local Storage → confirm `gifted_cookie_consent_v1` is **absent**.
4. Click **Reject all** → banner disappears, key is written with `analytics: false, marketing: false`.
5. Reload → banner does not return.
6. Click **Cookie preferences** in the footer → modal opens with Analytics OFF.
7. Toggle Analytics ON → **Save preferences** → modal closes, key updated.
8. Reload → banner still does not return; key still says `analytics: true`.
9. DevTools → Network → no analytics requests fire while analytics is OFF.
10. Mobile: resize to ≤640px → banner is full-width pinned to the bottom, buttons stack; modal is a bottom sheet.

Keyboard / a11y:

- Tab into the banner: focus order is Reject → Manage → Accept.
- Open the modal: focus lands on the close button, Esc closes, backdrop click closes, Tab cycles inside.

## 8. Known limitations

- **localStorage disabled** (e.g. Safari private mode quotas): the choice can't be persisted; the banner re-appears each visit. We treat that as the user effectively rejecting all on every visit.
- **Per-cookie listing**: we list categories on the policy page, not every individual cookie name. ICO and CNIL guidance both accept categorical disclosure as long as the actual vendors are named, which they are.
- **No geolocation gating**: we show the banner to every visitor regardless of country. Simpler and over-protective is better than under-protective.
- **Mid-session revocation**: if a user turns analytics off after it was on, any scripts already loaded are removed from the DOM, but SDKs may still hold in-memory state and previously-set cookies until the browser is closed. Acceptable per ICO guidance as long as no new tracking events fire.

## 9. Future work (not required for launch)

- Code-split `ConsentModal` with `React.lazy` so it isn't in the initial bundle. Today it's small enough (~2 KB) that the round-trip wouldn't help.
- Add translations for `consent.*` keys to `lib/i18n/messages/*.json`. English fallbacks are wired in via `getMessages` shallow merge, so the banner is functional in every locale today.
- Server-side consent receipt logging (write the consent timestamp + choice to a backend) — would be required if we ever pursued ePrivacy / TCF v2 compliance.
