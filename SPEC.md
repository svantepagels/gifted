Build a production-quality, mobile-first but desktop-beautiful web page for buying digital gift cards online.

This is not a rough prototype. Build it as a clean, structured, maintainable implementation that is visually polished, interaction-complete, and ready to be wired to real APIs.

You have access to the attached ZIPs. You MUST use them as the visual source of truth and verify the implementation against them with Playwright on both mobile and desktop before considering the task done.

ATTACHED DESIGN ASSETS TO FOLLOW
- desktop_flow.zip
- mobile_flow.zip

Inside them, use these screens as the reference set:
Desktop:
- stitch/1._browse_home_gifted/screen.png
- stitch/3._product_detail_checkout_gifted/screen.png
- stitch/payment_checkout_gifted/screen.png
- stitch/sign_up_email_verification_gifted/screen.png
- stitch/4._success_confirmation_gifted/screen.png
- stitch/slate_cobalt_premium/DESIGN.md

Mobile:
- stitch/1._browse_home_mobile_gifted/screen.png
- stitch/3._product_detail_mobile_gifted/screen.png
- stitch/4._payment_mobile_gifted/screen.png
- stitch/6._sign_up_mobile_gifted/screen.png
- stitch/5._success_mobile_gifted/screen.png
- stitch/slate_cobalt_premium/DESIGN.md

IMPORTANT DELIVERY STANDARD
- The implementation must adhere closely to the attached files.
- It must feel modern, sharp, deliberate, and premium.
- It must not feel generic, template-like, or AI slop.
- Add tasteful and relevant micro-animations.
- If the tester / queen finds anything off compared to the reference, re-implement until it is fully according to spec, including design quality, spacing, hierarchy, interactions, and responsiveness.
- Do not stop at “good enough”.
- Match the visual intent, not just the rough layout.

PRIMARY PRODUCT GOAL
Create the complete gift card purchase experience for a store that will eventually serve all gift cards available through Reloadly.
Country must be a first-class control because gift cards vary by country.
For this first implementation:
- data can be mocked
- API contracts should be prepared
- real integrations must be easy to plug in later
- all integration placeholder code must be clearly commented with what to replace when switching to the live integration

TECH STACK
Unless the repo clearly already dictates something else, use:
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- Framer Motion for tasteful micro-animations
- Lucide React for icons if needed
- React Hook Form + Zod for form validation if forms are included
- Playwright for visual and responsive verification

GENERAL DESIGN SYSTEM TO IMPLEMENT
Use the attached DESIGN.md as the base design system.
The visual language is architectural, restrained, editorial, and trust-heavy.

Core visual rules:
- mobile-first
- no fluff
- no gradients
- no glassmorphism
- no noisy shadows
- no clutter
- no cheap marketplace feel
- no obvious template sections
- no filler illustrations
- use whitespace and tonal layering for structure
- use background shifts instead of dividers where possible
- use strong typography and clean geometry

Typography:
- Headlines: Archivo Black / Archivo ExtraBold
- Body/UI: Inter
- Headline tracking slightly tight
- Large high-conviction headlines
- Readable body text and labels

Color direction:
- primary navy / ink: #0F172A
- page background around #F7F9FB
- white cards / content surfaces
- secondary CTA blue around #0051D5
- success green around #62DF7D / #009842 pairing
- use neutral slate grays for muted text and surfaces
- keep everything high contrast and trustworthy

Spacing and structure:
- 8pt grid
- 16px card radius
- 12px buttons / inputs
- subtle tonal hierarchy
- ambient shadow only for truly floating layers
- no cheap borders
- if border is needed, use a very soft ghost border

UX PRINCIPLES
The whole experience should optimize for:
- fast gift card discovery
- immediate understanding of country availability
- simple amount selection
- easy “for me” vs “send as gift” path
- obvious pricing
- obvious trust cues
- obvious guest checkout path
- minimal friction

Do not bury critical controls.
Country must always remain visible in the header or in the active filter state.
Guest checkout should be more prominent than sign in.

PAGES / STATES TO IMPLEMENT

1. BROWSE / HOME
Desktop reference:
- stitch/1._browse_home_gifted/screen.png
Mobile reference:
- stitch/1._browse_home_mobile_gifted/screen.png

