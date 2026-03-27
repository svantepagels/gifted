# DATA MODELS REFERENCE

Complete TypeScript type definitions and mock data structure.

---

## 🗂️ TYPE DEFINITIONS

### Gift Card Domain

```typescript
// lib/giftcards/types.ts

export interface Country {
  code: string;           // ISO 3166-1 alpha-2 (e.g., "US", "GB")
  name: string;           // "United States", "United Kingdom"
  flag: string;           // Emoji flag: "🇺🇸", "🇬🇧"
  currency: string;       // ISO 4217: "USD", "GBP", "EUR"
  currencySymbol: string; // "$", "£", "€"
}

export interface Category {
  id: string;    // "shopping", "food-drink"
  name: string;  // "Shopping", "Food & Drink"
  slug: string;  // "shopping", "food-drink"
}

export type DenominationType = 'fixed' | 'range';

export interface FixedDenomination {
  value: number;    // 25, 50, 100
  currency: string; // "USD", "GBP"
}

export interface RangeDenomination {
  min: number;      // 5
  max: number;      // 500
  currency: string; // "USD"
}

export interface GiftCardProduct {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  logoUrl: string;
  logoNeedsGhostBorder: boolean;
  
  availableInCountries: string[];  // ["US", "CA", "GB"]
  categories: string[];             // ["shopping", "featured"]
  
  denominationType: DenominationType;
  fixedDenominations?: FixedDenomination[];
  rangeDenomination?: RangeDenomination;
  
  description: string;
  terms: string;
  redemptionInstructions: string;
  deliveryTime: string;
  
  featured: boolean;
}

export interface GiftCardCatalog {
  products: GiftCardProduct[];
  categories: Category[];
  countries: Country[];
}
```

### Order Domain

```typescript
// lib/orders/types.ts

export type DeliveryMethod = 'for-me' | 'send-as-gift';

export type PaymentStatus = 'pending' | 'completed' | 'failed';

export type FulfillmentStatus = 'pending' | 'delivered' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  serviceFee: number;
}

export interface RecipientInfo {
  email: string;
  message?: string;
}

export interface CustomerInfo {
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface Order {
  id: string;
  createdAt: string;  // ISO 8601
  
  item: OrderItem;
  
  deliveryMethod: DeliveryMethod;
  recipient?: RecipientInfo;
  
  customer: CustomerInfo;
  
  paymentStatus: PaymentStatus;
  paymentSessionId?: string;
  
  fulfillmentStatus: FulfillmentStatus;
  giftCardCode?: string;
  
  subtotal: number;
  serviceFee: number;
  total: number;
  currency: string;
}
```

### Payment Domain

```typescript
// lib/payments/types.ts

export type CheckoutSessionStatus = 'pending' | 'completed' | 'failed';

export interface CheckoutSession {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: CheckoutSessionStatus;
  checkoutUrl?: string;
  createdAt: string;  // ISO 8601
}

export interface PaymentMetadata {
  orderId: string;
  productId: string;
  productName: string;
  amount: number;
  serviceFee: number;
  deliveryMethod: DeliveryMethod;
  recipientEmail?: string;
  giftMessage?: string;
  customerEmail: string;
}
```

---

## 🗃️ MOCK DATA EXAMPLES

### Countries

```typescript
// lib/countries/data.ts

export const countries: Country[] = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    currencySymbol: '£'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    currencySymbol: 'C$'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    currencySymbol: 'A$'
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    currencySymbol: '€'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    currencySymbol: '€'
  },
  {
    code: 'ES',
    name: 'Spain',
    flag: '🇪🇸',
    currency: 'EUR',
    currencySymbol: '€'
  },
  {
    code: 'IT',
    name: 'Italy',
    flag: '🇮🇹',
    currency: 'EUR',
    currencySymbol: '€'
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    currencySymbol: '¥'
  },
  {
    code: 'MX',
    name: 'Mexico',
    flag: '🇲🇽',
    currency: 'MXN',
    currencySymbol: 'MX$'
  }
];
```

### Categories

```typescript
// lib/giftcards/mock-data.ts

export const categories: Category[] = [
  {
    id: 'featured',
    name: 'Featured',
    slug: 'featured'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    slug: 'shopping'
  },
  {
    id: 'food-drink',
    name: 'Food & Drink',
    slug: 'food-drink'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    slug: 'entertainment'
  },
  {
    id: 'gaming',
    name: 'Gaming',
    slug: 'gaming'
  },
  {
    id: 'travel',
    name: 'Travel',
    slug: 'travel'
  },
  {
    id: 'fashion',
    name: 'Fashion',
    slug: 'fashion'
  },
  {
    id: 'tech',
    name: 'Technology',
    slug: 'tech'
  }
];
```

