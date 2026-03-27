# Design-to-Code Alignment Best Practices
**Research Source:** GIFTED Project Design Alignment  
**Date:** 2026-03-27  
**Status:** Reference Guide  

---

## Purpose

This document captures research-backed best practices for aligning code implementations with design specifications. These patterns emerged from analyzing the GIFTED project's design system and reference screens.

---

## 1. TYPOGRAPHY IMPLEMENTATION

### Pattern: Import Specialized Fonts Correctly

**❌ Common Mistake:**
```tsx
// Trying to use "Black" as a weight of the regular font family
import { Archivo } from 'next/font/google'
const archivo = Archivo({ weight: ['900'] })  // Might not give true "Black" weight
```

**✅ Correct Approach:**
```tsx
// Import Archivo Black as a separate font family
import { Archivo_Black } from 'next/font/google'
const archivoBlack = Archivo_Black({ 
  weight: '400',  // This IS the black weight
  subsets: ['latin'],
  variable: '--font-archivo-black'
})
```

**Lesson:** Some Google Fonts have dedicated "Black" or "Condensed" families that are separate imports, not weight variations.

### Pattern: Match Typography Exactly, Not Approximately

**❌ Approximate:**
```tsx
<h1 className="text-4xl font-bold">  // Generic Tailwind token
```

**✅ Exact:**
```tsx
<h1 className="text-[64px] font-black leading-[1.1] tracking-[-0.02em]">  // Matches design spec
```

**Lesson:** When design specifies exact values (64px, -0.02em tracking), use bracket notation to match precisely.

### Pattern: Letter Spacing is Semantic

**Tight spacing (-0.02em):** Authority, urgency, editorial headlines  
**Normal spacing (0em):** Body text, descriptions  
**Wide spacing (+0.05em, +0.1em):** Labels, section headers, buttons (improves legibility at small sizes)

```tsx
// Headlines: Tight
className="tracking-[-0.02em]"

// Body: Normal
className="tracking-normal"

// Labels: Wide
className="tracking-[0.05em] uppercase"
```

---

## 2. GRID & LAYOUT SYSTEMS

### Pattern: Progressive Responsive Grids

**❌ Large Jumps:**
```tsx
// Awkward: 2 columns → suddenly 6 columns
grid-cols-2 xl:grid-cols-6
```

**✅ Smooth Progression:**
```tsx
// Natural breakpoint flow
grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
```

**Lesson:** Each breakpoint should add 1-2 columns max to avoid jarring layout shifts.

### Pattern: Mobile-First Column Decisions

| Viewport Width | Recommended Product Grid Columns | Rationale |
|---------------|----------------------------------|-----------|
| 320-480px (mobile) | 2 | Thumb-friendly, card detail visible |
| 481-768px (tablet portrait) | 3 | Balances density and readability |
| 769-1024px (tablet landscape) | 4 | Standard e-commerce density |
| 1025-1280px (laptop) | 5 | High density without cramping |
| 1281px+ (desktop) | 6 | Maximum density for large screens |

### Pattern: Gap Sizing for Dense vs. Spacious Layouts

**Dense layouts (6-column grids):** `gap-3` or `gap-4` (12-16px)  
**Spacious layouts (3-4 column grids):** `gap-6` or `gap-8` (24-32px)

**Why:** More columns need tighter gaps to prevent visual chaos. Fewer columns can afford more breathing room.

---

## 3. COLOR & TONAL HIERARCHY

### Pattern: The "No-Line Rule"

**Principle:** Separate sections using background color shifts, not borders.

**❌ Traditional approach:**
```tsx
<div className="border-t border-gray-200">
  <section>Next section</section>
</div>
```

**✅ Tonal approach:**
```tsx
<section className="bg-white">First section</section>
<section className="bg-gray-50">Second section (visually separated)</section>
```

**When to break the rule:**
- Form inputs (need definition)
- Logo containers against same-color backgrounds
- Data tables (where rows need separation)