Must include:
- top header with brand wordmark: GIFTED
- visible country selector pill with flag + country + currency
- desktop nav links similar to browse / deals / my cards or equivalent
- help and cart affordances
- large hero headline
- prominent search box
- category pills
- product grid
- trust-building section
- footer
- mobile bottom navigation

Behavior:
- search filters the visible mocked brand list
- category chips filter products
- country selector changes available products and currency in the mocked dataset
- preserve selected country in app state
- show a useful empty state if no country is selected or no results exist
- sticky or semi-sticky relevant controls on mobile where it improves usability

2. PRODUCT DETAIL / PRE-CHECKOUT
Desktop reference:
- stitch/3._product_detail_checkout_gifted/screen.png
Mobile reference:
- stitch/3._product_detail_mobile_gifted/screen.png

Must include:
- product hero with logo
- product name
- selected country badge
- digital delivery label
- amount selection chips/cards
- custom amount option if mocked product supports it
- delivery method selector:
  - for me
  - send as gift
- recipient email input
- optional personal message for gift mode
- trust/info panel
- sticky order summary on desktop
- sticky bottom action area on mobile

Order summary must show:
- product name
- selected amount
- service fee
- total
- currency
- clear primary CTA: Continue as guest
- secondary CTA: Sign in

Important:
- Make “Continue as guest” visually dominant.
- Do not force account creation before checkout.
- Pricing hierarchy should be very clear.

3. PAYMENT / CHECKOUT
Desktop reference:
- stitch/payment_checkout_gifted/screen.png
Mobile reference:
- stitch/4._payment_mobile_gifted/screen.png

Build a realistic checkout step that is ready for Lemon Squeezy integration.
For this version:
- do NOT implement the real Lemon Squeezy checkout
- instead, mock the flow in a way that mirrors how the real integration will work

Should include:
- order review
- customer email
- recipient summary
- payment area or payment method placeholder
- trust cues near payment
- return/back affordance
- loading state for submitting payment
- error state
- success transition

4. SIGN-UP / EMAIL VERIFICATION OR ACCOUNT ENTRY STATE
Desktop reference:
- stitch/sign_up_email_verification_gifted/screen.png
Mobile reference:
- stitch/6._sign_up_mobile_gifted/screen.png

Implement this as a lightweight optional auth step / screen, not a blocker to guest checkout.
It should feel integrated with the overall design system.

5. SUCCESS / CONFIRMATION
Desktop reference:
- stitch/4._success_confirmation_gifted/screen.png
Mobile reference:
- stitch/5._success_mobile_gifted/screen.png

Must include:
- calm, premium success state
- summary of what was purchased
- amount
- recipient / delivery destination
- order identifier
- clear next steps
- CTA to buy another gift card
- CTA to view order / manage order
- clear success hierarchy with restrained green accents

MOCK DATA AND FUTURE API READINESS

You must architect the code so mocked data can be swapped to live integrations with minimal rewrite.

A. Reloadly preparation
Model the app around a service layer that anticipates Reloadly-like concepts:
- countries
- gift card brands
- categories
- currency
- denomination types
- fixed denominations
- custom range
- product availability by country
- product image / logo
- delivery metadata
- redemption instructions / terms if relevant

Create:
- a typed interface layer for gift card entities
- a mocked repository or service module
- a clear API adapter boundary

Example structure:
- /lib/giftcards/types.ts
- /lib/giftcards/mock-data.ts
- /lib/giftcards/service.ts
- /lib/giftcards/reloadly-adapter.ts

In reloadly-adapter.ts add explicit comments like:
- TODO: Replace mocked fetchGiftCardsByCountry with Reloadly API call
- TODO: Map Reloadly denomination structure to local GiftCardProduct model
- TODO: Replace local mock categories with categories derived from Reloadly
- TODO: Handle Reloadly auth token lifecycle here
- TODO: Add server-side caching / revalidation for product catalogs

B. Lemon Squeezy preparation
Create a separate payment integration boundary.
Example structure:
- /lib/payments/types.ts
- /lib/payments/mock-checkout.ts
- /lib/payments/lemon-squeezy-adapter.ts

Add explicit comments like:
- TODO: Replace mock session creation with Lemon Squeezy checkout/session creation
- TODO: Pass order metadata including country, productId, denomination, recipientEmail, giftMessage
- TODO: Verify webhook-driven payment confirmation before marking order complete
- TODO: Replace client-only success assumption with server-verified payment state
- TODO: Store Lemon Squeezy checkout/session IDs in order records

