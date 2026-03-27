# GIFTED - Digital Gift Card Marketplace

Production-ready Next.js application for purchasing digital gift cards.

**Design Language:** Slate Cobalt Premium - "Architectural Ledger"  
**Status:** Architecture Complete - Ready for Implementation

---

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test:e2e
npm run test:visual
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

### For Developers
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete technical specification (69KB)
- **[CODER-QUICK-REF.md](CODER-QUICK-REF.md)** - Developer quick reference (12KB)
- **[DATA-MODELS.md](DATA-MODELS.md)** - Type definitions and mock data (21KB)

### For Testers
- **[TESTER-CHECKLIST.md](TESTER-CHECKLIST.md)** - QA verification checklist (17KB)

### For Project Managers
- **[ARCHITECT-SUMMARY.md](ARCHITECT-SUMMARY.md)** - Architecture overview and handoff summary

---

## 🎨 Design System

**The "No-Line Rule"**

This design system rejects 1px borders for sectioning. Instead, we use tonal background shifts to create depth and hierarchy.

**Typography**
- **Headlines:** Archivo Black (tracking: -0.02em)
- **Body/UI:** Inter

**Colors**
- Primary: `#0F172A` (navy)
- CTA: `#0051D5` (blue)
- Success: `#62DF7D` (green)
- Background: `#F7F9FB` → `#FFFFFF` → `#F2F4F6` (tonal hierarchy)

**Spacing**
- 8pt grid (8px, 16px, 24px, 32px, etc.)

**Premium Feel**
- Restrained animations (200-400ms, ease-out)
- Wide margins
- No cheap shadows
- Editorial typography

See `design-refs/slate_cobalt_premium/DESIGN.md` for full design system specification.

---

## 🗂️ Project Structure

```
gifted-project/
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── page.tsx            # Home/Browse
│   │   ├── gift-card/[slug]/  # Product detail
│   │   ├── checkout/           # Payment
│   │   └── success/            # Confirmation
│   │
│   ├── components/
│   │   ├── layout/             # Header, Footer, MobileBottomNav
│   │   ├── common/             # Button, Input, Card
│   │   ├── products/           # ProductCard, ProductGrid
│   │   └── checkout/           # AmountSelector, OrderSummary
│   │
│   ├── lib/
│   │   ├── giftcards/          # Gift card domain
│   │   │   └── reloadly-adapter.ts    # 🔥 Integration boundary
│   │   ├── payments/           # Payment domain
│   │   │   └── lemon-squeezy-adapter.ts # 🔥 Integration boundary
│   │   ├── orders/             # Order management
│   │   ├── validation/         # Zod schemas
│   │   └── utils/              # Helpers
│   │
│   └── store/                  # Zustand state management
│
├── tests/
│   ├── e2e/                    # End-to-end tests
│   └── visual/                 # Visual regression tests
│
├── design-refs/                # Design reference screenshots
│   ├── desktop_flow/
│   ├── mobile_flow/
│   └── slate_cobalt_premium/
│
└── public/                     # Static assets
```

---

## 🔌 Integration Points

### Reloadly (Gift Card Provider)

**File:** `lib/giftcards/reloadly-adapter.ts`

All real API calls are commented with `// TODO:` markers. To integrate:

1. Set environment variables:
   ```
   RELOADLY_CLIENT_ID=your_client_id
   RELOADLY_CLIENT_SECRET=your_client_secret
   ```

2. Uncomment real API calls in `reloadly-adapter.ts`

3. Update `lib/giftcards/service.ts`: set `useRealAPI = true`

4. Test with Reloadly sandbox first

See `ARCHITECTURE.md §4.2` for detailed integration steps.

### Lemon Squeezy (Payment Provider)

**File:** `lib/payments/lemon-squeezy-adapter.ts`

All real API calls are commented with `// TODO:` markers. To integrate:

1. Set environment variables:
   ```
   LEMON_SQUEEZY_API_KEY=your_api_key
   LEMON_SQUEEZY_STORE_ID=your_store_id
   LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
   ```

2. Uncomment real API calls in `lemon-squeezy-adapter.ts`

3. Set up webhook endpoint: `/api/webhooks/lemon-squeezy`

4. Configure webhook in Lemon Squeezy dashboard

5. Update `lib/payments/service.ts`: set `useRealAPI = true`

**CRITICAL:** Never trust client-side payment success. Only mark orders complete after webhook confirmation.

See `ARCHITECTURE.md §4.4` for detailed integration steps.

---

## 🧪 Testing

### Visual Regression Tests

Compare implementation against design references:

```bash
npm run test:visual
```

