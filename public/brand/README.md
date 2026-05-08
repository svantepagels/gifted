# Gifted Brand Assets

Canonical brand assets for the **gifted** wordmark. Use these instead of regenerating the logo.

## Logo

The gifted logo is a pure lowercase wordmark — no decorative icon, no tagline, no container. The intent is a quiet, type-driven mark that does not compete with the gradient hero on the marketing site.

- **Ink color:** `#0A1320` (near-black, slight blue cast — matches the site's foreground text)
- **Construction:** lowercase, single-story `g` with a closed lower loop
- **Master format:** `gifted-logo.svg` is the source of truth. Use it for any context that supports vector (web, app icons, print, signage).
- **PNG fallbacks:** use the appropriate `@Nx` PNG when SVG is unavailable (e.g. some social platforms, email signatures, OG images).
- **Transparent vs white-bg:**
  - Use **transparent** PNGs when placing the logo on a known light background (white, off-white, very light gradient).
  - Use **white-bg** PNGs when the destination background is unknown, dark, or photographic, and you need the wordmark to remain legible without compositing.
  - On dark backgrounds, prefer the SVG with `fill` overridden to white via CSS, rather than using the white-bg PNGs (the white-bg PNGs are a *background*, not an inverted ink).

## Files

| File | Dimensions | Format | Use |
|---|---|---|---|
| `gifted-logo.svg` | vector | SVG | Master. Web, app, print, anywhere vector is supported. |
| `gifted-logo-transparent-1x.png` | 1376×768 | PNG, transparent bg | Web hero @1x, OG images, social previews |
| `gifted-logo-transparent-2x.png` | 2752×1536 | PNG, transparent bg | Web hero @2x (retina), high-DPI displays |
| `gifted-logo-transparent-4x.png` | 5504×3072 | PNG, transparent bg | Print, presentations, large displays |
| `gifted-logo-transparent-6x.png` | 8256×4608 | PNG, transparent bg | Billboards, very large print |
| `gifted-logo-white-1x.png` | 1376×768 | PNG, white bg | Email signatures, embeds where transparency is unreliable |
| `gifted-logo-white-2x.png` | 2752×1536 | PNG, white bg | Same, retina |
| `gifted-logo-white-4x.png` | 5504×3072 | PNG, white bg | Print fallback when transparent layering fails |
| `gifted-logo-white-6x.png` | 8256×4608 | PNG, white bg | Large print fallback |

## Provenance

The wordmark was generated on **2026-05-08** with Google's **Gemini 3 Pro Image Preview** model, then vectorized with **potrace**. The SVG nodes are an automated trace and have not been hand-cleaned.

For final print, signage, or any large-scale or licensable application, the SVG should either be:

1. **Cleaned manually** in Illustrator or Figma (simplify nodes, normalize curves, ensure pixel-aligned baselines), or
2. **Replaced** with a real typeface — set the word "gifted" in a chosen typeface, convert to outlines, and replace `gifted-logo.svg` while keeping the same filename.

Until that pass happens, treat this asset as **production-ready for web** but **draft-quality for print**.

## Concept

Pure lowercase wordmark. Single-story `g` with a closed loop. No decorative icon, no enclosing shape. Designed to recede so the site's gradient hero and product UI do the heavy lifting visually — the logo is a signature, not a centerpiece.