### Products (Examples)

```typescript
// lib/giftcards/mock-data.ts

export const products: GiftCardProduct[] = [
  // SHOPPING - Fixed Denominations
  {
    id: '1',
    slug: 'amazon-us',
    name: 'Amazon',
    brandName: 'Amazon.com',
    logoUrl: '/logos/amazon.png',
    logoNeedsGhostBorder: false,
    availableInCountries: ['US', 'CA', 'GB', 'DE', 'FR'],
    categories: ['shopping', 'featured'],
    denominationType: 'fixed',
    fixedDenominations: [
      { value: 25, currency: 'USD' },
      { value: 50, currency: 'USD' },
      { value: 100, currency: 'USD' },
      { value: 200, currency: 'USD' }
    ],
    description: 'Shop millions of products on Amazon.com',
    terms: 'Valid for Amazon.com purchases only. Not redeemable for cash. Full terms at amazon.com/gc-legal.',
    redemptionInstructions: 'Enter the gift card code at checkout when making a purchase on Amazon.com.',
    deliveryTime: 'Instant digital delivery',
    featured: true
  },
  
  // FOOD & DRINK - Range Denominations
  {
    id: '2',
    slug: 'starbucks-us',
    name: 'Starbucks',
    brandName: 'Starbucks Coffee',
    logoUrl: '/logos/starbucks.png',
    logoNeedsGhostBorder: false,
    availableInCountries: ['US', 'CA', 'GB'],
    categories: ['food-drink', 'featured'],
    denominationType: 'range',
    rangeDenomination: {
      min: 5,
      max: 500,
      currency: 'USD'
    },
    description: 'Enjoy your favorite Starbucks beverages and food',
    terms: 'Valid at participating Starbucks locations. Not valid at airports or grocery stores.',
    redemptionInstructions: 'Present the barcode in the Starbucks app or show the digital card at checkout.',
    deliveryTime: 'Instant digital delivery',
    featured: true
  },
  
  // GAMING - Fixed Denominations
  {
    id: '3',
    slug: 'playstation-us',
    name: 'PlayStation Store',
    brandName: 'PlayStation',
    logoUrl: '/logos/playstation.png',
    logoNeedsGhostBorder: true,
    availableInCountries: ['US', 'CA', 'GB', 'AU', 'JP'],
    categories: ['gaming', 'entertainment', 'featured'],
    denominationType: 'fixed',
    fixedDenominations: [
      { value: 10, currency: 'USD' },
      { value: 25, currency: 'USD' },
      { value: 50, currency: 'USD' },
      { value: 100, currency: 'USD' }
    ],
    description: 'Buy games, add-ons, and PlayStation Plus subscriptions',
    terms: 'Redeemable on PlayStation Store. Not compatible with other Sony services.',
    redemptionInstructions: 'Go to PlayStation Store > Redeem Codes and enter your code.',
    deliveryTime: 'Instant digital delivery',
    featured: true
  },
  
  // ENTERTAINMENT - Fixed
  {
    id: '4',
    slug: 'netflix-us',
    name: 'Netflix',
    brandName: 'Netflix',
    logoUrl: '/logos/netflix.png',
    logoNeedsGhostBorder: false,
    availableInCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT'],
    categories: ['entertainment', 'featured'],
    denominationType: 'fixed',
    fixedDenominations: [
      { value: 30, currency: 'USD' },
      { value: 60, currency: 'USD' },
      { value: 100, currency: 'USD' }
    ],
    description: 'Stream unlimited movies and TV shows',
    terms: 'Applied to your Netflix account. Does not auto-renew.',
    redemptionInstructions: 'Go to netflix.com/redeem and enter your code.',
    deliveryTime: 'Instant digital delivery',
    featured: true
  },
  
  // FASHION - Range
  {
    id: '5',
    slug: 'nike-us',
    name: 'Nike',
    brandName: 'Nike.com',
    logoUrl: '/logos/nike.png',
    logoNeedsGhostBorder: true,
    availableInCountries: ['US', 'CA', 'GB', 'DE', 'FR'],
    categories: ['fashion', 'shopping'],
    denominationType: 'range',
    rangeDenomination: {
      min: 10,
      max: 500,
      currency: 'USD'
    },
    description: 'Shop the latest Nike shoes, apparel, and gear',
    terms: 'Valid on Nike.com and Nike apps. Not redeemable at retail stores.',
    redemptionInstructions: 'Enter your gift card code at checkout on Nike.com.',
    deliveryTime: 'Instant digital delivery',
    featured: false
  },
  
  // TECH - Fixed
  {
    id: '6',
    slug: 'apple-us',
    name: 'Apple',
    brandName: 'Apple Gift Card',
    logoUrl: '/logos/apple.png',
    logoNeedsGhostBorder: true,
    availableInCountries: ['US', 'CA', 'GB', 'AU', 'JP', 'DE', 'FR'],
    categories: ['tech', 'shopping', 'featured'],
    denominationType: 'fixed',
    fixedDenominations: [
      { value: 25, currency: 'USD' },
      { value: 50, currency: 'USD' },
      { value: 100, currency: 'USD' },
      { value: 250, currency: 'USD' }
    ],
    description: 'For everything Apple — products, accessories, apps, games, music, movies, TV shows, iCloud, and more',
    terms: 'Valid in the U.S. only. Not redeemable for cash or other cards.',
    redemptionInstructions: 'Redeem on your iPhone, iPad, or Mac, or at apple.com/redeem.',
    deliveryTime: 'Instant digital delivery',
    featured: true
  },
  
  // TRAVEL - Range
  {
    id: '7',
    slug: 'airbnb-us',
    name: 'Airbnb',
    brandName: 'Airbnb',
    logoUrl: '/logos/airbnb.png',
    logoNeedsGhostBorder: false,
    availableInCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'MX'],
    categories: ['travel'],
    denominationType: 'range',
    rangeDenomination: {
      min: 25,
      max: 1000,
      currency: 'USD'
    },
    description: 'Book unique homes and experiences around the world',
    terms: 'Valid for Airbnb stays and experiences. Check airbnb.com/terms for full details.',
    redemptionInstructions: 'Go to airbnb.com/redeem and enter your code.',
    deliveryTime: 'Instant digital delivery',
    featured: false
  },
  
  // FOOD & DRINK - Fixed
  {
    id: '8',
    slug: 'uber-eats-us',
    name: 'Uber Eats',
    brandName: 'Uber Eats',
    logoUrl: '/logos/uber-eats.png',
    logoNeedsGhostBorder: false,
    availableInCountries: ['US', 'CA', 'GB', 'AU', 'FR', 'MX'],
    categories: ['food-drink'],
    denominationType: 'fixed',
    fixedDenominations: [
      { value: 25, currency: 'USD' },
      { value: 50, currency: 'USD' },
      { value: 100, currency: 'USD' }
    ],
    description: 'Get food delivered from your favorite restaurants',
    terms: 'Valid on Uber Eats orders. May not cover fees or tips.',
    redemptionInstructions: 'Open Uber Eats app > Account > Wallet > Add Payment Method > Gift Card.',
    deliveryTime: 'Instant digital delivery',
    featured: false
  },
  
  // GAMING - Fixed
  {
    id: '9',
    slug: 'xbox-us',
    name: 'Xbox Gift Card',
    brandName: 'Xbox',
    logoUrl: '/logos/xbox.png',
    logoNeedsGhostBorder: true,
    availableInCountries: ['US', 'CA', 'GB', 'AU', 'DE'],
    categories: ['gaming', 'entertainment'],
    denominationType: 'fixed',
    fixedDenominations: [
      { value: 10, currency: 'USD' },
      { value: 25, currency: 'USD' },
      { value: 50, currency: 'USD' },
      { value: 100, currency: 'USD' }
    ],
    description: 'Buy games, add-ons, and Xbox Game Pass subscriptions',
    terms: 'Valid on Microsoft Store and Xbox. Not valid for Xbox hardware.',
    redemptionInstructions: 'Go to microsoft.com/redeem or use the Xbox console.',
    deliveryTime: 'Instant digital delivery',
    featured: false
  },
  
  // ENTERTAINMENT - Fixed
  {
    id: '10',
    slug: 'spotify-us',
    name: 'Spotify',
    brandName: 'Spotify Premium',
    logoUrl: '/logos/spotify.png',
    logoNeedsGhostBorder: false,
    availableInCountries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'ES', 'IT', 'MX'],
    categories: ['entertainment'],
    denominationType: 'fixed',
    fixedDenominations: [
      { value: 10, currency: 'USD' },
      { value: 30, currency: 'USD' },
      { value: 60, currency: 'USD' }
    ],
    description: 'Enjoy ad-free music and podcasts with Spotify Premium',
    terms: 'Applied to Spotify Premium subscription. Auto-renewal may apply.',
    redemptionInstructions: 'Go to spotify.com/redeem and log in to your account.',
    deliveryTime: 'Instant digital delivery',
    featured: false
  },
  
  // Add 10+ more products for variety
  // Include different categories, countries, and denomination types
  // Ensure good distribution across:
  // - Categories (each should have 3+ products)
  // - Countries (US should have most, EU countries next)
  // - Denomination types (mix of fixed and range)
];
```

