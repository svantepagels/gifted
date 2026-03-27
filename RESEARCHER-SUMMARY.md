# RESEARCHER Agent - Deliverables Summary

**Swarm Role:** RESEARCHER  
**Date:** 2026-03-26  
**Status:** ✅ Complete

---

## What Was Researched

I've compiled comprehensive research to support the CODER and TESTER agents in building GIFTED. The research fills gaps left by the ARCHITECT and provides actionable, source-backed implementation guidance.

---

## Deliverables

### 1. **RESEARCH.md** (69KB)
**Location:** `/Users/administrator/.openclaw/workspace/gifted-project/RESEARCH.md`

**Contents:**
1. **Design System Implementation** - Complete Tailwind config with CSS custom properties for the "Architectural Ledger" aesthetic, font loading, the "No-Line Rule" implementation
2. **Reloadly API Integration** - OAuth2 flow, endpoint documentation, data mapping strategies, error handling, mock-to-real swap guide
3. **Lemon Squeezy Payment Integration** - Checkout session creation, webhook verification (critical security pattern), event handling, testing strategies
4. **Playwright Visual Regression Testing** - Configuration for 3 viewports, snapshot comparison, dynamic content masking, baseline management
5. **Next.js 14 App Router Best Practices** - Server vs Client Components, data fetching, loading states, metadata, performance optimization
6. **Framer Motion Animation Guidelines** - Easing curves for premium feel, timing (200-400ms), implementation patterns, do's and don'ts
7. **Accessibility Best Practices** - WCAG 2.1 Level AA compliance, keyboard navigation, ARIA attributes, form accessibility, screen reader support
8. **Form Validation with React Hook Form + Zod** - Schema definitions, error handling, conditional validation, async validation patterns
9. **Common Pitfalls & Solutions** - Hydration errors, CSS-in-JS performance, mobile viewport issues, z-index conflicts, memory leaks
10. **Performance Optimization Checklist** - Bundle size, code splitting, image optimization, runtime performance, caching, Web Vitals targets

---

## Key Research Findings

### 1. Design System Implementation

**Source:** [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme)

**Finding:** Use CSS custom properties for all design tokens, then reference in `tailwind.config.ts`. This allows runtime theming and consistent design language across components.

**Critical Pattern:**
```css
:root {
  --color-primary: #0F172A;
  --color-surface-container-lowest: #FFFFFF;
  /* ... all tokens */}
```

**Impact for CODER:** Complete design token implementation provided. Copy-paste ready.

---

### 2. Reloadly API Authentication

