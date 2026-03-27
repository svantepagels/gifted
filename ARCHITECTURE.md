# GIFTED - Technical Architecture Specification
**Version:** 1.0  
**Date:** 2026-03-26  
**Architect:** Fernando (Swarm ARCHITECT Agent)

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Data Models & Schemas](#data-models--schemas)
5. [Integration Architecture](#integration-architecture)
6. [Component Specifications](#component-specifications)
7. [Routing & Navigation](#routing--navigation)
8. [State Management](#state-management)
9. [Animation Specifications](#animation-specifications)
10. [Form Validation](#form-validation)
11. [Responsive Breakpoints](#responsive-breakpoints)
12. [Testing Strategy](#testing-strategy)
13. [Implementation Phases](#implementation-phases)

---

## 1. System Overview

### Purpose
GIFTED is a production-grade, mobile-first digital gift card marketplace that will eventually integrate with Reloadly (gift card catalog) and Lemon Squeezy (payment processing). The initial implementation uses mocked data with clear integration boundaries.

### Design Philosophy
- **Architectural Ledger Aesthetic**: Swiss minimalism, heavy-weight typography, tonal layering
- **No-Line Rule**: Use background color shifts instead of borders for section separation
- **Premium Feel**: Restrained color palette, intentional whitespace, trust-building UI
- **Mobile-First**: Optimized for thumb-friendly interactions, scales beautifully to desktop

### Core User Flows
1. **Browse** → Country selection → Search/filter → Product discovery
2. **Configure** → Amount selection → Delivery method (for me / send as gift)
3. **Checkout** → Guest checkout (primary) or Sign-in → Payment → Success

---

## 2. Tech Stack

### Framework & Language
- **Next.js 14.2+** with App Router
- **TypeScript 5.4+** (strict mode)
- **Node 18+**

### Styling & Animation
- **Tailwind CSS 3.4+**
- **Framer Motion 11+** for micro-animations
- **Lucide React** for icons

### Forms & Validation
- **React Hook Form 7.5+**
- **Zod 3.23+** for schema validation

### Testing
- **Playwright 1.42+** for visual regression and interaction testing
- **@playwright/test** for test runner

### Additional Libraries
- **clsx** for conditional classNames
- **date-fns** for date formatting
- **next-intl** (optional future enhancement for localization)

---

## 3. Project Structure

```
gifted-project/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── page.tsx                      # Home/Browse page
│   │   ├── gift-card/
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Product detail page
│   │   ├── checkout/
│   │   │   └── page.tsx                  # Checkout/payment page
│   │   ├── success/
│   │   │   └── page.tsx                  # Success confirmation page
│   │   └── auth/
│   │       └── verify/
│   │           └── page.tsx              # Email verification page
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileBottomNav.tsx
│   │   ├── country/
│   │   │   ├── CountrySelector.tsx
│   │   │   └── CountryModal.tsx
│   │   ├── search/
│   │   │   └── SearchBar.tsx
│   │   ├── products/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CategoryChips.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── product-detail/
│   │   │   ├── AmountSelector.tsx
│   │   │   ├── DeliveryMethodToggle.tsx
│   │   │   ├── RecipientForm.tsx
│   │   │   └── ProductInfo.tsx
│   │   ├── checkout/
│   │   │   ├── OrderSummary.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── PaymentSection.tsx
│   │   │   └── TrustBadges.tsx
│   │   ├── success/
│   │   │   └── SuccessSummary.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── TextArea.tsx
│   │       ├── Badge.tsx
│   │       └── Card.tsx
│   │
│   ├── lib/
│   │   ├── giftcards/
│   │   │   ├── types.ts                  # Gift card type definitions
│   │   │   ├── mock-data.ts              # Mocked product catalog
│   │   │   ├── service.ts                # Gift card business logic
│   │   │   └── reloadly-adapter.ts       # Reloadly integration (mocked)
│   │   ├── payments/
│   │   │   ├── types.ts                  # Payment type definitions
│   │   │   ├── mock-checkout.ts          # Mocked checkout flow
│   │   │   └── lemon-squeezy-adapter.ts  # Lemon Squeezy integration (mocked)
│   │   ├── orders/
│   │   │   ├── types.ts                  # Order type definitions
│   │   │   └── service.ts                # Order management logic
│   │   ├── countries/
│   │   │   ├── types.ts                  # Country/region definitions
│   │   │   └── data.ts                   # Country list with flags, currencies
│   │   └── utils/
│   │       ├── cn.ts                     # Tailwind class merger (clsx + twMerge)
│   │       ├── currency.ts               # Currency formatting
│   │       └── validation.ts             # Zod schemas
│   │
│   ├── hooks/
│   │   ├── useCountry.ts                 # Country selection hook
│   │   ├── useCart.ts                    # Cart/order state hook
│   │   └── useBreakpoint.ts              # Responsive breakpoint detection
│   │
│   ├── context/
│   │   ├── CountryContext.tsx            # Selected country provider
│   │   └── CartContext.tsx               # Cart/order state provider
│   │
│   └── styles/
│       └── globals.css                   # Tailwind imports + custom styles
│
├── tests/
│   ├── e2e/
│   │   ├── home.spec.ts                  # Browse page tests
│   │   ├── product-detail.spec.ts        # Product page tests
│   │   ├── checkout.spec.ts              # Checkout flow tests
│   │   └── visual/
│   │       ├── desktop.spec.ts           # Desktop visual regression
│   │       └── mobile.spec.ts            # Mobile visual regression
│   └── fixtures/
│       ├── countries.ts
│       ├── products.ts
│       └── orders.ts
│
├── public/
│   ├── brand-logos/                      # Gift card brand logos
│   └── flags/                            # Country flag SVGs
│
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

---

## 4. Data Models & Schemas

### 4.1 Country Types
```typescript
// lib/countries/types.ts

export interface Country {
  code: string;              // ISO 3166-1 alpha-2 code (e.g., "US")
  name: string;              // Display name (e.g., "United States")
  flagEmoji: string;         // Unicode emoji (e.g., "🇺🇸")
  currency: Currency;
  locale: string;            // BCP 47 language tag (e.g., "en-US")
}

export interface Currency {
  code: string;              // ISO 4217 code (e.g., "USD")
  symbol: string;            // Display symbol (e.g., "$")
  decimals: number;          // Decimal places (usually 2)
}
```

### 4.2 Gift Card Types
```typescript
// lib/giftcards/types.ts

export type DenominationType = 'FIXED' | 'RANGE';

export interface GiftCardProduct {
  id: string;                       // Unique product ID
  slug: string;                     // URL-friendly slug
  brandName: string;                // Display name (e.g., "Amazon")
  description: string;              // Short description
  logoUrl: string;                  // Brand logo image URL
  categories: string[];             // Category tags (e.g., ["retail", "electronics"])
  availableCountries: string[];     // List of country codes
  denominationType: DenominationType;
  fixedDenominations?: number[];    // If FIXED, list of amounts
  denominationRange?: {             // If RANGE, min/max
    min: number;
    max: number;
  };
  currency: string;                 // Currency code per country
  serviceFeePercent: number;        // Fee as percentage (e.g., 5.5)
  deliveryType: 'DIGITAL';          // Always digital for v1
  redemptionInstructions?: string;  // How to redeem
  termsUrl?: string;                // Link to terms
}

export interface GiftCardsByCountry {
  country: Country;
  products: GiftCardProduct[];
}

export interface CategoryFilter {
  id: string;
  label: string;
  count: number;
}
```

### 4.3 Order Types
```typescript
// lib/orders/types.ts

export type DeliveryMethod = 'FOR_ME' | 'SEND_AS_GIFT';

export interface OrderItem {
  productId: string;
  productSlug: string;
  brandName: string;
  amount: number;
  currency: string;
  serviceFee: number;
  total: number;
}

export interface RecipientInfo {
  email: string;
  message?: string;        // Optional gift message
}

export interface Order {
  id: string;              // Order/transaction ID
  item: OrderItem;
  deliveryMethod: DeliveryMethod;
  customerEmail: string;
  recipient?: RecipientInfo;  // Only if SEND_AS_GIFT
  country: Country;
  status: OrderStatus;
  createdAt: Date;
  paymentSessionId?: string;  // Lemon Squeezy session ID (future)
}

export type OrderStatus = 
  | 'DRAFT'           // Order being configured
  | 'PENDING'         // Payment initiated
  | 'PAID'            // Payment confirmed
  | 'DELIVERED'       // Gift card code delivered
  | 'FAILED'          // Payment failed
  | 'REFUNDED';       // Order refunded
```

### 4.4 Payment Types
```typescript
// lib/payments/types.ts

export interface CheckoutSession {
  id: string;                    // Session ID
  orderId: string;               // Associated order ID
  status: 'PENDING' | 'COMPLETE' | 'FAILED';
  checkoutUrl?: string;          // Lemon Squeezy checkout URL (future)
  expiresAt: Date;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  errorMessage?: string;
}
```

---

## 5. Integration Architecture

### 5.1 Reloadly Integration (Gift Cards)

**File:** `lib/giftcards/reloadly-adapter.ts`

```typescript
/**
 * RELOADLY INTEGRATION ADAPTER
 * 
 * This module will be the ONLY place that interacts with Reloadly APIs.
 * Currently mocked. Replace with real API calls when ready.
 * 
 * Reloadly API Docs: https://developers.reloadly.com/
 * 
 * Authentication:
 * - OAuth2 client credentials flow
 * - Store access token with expiry
 * - Refresh token before expiry
 * 
 * Key Endpoints:
 * - GET /countries - List supported countries
 * - GET /products - List gift card products (filterable by country)
 * - GET /products/{productId} - Get product details
 * - POST /orders - Purchase gift card
 */

import { GiftCardProduct, GiftCardsByCountry } from './types';
import { Country } from '../countries/types';
import { MOCK_PRODUCTS } from './mock-data';

// TODO: Add Reloadly API credentials to env
// RELOADLY_CLIENT_ID=your_client_id
// RELOADLY_CLIENT_SECRET=your_client_secret
// RELOADLY_API_URL=https://giftcards.reloadly.com

export class ReloadlyAdapter {
  private accessToken?: string;
  private tokenExpiry?: Date;

  /**
   * TODO: Replace with real Reloadly OAuth token acquisition
   * - POST to /oauth/token with client credentials
   * - Cache token until expiry
   * - Implement refresh logic
   */
  private async ensureAuthenticated(): Promise<void> {
    // MOCK: In production, fetch and cache OAuth token
    return Promise.resolve();
  }

  /**
   * Fetch all gift cards available for a specific country
   * 
   * TODO: Replace with real Reloadly API call:
   * - GET /products?countryCode={countryCode}
   * - Add caching layer (Redis or in-memory with revalidation)
   * - Consider implementing ISR (Incremental Static Regeneration) in Next.js
   * - Map Reloadly product schema to local GiftCardProduct interface
   */
  async getGiftCardsByCountry(countryCode: string): Promise<GiftCardProduct[]> {
    await this.ensureAuthenticated();
    
    // MOCK: Filter mock data by country
    return MOCK_PRODUCTS.filter(product =>
      product.availableCountries.includes(countryCode)
    );
  }

  /**
   * Fetch single gift card product details
   * 
   * TODO: Replace with real Reloadly API call:
   * - GET /products/{productId}
   * - Handle product not found errors
   * - Cache product details (consider Next.js data cache)
   */
  async getGiftCardById(productId: string): Promise<GiftCardProduct | null> {
    await this.ensureAuthenticated();
    
    // MOCK: Find in mock data
    return MOCK_PRODUCTS.find(p => p.id === productId) || null;
  }

  /**
   * Search gift cards by query string
   * 
   * TODO: Replace with real Reloadly API search:
   * - GET /products?search={query}&countryCode={countryCode}
   * - Implement debouncing on client side
   * - Consider server-side search with proper indexing
   */
  async searchGiftCards(query: string, countryCode: string): Promise<GiftCardProduct[]> {
    const allProducts = await this.getGiftCardsByCountry(countryCode);
    
    // MOCK: Simple string search
    const lowerQuery = query.toLowerCase();
    return allProducts.filter(product =>
      product.brandName.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get available categories for a country
   * 
   * TODO: Replace with real Reloadly category endpoint or derive from products
   * - Aggregate categories from fetched products
   * - Cache category list per country
   */
  async getCategories(countryCode: string): Promise<string[]> {
    const products = await this.getGiftCardsByCountry(countryCode);
    
    // MOCK: Extract unique categories
    const categories = new Set<string>();
    products.forEach(p => p.categories.forEach(c => categories.add(c)));
    return Array.from(categories).sort();
  }
}

export const reloadlyAdapter = new ReloadlyAdapter();
```

**Service Layer:** `lib/giftcards/service.ts`

```typescript
/**
 * Gift Card Service
 * 
 * Business logic layer between UI and data adapter.
 * Handles caching, error handling, data transformation.
 */

import { reloadlyAdapter } from './reloadly-adapter';
import { GiftCardProduct, CategoryFilter } from './types';

export class GiftCardService {
  /**
   * Get gift cards for a country with optional category filter
   */
  async getProducts(
    countryCode: string,
    categoryFilter?: string
  ): Promise<GiftCardProduct[]> {
    try {
      let products = await reloadlyAdapter.getGiftCardsByCountry(countryCode);
      
      if (categoryFilter) {
        products = products.filter(p => p.categories.includes(categoryFilter));
      }
      
      return products;
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
      throw new Error('Unable to load gift cards. Please try again.');
    }
  }

  /**
   * Search products by query
   */
  async searchProducts(query: string, countryCode: string): Promise<GiftCardProduct[]> {
    if (!query.trim()) {
      return this.getProducts(countryCode);
    }
    
    try {
      return await reloadlyAdapter.searchGiftCards(query, countryCode);
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error('Search failed. Please try again.');
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string): Promise<GiftCardProduct | null> {
    try {
      return await reloadlyAdapter.getGiftCardById(productId);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return null;
    }
  }

  /**
   * Get category filters with product counts
   */
  async getCategoryFilters(countryCode: string): Promise<CategoryFilter[]> {
    const products = await this.getProducts(countryCode);
    const categoryCounts = new Map<string, number>();
    
    products.forEach(product => {
      product.categories.forEach(category => {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      });
    });
    
    return Array.from(categoryCounts.entries())
      .map(([id, count]) => ({
        id,
        label: this.formatCategoryLabel(id),
        count
      }))
      .sort((a, b) => b.count - a.count);
  }

  private formatCategoryLabel(categoryId: string): string {
    return categoryId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

export const giftCardService = new GiftCardService();
```

### 5.2 Lemon Squeezy Integration (Payments)

**File:** `lib/payments/lemon-squeezy-adapter.ts`

```typescript
/**
 * LEMON SQUEEZY INTEGRATION ADAPTER
 * 
 * This module will be the ONLY place that interacts with Lemon Squeezy APIs.
 * Currently mocked. Replace with real API calls when ready.
 * 
 * Lemon Squeezy API Docs: https://docs.lemonsqueezy.com/api
 * 
 * Authentication:
 * - API key authentication via Authorization header
 * - Store API key in env variable: LEMON_SQUEEZY_API_KEY
 * 
 * Key Endpoints:
 * - POST /v1/checkouts - Create checkout session
 * - GET /v1/checkouts/{id} - Get checkout status
 * - Webhooks for payment confirmation
 * 
 * Integration Flow:
 * 1. Create checkout session with order metadata
 * 2. Redirect user to Lemon Squeezy checkout URL
 * 3. Handle redirect back after payment
 * 4. Verify payment via webhook (server-side)
 * 5. Mark order as PAID only after webhook verification
 */

import { Order, OrderStatus } from '../orders/types';
import { CheckoutSession, PaymentResult } from './types';

// TODO: Add Lemon Squeezy credentials to env
// LEMON_SQUEEZY_API_KEY=your_api_key
// LEMON_SQUEEZY_STORE_ID=your_store_id
// LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret

export class LemonSqueezyAdapter {
  private readonly apiKey: string;
  private readonly storeId: string;
  
  constructor() {
    // TODO: Load from env
    this.apiKey = process.env.LEMON_SQUEEZY_API_KEY || 'mock_key';
    this.storeId = process.env.LEMON_SQUEEZY_STORE_ID || 'mock_store';
  }

  /**
   * Create a checkout session for an order
   * 
   * TODO: Replace with real Lemon Squeezy API call:
   * - POST /v1/checkouts
   * - Include order metadata in custom_data field
   * - Set success_url and cancel_url for redirects
   * - Store checkout session ID in order record
   * - Return checkout URL for redirect
   * 
   * Example request body:
   * {
   *   "data": {
   *     "type": "checkouts",
   *     "attributes": {
   *       "store_id": "your_store_id",
   *       "product_options": {
   *         "name": "Amazon Gift Card - $50",
   *         "description": "Digital gift card delivery"
   *       },
   *       "checkout_data": {
   *         "email": "customer@example.com",
   *         "custom": {
   *           "order_id": "order_123",
   *           "product_id": "amazon-us",
   *           "amount": 50,
   *           "delivery_method": "FOR_ME"
   *         }
   *       },
   *       "success_url": "https://yourdomain.com/success?session_id={CHECKOUT_ID}",
   *       "cancel_url": "https://yourdomain.com/checkout?cancelled=true"
   *     }
   *   }
   * }
   */
  async createCheckoutSession(order: Order): Promise<CheckoutSession> {
    // MOCK: Return fake session
    const sessionId = `ls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: sessionId,
      orderId: order.id,
      status: 'PENDING',
      checkoutUrl: `/checkout/mock?session=${sessionId}`, // Mock URL
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };
  }

  /**
   * Process a mocked payment (for development only)
   * 
   * TODO: Remove this method entirely in production.
   * Real payments are confirmed via webhook, not client-initiated.
   */
  async processMockPayment(sessionId: string): Promise<PaymentResult> {
    // MOCK: Simulate payment success
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
    
    return {
      success: true,
      orderId: sessionId.split('_')[1] // Extract from mock session ID
    };
  }

  /**
   * Verify webhook signature
   * 
   * TODO: Implement Lemon Squeezy webhook signature verification:
   * - Use LEMON_SQUEEZY_WEBHOOK_SECRET to verify signature
   * - Validate timestamp to prevent replay attacks
   * - Return true only if signature is valid
   * 
   * Webhook signature is sent in X-Signature header
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implement real signature verification
    // const expectedSignature = crypto
    //   .createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)
    //   .update(payload)
    //   .digest('hex');
    // return crypto.timingSafeEqual(
    //   Buffer.from(signature),
    //   Buffer.from(expectedSignature)
    // );
    
    return true; // MOCK: Always valid
  }

  /**
   * Handle webhook event
   * 
   * TODO: Process Lemon Squeezy webhooks:
   * - Listen for 'order_created' and 'order_completed' events
   * - Extract order_id from custom_data
   * - Update order status in database
   * - Trigger gift card delivery (call Reloadly purchase API)
   * - Send confirmation email
   * 
   * Webhook events to handle:
   * - order_created: Initial order creation
   * - order_completed: Payment confirmed, trigger fulfillment
   * - order_refunded: Handle refund logic
   */
  async handleWebhook(eventType: string, eventData: any): Promise<void> {
    // TODO: Implement webhook handling
    console.log('Webhook received:', eventType, eventData);
  }
}

export const lemonSqueezyAdapter = new LemonSqueezyAdapter();
```

**Service Layer:** `lib/payments/mock-checkout.ts`

```typescript
/**
 * Mock Checkout Service
 * 
 * Simulates payment flow for development.
 * Replace with real Lemon Squeezy flow in production.
 */

import { Order } from '../orders/types';
import { lemonSqueezyAdapter } from './lemon-squeezy-adapter';
import { CheckoutSession, PaymentResult } from './types';

export class MockCheckoutService {
  /**
   * Initiate checkout flow
   */
  async createCheckout(order: Order): Promise<CheckoutSession> {
    return await lemonSqueezyAdapter.createCheckoutSession(order);
  }

  /**
   * Complete mock payment (development only)
   * 
   * TODO: Remove this entirely in production.
   * Real flow: User is redirected to Lemon Squeezy → completes payment → redirected back → webhook confirms.
   */
  async completeMockPayment(sessionId: string): Promise<PaymentResult> {
    return await lemonSqueezyAdapter.processMockPayment(sessionId);
  }
}

export const mockCheckoutService = new MockCheckoutService();
```

### 5.3 Order Management

**File:** `lib/orders/service.ts`

```typescript
/**
 * Order Service
 * 
 * Manages order lifecycle from draft to completion.
 * In production, this will interact with a database.
 */

import { Order, OrderItem, OrderStatus, DeliveryMethod, RecipientInfo } from './types';
import { GiftCardProduct } from '../giftcards/types';
import { Country } from '../countries/types';

export class OrderService {
  // MOCK: In-memory storage (replace with database in production)
  private orders: Map<string, Order> = new Map();

  /**
   * Create a draft order from product configuration
   */
  createDraftOrder(
    product: GiftCardProduct,
    amount: number,
    deliveryMethod: DeliveryMethod,
    customerEmail: string,
    country: Country,
    recipient?: RecipientInfo
  ): Order {
    const serviceFee = (amount * product.serviceFeePercent) / 100;
    const total = amount + serviceFee;
    
    const order: Order = {
      id: this.generateOrderId(),
      item: {
        productId: product.id,
        productSlug: product.slug,
        brandName: product.brandName,
        amount,
        currency: country.currency.code,
        serviceFee,
        total
      },
      deliveryMethod,
      customerEmail,
      recipient: deliveryMethod === 'SEND_AS_GIFT' ? recipient : undefined,
      country,
      status: 'DRAFT',
      createdAt: new Date()
    };
    
    this.orders.set(order.id, order);
    return order;
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Order | null {
    return this.orders.get(orderId) || null;
  }

  /**
   * Update order status
   * 
   * TODO: Replace with database update
   * - Update order status in database
   * - Trigger status-specific actions (e.g., send confirmation email on PAID)
   * - Log status change for audit trail
   */
  updateOrderStatus(orderId: string, status: OrderStatus): Order | null {
    const order = this.orders.get(orderId);
    if (!order) return null;
    
    order.status = status;
    this.orders.set(orderId, order);
    
    return order;
  }

  /**
   * Mark order as paid and trigger fulfillment
   * 
   * TODO: Implement fulfillment logic:
   * - Call Reloadly API to purchase gift card
   * - Store gift card code in order record
   * - Send delivery email with gift card details
   * - Update order status to DELIVERED
   */
  async fulfillOrder(orderId: string): Promise<void> {
    const order = this.getOrderById(orderId);
    if (!order || order.status !== 'PAID') {
      throw new Error('Order not ready for fulfillment');
    }
    
    // TODO: Call Reloadly purchase API
    // const giftCardCode = await reloadlyAdapter.purchaseGiftCard({
    //   productId: order.item.productId,
    //   amount: order.item.amount,
    //   recipientEmail: order.recipient?.email || order.customerEmail
    // });
    
    // TODO: Send delivery email
    // await emailService.sendGiftCardDelivery(order, giftCardCode);
    
    this.updateOrderStatus(orderId, 'DELIVERED');
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

export const orderService = new OrderService();
```

---

## 6. Component Specifications

### 6.1 Layout Components

#### **Header** (`components/layout/Header.tsx`)

**Desktop Appearance:**
- Fixed position at top
- Background: `surface_container_lowest` (#FFFFFF)
- Height: 72px
- Shadow: None at rest, ambient shadow on scroll

**Structure:**
```
[GIFTED Logo] [Browse] [Deals] [My Cards] [Spacer] [Country Selector] [Help] [Cart Icon]
```

**Mobile Appearance:**
- Simplified: [Menu Icon] [GIFTED] [Cart Icon]
- Height: 64px
- Country selector accessible from bottom nav or modal

**Interactions:**
- Logo click → Navigate to home
- Country selector → Open CountryModal
- Cart → Show cart (future enhancement)
- Scroll detection → Apply shadow on scroll down

**Props:**
```typescript
interface HeaderProps {
  className?: string;
}
```

#### **Footer** (`components/layout/Footer.tsx`)

**Appearance:**
- Background: `surface` (#F7F9FB)
- Padding: 64px vertical (desktop), 48px (mobile)
- Typography: `label-sm` (Inter Regular, 14px)

**Structure:**
```
[Company Info]  [Links Column 1]  [Links Column 2]  [Social Icons]
[Copyright]
```

**Content:**
- Company info: "GIFTED - Digital gift cards delivered instantly"
- Link columns: About, Help, Terms, Privacy, Contact
- Social icons: Placeholder for future
- Copyright: "© 2026 GIFTED. All rights reserved."

#### **MobileBottomNav** (`components/layout/MobileBottomNav.tsx`)

**Appearance:**
- Fixed bottom position
- Background: `surface_container_lowest` (#FFFFFF)
- Height: 64px
- Top border: None (use shadow)
- Shadow: Ambient shadow upward

**Structure:**
```
[Home Icon]  [Browse Icon]  [Country Icon]  [Account Icon]
```

**Interactions:**
- Home → Navigate to /
- Browse → Scroll to categories
- Country → Open CountryModal
- Account → Navigate to /auth/verify (or sign-in flow)

**Props:**
```typescript
interface MobileBottomNavProps {
  activeRoute: string;
}
```

### 6.2 Country Selection

#### **CountrySelector** (`components/country/CountrySelector.tsx`)

**Appearance (Desktop):**
- Pill-shaped button
- Background: `surface_container_high` (#E6E8EA)
- Border radius: `full` (9999px)
- Padding: 8px 16px
- Typography: `label-md` (Inter Medium, 14px)
- Hover: Background → `primary_container` (#131B2E), Text → `on_primary_container` (#7C839B)

**Structure:**
```
[Flag Emoji] [Country Name] [Currency Code] [Chevron Down]
```

**Example:** 🇺🇸 United States USD ▼

**Mobile:**
- Accessible from bottom nav
- Opens modal instead of dropdown

**Props:**
```typescript
interface CountrySelectorProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country) => void;
}
```

#### **CountryModal** (`components/country/CountryModal.tsx`)

**Appearance:**
- Full-screen modal on mobile
- Centered modal on desktop (max-width: 480px)
- Background: `surface_container_lowest` (#FFFFFF)
- Border radius: `lg` (16px) on desktop

**Structure:**
```
[Header: Select Country]
[Search Input]
[Country List]
  - [Flag] [Country Name] [Currency]
  - ...
```

**Interactions:**
- Search filters country list
- Click country → Select and close modal
- Escape key → Close modal
- Click outside → Close modal

**Props:**
```typescript
interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (country: Country) => void;
  selectedCountry: Country | null;
}
```

### 6.3 Product Discovery

#### **SearchBar** (`components/search/SearchBar.tsx`)

**Appearance:**
- Background: `surface_container` (#ECEEF0)
- Border: 1px solid `outline_variant` (#C6C6CD) at 20% opacity
- Border radius: `md` (12px)
- Padding: 12px 16px
- Focus: Border color → `secondary` (#0051D5) at 100% opacity

**Structure:**
```
[Search Icon] [Input: "Search gift cards..."]
```

**Behavior:**
- Debounced input (300ms)
- Clear button appears when text is entered
- Enter key triggers search

**Props:**
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

#### **CategoryChips** (`components/products/CategoryChips.tsx`)

**Appearance:**
- Horizontal scrollable row
- Chip background: `surface_container_lowest` (#FFFFFF)
- Active chip: `primary_container` (#131B2E), text `on_primary_container` (#7C839B)
- Border radius: `full` (9999px)
- Padding: 8px 20px
- Typography: `label-sm` (Inter Medium, 13px)

**Structure:**
```
[All] [Retail] [Entertainment] [Food] [Gaming] [Travel]
```

**Behavior:**
- Click chip → Filter products by category
- "All" chip clears filter
- Scroll horizontally on mobile
- Show scroll indicators if overflowing

**Props:**
```typescript
interface CategoryChipsProps {
  categories: CategoryFilter[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}
```

#### **ProductCard** (`components/products/ProductCard.tsx`)

**Appearance:**
- Background: `surface_container_lowest` (#FFFFFF)
- Border radius: `lg` (16px)
- Padding: 24px (desktop), 16px (mobile)
- Shadow: None at rest
- Hover (desktop): Background → `surface_bright` (#FAFBFC), Ambient shadow, slight scale (1.02)

**Structure:**
```
[Brand Logo - Centered, 80x80px]
[Brand Name - Headline-SM (Archivo ExtraBold)]
[Category Badge - Label-XS]
[Price Range - Body-SM]
```

**Interactions:**
- Click card → Navigate to `/gift-card/[slug]`
- Smooth hover transition (200ms ease-out)

**Props:**
```typescript
interface ProductCardProps {
  product: GiftCardProduct;
  onClick: () => void;
}
```

#### **ProductGrid** (`components/products/ProductGrid.tsx`)

**Appearance:**
- Grid layout with responsive columns:
  - Mobile: 2 columns
  - Tablet: 3 columns
  - Desktop: 4 columns
- Gap: 24px (desktop), 16px (mobile)

**Props:**
```typescript
interface ProductGridProps {
  products: GiftCardProduct[];
  onProductClick: (product: GiftCardProduct) => void;
}
```

#### **EmptyState** (`components/products/EmptyState.tsx`)

**Appearance:**
- Centered vertically and horizontally
- Max-width: 400px
- Typography: `title-lg` (Inter Semi-Bold, 22px)

**Structure:**
```
[Icon: Search or Filter]
[Headline: "No gift cards found"]
[Body: "Try adjusting your search or filters"]
[Action: Clear Filters Button]
```

**Props:**
```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

### 6.4 Product Detail Components

#### **AmountSelector** (`components/product-detail/AmountSelector.tsx`)

**Appearance:**
- Two variants based on `denominationType`:

**A. Fixed Denominations:**
- Grid of amount chips (2 columns mobile, 3-4 desktop)
- Chip background: `surface_container` (#ECEEF0)
- Selected: `secondary` (#0051D5), text `on_secondary` (#FFFFFF)
- Border radius: `md` (12px)
- Typography: `title-md` (Inter Semi-Bold, 18px)

**B. Range Input:**
- Large input field with currency symbol prefix
- Min/max labels below
- Validation error below input

**Props:**
```typescript
interface AmountSelectorProps {
  denominationType: DenominationType;
  fixedDenominations?: number[];
  denominationRange?: { min: number; max: number };
  selectedAmount: number | null;
  onSelectAmount: (amount: number) => void;
  currency: Currency;
}
```

#### **DeliveryMethodToggle** (`components/product-detail/DeliveryMethodToggle.tsx`)

**Appearance:**
- Two large toggle buttons
- Background: `surface_container` (#ECEEF0)
- Selected: `secondary` (#0051D5), text `on_secondary` (#FFFFFF)
- Border radius: `md` (12px)
- Padding: 16px
- Typography: `label-lg` (Inter Semi-Bold, 16px)

**Structure:**
```
[For Me Icon]       [Send as Gift Icon]
For Me              Send as Gift
Use it yourself     Email to someone
```

**Behavior:**
- Mutually exclusive selection
- Smooth transition between states (150ms)
- When "Send as Gift" selected → Show RecipientForm

**Props:**
```typescript
interface DeliveryMethodToggleProps {
  selectedMethod: DeliveryMethod;
  onSelectMethod: (method: DeliveryMethod) => void;
}
```

#### **RecipientForm** (`components/product-detail/RecipientForm.tsx`)

**Appearance:**
- Appears with slide-down animation when "Send as Gift" is selected
- Background: `surface_container_low` (#F2F4F6)
- Border radius: `lg` (16px)
- Padding: 24px

**Structure:**
```
[Label: Recipient Email]
[Input Field]
[Label: Personal Message (Optional)]
[Textarea - Max 300 chars]
[Character Count: 123/300]
```

**Validation:**
- Email: Required, valid format
- Message: Optional, max 300 characters

**Props:**
```typescript
interface RecipientFormProps {
  recipientEmail: string;
  recipientMessage: string;
  onRecipientEmailChange: (email: string) => void;
  onRecipientMessageChange: (message: string) => void;
  errors?: {
    email?: string;
    message?: string;
  };
}
```

#### **ProductInfo** (`components/product-detail/ProductInfo.tsx`)

**Appearance:**
- Section with product metadata
- Background: `surface_container_lowest` (#FFFFFF)
- Border radius: `lg` (16px)
- Padding: 24px

**Structure:**
```
[Product Logo - 120x120px]
[Brand Name - Display-SM (Archivo Black)]
[Country Badge - Pill with flag]
[Delivery Label - "📧 Digital Delivery"]
[Description - Body-MD]
[Trust Badges: "Instant", "Secure", "Support"]
```

**Props:**
```typescript
interface ProductInfoProps {
  product: GiftCardProduct;
  country: Country;
}
```

### 6.5 Checkout Components

#### **OrderSummary** (`components/checkout/OrderSummary.tsx`)

**Desktop:**
- Sticky sidebar (right side)
- Background: `surface_container_lowest` (#FFFFFF)
- Border radius: `lg` (16px)
- Padding: 32px

**Mobile:**
- Sticky bottom section
- Slides up from bottom
- Collapsible with tap

**Structure:**
```
[Headline: Order Summary]
[Product Name]
[Selected Amount: $50.00]
[Service Fee: $2.50]
[Divider - Spacing only, no line]
[Total: $52.50 - Display-SM (Archivo ExtraBold)]
```

**Props:**
```typescript
interface OrderSummaryProps {
  orderItem: OrderItem;
  onContinueAsGuest: () => void;
  onSignIn: () => void;
}
```

#### **CheckoutForm** (`components/checkout/CheckoutForm.tsx`)

**Appearance:**
- Multi-section form
- Each section background: `surface_container_lowest` (#FFFFFF)
- Border radius: `lg` (16px)
- Spacing between sections: 24px

**Structure:**
```
[Section 1: Customer Information]
  [Email Input]
  [Checkbox: Subscribe to deals]

[Section 2: Order Review]
  [Product Summary]
  [Delivery Method]
  [Recipient Email (if gift)]

[Section 3: Payment]
  [Payment Method Placeholder]
  [Continue to Payment Button]
```

**Props:**
```typescript
interface CheckoutFormProps {
  order: Order;
  onSubmit: (paymentData: any) => void;
  isProcessing: boolean;
}
```

#### **PaymentSection** (`components/checkout/PaymentSection.tsx`)

**Appearance:**
- Placeholder for Lemon Squeezy integration
- Background: `surface_container_low` (#F2F4F6)
- Border radius: `md` (12px)
- Padding: 24px

**Structure:**
```
[Icon: Credit Card]
[Text: "Secure payment powered by Lemon Squeezy"]
[Button: Continue to Payment]
```

**TODO Comments:**
```typescript
/**
 * TODO: Replace with Lemon Squeezy checkout integration
 * 
 * Implementation steps:
 * 1. Create checkout session via lemonSqueezyAdapter.createCheckoutSession(order)
 * 2. Redirect user to checkoutSession.checkoutUrl
 * 3. Lemon Squeezy handles payment collection
 * 4. User is redirected back to /success?session_id={CHECKOUT_ID}
 * 5. Webhook confirms payment and triggers fulfillment
 * 
 * Remove this placeholder entirely once integration is live.
 */
```

**Props:**
```typescript
interface PaymentSectionProps {
  order: Order;
  onPaymentInitiate: () => void;
}
```

#### **TrustBadges** (`components/checkout/TrustBadges.tsx`)

**Appearance:**
- Horizontal row of trust indicators
- Background: Transparent
- Icons: Lucide React icons in `on_surface_variant` color

**Structure:**
```
[Shield Icon] Secure Payment
[Zap Icon] Instant Delivery
[Lock Icon] 256-bit Encryption
```

**Props:**
```typescript
interface TrustBadgesProps {
  badges: Array<{ icon: LucideIcon; label: string }>;
}
```

### 6.6 Success Component

#### **SuccessSummary** (`components/success/SuccessSummary.tsx`)

**Appearance:**
- Centered on page
- Max-width: 600px
- Background: `surface_container_lowest` (#FFFFFF)
- Border radius: `lg` (16px)
- Padding: 48px (desktop), 32px (mobile)

**Structure:**
```
[Success Icon - Green checkmark in circle]
[Headline: "Gift card delivered!" - Display-MD (Archivo Black)]
[Order ID: ORD-123456]
[Product Summary]
  [Brand Logo]
  [Brand Name]
  [Amount]
  [Recipient Email (if gift)]
[Divider - Spacing]
[Next Steps Section]
  [Button: Buy Another Gift Card]
  [Link: View Order Details]
```

**Animation:**
- Entrance: Fade in + scale from 0.95 to 1.0 (400ms ease-out)
- Success icon: Checkmark draw animation (600ms)

**Props:**
```typescript
interface SuccessSummaryProps {
  order: Order;
}
```

### 6.7 UI Primitives

#### **Button** (`components/ui/Button.tsx`)

**Variants:**
- `primary`: `secondary` background, `on_secondary` text
- `secondary`: `surface_container` background, `on_surface` text
- `outline`: Transparent background, `secondary` border
- `ghost`: Transparent background, no border

**Sizes:**
- `sm`: Padding 8px 16px, `label-sm` typography
- `md`: Padding 12px 24px, `label-md` typography
- `lg`: Padding 16px 32px, `label-lg` typography

**States:**
- Default: Solid color
- Hover: Darken 10%
- Active: Scale 0.98
- Disabled: Opacity 0.5, cursor not-allowed

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}
```

#### **Input** (`components/ui/Input.tsx`)

**Appearance:**
- Background: `surface_container_low` (#F2F4F6)
- Border: 1px solid `outline_variant` at 20% opacity
- Border radius: `md` (12px)
- Padding: 12px 16px
- Typography: `body-md` (Inter Regular, 16px)

**States:**
- Default: Border subtle
- Focus: Border `secondary` (#0051D5) at 100% opacity
- Error: Border `error` (#DC2626)
- Disabled: Opacity 0.6

**Props:**
```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}
```

#### **TextArea** (`components/ui/TextArea.tsx`)

**Appearance:**
- Same as Input, but with min-height and resize control
- Min-height: 120px
- Resize: vertical only

**Props:**
```typescript
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
}
```

#### **Badge** (`components/ui/Badge.tsx`)

**Appearance:**
- Border radius: `full` (9999px)
- Padding: 4px 12px
- Typography: `label-xs` (Inter Semi-Bold, 12px, uppercase)

**Variants:**
- `default`: `surface_container` background
- `primary`: `primary_container` background
- `success`: `tertiary_fixed_dim` background
- `error`: `error_container` background

**Props:**
```typescript
interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'error';
  children: React.ReactNode;
}
```

#### **Card** (`components/ui/Card.tsx`)

**Appearance:**
- Background: `surface_container_lowest` (#FFFFFF)
- Border radius: `lg` (16px)
- Padding: 24px
- Shadow: None (follows "No Shadow" rule)

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
```

---

## 7. Routing & Navigation

### Route Structure

```
/                           → Home/Browse page
/gift-card/[slug]           → Product detail page
/checkout                   → Checkout/payment page
/success                    → Success confirmation page
/auth/verify                → Email verification page (optional)
```

### Query Parameters

**Product Detail:**
- `/gift-card/amazon-us?country=US` → Pre-select country

**Checkout:**
- `/checkout?order_id=ORD-123` → Load existing order

**Success:**
- `/success?order_id=ORD-123` → Show order confirmation
- `/success?session_id=ls_abc123` → Load order from session (Lemon Squeezy redirect)

### Navigation Flows

**Flow 1: Browse → Purchase (For Me)**
```
/ 
→ Select country (if not already selected)
→ Search or browse products
→ Click product card
→ /gift-card/[slug]
→ Select amount
→ Select "For Me"
→ Enter customer email
→ Click "Continue as Guest"
→ /checkout
→ Review order
→ Click "Continue to Payment"
→ [Lemon Squeezy checkout] (future)
→ /success?order_id=ORD-123
```

**Flow 2: Browse → Purchase (Send as Gift)**
```
/
→ Select country
→ Click product card
→ /gift-card/[slug]
→ Select amount
→ Select "Send as Gift"
→ Enter recipient email + message
→ Enter customer email
→ Click "Continue as Guest"
→ /checkout
→ Review order
→ Click "Continue to Payment"
→ [Lemon Squeezy checkout] (future)
→ /success?order_id=ORD-123
```

**Flow 3: Email Verification (Optional)**
```
/auth/verify
→ Enter email
→ Receive verification code
→ Enter code
→ Account created
→ Redirect to previous page or home
```

### Protected Routes
- None in v1 (guest checkout is primary flow)
- Future: `/account`, `/orders` will require authentication

---

## 8. State Management

### Context Providers

#### **CountryContext**
**Purpose:** Manage selected country across entire app

```typescript
// context/CountryContext.tsx

interface CountryContextType {
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country) => void;
  isLoading: boolean;
}

export const CountryProvider: React.FC<{ children: React.ReactNode }>;
export const useCountry: () => CountryContextType;
```

**Storage:** 
- LocalStorage key: `gifted_selected_country`
- Persist country selection across sessions

#### **CartContext**
**Purpose:** Manage order/cart state during purchase flow

```typescript
// context/CartContext.tsx

interface CartContextType {
  currentOrder: Order | null;
  createOrder: (config: OrderConfig) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  clearOrder: () => void;
}

export const CartProvider: React.FC<{ children: React.ReactNode }>;
export const useCart: () => CartContextType;
```

**Storage:**
- SessionStorage key: `gifted_current_order`
- Clear on successful purchase or page close

### Custom Hooks

#### **useCountry**
```typescript
// hooks/useCountry.ts

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within CountryProvider');
  }
  return context;
}
```

#### **useCart**
```typescript
// hooks/useCart.ts

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
```

#### **useBreakpoint**
```typescript
// hooks/useBreakpoint.ts

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) setBreakpoint('mobile');
      else if (width < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
}
```

---

## 9. Animation Specifications

### Principles
- **Restrained:** No bouncy or flashy animations
- **Purposeful:** Animations guide user attention or confirm actions
- **Fast:** Animations should be 150-400ms max
- **Easing:** Use `ease-out` for entrances, `ease-in-out` for state changes

### Animation Catalog

#### **Page Entrance**
```typescript
// Fade in + subtle scale
{
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
}
```

#### **Button Press**
```typescript
// Subtle scale on active
{
  whileTap: { scale: 0.98 },
  transition: { duration: 0.1 }
}
```

#### **Card Hover (Desktop)**
```typescript
// Background shift + shadow + subtle scale
{
  whileHover: {
    backgroundColor: 'var(--surface-bright)',
    scale: 1.02,
    boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.06)'
  },
  transition: { duration: 0.2, ease: 'easeOut' }
}
```

#### **Modal Entrance**
```typescript
// Backdrop fade + modal slide up (mobile) or scale (desktop)

// Backdrop
{
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

// Modal (Mobile)
{
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: { duration: 0.3, ease: 'easeOut' }
}

// Modal (Desktop)
{
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2, ease: 'easeOut' }
}
```

#### **Success Checkmark**
```typescript
// SVG path draw animation
<motion.path
  d="..." // Checkmark path
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
/>
```

#### **Sticky Element Appearance**
```typescript
// Slide in from bottom (mobile bottom nav/order summary)
{
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.3, ease: 'easeOut' }
}
```

#### **Loading Spinner**
```typescript
// Continuous rotation
{
  animate: { rotate: 360 },
  transition: { duration: 1, repeat: Infinity, ease: 'linear' }
}
```

#### **Category Chip Selection**
```typescript
// Background color transition
{
  animate: {
    backgroundColor: isSelected ? 'var(--primary-container)' : 'var(--surface-container-lowest)'
  },
  transition: { duration: 0.15 }
}
```

---

## 10. Form Validation

### Validation Schemas (Zod)

#### **Email Schema**
```typescript
// lib/utils/validation.ts

import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(100, 'Email is too long');
```

#### **Recipient Form Schema**
```typescript
export const recipientSchema = z.object({
  email: emailSchema,
  message: z
    .string()
    .max(300, 'Message cannot exceed 300 characters')
    .optional()
});
```

#### **Checkout Form Schema**
```typescript
export const checkoutSchema = z.object({
  customerEmail: emailSchema,
  subscribeToDeals: z.boolean().optional()
});
```

#### **Amount Validation**
```typescript
export const createAmountSchema = (min: number, max: number) =>
  z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number'
    })
    .min(min, `Minimum amount is ${min}`)
    .max(max, `Maximum amount is ${max}`)
    .positive('Amount must be positive');
```

### Form Handling

**React Hook Form Integration:**
```typescript
// Example usage in RecipientForm.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recipientSchema } from '@/lib/utils/validation';

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  watch
} = useForm({
  resolver: zodResolver(recipientSchema),
  mode: 'onBlur' // Validate on blur, not on every keystroke
});
```

### Error Display
- **Inline errors:** Show below input field
- **Typography:** `label-sm` (Inter Regular, 13px), `error` color (#DC2626)
- **Icon:** Optional error icon before text
- **Animation:** Fade in error message (150ms)

---

## 11. Responsive Breakpoints

### Breakpoint Definitions

```typescript
// tailwind.config.ts

export default {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
      '2xl': '1536px'  // Extra large desktop
    }
  }
}
```

### Responsive Patterns

#### **Typography Scaling**
```typescript
// Headline example
className="text-4xl md:text-5xl lg:text-6xl font-black"
```

#### **Grid Columns**
```typescript
// Product grid
className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
```

#### **Padding/Spacing**
```typescript
// Container padding
className="px-4 md:px-6 lg:px-8"

// Section spacing
className="py-8 md:py-12 lg:py-16"
```

#### **Layout Switching**
```typescript
// Stack on mobile, side-by-side on desktop
className="flex flex-col lg:flex-row gap-6 lg:gap-8"
```

#### **Hide/Show Elements**
```typescript
// Show only on desktop
className="hidden lg:block"

// Show only on mobile
className="block lg:hidden"
```

### Viewport-Specific Behaviors

**Mobile (<768px):**
- Bottom navigation visible
- Simplified header
- Single-column layouts
- Country selector via modal
- Order summary collapsible/sticky bottom

**Tablet (768px - 1023px):**
- Intermediate column counts (3 products per row)
- Slightly larger touch targets
- Bottom nav transitions to top nav

**Desktop (≥1024px):**
- Full header with all nav items
- Sticky order summary sidebar
- Hover states active
- Multi-column layouts
- Larger whitespace/margins

---

## 12. Testing Strategy

### 12.1 Playwright Configuration

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'], viewport: { width: 390, height: 844 } }
    },
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'], viewport: { width: 1024, height: 1366 } }
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### 12.2 Test Structure

#### **Visual Regression Tests**
```typescript
// tests/e2e/visual/desktop.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Desktop Visual Regression', () => {
  test('Home page matches design reference', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('desktop-home.png', {
      fullPage: true,
      threshold: 0.2 // Allow 20% difference for anti-aliasing
    });
  });

  test('Product detail page matches design reference', async ({ page }) => {
    await page.goto('/gift-card/amazon-us');
    
    await page.waitForSelector('[data-testid="amount-selector"]');
    
    await expect(page).toHaveScreenshot('desktop-product-detail.png', {
      fullPage: true,
      threshold: 0.2
    });
  });
});
```

#### **Interaction Tests**
```typescript
// tests/e2e/home.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should allow country selection', async ({ page }) => {
    await page.goto('/');
    
    // Click country selector
    await page.click('[data-testid="country-selector"]');
    
    // Verify modal opens
    await expect(page.locator('[data-testid="country-modal"]')).toBeVisible();
    
    // Select a country
    await page.click('[data-testid="country-option-US"]');
    
    // Verify country is selected
    await expect(page.locator('[data-testid="country-selector"]')).toContainText('United States');
  });

  test('should filter products by search', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    const initialCount = await page.locator('[data-testid="product-card"]').count();
    
    // Enter search query
    await page.fill('[data-testid="search-input"]', 'Amazon');
    
    // Wait for debounce
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const filteredCount = await page.locator('[data-testid="product-card"]').count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    await page.goto('/');
    
    // Click a category chip
    await page.click('[data-testid="category-chip-retail"]');
    
    // Verify URL updated
    expect(page.url()).toContain('category=retail');
    
    // Verify products are filtered
    const productCards = page.locator('[data-testid="product-card"]');
    expect(await productCards.count()).toBeGreaterThan(0);
  });
});
```

#### **Checkout Flow Test**
```typescript
// tests/e2e/checkout.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete guest checkout for "For Me" purchase', async ({ page }) => {
    // 1. Navigate to product
    await page.goto('/gift-card/amazon-us');
    
    // 2. Select amount
    await page.click('[data-testid="amount-50"]');
    
    // 3. Select "For Me"
    await page.click('[data-testid="delivery-for-me"]');
    
    // 4. Enter customer email
    await page.fill('[data-testid="customer-email"]', 'test@example.com');
    
    // 5. Continue as guest
    await page.click('[data-testid="continue-as-guest"]');
    
    // 6. Verify checkout page
    expect(page.url()).toContain('/checkout');
    
    // 7. Verify order summary
    await expect(page.locator('[data-testid="order-summary"]')).toContainText('$50.00');
    await expect(page.locator('[data-testid="order-summary"]')).toContainText('Amazon');
    
    // 8. Continue to payment (mock)
    await page.click('[data-testid="continue-to-payment"]');
    
    // 9. Verify success page
    await page.waitForURL('**/success**');
    await expect(page.locator('[data-testid="success-headline"]')).toContainText('delivered');
  });

  test('should complete guest checkout for "Send as Gift" purchase', async ({ page }) => {
    await page.goto('/gift-card/nike-us');
    
    // Select amount
    await page.click('[data-testid="amount-100"]');
    
    // Select "Send as Gift"
    await page.click('[data-testid="delivery-send-gift"]');
    
    // Fill recipient form
    await page.fill('[data-testid="recipient-email"]', 'recipient@example.com');
    await page.fill('[data-testid="recipient-message"]', 'Happy Birthday!');
    
    // Fill customer email
    await page.fill('[data-testid="customer-email"]', 'sender@example.com');
    
    // Continue as guest
    await page.click('[data-testid="continue-as-guest"]');
    
    // Verify checkout shows recipient info
    await expect(page.locator('[data-testid="recipient-info"]')).toContainText('recipient@example.com');
    await expect(page.locator('[data-testid="recipient-message-preview"]')).toContainText('Happy Birthday!');
    
    // Complete checkout
    await page.click('[data-testid="continue-to-payment"]');
    
    // Verify success
    await page.waitForURL('**/success**');
    await expect(page.locator('[data-testid="success-recipient"]')).toContainText('recipient@example.com');
  });
});
```

### 12.3 Data Test IDs

**Component Attribute Pattern:**
```typescript
// Example: ProductCard.tsx
<article data-testid={`product-card-${product.slug}`}>
  <img data-testid="product-logo" ... />
  <h3 data-testid="product-name">{product.brandName}</h3>
</article>
```

**Standard Test IDs:**
- `data-testid="country-selector"` → Country selector button
- `data-testid="country-modal"` → Country selection modal
- `data-testid="search-input"` → Search bar input
- `data-testid="category-chip-{categoryId}"` → Category filter chip
- `data-testid="product-card-{slug}"` → Product card
- `data-testid="amount-{value}"` → Amount selection button
- `data-testid="delivery-for-me"` → "For Me" toggle
- `data-testid="delivery-send-gift"` → "Send as Gift" toggle
- `data-testid="recipient-email"` → Recipient email input
- `data-testid="customer-email"` → Customer email input
- `data-testid="continue-as-guest"` → Continue as guest button
- `data-testid="order-summary"` → Order summary section
- `data-testid="success-headline"` → Success page headline

### 12.4 Visual Comparison Process

**Setup:**
1. Run app locally: `npm run dev`
2. Generate baseline screenshots: `npx playwright test --update-snapshots`
3. Store baselines in `tests/e2e/visual/__screenshots__/`

**Comparison:**
1. Run tests: `npx playwright test`
2. Playwright compares current screenshots to baselines
3. Fails if difference exceeds threshold (20%)
4. Review diff in HTML report: `npx playwright show-report`

**Acceptance Criteria:**
- Desktop home must match `desktop_flow/stitch/1._browse_home_gifted/screen.png`
- Mobile home must match `mobile_flow/stitch/1._browse_home_mobile_gifted/screen.png`
- All key screens must pass visual regression within 20% threshold
- Differences due to dynamic content (timestamps, order IDs) should be masked

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Set up project structure, design system, and basic routing

**Tasks:**
1. Initialize Next.js 14 project with TypeScript
2. Configure Tailwind CSS with design tokens
3. Create project folder structure
4. Implement color system (CSS custom properties)
5. Implement typography system (Archivo + Inter)
6. Build UI primitives (Button, Input, Card, Badge)
7. Set up routing structure (/, /gift-card/[slug], /checkout, /success)
8. Create layout components (Header, Footer, MobileBottomNav)

**Deliverables:**
- Runnable Next.js app with styled components
- Design system tokens in `globals.css`
- All route pages rendering (empty for now)

### Phase 2: Country & Data Layer (Week 1-2)
**Goal:** Implement country selection and mock data integration

**Tasks:**
1. Create country data types and mock data
2. Implement CountryContext and provider
3. Build CountrySelector component
4. Build CountryModal component
5. Create gift card types and mock data
6. Implement Reloadly adapter (mocked)
7. Implement GiftCardService
8. Add TODO comments for real integration

**Deliverables:**
- Functional country selection
- Mock gift card catalog
- Service layer with integration boundaries

### Phase 3: Browse Experience (Week 2)
**Goal:** Complete home/browse page with search and filters

**Tasks:**
1. Implement SearchBar component
2. Implement CategoryChips component
3. Implement ProductCard component
4. Implement ProductGrid component
5. Implement EmptyState component
6. Wire up search functionality (debounced)
7. Wire up category filtering
8. Add trust section
9. Implement responsive layout

**Deliverables:**
- Fully functional browse page
- Search and filter working
- Mobile and desktop layouts

### Phase 4: Product Detail (Week 2-3)
**Goal:** Complete product configuration and order creation

**Tasks:**
1. Implement ProductInfo component
2. Implement AmountSelector component (fixed + range)
3. Implement DeliveryMethodToggle component
4. Implement RecipientForm component
5. Implement OrderSummary component
6. Create CartContext and provider
7. Implement order creation logic
8. Add form validation (Zod)
9. Wire up "Continue as Guest" flow

**Deliverables:**
- Functional product detail page
- Order draft creation
- Validation working

### Phase 5: Checkout Flow (Week 3)
**Goal:** Complete checkout page with payment placeholder

**Tasks:**
1. Implement CheckoutForm component
2. Implement PaymentSection component (mocked)
3. Implement TrustBadges component
4. Create payment adapter (mocked)
5. Implement order submission logic
6. Add TODO comments for Lemon Squeezy integration
7. Wire up success redirect

**Deliverables:**
- Functional checkout page
- Mock payment flow
- Order status updates

### Phase 6: Success & Polish (Week 3-4)
**Goal:** Complete success page and add animations

**Tasks:**
1. Implement SuccessSummary component
2. Add success checkmark animation
3. Add page entrance animations
4. Add button/card hover animations
5. Implement loading states
6. Add error states and messages
7. Polish responsive behaviors
8. Add accessibility improvements

**Deliverables:**
- Polished success page
- Smooth animations throughout
- Accessible interactions

### Phase 7: Testing (Week 4)
**Goal:** Implement Playwright tests and verify against design

**Tasks:**
1. Set up Playwright configuration
2. Write visual regression tests (desktop + mobile)
3. Write interaction tests (search, filter, checkout flow)
4. Generate baseline screenshots
5. Compare against design references
6. Iterate on visual discrepancies
7. Fix any bugs found during testing
8. Run full test suite

**Deliverables:**
- Complete Playwright test suite
- Visual regression passing
- All interaction tests passing

### Phase 8: Documentation (Week 4)
**Goal:** Create README and integration guide

**Tasks:**
1. Write comprehensive README
2. Document environment variables needed
3. Document integration swap process (Reloadly + Lemon Squeezy)
4. Document deployment process
5. Create developer setup guide
6. Document known limitations

**Deliverables:**
- Production-ready README
- Integration swap guide
- Developer documentation

---

## Implementation Checklist

### Must-Have Features
- [x] Architecture document completed
- [ ] Country selection working
- [ ] Product browsing with search/filter
- [ ] Product detail with amount selection
- [ ] Delivery method selection (For Me / Send as Gift)
- [ ] Guest checkout flow
- [ ] Order summary (sticky on desktop)
- [ ] Mock payment integration
- [ ] Success confirmation page
- [ ] Responsive mobile + desktop layouts
- [ ] Visual regression tests passing
- [ ] Integration boundaries clearly marked

### Nice-to-Have Features (Future)
- [ ] User authentication
- [ ] Order history
- [ ] Save payment methods
- [ ] Wishlist
- [ ] Recently viewed products
- [ ] Recommended products
- [ ] Email notifications
- [ ] Real-time stock updates
- [ ] Multi-language support

---

## Design System Token Reference

### Color Tokens
```css
:root {
  /* Primary Navy */
  --primary: #0F172A;
  --on-primary: #FFFFFF;
  --primary-container: #131B2E;
  --on-primary-container: #7C839B;

  /* Secondary Blue */
  --secondary: #0051D5;
  --on-secondary: #FFFFFF;
  --secondary-container: #E8F1FF;
  --on-secondary-container: #003C9E;

  /* Tertiary (Success Green) */
  --tertiary: #009842;
  --on-tertiary: #FFFFFF;
  --tertiary-container: #C5F6D9;
  --on-tertiary-container: #006028;
  --tertiary-fixed-dim: #62DF7D;

  /* Error */
  --error: #DC2626;
  --on-error: #FFFFFF;
  --error-container: #FEE2E2;
  --on-error-container: #991B1B;

  /* Surface Hierarchy */
  --surface: #F7F9FB;
  --surface-bright: #FAFBFC;
  --surface-dim: #E9EBEF;
  --on-surface: #0F172A;
  --on-surface-variant: #6B7280;

  /* Surface Containers */
  --surface-container-lowest: #FFFFFF;
  --surface-container-low: #F2F4F6;
  --surface-container: #ECEEF0;
  --surface-container-high: #E6E8EA;
  --surface-container-highest: #E0E2E4;

  /* Outline */
  --outline: #9CA3AF;
  --outline-variant: #C6C6CD;

  /* Shadows */
  --ambient-shadow: 0px 12px 32px rgba(15, 23, 42, 0.06);
}
```

### Typography Tokens
```css
/* Display */
.display-lg { font-family: 'Archivo Black'; font-size: 57px; line-height: 64px; letter-spacing: -0.02em; }
.display-md { font-family: 'Archivo Black'; font-size: 45px; line-height: 52px; letter-spacing: -0.02em; }
.display-sm { font-family: 'Archivo ExtraBold'; font-size: 36px; line-height: 44px; letter-spacing: -0.02em; }

/* Headline */
.headline-lg { font-family: 'Archivo ExtraBold'; font-size: 32px; line-height: 40px; letter-spacing: -0.01em; }
.headline-md { font-family: 'Archivo ExtraBold'; font-size: 28px; line-height: 36px; letter-spacing: -0.01em; }
.headline-sm { font-family: 'Archivo ExtraBold'; font-size: 24px; line-height: 32px; }

/* Title */
.title-lg { font-family: 'Inter'; font-weight: 600; font-size: 22px; line-height: 28px; }
.title-md { font-family: 'Inter'; font-weight: 600; font-size: 18px; line-height: 24px; }
.title-sm { font-family: 'Inter'; font-weight: 600; font-size: 16px; line-height: 22px; }

/* Body */
.body-lg { font-family: 'Inter'; font-weight: 400; font-size: 18px; line-height: 28px; }
.body-md { font-family: 'Inter'; font-weight: 400; font-size: 16px; line-height: 24px; }
.body-sm { font-family: 'Inter'; font-weight: 400; font-size: 14px; line-height: 20px; }

/* Label */
.label-lg { font-family: 'Inter'; font-weight: 500; font-size: 16px; line-height: 20px; }
.label-md { font-family: 'Inter'; font-weight: 500; font-size: 14px; line-height: 18px; }
.label-sm { font-family: 'Inter'; font-weight: 500; font-size: 13px; line-height: 16px; }
.label-xs { font-family: 'Inter'; font-weight: 600; font-size: 12px; line-height: 14px; text-transform: uppercase; letter-spacing: 0.05em; }
```

### Spacing Scale (8pt Grid)
```css
--spacing-1: 0.25rem; /* 4px */
--spacing-2: 0.5rem;  /* 8px */
--spacing-3: 0.75rem; /* 12px */
--spacing-4: 1rem;    /* 16px */
--spacing-5: 1.25rem; /* 20px */
--spacing-6: 1.5rem;  /* 24px */
--spacing-7: 1.75rem; /* 28px */
--spacing-8: 2rem;    /* 32px */
--spacing-10: 2.5rem; /* 40px */
--spacing-12: 3rem;   /* 48px */
--spacing-16: 4rem;   /* 64px */
```

### Border Radius
```css
--radius-sm: 0.5rem;   /* 8px */
--radius-md: 0.75rem;  /* 12px */
--radius-lg: 1rem;     /* 16px */
--radius-xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

---

## Environment Variables

```bash
# .env.local

# Reloadly Integration (future)
# RELOADLY_CLIENT_ID=your_client_id
# RELOADLY_CLIENT_SECRET=your_client_secret
# RELOADLY_API_URL=https://giftcards.reloadly.com

# Lemon Squeezy Integration (future)
# LEMON_SQUEEZY_API_KEY=your_api_key
# LEMON_SQUEEZY_STORE_ID=your_store_id
# LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GIFTED
```

---

## Final Notes

This architecture document provides the complete technical specification for implementing GIFTED. It includes:

1. ✅ **Exact component specifications** with props, structure, and appearance
2. ✅ **Complete data models** with TypeScript interfaces
3. ✅ **Integration boundaries** with clear TODO comments for Reloadly and Lemon Squeezy
4. ✅ **Animation specifications** with Framer Motion patterns
5. ✅ **Responsive breakpoints** and patterns
6. ✅ **Testing strategy** with Playwright examples
7. ✅ **Implementation phases** with clear deliverables

**Key Integration Points:**
- **Reloadly:** `lib/giftcards/reloadly-adapter.ts` - All gift card API calls
- **Lemon Squeezy:** `lib/payments/lemon-squeezy-adapter.ts` - All payment processing
- **Webhooks:** Server-side endpoint needed for Lemon Squeezy payment confirmation

**Next Steps for CODER Agent:**
1. Initialize Next.js project with exact folder structure
2. Implement design system tokens in `globals.css`
3. Build UI primitives first (Button, Input, Card, Badge)
4. Follow implementation phases sequentially
5. Add `data-testid` attributes to all interactive elements
6. Leave explicit TODO comments at integration boundaries

**Next Steps for TESTER Agent:**
1. Set up Playwright with provided config
2. Generate baseline screenshots from design references
3. Run visual regression tests on each completed phase
4. Verify responsive behavior on all breakpoints
5. Test all interaction flows (search, filter, checkout)
6. Report any visual discrepancies for iteration

This specification is complete and actionable. The CODER can begin implementation immediately.