### Order Example

```typescript
// Example order object after creation

const exampleOrder: Order = {
  id: 'ORD-1234567890-ABC123',
  createdAt: '2026-03-26T22:30:00Z',
  
  item: {
    productId: '1',
    productName: 'Amazon',
    amount: 50,
    currency: 'USD',
    serviceFee: 2.50
  },
  
  deliveryMethod: 'send-as-gift',
  
  recipient: {
    email: 'friend@example.com',
    message: 'Happy Birthday! Enjoy shopping on Amazon.'
  },
  
  customer: {
    email: 'sender@example.com'
  },
  
  paymentStatus: 'completed',
  paymentSessionId: 'lmsqy_1234567890',
  
  fulfillmentStatus: 'delivered',
  giftCardCode: 'AMZN-1234-5678-90AB-CDEF',
  
  subtotal: 50,
  serviceFee: 2.50,
  total: 52.50,
  currency: 'USD'
};
```

---

## 🔄 STATE FLOW

### Zustand Store State Shape

```typescript
// store/app-store.ts

interface AppState {
  // Country selection
  selectedCountry: Country | null;
  
  // Current product flow
  currentProduct: GiftCardProduct | null;
  selectedAmount: number | null;
  deliveryMethod: DeliveryMethod;
  recipientEmail: string;
  giftMessage: string;
  
  // Computed
  serviceFee: number;
  total: number;
}

// Example state during checkout:
{
  selectedCountry: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    currencySymbol: '$'
  },
  currentProduct: {
    id: '1',
    slug: 'amazon-us',
    name: 'Amazon',
    // ... full product object
  },
  selectedAmount: 50,
  deliveryMethod: 'send-as-gift',
  recipientEmail: 'friend@example.com',
  giftMessage: 'Happy Birthday!',
  serviceFee: 2.50,
  total: 52.50
}
```