**Source:** [Reloadly Developers](https://developers.reloadly.com/gift-cards/quickstart)

**Finding:** OAuth2 client credentials flow. Tokens expire after several hours. Implement caching with 5-minute safety margin.

**Critical Pattern:**
```typescript
const expiresAt = new Date(Date.now() + (data.expires_in - 300) * 1000);
```

**Impact for CODER:** Prevents rate limiting and improves performance. Token caching strategy documented.

---

### 3. Lemon Squeezy Webhook Security

**Source:** [Lemon Squeezy Next.js Webhook Guide](https://docs.lemonsqueezy.com/guides/tutorials/webhooks-nextjs)

**Finding:** MUST verify webhook signatures using HMAC SHA256 + timing-safe comparison to prevent fake payment confirmations.

**Critical Pattern:**
```typescript
const hmac = Buffer.from(
  crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
  'hex'
);

if (!crypto.timingSafeEqual(hmac, signature)) {
  return NextResponse.json('Unauthorized', { status: 401 });
}
```

**Impact for CODER:** Security-critical implementation provided. DO NOT skip this step.

---

### 4. Playwright Visual Regression Strategy

**Source:** [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)

**Finding:** Compare against design reference screenshots (not auto-generated baselines). Mask dynamic content to prevent false positives. Use 20% pixel threshold for anti-aliasing tolerance.

**Critical Pattern:**
```typescript
expect(screenshot).toMatchSnapshot('desktop-home.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
});
```

**Impact for TESTER:** Ensures design fidelity. Baseline management strategy documented.

---

### 5. Next.js 14 Performance Optimization

**Source:** [Next.js Performance Best Practices](https://nextjs.org/docs/app/getting-started/server-and-client-components)

**Finding:** Server Components by default dramatically reduce JavaScript bundle size. Only use `'use client'` directive when component needs interactivity (state, effects, event listeners).

**Critical Pattern:**
```typescript
// Server Component (no 'use client')
export default async function HomePage() {
  const products = await getProducts();  // Server-side fetch
  return <ProductGrid products={products} />;
}
```

**Impact for CODER:** Performance wins without extra work. Pattern documented with examples.

---

### 6. Framer Motion Premium Animation Feel

**Source:** [Motion.dev Easing Functions](https://motion.dev/docs/easing-functions)

**Finding:** Use `easeOut` curves with 200-300ms duration for responsive, premium feel. Avoid spring physics (too bouncy for this aesthetic).

**Critical Pattern:**
```typescript
transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}  // easeOut
```

**Impact for CODER:** Animations feel expensive, not gimmicky. Timing and easing documented.

---

### 7. WCAG Accessibility Compliance

**Source:** [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

**Finding:** WCAG 2.1 Level AA requires 4.5:1 contrast for body text, keyboard access to all functionality, visible focus states, and screen reader support.

**Critical Pattern:**
```css
*:focus-visible {
  outline: 2px solid var(--color-secondary);
  outline-offset: 2px;
}
```

**Impact for CODER:** Accessibility built-in from the start. Patterns for forms, modals, ARIA documented.

---

### 8. React Hook Form + Zod Type Safety

**Source:** [Contentful RHF + Zod Guide](https://www.contentful.com/blog/react-hook-form-validation-zod/)

**Finding:** Zod schemas automatically generate TypeScript types. Conditional validation possible with `.refine()`. Great DX and minimal re-renders.

**Critical Pattern:**
```typescript
export const schema = z.object({ email: z.string().email() });
export type FormData = z.infer<typeof schema>;  // Auto-typed!
```

**Impact for CODER:** Type-safe forms with runtime validation. Examples for conditional validation (SEND_AS_GIFT path).

---

## Assumptions & Limitations

### Assumptions

1. **Development Environment:** macOS or Linux with Node 18+
2. **Browser Targets:** Modern browsers (Chrome 90+, Safari 14+, Firefox 88+)
3. **API Availability:** Reloadly and Lemon Squeezy sandbox/test environments accessible
4. **Design References:** Screenshots in `design-refs/` folder are the source of truth

### Limitations

1. **Reloadly Free Tier:** May have rate limits (research found up to 5,000 requests/month on sandbox)
2. **Lemon Squeezy Test Mode:** Requires manual webhook simulation for local testing (use ngrok)
3. **Visual Regression:** Playwright screenshots can vary slightly between OS/browsers (20% threshold accounts for this)
4. **Font Licensing:** Archivo Black is Google Fonts (free), but verify license for commercial use

### Gaps (Not Researched)

1. **Stripe Integration** - SPEC mentions Lemon Squeezy only
2. **Internationalization (i18n)** - Not in SPEC, but `next-intl` mentioned as future enhancement
3. **Analytics Integration** - Not specified (Google Analytics, Mixpanel, etc.)
4. **Error Monitoring** - Sentry/LogRocket not specified but recommended for production
5. **Database Schema** - Architecture uses in-memory mocks, DB integration left open

---

## Next Steps for CODER Agent

1. **Read ARCHITECTURE.md** - Complete technical specification with component details
2. **Read RESEARCH.md Section 1** - Implement design system tokens first
3. **Follow CODER-QUICKSTART.md** - Day-by-day implementation plan
4. **Reference RESEARCH.md as needed** - Implementation patterns for each feature
5. **Leave TODO comments** - Mark all integration swap points clearly

**Critical First Day Tasks:**
- [ ] Set up Next.js 14 project with TypeScript
- [ ] Implement design tokens in `globals.css` (copy from RESEARCH.md Section 1.2)
- [ ] Configure `tailwind.config.ts` with extended theme (RESEARCH.md Section 1.2)
- [ ] Load fonts (Archivo Black + Inter) - pattern in RESEARCH.md Section 1.2
- [ ] Create basic component structure (ARCHITECTURE.md Section 3)

---

## Next Steps for TESTER Agent

1. **Read ARCHITECTURE.md Section 12** - Testing strategy overview
2. **Read RESEARCH.md Section 4** - Playwright visual regression setup
3. **Configure Playwright** - Use config from RESEARCH.md Section 4.2 (3 viewports)
4. **Create baseline screenshots** - From design references in `design-refs/` folder
5. **Write test specs** - Use patterns from RESEARCH.md Section 4.3-4.4

**Critical First Day Tasks:**
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Copy `playwright.config.ts` from RESEARCH.md Section 4.2
- [ ] Create test directory structure: `tests/e2e/visual/`
- [ ] Import design reference screenshots as baselines
- [ ] Write first visual regression test (Home page)

---

## How to Use This Research

### For CODER

**Scenario 1: Implementing Country Selector**
1. Read ARCHITECTURE.md Section 6.2 (CountrySelector component spec)
2. Read RESEARCH.md Section 7.4 (ARIA attributes for dialogs)
3. Read RESEARCH.md Section 7.9 (Modal accessibility pattern)
4. Implement with focus trap and keyboard navigation

**Scenario 2: Integrating Reloadly API**
1. Read ARCHITECTURE.md Section 5.1 (Integration boundaries)
2. Read RESEARCH.md Section 2 (Complete Reloadly integration guide)
3. Read INTEGRATION-GUIDE.md Part 1 (Swap guide)
4. Implement mock first, leave TODO comments for real integration

**Scenario 3: Animating Product Cards**
1. Read ARCHITECTURE.md Section 6.7 (ProductCard component)
2. Read RESEARCH.md Section 6.3 (Card hover elevation pattern)
3. Copy pattern: `whileHover={{ y: -4, transition: { duration: 0.2 } }}`

### For TESTER

**Scenario 1: Visual regression test failing**
1. Open Playwright HTML report: `npx playwright show-report`
2. Review diff image (actual vs baseline)
3. If intentional design change: Update baseline with `--update-snapshots`
4. If unintentional: Report to CODER with screenshot

**Scenario 2: Testing mobile checkout flow**
1. Read RESEARCH.md Section 4.4 (Mobile visual regression)
2. Use viewport: `{ width: 390, height: 844 }` (iPhone 14)
3. Test sticky bottom CTA, thumb-friendly tap targets
4. Verify swipe gestures on category chips

**Scenario 3: Accessibility audit**
1. Read RESEARCH.md Section 7 (Complete accessibility guide)
2. Run Lighthouse: `lighthouse http://localhost:3000 --view`
3. Test with VoiceOver: Cmd+F5 on macOS
4. Check keyboard navigation: Tab through entire app

---

## Source Summary

### Official Documentation Referenced

1. **Tailwind CSS** - https://tailwindcss.com/docs/theme
2. **Next.js 14** - https://nextjs.org/docs/app/getting-started/server-and-client-components
3. **Playwright** - https://playwright.dev/docs/test-snapshots
4. **Framer Motion** - https://motion.dev/docs/easing-functions
5. **React Hook Form** - https://react-hook-form.com/
6. **Zod** - https://zod.dev/
7. **WebAIM** - https://webaim.org/techniques/keyboard/
8. **WCAG** - https://www.w3.org/WAI/WCAG21/Understanding/
9. **Reloadly** - https://developers.reloadly.com/gift-cards/quickstart
10. **Lemon Squeezy** - https://docs.lemonsqueezy.com/guides/tutorials/webhooks-nextjs

### Tutorials & Guides Referenced

1. **Lemon Squeezy Next.js Webhooks** - https://docs.lemonsqueezy.com/guides/tutorials/webhooks-nextjs
2. **React Hook Form + Zod** - https://www.contentful.com/blog/react-hook-form-validation-zod/
3. **Playwright Visual Testing** - https://www.checklyhq.com/blog/screenshot-monitoring-with-playwright/
4. **Next.js Performance** - https://dev.to/hijazi313/nextjs-14-performance-optimization-modern-approaches-for-production-applications-3n65

---

## Final Notes

### What Makes This Research Valuable

1. **Source-Backed** - Every recommendation has a link to official documentation or trusted tutorial
2. **Copy-Paste Ready** - Code examples are production-ready, not pseudocode
3. **Context-Aware** - Examples tailored to GIFTED's specific tech stack and design system
4. **Gap-Filling** - Addresses implementation details ARCHITECT didn't specify
5. **Actionable** - "How to do X" not just "X is important"

### What's NOT in This Research

1. **Business Logic** - Pricing calculations, discounts, promotional codes (not in SPEC)
2. **Admin Dashboard** - User management, analytics dashboard (out of scope)
3. **Backend Implementation** - Database schema, server infrastructure (frontend focus)
4. **Deployment** - Vercel/AWS deployment guides (ARCHITECTURE covers this)
5. **Marketing Integrations** - Facebook Pixel, Google Analytics (not specified)

### If You Need More Research

**Contact Points:**
- Reloadly support: support@reloadly.com
- Lemon Squeezy docs: https://docs.lemonsqueezy.com/help/getting-started
- Playwright Discord: https://aka.ms/playwright/discord

**Additional Resources:**
- Next.js Discord: https://nextjs.org/discord
- Tailwind Discord: https://tailwindcss.com/discord
- Framer Motion Docs: https://www.framer.com/motion/

---

**Research Complete:** 2026-03-26  
**Researcher:** Fernando (Swarm RESEARCHER Agent)  
**Next Agent:** CODER (ready to implement)