### Pattern: "Ghost Borders" for Necessary Lines

When you MUST use a border:

**❌ Harsh 100% opacity:**
```tsx
border border-gray-300  // Too prominent
```

**✅ Subtle 20-30% opacity:**
```tsx
// Using alpha channel or opacity
border border-gray-200/30
// or
border border-[rgba(198,198,205,0.3)]
```

**Lesson:** Borders should whisper, not shout. Low opacity maintains the "milled from one block" premium feel.

---

## 4. INTERACTIVE STATES & VISUAL FEEDBACK

### Pattern: Active State Inversion

**For chip/pill filters:**

**Inactive state:**
- Background: Transparent or white
- Border: Light gray
- Text: Dark

**Active state (inversion):**
- Background: Dark/black
- Border: None
- Text: White

```tsx
// Inactive
className="bg-white border border-gray-300 text-gray-700"

// Active
className="bg-gray-900 border-none text-white"
```

**Why:** High contrast inversion makes the active state unmistakable.

### Pattern: Hover States for Cards

**❌ Heavy shadow on hover:**
```css
.card:hover {
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);  /* Too dramatic */
}
```

**✅ Subtle tonal shift + ambient shadow:**
```css
.card {
  background: #FFFFFF;
  transition: background 200ms, box-shadow 200ms;
}

.card:hover {
  background: #FAFBFC;  /* Slightly brighter */
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);  /* Soft, atmospheric */
}
```

**Lesson:** Use the brand's primary color (e.g., navy #0F172A) in shadows at low opacity for cohesive depth.

---

## 5. COMPONENT-SPECIFIC PATTERNS

### Pattern: Search Bar with Internal Button

**Structure:** Outer pill container with button positioned inside the right edge.

```tsx
<div className="relative flex items-center">
  <input 
    className="w-full h-[52px] pl-12 pr-32 rounded-full border border-gray-300"
    placeholder="Search brands..."
  />
  <button className="absolute right-[6px] h-[40px] px-6 bg-gray-900 text-white rounded-full font-bold uppercase text-sm">
    SEARCH
  </button>
</div>
```

**Key details:**
- Input has right padding to prevent text overlap with button
- Button is absolutely positioned inside the input with small margin
- Button is slightly shorter than input height for visual balance

### Pattern: Compound Form Inputs (Card Details)

**Stripe/Payment processor pattern:** Grouped inputs with shared borders.

```tsx
<div className="overflow-hidden rounded-lg border border-gray-300">
  {/* Top field: full width */}
  <input 
    placeholder="Card number"
    className="w-full p-3 border-b border-gray-300"
  />
  <div className="grid grid-cols-2">
    {/* Bottom left: expiry */}
    <input 
      placeholder="MM / YY"
      className="p-3 border-r border-gray-300"
    />
    {/* Bottom right: CVC */}
    <input 
      placeholder="CVC"
      className="p-3"
    />
  </div>
</div>
```

**Why:** Reduces visual clutter, groups related fields, and looks professional.

### Pattern: Emphasized Total Price

**❌ Same size as other prices:**
```tsx
<div className="text-lg font-bold">$25.00</div>
```

**✅ Dramatically larger with currency suffix:**
```tsx
<div className="flex items-baseline gap-1">
  <span className="text-[36px] font-extrabold leading-none">
    $25.00
  </span>
  <span className="text-[10px] uppercase text-gray-500">
    USD
  </span>
</div>
```

**Lesson:** The total should be 2-3x larger than line item prices to create unmistakable hierarchy before a user commits to payment.

---

## 6. SUCCESS & CONFIRMATION PATTERNS

### Pattern: Success Icon with Halo Glow

**❌ Flat icon:**
```css
.success-icon {
  background: green;
  border-radius: 50%;
}
```

**✅ Soft radial glow:**
```css
.success-icon {
  background: #62DF7D;
  border-radius: 50%;
  box-shadow: 
    0 0 0 8px rgba(98, 223, 125, 0.15),
    0 0 0 16px rgba(98, 223, 125, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.1);
}
```

