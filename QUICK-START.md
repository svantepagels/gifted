# GIFTED - Quick Start Guide

Get the application running in 2 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn installed

## Installation & Run

```bash
# Navigate to project directory
cd /Users/administrator/.openclaw/workspace/gifted-project

# Install dependencies (if not already installed)
npm install

# Run development server
npm run dev
```

Open **http://localhost:3000** in your browser.

## What You'll See

### 1. Browse Page (Homepage)
- **Country Selector** (top right) - Click to change country (persists in localStorage)
- **Search Bar** - Type to search gift cards (debounced 300ms)
- **Category Chips** - Filter by category (Shopping, Entertainment, etc.)
- **Product Grid** - 8 sample products (Amazon, Spotify, Netflix, etc.)
- **Trust Section** - Security badges at bottom

### 2. Product Detail Page
Click any product card to see:
- **Product Information** - Logo, name, description
- **Amount Selector** - Choose fixed denomination or enter custom amount
- **Delivery Method** - Toggle between "For Me" and "Send as Gift"
- **Gift Form** - (appears when "Send as Gift" selected) Email + message
- **Order Summary** - Sticky sidebar (desktop) or bottom sheet (mobile)
- **Continue as Guest** - Primary CTA button

### 3. Checkout Page
After clicking "Continue as Guest":
- **Order Review** - Product summary, pricing breakdown
- **Email Form** - Enter and confirm your email
- **Payment Section** - Mocked payment (completes after 1.5s delay)
- **Complete Purchase** - Submit button

### 4. Success Page
After successful "payment":
- **Animated Checkmark** - SVG draw animation
- **Order Summary** - Product details, order ID
- **Next Steps** - Buy another card or view order

## Test Data

### Countries Available
Select from 10 countries in the country selector:
- 🇺🇸 United States (USD)
- 🇬🇧 United Kingdom (GBP)
- 🇨🇦 Canada (CAD)
- 🇦🇺 Australia (AUD)
- 🇩🇪 Germany (EUR)
- 🇫🇷 France (EUR)
- 🇪🇸 Spain (EUR)
- 🇮🇹 Italy (EUR)
- 🇧🇷 Brazil (BRL)
- 🇲🇽 Mexico (MXN)

### Products Available
8 mocked gift card products:
1. **Amazon** - $10, $25, $50, $100, $200 (Available in 8 countries)
2. **Spotify** - $10, $30, $60 (Available in 10 countries)
3. **Starbucks** - Custom amount $5-$500 (US, CA, GB only)
4. **Netflix** - $25, $50, $100 (Available in 10 countries)
5. **Target** - $10, $25, $50, $100 (US only)
6. **Uber** - $25, $50, $75, $100 (Available in 6 countries)
7. **Steam** - $10, $20, $50, $100 (Available in 8 countries)
8. **Walmart** - Custom amount $10-$500 (US only)

### Test Emails
Use any email format (validation is enabled):
- `test@example.com`
- `user@domain.com`
- Any valid email format

### Mock Payment Behavior
- **Delay:** 1.5 seconds (simulates API call)
- **Success Rate:** 95% (5% chance of random failure for testing error states)
- **No Real Charges:** Everything is mocked, no real payment processing

## Key Features to Test

### ✅ Country Selection
1. Click country selector (top right)
2. Search for a country or scroll the list
3. Select a different country
4. Refresh page - selection persists
5. Product catalog updates to show only products available in selected country

### ✅ Search
1. Type in search bar (e.g., "Amazon")
2. Notice 300ms debounce (smooth typing)
3. Results filter as you type
4. Clear button appears when typing
5. Empty state shows if no results

### ✅ Category Filter
1. Click a category chip (e.g., "Entertainment")
2. Product grid filters to that category
3. Click "All" to show all products again

### ✅ Product Configuration
1. Click a product card
2. Select an amount (fixed denomination or custom)
3. Toggle delivery method:
   - **For Me:** Simple flow
   - **Send as Gift:** Shows recipient email + message fields
4. Validate form (try leaving fields empty or entering invalid email)
5. See order summary update in real-time

### ✅ Checkout Flow
1. Click "Continue as Guest"
2. Enter email (twice for confirmation)
3. Try mismatching emails - see validation error
4. Click "Complete Purchase"
5. See loading state (1.5s)
6. Redirect to success page

### ✅ Responsive Design
1. Resize browser window
2. Test mobile view (390px width):
   - Bottom navigation appears
   - Sticky order summary changes to bottom sheet
   - Category chips scroll horizontally
3. Test desktop view (1280px+ width):
   - Top navigation
   - Sticky sidebar (order summary)
   - Hover states on cards

## Development Commands

```bash
# Start dev server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm run start

# Run linter
npm run lint

# Run Playwright tests (coming from TESTER agent)
npm run test:e2e
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill existing Next.js process
pkill -f "next dev"

# Or use a different port
npx next dev -p 3001
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Dependencies Missing
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Country Selection Not Persisting
- Check browser localStorage (DevTools > Application > Local Storage)
- Look for key: `gifted_selected_country`
- Try a different browser if localStorage is disabled

## Project Structure Overview

```
gifted-project/
├── app/                     # Next.js pages
│   ├── page.tsx            # Browse (homepage)
│   ├── gift-card/[slug]/   # Product detail
│   ├── checkout/           # Checkout
│   └── success/            # Success confirmation
│
├── components/              # React components
│   ├── layout/             # Header, Footer, Nav
│   ├── browse/             # Product grid, cards
│   ├── product/            # Amount selector, toggles
│   ├── checkout/           # Checkout form
│   └── shared/             # Buttons, inputs
│
├── lib/                     # Business logic
│   ├── giftcards/          # Product data (mocked)
│   ├── orders/             # Order management
│   ├── payments/           # Payment (mocked)
│   ├── countries/          # Country data
│   └── utils/              # Helpers
│
└── contexts/                # React contexts
    └── AppContext.tsx      # App state (country selection)
```

## Next Steps

1. **Explore the UI** - Browse products, configure orders
2. **Test responsive design** - Resize browser or use DevTools device toolbar
3. **Review the code** - See how components are structured
4. **Read README.md** - Full documentation
5. **Check integration guides** - See how to swap mocked APIs for real ones

## Need Help?

- **Full docs:** `README.md`
- **Architecture:** `ARCHITECTURE.md`
- **Integration guide:** `INTEGRATION-GUIDE.md`
- **Troubleshooting:** `TROUBLESHOOTING.md`
- **Implementation details:** `CODER-DELIVERABLES.md`

---

**Enjoy exploring GIFTED!** 🎁
