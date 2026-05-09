# Swarm Task 4 — Apply the Gifted logo across all surfaces

**Repo:** `svantepagels/gifted` (Next.js 14.2.18 App Router, TypeScript)
**Branch:** `feat/apply-brand-logo` (cut from `main` after Tasks 1–3 are merged)
**PR target:** `main`
**Estimated effort:** small-to-medium (45–90 min)

## Why

The Gifted logo asset set has been in `public/brand/` for a week (`gifted-logo.svg` + 8 PNG variants + a thorough README) but **zero code references it**. Currently:

- Header shows the text "GIFTED" rendered in `font-archivo-black` — no image at all.
- Footer has no logo at all — just nav columns and a copyright line.
- `app/layout.tsx` has no favicon, no Apple touch icon, no Open Graph image, no web manifest, no theme color.
- Browser tabs render with the default Next.js favicon. Phone home-screen bookmarks land on a generic icon.
- Social shares (Telegram, Slack, Twitter, Facebook) preview as a blank rectangle.

This is a free brand-equity win. The asset set is already curated; we just need to wire it through the surfaces that matter.

**Asset spec (verbatim from `public/brand/README.md`):**
- **Master:** `gifted-logo.svg` (vector, source of truth)
- **PNG fallbacks:** transparent + white-bg variants at 1x/2x/4x/6x
- **Ink color:** `#0A1320` (near-black, matches site foreground)
- **Construction:** lowercase wordmark, single-story `g`, no decorative icon
- **Dark backgrounds:** prefer SVG with `fill` overridden to white via CSS, NOT the white-bg PNGs
- **Light backgrounds:** prefer transparent SVG/PNG

## What

Apply the logo to every surface where a brand mark belongs. Concretely:

### 1. Header (`components/layout/Header.tsx`)

Replace the current text-only logo link with the SVG, sized appropriately for both mobile (16px header) and desktop (20px header).

```tsx
import Image from 'next/image'

<Link href="/" aria-label="Gifted home" className="flex items-center hover:opacity-80 transition-opacity">
  <Image
    src="/brand/gifted-logo.svg"
    alt="Gifted"
    width={96}
    height={28}
    priority
    className="h-6 md:h-7 w-auto"
  />
</Link>
```

**Acceptance:** Logo renders at the correct size on iPhone SE (375px), iPhone 14 Pro (393px), iPad (768px), and desktop (1500px). No layout shift on load (use explicit width/height to reserve space).

### 2. Footer (`components/layout/Footer.tsx`)

Add a logo to the top of the footer above the nav columns. Footer background is `bg-primary-container`, which is **dark** — use the SVG with white fill override (CSS) per the README's guidance.

```tsx
<div className="mb-12">
  <Link href="/" aria-label="Gifted home" className="inline-flex items-center">
    <Image
      src="/brand/gifted-logo.svg"
      alt="Gifted"
      width={120}
      height={36}
      className="h-8 w-auto [&>path]:fill-white invert brightness-0 contrast-200"
    />
  </Link>
  <p className="text-label-md mt-3 opacity-80">Digital gift cards, instantly delivered.</p>
</div>
```

If the CSS filter approach doesn't render cleanly, fall back to inline-importing the SVG as a React component (via `@svgr/webpack`) so `fill` can be controlled with a `currentColor` token. Pick whichever is cleaner — but never use `gifted-logo-white-*x.png` (the README explicitly warns against these for inverted-ink use; they're a *background*, not an inverted ink).

### 3. Favicons + app icons (`app/icon.tsx`, `app/apple-icon.tsx`, `public/favicon.ico`)

Next 14 supports file-convention icons. Implement all of:

- **`app/icon.tsx`** — programmatically renders a 32×32 favicon from the SVG. Use the `ImageResponse` API:
  ```tsx
  import { ImageResponse } from 'next/og'
  export const size = { width: 32, height: 32 }
  export const contentType = 'image/png'
  export default function Icon() {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Inline SVG of the wordmark, scaled */}
      </div>,
      { ...size }
    )
  }
  ```