**Why:** The halo creates a celebratory "glow" effect that feels warmer and more successful than a flat green circle. Use concentric shadows with decreasing opacity for a natural gradient.

### Pattern: Confirmation Page Layout

**Structure:**
1. Success icon (with halo)
2. Bold confirmation headline
3. Expectation-setting description ("Your code will arrive in 1-2 minutes")
4. Order details card
5. Primary CTA (revenue-generating: "Buy another")
6. Secondary CTA (utility: "View order history")
7. Trust badges footer

**Key principle:** Primary CTA should drive repeat business, not just utility. Make it easy for users to convert again while they're in a positive emotional state.

---

## 7. MOBILE-SPECIFIC PATTERNS

### Pattern: Fixed Bottom Navigation (Tab Bar)

**iOS/Material standard:** 4-5 tabs with icons above labels.

```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
  <div className="grid grid-cols-4 h-16">
    <TabButton icon={ShoppingBag} label="SHOP" active />
    <TabButton icon={CreditCard} label="CARDS" />
    <TabButton icon={ShoppingCart} label="CART" />
    <TabButton icon={User} label="ACCOUNT" />
  </div>
</nav>
```

**Critical details:**
- `pb-safe` for devices with home indicators (iPhone notch)
- Active state uses darker/filled icon
- Labels in small all-caps for consistency

### Pattern: Horizontal Scrolling Category Chips

```tsx
<div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
  <Chip active>All</Chip>
  <Chip>Gaming</Chip>
  <Chip>Shopping</Chip>
  <Chip>Food</Chip>
  {/* Last chip partially visible to signal scrollability */}
</div>
```

**Lesson:** Let the last chip peek off-screen ("peek pattern") to indicate there's more content to the right. Don't force-fit all chips into viewport width.

### Pattern: Touch Target Sizing

**Minimum touch target:** 44x44px (iOS HIG standard, WCAG 2.5.5)

```tsx
// Even if the visual is smaller, ensure the clickable area is 44px+
<button className="h-[44px] min-h-[44px] px-4">
  <Icon size={20} />  {/* Icon can be smaller */}
</button>
```

---

## 8. TESTING & VALIDATION

### Pattern: Automated Visual Regression

**Playwright screenshot tests:**

```typescript
test('product grid matches design', async ({ page }) => {
  await page.goto('/browse')
  await page.waitForLoadState('networkidle')
  
  // Capture at different viewports
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(page).toHaveScreenshot('browse-desktop.png', {
    maxDiffPixels: 100  // Allow minor anti-aliasing differences
  })
  
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(page).toHaveScreenshot('browse-mobile.png')
})
```

### Pattern: Typography Measurement

**Browser DevTools console:**

```javascript
// Measure actual rendered font size
const element = document.querySelector('h1')
const styles = getComputedStyle(element)

console.log({
  fontSize: styles.fontSize,
  fontWeight: styles.fontWeight,
  letterSpacing: styles.letterSpacing,
  lineHeight: styles.lineHeight,
  fontFamily: styles.fontFamily
})
```

### Pattern: Color Accuracy Check

**Extension:** ColorZilla or Eye Dropper  
**Manual verification:**

```javascript
// Get exact background color
getComputedStyle(document.querySelector('.hero')).backgroundColor
// Should return: "rgb(242, 244, 246)" = #F2F4F6
```

---

## 9. COMMON MISTAKES & SOLUTIONS

### Mistake #1: "Close Enough" Typography

**Problem:** Using standard Tailwind tokens instead of design-specified exact values.

**Solution:** Always use bracket notation for exact matches:
```tsx
// Instead of text-4xl (2.25rem = 36px)
// Use exact design value
text-[64px]
```

### Mistake #2: Ignoring Letter Spacing

**Problem:** Designs specify tight or wide tracking, implementation ignores it.