Tests verify pixel-perfect match (≤5% tolerance) across:
- Desktop and mobile home pages
- Desktop and mobile product detail pages
- Desktop and mobile checkout pages
- Desktop and mobile success pages

### E2E Flow Tests

Test complete user journeys:

```bash
npm run test:e2e
```

Flows covered:
- Guest checkout - for me
- Guest checkout - send as gift
- Country filtering
- Search and category filtering
- Form validation
- Amount selection

### Manual Testing

Test responsive behavior at:
- Mobile: 375x667
- Tablet: 768x1024
- Desktop: 1920x1080

---

## 🎯 Key Features

### Country-First Experience
- Country selector is prominent
- Products filter by availability
- Currency adjusts dynamically
- Selection persists across navigation

### Guest Checkout Priority
- "Continue as Guest" is primary CTA
- "Sign in" is secondary/subtle
- No forced account creation

### Flexible Delivery
- "For Me" delivery to customer email
- "Send as Gift" with recipient email + message
- Different success messaging per mode

### Premium UX
- Tasteful micro-animations
- Responsive at all breakpoints
- Touch-friendly on mobile
- Keyboard-accessible
- High color contrast

---

## 🚀 Development Workflow

1. **Set up design system first**
   - Configure Tailwind with exact tokens (see ARCHITECTURE.md §2.1)
   - Add custom typography classes (see ARCHITECTURE.md §2.2)
   - Test with Button component

2. **Build components bottom-up**
   - Atomic components (Button, Input, Card)
   - Composite components (ProductCard, OrderSummary)
   - Layout components (Header, Footer)

3. **Implement pages in order**
   - Home (most complex)
   - Product detail
   - Checkout
   - Success (simplest)

4. **Wire up state and flows**
   - Zustand store
   - Form validation
   - Mock checkout completion

5. **Test thoroughly**
   - Visual regression
   - E2E flows
   - Responsive behavior
   - Accessibility

See `CODER-QUICK-REF.md` for detailed workflow.

---

## ✅ Quality Standards

**Design Match**
- Spacing follows 8pt grid
- Typography uses correct scale
- Colors use design tokens only
- No borders for sectioning (tonal shifts)
- Shadows only on floating elements

**Premium Feel**
- Looks expensive, not generic
- Animations are tasteful (no bounce)
- Wide margins signal luxury
- Editorial typography hierarchy

**Code Quality**
- TypeScript throughout (no `any`)
- Modular component structure
- Clear separation of concerns
- Integration boundaries documented
- Tests provide good coverage

See `TESTER-CHECKLIST.md` for complete quality checklist.

---

## 🐛 Common Pitfalls

### DON'T:
❌ Use 1px borders to separate sections  
❌ Hardcode colors outside design tokens  
❌ Add shadows to resting cards  
❌ Make buttons bounce on click  
❌ Use Archivo for body text  
❌ Trust client-side payment success  

### DO:
✅ Use background color shifts for sections  
✅ Reference design tokens from Tailwind config  
✅ Reserve shadows for floating elements only  
✅ Use subtle scale feedback (0.98) on press  
✅ Use Inter for all body/UI text  
✅ Verify payments via webhook only  

---

## 📋 Environment Variables

```bash
# Optional - for future Reloadly integration
RELOADLY_CLIENT_ID=your_client_id
RELOADLY_CLIENT_SECRET=your_client_secret

# Optional - for future Lemon Squeezy integration
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

No environment variables needed for local development with mocked data.

---

## 🤝 Contributing

### Before Starting
- [ ] Read ARCHITECTURE.md
- [ ] Read CODER-QUICK-REF.md
- [ ] Review design references in `design-refs/`
- [ ] Understand the No-Line Rule
- [ ] Understand integration boundaries

### Before Submitting
- [ ] Visual regression tests pass
- [ ] E2E tests pass
- [ ] Responsive at all breakpoints
- [ ] No console errors
- [ ] Matches design references exactly
- [ ] Integration TODOs are clear

### Code Review Checklist
- [ ] Design system compliance
- [ ] Premium feel maintained
- [ ] Mobile and desktop equally polished
- [ ] Integration boundaries respected
- [ ] Tests updated
- [ ] Documentation updated

---

## 📞 Support

**Architecture Questions:** See ARCHITECTURE.md  
**Design System Questions:** See design-refs/slate_cobalt_premium/DESIGN.md  
**Implementation Questions:** See CODER-QUICK-REF.md  
**Testing Questions:** See TESTER-CHECKLIST.md  
**Integration Questions:** See ARCHITECTURE.md §4

---

## 📄 License

MIT

---

**Built with precision. Designed for premium.**

*Ship when the tester can't find anything to improve.*