---

## 🧮 BUSINESS LOGIC

### Service Fee Calculation

```typescript
// lib/orders/service.ts

function calculateServiceFee(amount: number): number {
  // Simple flat fee calculation
  // 5% of amount, minimum $0.99
  const feePercentage = 0.05;
  const minimumFee = 0.99;
  
  const calculatedFee = amount * feePercentage;
  
  return Math.max(minimumFee, calculatedFee);
}

// Examples:
// $10 amount → $0.99 fee (minimum)
// $25 amount → $1.25 fee
// $50 amount → $2.50 fee
// $100 amount → $5.00 fee
```

### Currency Formatting

```typescript
// lib/utils/currency.ts

export function formatCurrency(amount: number, currency: string): string {
  const locale = getCurrencyLocale(currency);
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function getCurrencyLocale(currency: string): string {
  const localeMap: Record<string, string> = {
    'USD': 'en-US',
    'GBP': 'en-GB',
    'EUR': 'de-DE',
    'CAD': 'en-CA',
    'AUD': 'en-AU',
    'JPY': 'ja-JP',
    'MXN': 'es-MX'
  };
  
  return localeMap[currency] || 'en-US';
}

// Examples:
// formatCurrency(50, 'USD')  → "$50.00"
// formatCurrency(50, 'GBP')  → "£50.00"
// formatCurrency(50, 'EUR')  → "50,00 €"
// formatCurrency(1000, 'JPY') → "¥1,000"
```

---

## 🔍 FILTERING & SEARCH

### Product Filtering Logic