- **`app/apple-icon.tsx`** — same, but 180×180, white background.
- **`public/favicon.ico`** — multi-resolution `.ico` (16×16, 32×32, 48×48). Generate with ImageMagick from the SVG:
  ```bash
  convert -background white -density 300 public/brand/gifted-logo.svg \
    -define icon:auto-resize=16,32,48 public/favicon.ico
  ```
  Commit the resulting `.ico` to `public/favicon.ico`.

**Acceptance:** Browser tab shows the Gifted mark across Chrome, Safari, Firefox. iOS "Add to Home Screen" pulls the apple-icon. Lighthouse "PWA" or "Best Practices" doesn't complain about missing icons.

### 4. Web manifest (`app/manifest.ts`)

Create using Next 14's manifest file convention:

```ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gifted',
    short_name: 'Gifted',
    description: 'Digital gift cards, instantly delivered.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0A1320',
    icons: [
      { src: '/brand/gifted-logo-transparent-1x.png', sizes: '1376x768', type: 'image/png' },
      { src: '/brand/gifted-logo-transparent-2x.png', sizes: '2752x1536', type: 'image/png' },
      // Plus standard PWA icon sizes — generate 192×192 and 512×512 from the SVG and add them.
    ],
  }
}
```

Generate `public/brand/icon-192.png` and `public/brand/icon-512.png` (square crops, white background) from the SVG. ImageMagick:
```bash
convert -background white -gravity center -resize 1024x1024 -extent 1024x1024 \
  public/brand/gifted-logo.svg -resize 192x192 public/brand/icon-192.png
convert -background white -gravity center -resize 1024x1024 -extent 1024x1024 \
  public/brand/gifted-logo.svg -resize 512x512 public/brand/icon-512.png
```