**Solution:** Add `tracking-*` to every typographic element that isn't default:
```tsx
<h1 className="... tracking-[-0.02em]">  {/* Tight */}
<button className="... tracking-[0.05em]">  {/* Wide */}
```

### Mistake #3: Adding Borders Everywhere

**Problem:** Using borders to separate every section breaks the premium feel.

**Solution:** Use tonal shifts (background color changes) for 90% of separations. Reserve borders for form inputs only.

### Mistake #4: Weak Visual Hierarchy

**Problem:** All text sizes too similar, nothing stands out.

**Solution:** Create dramatic size jumps:
- Hero: 64-80px
- Section headers: 18-24px
- Body: 14-16px
- Labels: 11-12px

**Ratio:** Aim for at least 1.5x-2x between hierarchy levels.

### Mistake #5: Mobile Grid Cramming

**Problem:** Trying to fit too many columns on mobile.

**Solution:** Stick to 2 columns max for product grids on mobile. More columns = illegible cards.

---

## 10. DESIGN SYSTEM PHILOSOPHY

### The "Architectural Ledger" Approach

**Core principles (from GIFTED design system):**

1. **Intentional Asymmetry:** White space directs the eye, not decorative elements
2. **Massive Type Contrast:** Bold headlines (Archivo Black 900) vs. clean body (Inter 400)
3. **Structural Minimalism:** No borders, gradients, or glassmorphism
4. **Tonal Layering:** Depth through background shifts, not shadows
5. **Precision as Aesthetic:** Exact pixel values, not approximations

**When to apply this philosophy:**
- Premium products (luxury, finance, B2B)
- Editorial/content-heavy sites
- When brand positioning is "sophisticated" or "authoritative"

**When NOT to apply:**
- Playful/youth-focused brands
- E-commerce with heavy product imagery
- When brand requires vibrant colors and gradients

---

## 11. TOOLING & WORKFLOW

### Recommended Tools

