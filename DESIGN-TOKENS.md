# Design Tokens Reference

Quick reference for implementing the "Architectural Ledger" design system.

## Color Palette

### Primary (Navy/Ink)
```
primary: #0F172A
primary-container: #131B2E
on-primary-container: #7C839B
```

### Secondary (CTA Blue)
```
secondary: #0051D5
secondary-hover: #003BA3
on-secondary: #FFFFFF
```

### Success (Green)
```
tertiary-fixed-dim: #62DF7D
tertiary-container: #009842
on-tertiary-container: #FFFFFF
```

### Error (Red)
```
error: #DC2626
error-container: #FEE2E2
on-error-container: #991B1B
```

### Surface Hierarchy
```
surface: #F7F9FB              (page background)
surface-bright: #FAFBFC
surface-container-lowest: #FFFFFF    (cards, content blocks)
surface-container-low: #F2F4F6       (tonal sections)
surface-container: #ECEEF0           (nested elements)
surface-container-high: #E6E8EA      (pills, chips)
surface-container-highest: #DFE1E4
```

### Text
```
on-surface: #0F172A           (primary text)
on-surface-variant: #64748B   (secondary text)
```

### Borders
```
outline-variant: #C6C6CD at 20-30% opacity (ghost borders)
```

---

## Typography

### Font Families
```css
--font-archivo: 'Archivo', sans-serif;   /* Headlines */
--font-inter: 'Inter', sans-serif;       /* UI & Body */
```

### Type Scale

#### Display (Archivo Black)
```
display-lg: 56px / 1.1 / -0.02em
display-md: 44px / 1.15 / -0.02em
display-sm: 36px / 1.2 / -0.02em
```

#### Headline (Archivo ExtraBold)
```
headline-lg: 32px / 1.25 / -0.02em
headline-md: 28px / 1.3 / -0.02em
headline-sm: 24px / 1.35 / -0.02em
```

#### Title (Inter Medium)
```
title-lg: 22px / 1.4
title-md: 16px / 1.5
title-sm: 14px / 1.45
```

#### Body (Inter Regular)
```
body-lg: 16px / 1.6
body-md: 14px / 1.55
body-sm: 13px / 1.5
```

#### Label (Inter Medium/SemiBold)
```
label-lg: 14px / 1.45 / 500 weight
label-md: 12px / 1.45 / 500 weight
label-sm: 11px / 1.4 / 600 weight / 0.05em / uppercase
```

### Usage Guidelines
- **Archivo:** Product names, page headlines, section headers, brand voice
- **Inter:** Prices, descriptions, UI labels, buttons, inputs, body text
- **Tight tracking (-0.02em):** Headlines only (creates editorial feel)
- **Uppercase:** label-sm only (for premium tag accents)

---

## Spacing (8pt Grid)

```
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
5: 1.25rem (20px)
6: 1.5rem (24px)
8: 2rem (32px)
10: 2.5rem (40px)
12: 3rem (48px)
16: 4rem (64px)
20: 5rem (80px)
24: 6rem (96px)
```

### Common Patterns
- Card padding: `p-6` (24px)
- Section padding: `py-12` (48px)
- Button padding: `px-8 py-4` (32px x 16px)
- Input padding: `px-4 py-3` (16px x 12px)
- Gap between cards: `gap-6` or `gap-8`

---

## Border Radius

```
sm: 0.5rem (8px)
md: 0.75rem (12px)    ← Primary choice for buttons/inputs
lg: 1rem (16px)       ← Primary choice for cards
xl: 1.25rem (20px)
full: 9999px          ← Pills and chips
```

### Usage
- **Cards:** `rounded-lg` (16px)
- **Buttons/Inputs:** `rounded-md` (12px)
- **Pills/Chips:** `rounded-full`
- **Images:** `rounded-lg` or match container

---

## Shadows

### Ambient Shadow (Floating Elements Only)
```css
shadow-ambient: 0px 12px 32px rgba(15, 23, 42, 0.06)
shadow-ambient-lg: 0px 20px 48px rgba(15, 23, 42, 0.08)
```

### Rules
- **Don't** use shadows on every card
- **Do** use for dropdowns, modals, tooltips
- **Do** use navy tint (#0F172A) not pure black
- **Don't** use box-shadow for hover states (use elevation/background change instead)

---

## Component-Specific Patterns

### Buttons

**Primary CTA**
```
bg: secondary (#0051D5)
text: on-secondary (#FFFFFF)
hover: secondary-hover (#003BA3)
active: scale-98
radius: md (12px)
padding: px-8 py-4
font: label-lg (14px, 500 weight)
```

**Secondary CTA**
```
bg: transparent
border: 2px solid outline-variant/30
text: on-surface
hover: bg surface-container
radius: md
padding: px-8 py-4
```

### Inputs

**Default State**
```
bg: surface-container-low (#F2F4F6)
border: 1px solid outline-variant/20
text: body-md
radius: md
padding: px-4 py-3
```

**Focus State**
```
border: 1px solid secondary (#0051D5)
ring: 2px ring-secondary ring-offset-2
```

**Error State**
```
border: 1px solid error (#DC2626)
text-error: on-error-container (#991B1B)
```

### Cards

**Product Card**
```
bg: surface-container-lowest (#FFFFFF)
radius: lg (16px)
padding: none (use section padding)
hover: y: -4px, shadow-ambient
border: none (no dividing lines)
```

**Logo Container (inside card)**
```
bg: #FFFFFF
aspect-ratio: 4/3
padding: p-8
border-bottom: 1px solid outline-variant/20 (ghost border)
```

### Pills/Chips

**Category Chip (Inactive)**
```
bg: surface-container-high (#E6E8EA)
text: on-surface
radius: full
padding: px-4 py-2
font: label-md
```

**Category Chip (Active)**
```
bg: primary-container (#131B2E)
text: on-primary-container (#7C839B)
radius: full
```

### Country Selector

**Pill Button**
```
bg: surface-container-high (#E6E8EA)
hover: bg primary-container, text on-primary-container
radius: full
padding: px-4 py-2
gap: space-x-2
```

**Dropdown**
```
bg: surface-container-lowest
shadow: shadow-ambient
radius: lg
max-height: 96 (24rem)
overflow-y: auto
```

---

## Transitions & Animations

### Standard Durations
```
fast: 150ms
normal: 200ms
slow: 300ms
```

### Easing
```
ease-out: cubic-bezier(0, 0, 0.2, 1)  ← Default
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

### Common Patterns

**Button Press**
```tsx
<motion.button
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.15 }}
>
```

**Card Hover**
```tsx
<motion.div
  whileHover={{ y: -4 }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
```

**Dropdown Entrance**
```tsx
<motion.div
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.15 }}
>
```

**Page Entrance (Subtle)**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

---

## Responsive Breakpoints

```typescript
// Tailwind defaults
sm: 640px   // Small tablets
md: 768px   // Tablets
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