Reference these square icons in the manifest (the wide PNGs aren't appropriate for app launchers; iOS and Android need square).

### 5. Open Graph default image (`app/opengraph-image.tsx`)

Most pages will get per-page OG images later (Task 3 — SEO scaffolding handles per-brand OG composition). But the homepage and any page without a custom OG image needs a sensible default.

Create `app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Gifted — Digital gift cards, instantly delivered'

export default function OpengraphImage() {
  return new ImageResponse(
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    }}>
      <img src="https://gifted.app/brand/gifted-logo-transparent-2x.png" width={400} height={224} alt="" />
      <div style={{ fontSize: 36, color: '#0A1320', fontWeight: 600 }}>
        Digital gift cards, instantly delivered
      </div>
    </div>,
    { ...size }
  )
}
```

Same for `app/twitter-image.tsx` (Twitter Card) — same composition, identical 1200×630 dimensions.

### 6. Root metadata (`app/[locale]/layout.tsx`)

Update `metadata` to declare the assets explicitly so Next emits correct `<link>` and `<meta>` tags:

```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://gifted.app'),
  title: { default: 'Gifted — Digital Gift Cards', template: '%s | Gifted' },
  description: 'Buy digital gift cards for brands you love. Instant delivery.',
  keywords: ['gift cards', 'digital gifts', 'online shopping'],
  icons: {
    icon: [
      { url: '/icon', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-icon',
  },
  manifest: '/manifest.webmanifest',
  themeColor: '#0A1320',
  openGraph: {
    siteName: 'Gifted',
    type: 'website',
    images: ['/opengraph-image'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image'],
  },
}
```

Note: if Task 1 (i18n routing) has already moved the layout to `app/[locale]/layout.tsx`, edit *that* file. If Tasks 1–3 haven't been merged yet, edit `app/layout.tsx` and the i18n task can re-merge.

### 7. Loading / splash states (optional but high-impact)

If `app/loading.tsx` or any of the suspense fallbacks render a generic spinner today, replace them with a centered logo + spinner combo. This is a free polish moment — costs ~10 lines of code and noticeably improves perceived quality during route transitions.

Specifically check:
- `app/loading.tsx` (or `app/[locale]/loading.tsx`)
- `app/gift-card/[slug]/loading.tsx` (or `[locale]/gift-card/[slug]/loading.tsx`)
- Any `<Suspense fallback={...}>` in `app/page.tsx` and child pages

### 8. 404 / error pages

Brand the error pages too. `app/not-found.tsx` and `app/global-error.tsx` should both show the logo + a friendly message + a "Back home" button. Cheap brand-trust win for the rare visitor who lands on a broken URL.

### 9. Email order confirmation template (if it exists)

Check `lib/orders/` for any email template. If there's an order-confirmation email, it should:
- Use `gifted-logo-transparent-2x.png` in the header (transparent over light email-template bg)
- Inline the image as a CID attachment OR host it at a stable public URL (`https://gifted.app/brand/gifted-logo-transparent-2x.png`)
- Set `alt="Gifted"`
- Link to the homepage

If no email template exists yet, skip this — don't author one in this task.

## Acceptance criteria

- [ ] `pnpm build` succeeds with no new TypeScript errors.
- [ ] Header on `/`, `/[locale]/`, `/gift-card/[slug]`, and `/checkout/...` renders the logo (SVG) at the correct size on mobile and desktop.
- [ ] Footer renders the logo in white over the dark `bg-primary-container`.
- [ ] Browser tab on `/` shows the Gifted favicon (Chrome + Safari + Firefox verified).
- [ ] iOS "Add to Home Screen" on `/` produces a Gifted-branded home-screen icon.
- [ ] `https://<deployment-url>/manifest.webmanifest` returns a valid JSON manifest with at least the 192 and 512 square icons.
- [ ] Sharing the homepage URL on Telegram/Slack/Twitter renders the OG image preview (1200×630, logo + tagline).
- [ ] Lighthouse "Best Practices" score ≥ 95 on `/`.
- [ ] No layout shift (CLS = 0) introduced by the new logo `<Image>` tags — verify in Chrome DevTools Performance panel.
- [ ] No broken image references anywhere in the rendered HTML (check via `pnpm build` output and a quick `curl | grep -E '(404|<img.*src.*404)'` on the deployment).

## Out of scope

- **Per-brand OG images** for landing pages (Task 3 / SEO scaffolding handles per-page OG composition).
- **Manual SVG cleanup** — the README notes the current SVG is an automated potrace and may have noisy nodes. Print/signage cleanup is a designer task, not a swarm task. Keep the file as-is.
- **Animated logo** (loading-state lottie, etc.) — out of scope. If we want it later, separate ticket.
- **Logo on the email-marketing/newsletter templates** — those don't exist yet.
- **Designing additional logo lockups** (logo + tagline composites, monogram variants, etc.) — separate brand task.

## Files to read first (in repo)

1. `public/brand/README.md` — canonical asset spec, **read this first**
2. `components/layout/Header.tsx` — current text-only logo
3. `components/layout/Footer.tsx` — currently no logo
4. `app/layout.tsx` (or `app/[locale]/layout.tsx` post-Task-1) — root metadata, currently no icon declarations
5. `app/global-error.tsx`, `app/not-found.tsx` — error surfaces (may not exist yet)
6. `next.config.mjs` — verify `images.domains` doesn't need updating (we're serving from `public/`, so no)

## Dependencies

- **Should run AFTER Tasks 1–3 are merged** so the metadata edits land in `app/[locale]/layout.tsx` rather than `app/layout.tsx` (which Task 1 will have moved).
- If absolutely needed, this task could run in parallel with Task 1 — but at the cost of a small merge conflict in the layout file. Default to sequential.

## PR description template

```md
Applies the Gifted brand logo across the product surfaces.

The asset set has been in `public/brand/` for a week with zero code references.
This PR wires it through:

- Header: text-only "GIFTED" → SVG wordmark
- Footer: adds logo (white over dark footer)
- Favicons: programmatic `app/icon.tsx`, `app/apple-icon.tsx`, multi-res `favicon.ico`
- Web manifest: `app/manifest.ts` + 192×192 and 512×512 square icons
- Open Graph: default `app/opengraph-image.tsx` and `twitter-image.tsx`
- Root metadata: declares icons, manifest, theme color, OG site name
- Error/loading states: branded with the logo
- Order email template: logo in header (if template exists)

No layout shift, no new dependencies, no design changes elsewhere.

Closes the brand-application piece of the launch infrastructure.
```
