# Design System Specification: Premium Utility & Precise Commerce

## 1. Overview & Creative North Star
### The Creative North Star: "The Architectural Ledger"
This design system rejects the "fluff" of modern web trends in favor of a high-conviction, editorial aesthetic. It is inspired by Swiss minimalism and premium financial ledgers—where precision is the primary aesthetic. By utilizing heavy-weight typography and a strict adherence to tonal layering over structural lines, we create an environment of absolute trust.

The "Architectural Ledger" look is achieved through:
*   **Intentional Asymmetry:** Using the 8pt grid to create unexpected white space that directs the eye.
*   **Massive Type Contrast:** Pitting extra-bold headlines against functional, clean UI text.
*   **Structural Minimalism:** Eliminating borders and gradients to let the brand logos and typography serve as the primary visual interest.

---

## 2. Color & Tonal Architecture
The palette is rooted in **Primary Navy (#0F172A)** and **Background (#FFFFFF)**. It is designed to feel "expensive" through restraint.

### The "No-Line" Rule
To maintain a high-end feel, **1px solid borders are prohibited for sectioning.** 
*   **Standard Method:** Instead of drawing a line between a header and a body, shift the background from `surface_container_lowest` (#FFFFFF) to `surface_container_low` (#F2F4F6).
*   **The Intent:** This creates a seamless, "milled from a single block" feel that standard e-commerce templates lack.

### Surface Hierarchy & Nesting
Depth is achieved through a "Stacked Paper" philosophy. Use the following tokens to define depth:
*   **Base Layer:** `surface` (#F7F9FB) for the main page background.
*   **Content Blocks:** `surface_container_lowest` (#FFFFFF) for the primary content cards or hero sections.
*   **Interactive Sub-elements:** `surface_container` (#ECEEF0) for nested elements like search bars or country selectors within a white card.

### Visual Polish
*   **Secondary Utility:** Use `secondary` (#0051D5) only for high-conviction actions (CTAs).
*   **Success States:** Use `tertiary_fixed_dim` (#62DF7D) for success confirmations, ensuring it is paired with `on_tertiary_container` (#009842) for accessible text.

---

## 3. Typography
The system uses a high-contrast pairing to balance "Authority" (Archivo) with "Utility" (Inter).

### Headline Strategy (Archivo)
*   **Display-LG to Headline-SM:** Always use **Archivo Black/ExtraBold**. 
*   **Letter Spacing:** Apply `-0.02em` tracking to headlines to create a "tight," editorial feel.
*   **Purpose:** Archivo is our "Voice of Authority." It should be used for product names, section headers, and hero value propositions.

### UI & Body Strategy (Inter)
*   **Title-LG to Label-SM:** Always use **Inter**.
*   **Weighting:** Use Regular (400) for body and Medium (500) or Semi-Bold (600) for UI labels/buttons.
*   **Purpose:** Inter provides the "Utility." It is used for prices, descriptions, inputs, and navigation to ensure maximum legibility.

---

## 4. Elevation & Depth
This system eschews traditional shadows in favor of **Tonal Layering**.

### The Layering Principle
Do not use shadows to show that a card is clickable. Instead, elevate it physically:
1.  **Resting State:** `surface_container_lowest` on a `surface` background.
2.  **Hover State:** Transition the background to `surface_bright` and apply an **Ambient Shadow**.

### Ambient Shadows
If a floating element (like a dropdown or modal) is required:
*   **Shadow Token:** `0px 12px 32px rgba(15, 23, 42, 0.06)`. 
*   **The Tint:** Notice the shadow uses a 6% opacity of our Primary Navy (`#0F172A`), not pure black. This creates a sophisticated, atmospheric depth.

### The "Ghost Border" Fallback
Borders are only permitted for form inputs or when a logo requires a container against a white background.
*   **Token:** `outline_variant` (#C6C6CD) at **30% opacity**.
*   **Rule:** Never use 100% opaque borders. They clutter the UI and break the "Architectural" feel.

---

## 5. Components

### High-Conviction CTAs (Buttons)
*   **Primary:** `secondary` (#0051D5) background, `on_secondary` (#FFFFFF) text. 
*   **Radius:** `md` (0.75rem / 12px).
*   **Padding:** `4` (1rem) vertical, `8` (2rem) horizontal.
*   **Style:** No gradients. Solid color only.

### Product Cards
*   **Structure:** No borders. Use `surface_container_lowest` (#FFFFFF).
*   **Corner Radius:** `lg` (1rem / 16px).
*   **Spacing:** Use `spacing.6` (1.5rem) internal padding.
*   **Logo Treatment:** Place brand logos (e.g., Amazon, Nike) centered. If the logo has a white background, use a "Ghost Border" to define the space.

### Country Selector Pills
*   **Background:** `surface_container_high` (#E6E8EA).
*   **Radius:** `full` (9999px).
*   **Typography:** `label-md` (Inter).
*   **Interaction:** On hover, shift to `primary_container` (#131B2E) with `on_primary_container` (#7C839B) text.

### Input Fields
*   **Style:** `surface_container_low` (#F2F4F6) background with a 1px `outline_variant` at 20% opacity.
*   **Focus State:** Border becomes `secondary` (#0051D5) at 100% opacity.
*   **Radius:** `md` (0.75rem / 12px).

### Card & List Separation
*   **Constraint:** **Dividers are forbidden.**
*   **Solution:** Use `spacing.8` (2rem) of vertical white space or a subtle background shift between sections. This forces the designer to use layout, not lines, to organize information.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use Archivo in all-caps for small `label-sm` accents to add a "premium tag" feel.
*   **Do** prioritize brand logos. They are the "hero" of the card.
*   **Do** use wide margins. White space is a luxury signal.
*   **Do** ensure all Success/Error states use the defined `tertiary` and `error` tokens for accessibility.

### Don't:
*   **Don't** use gradients, glassmorphism, or blurs. This system is about solid, architectural certainty.
*   **Don't** use shadows on every card. Reserve them for floating overlays only.
*   **Don't** use generic icons. Use high-stroke-weight, geometric icons that match the "Precise" tone.
*   **Don't** use Archivo for body text. It is too heavy and will fatigue the user.