**Typography:**
- [Google Fonts](https://fonts.google.com) — Font pairing research
- [Type Scale](https://typescale.com) — Generate harmonious size systems
- [Font Pair](https://fontpair.co) — Curated pairing suggestions

**Color:**
- [Tailwind Color Palette Generator](https://uicolors.app) — Generate tonal scales
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — Ensure WCAG compliance
- [Coolors](https://coolors.co) — Palette inspiration

**Layout:**
- [CSS Grid Generator](https://cssgrid-generator.netlify.app) — Visualize grid systems
- [Responsively App](https://responsively.app) — Test multiple viewports simultaneously
- Browser DevTools (F12) — Element inspection and measurement

**Testing:**
- [Playwright](https://playwright.dev) — Visual regression testing
- [Percy](https://percy.io) — Visual review workflow
- [Chromatic](https://chromatic.com) — Storybook visual testing

### Workflow: Design-to-Code Process

1. **Receive design files/screenshots**
2. **Extract design system** (colors, typography, spacing) → `DESIGN_TOKENS.md`
3. **Document components** (anatomy, states, interactions) → `COMPONENT_SPEC.md`
4. **Measure precise values** (font sizes, spacing, dimensions) → Add to spec
5. **Implement in code** with exact values (bracket notation)
6. **Compare screenshots** side-by-side (design vs. implementation)
7. **Iterate until pixel-perfect** (or "design-intent-perfect")

---

## 12. ACCESSIBILITY CONSIDERATIONS

### Pattern: Touch Targets on Mobile

**WCAG 2.5.5:** Minimum 44x44px (iOS HIG) or 48x48dp (Material)

```tsx
// Visual can be smaller, but clickable area must be 44px+
<button className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] p-2">
  <Icon className="h-5 w-5" />
</button>
```

### Pattern: Color Contrast Ratios

**WCAG AA (minimum):**
- Normal text (< 18px): 4.5:1
- Large text (≥ 18px or ≥ 14px bold): 3:1

**WCAG AAA (enhanced):**
- Normal text: 7:1
- Large text: 4.5:1

```tsx
// Good contrast example
<button className="bg-blue-600 text-white">  
  {/* Blue #2563EB on white = 4.5:1, passes AA */}
</button>

// Bad contrast example (avoid)
<p className="text-gray-400">  
  {/* Light gray on white = 2.5:1, FAILS */}
</p>
```

### Pattern: Font Size for Mobile Inputs

**iOS Safari auto-zooms on inputs < 16px**

```tsx
// Prevents unwanted zoom on focus
<input className="text-base"  {/* 16px */} />

// NOT
<input className="text-sm"  {/* 14px, triggers zoom */} />
```

---

## 13. PERFORMANCE OPTIMIZATION

### Pattern: Font Loading Strategy

**next/font/google** provides automatic optimization:

```tsx
// app/layout.tsx
import { Inter, Archivo_Black } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',  // Prevents FOIT (flash of invisible text)
  variable: '--font-inter'
})

const archivoBlack = Archivo_Black({ 
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo-black'
})

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${archivoBlack.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

**Result:** Fonts are self-hosted, preloaded, and swap-optimized automatically.

### Pattern: Image Optimization for Product Cards

```tsx
import Image from 'next/image'

<Image 
  src={product.logo}
  alt={product.name}
  width={80}
  height={80}
  className="object-contain"
  loading="lazy"  // Defers off-screen images
  quality={90}    // Balance between quality and file size
/>
```

---

## 14. DOCUMENTATION PATTERNS

### Pattern: Component Documentation Template

```markdown
## [Component Name]

### Design References
- Desktop: `design-refs/.../screen.png`
- Mobile: `design-refs/.../screen.png`

### Anatomy
[Visual breakdown or ASCII diagram]

### States
- Default
- Hover
- Active
- Disabled

### Props/API
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|

### Implementation
[Code snippet]

### Accessibility
- Keyboard navigation: [describe]
- ARIA labels: [list required]
- Touch targets: [dimensions]

### Testing
- [ ] Visual matches design
- [ ] Responsive behavior correct
- [ ] Interactive states work
- [ ] Accessibility requirements met
```

---

## 15. SUMMARY CHECKLIST

Use this checklist for every design alignment project:

**Typography:**
- [ ] Exact font families imported (including specialized variants like "Black")
- [ ] Font sizes match design spec (use bracket notation)
- [ ] Letter spacing applied correctly (tight for headlines, wide for labels)
- [ ] Line heights match design (especially for headlines)
- [ ] Text case correct (uppercase labels, sentence case body)

**Layout:**
- [ ] Grid columns progress smoothly across breakpoints
- [ ] Mobile starts at 2 columns max for product grids
- [ ] Gap sizes appropriate for density (tight for 6-col, spacious for 3-col)
- [ ] Responsive breakpoints tested at intermediate sizes

**Color & Depth:**
- [ ] Color tokens match design system exactly
- [ ] Sections separated by tonal shifts, not borders (where appropriate)
- [ ] Borders at 20-30% opacity when required
- [ ] Shadows use brand color at low opacity (not pure black)

**Components:**
- [ ] Search bars have internal buttons if specified
- [ ] Form inputs use compound grouping for related fields
- [ ] Total price is 2-3x larger than line items
- [ ] Success icons have halo/glow effects
- [ ] Category chips use inversion for active state

**Mobile:**
- [ ] Fixed bottom navigation if specified
- [ ] Touch targets minimum 44px
- [ ] Input fields 16px font size to prevent iOS zoom
- [ ] Horizontal scrolling chips with peek pattern

**Testing:**
- [ ] Screenshot comparison completed
- [ ] Typography measured and validated
- [ ] Color accuracy checked
- [ ] Responsive behavior verified
- [ ] Accessibility requirements met (WCAG AA minimum)

---

**End of Best Practices Guide**  
**Version: 1.0**  
**Last Updated: 2026-03-27**
