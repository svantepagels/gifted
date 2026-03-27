# Brand Logos

This directory should contain brand logo files for gift cards.

In production, these would be:
- SVG or PNG format
- Optimized for web (compressed)
- Named by product slug (e.g., amazon.svg, spotify.svg)
- Sourced from Reloadly API logoUrls field

For now, components use text-based placeholders showing the first letter of the brand name.

To add real logos:
1. Download brand assets from Reloadly or official brand guidelines
2. Optimize with tools like SVGO (for SVG) or ImageOptim (for PNG)
3. Place in this directory with correct naming
4. Update Next.js Image configuration if needed