### Mobile-First Strategy

Start with mobile (default), enhance for larger screens:

```tsx
<div className="
  grid 
  grid-cols-1      {/* Mobile: 1 column */}
  md:grid-cols-2   {/* Tablet: 2 columns */}
  lg:grid-cols-3   {/* Desktop: 3 columns */}
  gap-6
">
```

### Common Responsive Patterns

**Typography**
```
text-display-sm md:text-display-md lg:text-display-lg
```

**Spacing**
```
py-8 lg:py-12     {/* 32px mobile, 48px desktop */}
px-4 lg:px-8      {/* 16px mobile, 32px desktop */}
```

**Layout**
```
flex-col lg:flex-row  {/* Stack mobile, row desktop */}
```

**Visibility**
```
hidden lg:flex     {/* Desktop only */}
flex lg:hidden     {/* Mobile only */}
```

---

## Accessibility Requirements

### Color Contrast
- **Text on background:** Minimum 4.5:1 (WCAG AA)
- **Large text (18px+):** Minimum 3:1
- **UI components:** Minimum 3:1

### Focus States
All interactive elements must have visible focus:
```
focus:outline-none 
focus:ring-2 
focus:ring-secondary 
focus:ring-offset-2
```

### Keyboard Navigation
- Logical tab order
- Enter/Space to activate buttons
- Arrow keys for menus/dropdowns
- Escape to close modals/dropdowns

### ARIA Labels
```tsx
<button aria-label="Close">×</button>
<input aria-describedby="email-error" />
<div role="alert" aria-live="polite">{error}</div>
```

---

## Do's and Don'ts

### ✅ Do
- Use Archivo for headlines, Inter for everything else
- Use tonal background shifts instead of dividers
- Keep animations subtle and fast (<300ms)
- Use generous whitespace (white space is luxury)
- Use ghost borders (20-30% opacity) sparingly
- Reserve shadows for truly floating elements
- Prioritize brand logos as visual anchors
- Maintain 8pt grid alignment

### ❌ Don't
- Use gradients
- Use glassmorphism/blur effects
- Use drop shadows on every card
- Use 100% opaque borders for sectioning
- Use Archivo for body text (too heavy)
- Use bouncy or flashy animations
- Add decorative illustrations
- Use noisy shadows
- Clutter the UI with unnecessary elements

---

## Quick Copy-Paste Snippets

### Primary Button
```tsx
<button className="
  bg-secondary 
  hover:bg-secondary-hover 
  active:scale-98
  text-on-secondary 
  font-inter 
  text-label-lg 
  px-8 
  py-4 
  rounded-md 
  transition-colors 
  duration-200
">
  Continue as guest
</button>
```

### Card
```tsx
<div className="
  bg-surface-container-lowest 
  rounded-lg 
  p-6 
  hover:shadow-ambient 
  transition-shadow 
  duration-200
">
  {/* content */}
</div>
```

### Input
```tsx
<input className="
  w-full 
  bg-surface-container-low 
  border 
  border-outline-variant/20 
  focus:border-secondary 
  focus:ring-2 
  focus:ring-secondary 
  focus:ring-offset-2 
  rounded-md 
  px-4 
  py-3 
  text-body-md 
  transition-colors
" />
```

### Headline
```tsx
<h1 className="
  font-archivo 
  font-black 
  text-headline-lg 
  tracking-tight
">
  Buy digital gift cards
</h1>
```

### Section with Tonal Background
```tsx
<section className="bg-surface-container-low py-12">
  <div className="container mx-auto px-4">
    {/* content */}
  </div>
</section>
```

---

## Visual Reference Checklist

When comparing implementation to design refs:

- [ ] **Spacing:** Consistent with 8pt grid
- [ ] **Typography:** Archivo vs Inter used correctly
- [ ] **Weight:** Headlines are ExtraBold/Black, not Regular
- [ ] **Tracking:** Headlines have tight tracking (-0.02em)
- [ ] **Colors:** Match exact hex values
- [ ] **Borders:** Ghost borders only, correct opacity
- [ ] **Radius:** Consistent (12px buttons, 16px cards)
- [ ] **Shadows:** Only on floating elements (dropdowns, modals)
- [ ] **Hierarchy:** Tonal shifts create sections, not lines
- [ ] **Whitespace:** Generous, not cramped
- [ ] **Logos:** Centered, proper aspect ratio
- [ ] **Interactive states:** Hover/active/focus all present