```typescript
// lib/giftcards/service.ts

// Filter by country
function filterByCountry(products: GiftCardProduct[], countryCode: string): GiftCardProduct[] {
  return products.filter(product => 
    product.availableInCountries.includes(countryCode)
  );
}

// Filter by category
function filterByCategory(products: GiftCardProduct[], categoryId: string): GiftCardProduct[] {
  return products.filter(product =>
    product.categories.includes(categoryId)
  );
}

// Search by name/brand
function searchProducts(products: GiftCardProduct[], query: string): GiftCardProduct[] {
  const lowerQuery = query.toLowerCase().trim();
  
  if (!lowerQuery) {
    return products;
  }
  
  return products.filter(product =>
    product.name.toLowerCase().includes(lowerQuery) ||
    product.brandName.toLowerCase().includes(lowerQuery)
  );
}

// Combined filtering
function getFilteredProducts(
  products: GiftCardProduct[],
  filters: {
    countryCode?: string;
    categoryId?: string;
    searchQuery?: string;
  }
): GiftCardProduct[] {
  let filtered = products;
  
  if (filters.countryCode) {
    filtered = filterByCountry(filtered, filters.countryCode);
  }
  
  if (filters.categoryId && filters.categoryId !== 'featured') {
    filtered = filterByCategory(filtered, filters.categoryId);
  } else if (filters.categoryId === 'featured') {
    filtered = filtered.filter(p => p.featured);
  }
  
  if (filters.searchQuery) {
    filtered = searchProducts(filtered, filters.searchQuery);
  }
  
  return filtered;
}
```

---

## 📋 VALIDATION RULES

### Email Validation
```typescript
// lib/validation/schemas.ts

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');
```

### Amount Validation (Range)
```typescript
const rangeAmountSchema = z.number()
  .min(rangeDenomination.min, `Minimum amount is ${formatCurrency(rangeDenomination.min, currency)}`)
  .max(rangeDenomination.max, `Maximum amount is ${formatCurrency(rangeDenomination.max, currency)}`);
```

### Gift Message Validation
```typescript
const giftMessageSchema = z.string()
  .max(200, 'Message must be 200 characters or less')
  .optional();
```

### Complete Checkout Form Validation
```typescript
const checkoutFormSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  amount: z.number().min(0.01, 'Please select an amount'),
  deliveryMethod: z.enum(['for-me', 'send-as-gift']),
  customerEmail: emailSchema,
  recipientEmail: emailSchema.optional(),
  giftMessage: giftMessageSchema
}).refine(
  (data) => {
    // If sending as gift, recipient email is required
    if (data.deliveryMethod === 'send-as-gift') {
      return !!data.recipientEmail;
    }
    return true;
  },
  {
    message: 'Recipient email is required when sending as a gift',
    path: ['recipientEmail']
  }
);
```

---

## 🎲 MOCK DATA GENERATORS

### Generate Order ID
```typescript
function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// Example: "ORD-1711488000000-A3B9C2"
```

### Generate Gift Card Code
```typescript
function generateGiftCardCode(): string {
  const segments = 4;
  const segmentLength = 4;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
  
  const code = Array.from({ length: segments }, () => {
    return Array.from({ length: segmentLength }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }).join('-');
  
  return code;
}

// Example: "A3B9-C2D4-E5F6-G7H8"
```

---

## 📊 ANALYTICS EVENTS (Future)

Structure for future analytics integration:

```typescript
// lib/analytics/events.ts

interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
}

// Example events to track:

// Product viewed
{
  name: 'product_viewed',
  properties: {
    productId: '1',
    productName: 'Amazon',
    country: 'US'
  },
  timestamp: '2026-03-26T22:30:00Z'
}

// Amount selected
{
  name: 'amount_selected',
  properties: {
    productId: '1',
    amount: 50,
    currency: 'USD',
    denominationType: 'fixed'
  },
  timestamp: '2026-03-26T22:31:00Z'
}

// Checkout initiated
{
  name: 'checkout_initiated',
  properties: {
    productId: '1',
    amount: 50,
    deliveryMethod: 'send-as-gift',
    total: 52.50
  },
  timestamp: '2026-03-26T22:32:00Z'
}

// Purchase completed
{
  name: 'purchase_completed',
  properties: {
    orderId: 'ORD-1234567890-ABC123',
    productId: '1',
    amount: 50,
    total: 52.50,
    deliveryMethod: 'send-as-gift'
  },
  timestamp: '2026-03-26T22:35:00Z'
}
```

---

**All types and data structures are production-ready and integration-compatible.**