C. Orders
Create a lightweight mocked order model so the success page is driven by realistic data rather than static text.

RESPONSIVENESS REQUIREMENTS

Desktop:
- should match the desktop references closely
- should feel spacious and intentional
- sticky order summary where applicable
- elegant margins and alignment
- not just stretched mobile

Mobile:
- should feel native-like and highly thumb-friendly
- keep key controls easy to reach
- sticky bottom CTA where appropriate
- category row should feel good horizontally
- inputs should be large and usable
- top and bottom nav should match the design intent

Recommended breakpoints:
- mobile default
- md for tablet
- lg/xl for desktop enhancements

INTERACTIONS AND MICRO-ANIMATIONS

Add tasteful motion only where it adds polish:
- subtle button press feedback
- filter chip transitions
- hover elevation or tonal response on desktop cards
- smooth page/section entrance
- sticky summary appearing naturally
- modal / drawer / country selector transitions if used
- success transition

Do not overanimate.
No bouncey nonsense.
No flashy delays.
Everything should feel expensive, responsive, and controlled.

COMPONENTS TO BUILD

Create reusable components for at least:
- Header
- CountrySelector
- SearchBar
- CategoryChips
- ProductCard
- ProductGrid
- TrustSection
- AmountSelector
- DeliveryMethodToggle
- OrderSummary
- CheckoutForm
- SuccessSummary
- MobileBottomNav
- Footer

ACCESSIBILITY
Implement basic accessibility properly:
- keyboard navigation
- visible focus states
- semantic headings
- button roles correct
- labels on inputs
- aria for menus/dialogs if used
- sufficient contrast
- no inaccessible tiny text on key actions

FORM AND VALIDATION
Validate:
- email format
- required fields depending on flow
- gift recipient message length if applicable
- amount selection before checkout
- country selected where required

If “Send as gift” is selected, show only the fields that make sense for that mode.

APP STRUCTURE
Prefer a clean route structure like:
- /
- /gift-card/[slug]
- /checkout
- /success
- /auth or /verify if needed

Use shared state sensibly.
A lightweight store is fine if useful, otherwise React context is enough.
Do not overengineer.

VISUAL ACCURACY PROCESS
You MUST use Playwright to verify the implementation against the provided references on both desktop and mobile.

Minimum verification:
- desktop home
- mobile home
- desktop product detail / checkout
- mobile product detail
- desktop success
- mobile success

Compare for:
- layout structure
- spacing
- typography feel
- card sizing
- header proportions
- footer proportions
- CTA prominence
- input appearance
- filter chip style
- nav placement
- trust section treatment
- bottom sticky elements on mobile

If anything is noticeably off, iterate until it matches the reference intent.

TESTING / QA REQUIREMENTS
Before finishing:
1. Run the app locally
2. Run Playwright on desktop and mobile viewports
3. Verify all major routes render correctly
4. Verify no console errors
5. Verify no hydration bugs
6. Verify responsive behavior
7. Verify mocked checkout flow reaches success page
8. Verify country switching changes available mocked inventory
9. Verify search and category filtering work
10. Verify guest checkout remains the primary path

IMPLEMENTATION STYLE
Code quality expectations:
- typed
- modular
- clean naming
- no dead code
- no giant monolithic page files
- no inline random hardcoded junk unless intentional and localized
- clear comments only where needed
- especially clear comments around future integration swap points

IMPORTANT COMMENTS TO LEAVE IN CODE
Anywhere mocked integrations are used, add explicit comments that say:
- what is mocked
- what real integration should replace it
- where auth / tokens / webhooks / server validation belong
- what should be removed once real integrations are live

DELIVERABLES
Deliver:
- complete implementation
- polished UI matching the references
- mocked but integration-ready Reloadly data flow
- mocked but integration-ready Lemon Squeezy checkout flow
- Playwright tests or verification scripts
- concise README section explaining:
  - how to run
  - where the mock integration boundaries are
  - exactly what to replace when moving to live Reloadly and Lemon Squeezy

FINAL STANDARD
Do not ship a page that merely functions.
Ship a page that looks designed.
The tester / queen should not have to point out sloppy spacing, weak typography, generic cards, poor responsive behavior, mismatched states, or missing polish.
If review finds anything off-spec, rework it until it is fully aligned with the provided design language and screen references.