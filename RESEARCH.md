# GIFTED - Research & Implementation Insights

**Created by:** RESEARCHER Agent (Swarm)  
**Date:** 2026-03-26  
**Purpose:** Provide comprehensive context, best practices, and actionable insights for CODER and TESTER agents

---

## Table of Contents

1. [Design System Implementation](#1-design-system-implementation)
2. [Reloadly API Integration](#2-reloadly-api-integration)
3. [Lemon Squeezy Payment Integration](#3-lemon-squeezy-payment-integration)
4. [Playwright Visual Regression Testing](#4-playwright-visual-regression-testing)
5. [Next.js 14 App Router Best Practices](#5-nextjs-14-app-router-best-practices)
6. [Framer Motion Animation Guidelines](#6-framer-motion-animation-guidelines)
7. [Accessibility Best Practices](#7-accessibility-best-practices)
8. [Form Validation with React Hook Form + Zod](#8-form-validation-with-react-hook-form--zod)
9. [Common Pitfalls & Solutions](#9-common-pitfalls--solutions)
10. [Performance Optimization Checklist](#10-performance-optimization-checklist)

---

## 1. Design System Implementation

### 1.1 The "Architectural Ledger" Aesthetic

**Core Principle:** Swiss minimalism meets premium financial ledgers. No fluff, no gradients, no glassmorphism—just precision, trust, and intentional whitespace.

**Key Design Rules:**
1. **The "No-Line Rule"** - Use background color shifts instead of 1px borders for section separation
2. **Heavy-weight Typography** - Archivo Black for headlines, Inter for UI/body text
3. **Tonal Layering** - Create depth through surface hierarchy, not shadows
4. **Intentional Asymmetry** - Use the 8pt grid to create unexpected whitespace

### 1.2 Implementing Design Tokens in Tailwind

**Resource:** [Tailwind CSS Theme Variables](https://tailwindcss.com/docs/theme)

**Strategy:** Use CSS custom properties for all design tokens, then reference them in `tailwind.config.ts`.

**Implementation Pattern:**

```css
/* globals.css */
@layer base {
  :root {
    /* Color Tokens - Primary Palette */
    --color-primary: #0F172A;           /* Navy */
    --color-on-primary: #FFFFFF;
    --color-primary-container: #131B2E;
    --color-on-primary-container: #7C839B;

    /* Surface Hierarchy - "Stacked Paper" */
    --color-surface: #F7F9FB;                    /* Base page background */
    --color-surface-bright: #FAFBFC;
    --color-surface-container-lowest: #FFFFFF;   /* Primary content cards */
    --color-surface-container-low: #F2F4F6;
    --color-surface-container: #ECEEF0;          /* Nested elements */
    --color-surface-container-high: #E6E8EA;

    /* Secondary & Accent */
    --color-secondary: #0051D5;                  /* CTA Blue */
    --color-on-secondary: #FFFFFF;
    
    /* Success/Tertiary */
    --color-tertiary-fixed-dim: #62DF7D;
    --color-on-tertiary-container: #009842;
    
    /* Error */
    --color-error: #D32F2F;
    --color-on-error: #FFFFFF;

    /* Borders (use sparingly!) */
    --color-outline-variant: #C6C6CD;  /* 30% opacity for "ghost borders" */

    /* Spacing (8pt grid) */
    --spacing-1: 0.125rem;  /* 2px */
    --spacing-2: 0.25rem;   /* 4px */
    --spacing-3: 0.5rem;    /* 8px */
    --spacing-4: 1rem;      /* 16px */
    --spacing-6: 1.5rem;    /* 24px */
    --spacing-8: 2rem;      /* 32px */
    --spacing-12: 3rem;     /* 48px */
    --spacing-16: 4rem;     /* 64px */

    /* Border Radius */
    --radius-sm: 0.5rem;    /* 8px - tight corners */
    --radius-md: 0.75rem;   /* 12px - buttons, inputs */
    --radius-lg: 1rem;      /* 16px - product cards */
    --radius-full: 9999px;  /* pills */

    /* Shadows (use only for floating elements) */
    --shadow-ambient: 0px 12px 32px rgba(15, 23, 42, 0.06);
  }

  /* Typography Classes */
  .display-lg {
    font-family: 'Archivo Black', sans-serif;
    font-size: 3.5rem;      /* 56px */
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .headline-lg {
    font-family: 'Archivo Black', sans-serif;
    font-size: 2rem;        /* 32px */
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .headline-sm {
    font-family: 'Archivo ExtraBold', sans-serif;
    font-size: 1.5rem;      /* 24px */
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .title-lg {
    font-family: 'Inter', sans-serif;
    font-size: 1.25rem;     /* 20px */
    font-weight: 600;
    line-height: 1.4;
  }

  .body-lg {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;        /* 16px */
    font-weight: 400;
    line-height: 1.5;
  }

  .body-md {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;    /* 14px */
    font-weight: 400;
    line-height: 1.5;
  }

  .label-lg {
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;    /* 14px */
    font-weight: 600;
    line-height: 1.4;
    letter-spacing: 0.01em;
  }

  .label-md {
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;     /* 12px */
    font-weight: 500;
    line-height: 1.4;
  }

  .label-sm {
    font-family: 'Archivo', sans-serif;
    font-size: 0.625rem;    /* 10px */
    font-weight: 700;
    line-height: 1.2;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}
```

**Tailwind Config:**

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'on-primary': 'var(--color-on-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary-container': 'var(--color-on-primary-container)',
        
        surface: 'var(--color-surface)',
        'surface-bright': 'var(--color-surface-bright)',
        'surface-container-lowest': 'var(--color-surface-container-lowest)',
        'surface-container-low': 'var(--color-surface-container-low)',
        'surface-container': 'var(--color-surface-container)',
        'surface-container-high': 'var(--color-surface-container-high)',
        
        secondary: 'var(--color-secondary)',
        'on-secondary': 'var(--color-on-secondary)',
        
        tertiary: 'var(--color-tertiary-fixed-dim)',
        'on-tertiary': 'var(--color-on-tertiary-container)',
        
        error: 'var(--color-error)',
        'on-error': 'var(--color-on-error)',
        
        outline: 'var(--color-outline-variant)',
      },
      spacing: {
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'ambient': 'var(--shadow-ambient)',
      },
      fontFamily: {
        'archivo': ['Archivo Black', 'Archivo ExtraBold', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Font Loading (Next.js):**

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const archivoBlack = localFont({
  src: [
    {
      path: '../public/fonts/ArchivoBlack-Regular.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-archivo',
  display: 'swap',
});

// Use in className: `${inter.variable} ${archivoBlack.variable}`
```

### 1.3 Implementing the "No-Line Rule"

**Instead of this (borders):**
```tsx
<div className="border-b border-gray-200">
  <header>Content</header>
</div>
<div>
  <main>More content</main>
</div>
```

**Do this (tonal layering):**
```tsx
<div className="bg-surface-container-lowest">
  <header className="px-6 py-4">Content</header>
</div>
<div className="bg-surface-container-low">
  <main className="px-6 py-8">More content</main>
</div>
```

**For form inputs (only exception):**
```tsx
<input 
  className="bg-surface-container-low border border-outline/30 
             focus:border-secondary focus:border-opacity-100 
             rounded-md px-4 py-3 transition-colors"
/>
```

### 1.4 Component Style Patterns

**Product Cards (no borders):**
```tsx
<div className="bg-surface-container-lowest rounded-lg p-6 
                hover:bg-surface-bright 
                transition-colors duration-200">
  {/* Card content */}
</div>
```

**CTAs (high-conviction):**
```tsx
<button className="bg-secondary text-on-secondary 
                   px-8 py-4 rounded-md 
                   hover:brightness-110 
                   transition-all duration-200">
  Continue as Guest
</button>
```

**Country Selector Pills:**
```tsx
<button className="bg-surface-container-high text-primary 
                   px-4 py-2 rounded-full 
                   hover:bg-primary-container hover:text-on-primary-container
                   transition-colors duration-200">
  🇺🇸 United States (USD)
</button>
```

---

## 2. Reloadly API Integration

### 2.1 Overview

**Official Docs:** [https://developers.reloadly.com/gift-cards/quickstart](https://developers.reloadly.com/gift-cards/quickstart)  
**API Base URL:** `https://giftcards.reloadly.com`  
**Auth Method:** OAuth2 client credentials flow

### 2.2 Authentication Flow

**Step 1: Get Access Token**

```typescript
// lib/giftcards/reloadly-adapter.ts

interface ReloadlyAuthResponse {
  access_token: string;
  expires_in: number;  // Seconds until expiration
  token_type: 'Bearer';
}

async function getAccessToken(): Promise<string> {
  const response = await fetch('https://auth.reloadly.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.RELOADLY_CLIENT_ID,
      client_secret: process.env.RELOADLY_CLIENT_SECRET,
      grant_type: 'client_credentials',
      audience: 'https://giftcards.reloadly.com'
    })
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate with Reloadly');
  }

  const data: ReloadlyAuthResponse = await response.json();
  
  // Cache token with 5-minute safety margin before expiration
  const expiresAt = new Date(Date.now() + (data.expires_in - 300) * 1000);
  
  return data.access_token;
}
```

**Best Practice:** Implement token caching to avoid unnecessary auth requests. Tokens are valid for several hours.

### 2.3 Fetching Gift Card Products

**Endpoint:** `GET /products`

**Query Parameters:**
- `countryCode` (required) - ISO 3166-1 alpha-2 code (e.g., "US")
- `page` (optional) - Page number for pagination
- `size` (optional) - Items per page (max 200)

**Response Schema:**
```typescript
interface ReloadlyProduct {
  productId: number;
  productName: string;
  global: boolean;
  senderFee: number;
  discountPercentage: number;
  denominationType: 'FIXED' | 'RANGE';
  recipientCurrencyCode: string;
  minRecipientDenomination: number | null;
  maxRecipientDenomination: number | null;
  senderCurrencyCode: string;
  fixedRecipientDenominations: number[] | null;
  fixedSenderDenominations: number[] | null;
  logoUrls: string[];
  brand: {
    brandId: number;
    brandName: string;
  };
  country: {
    isoName: string;
    name: string;
  };
  redeemInstruction: {
    concise: string;
    verbose: string;
  };
  category: {
    id: number;
    name: string;
  };
}

interface ReloadlyProductsResponse {
  content: ReloadlyProduct[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}
```

**Implementation Example:**

```typescript
async function getGiftCardsByCountry(countryCode: string): Promise<GiftCardProduct[]> {
  const token = await getAccessToken();
  
  const response = await fetch(
    `https://giftcards.reloadly.com/products?countryCode=${countryCode}&size=200`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data: ReloadlyProductsResponse = await response.json();
  
  // Map to local GiftCardProduct interface
  return data.content.map(mapReloadlyProductToLocal);
}
```

### 2.4 Data Mapping Strategy

**Key Transformations:**
1. **Product ID:** `reloadlyProduct.productId.toString()` → `GiftCardProduct.id`
2. **Slug Generation:** Create URL-friendly slug from `productName`
3. **Categories:** Map Reloadly category to local category system
4. **Denominations:** Handle both FIXED and RANGE types
5. **Service Fee:** Calculate from `discountPercentage` or use flat 5.5%

**Slug Generator:**
```typescript
function generateSlug(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

### 2.5 Error Handling

**Common Errors:**
- `401 Unauthorized` - Token expired or invalid credentials
- `429 Too Many Requests` - Rate limit exceeded (implement exponential backoff)
- `503 Service Unavailable` - Reloadly API down (show graceful error message)

**Retry Strategy:**
```typescript
async function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetcher();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 2.6 Environment Variables

```bash
# .env.local
RELOADLY_CLIENT_ID=your_client_id_here
RELOADLY_CLIENT_SECRET=your_client_secret_here
RELOADLY_API_URL=https://giftcards.reloadly.com
RELOADLY_AUTH_URL=https://auth.reloadly.com
```

### 2.7 Testing Strategy (Mocked Version)

**Mock Data Structure:**
```typescript
// lib/giftcards/mock-data.ts
export const MOCK_RELOADLY_PRODUCTS: GiftCardProduct[] = [
  {
    id: '1',
    slug: 'amazon-us',
    brandName: 'Amazon',
    description: 'Shop millions of products on Amazon.com',
    logoUrl: '/brand-logos/amazon.png',
    categories: ['retail', 'electronics'],
    availableCountries: ['US', 'CA', 'GB'],
    denominationType: 'FIXED',
    fixedDenominations: [25, 50, 100, 200],
    currency: 'USD',
    serviceFeePercent: 5.5,
    deliveryType: 'DIGITAL',
  },
  // ... more products
];
```

**Swap Point (in reloadly-adapter.ts):**
```typescript
async getGiftCardsByCountry(countryCode: string): Promise<GiftCardProduct[]> {
  // TODO: SWAP POINT - Replace with real Reloadly API call
  // 1. Remove this mock data filter
  // 2. Uncomment the real API call below
  // 3. Ensure RELOADLY_CLIENT_ID and RELOADLY_CLIENT_SECRET are set in .env
  
  return MOCK_RELOADLY_PRODUCTS.filter(product =>
    product.availableCountries.includes(countryCode)
  );
  
  // REAL IMPLEMENTATION (uncomment when ready):
  // const token = await this.getAccessToken();
  // const response = await fetch(...);
  // return data.content.map(this.mapToLocal);
}
```

---

## 3. Lemon Squeezy Payment Integration

### 3.1 Overview

**Official Docs:** [https://docs.lemonsqueezy.com](https://docs.lemonsqueezy.com)  
**Webhook Guide:** [https://docs.lemonsqueezy.com/guides/tutorials/webhooks-nextjs](https://docs.lemonsqueezy.com/guides/tutorials/webhooks-nextjs)  
**Integration Type:** Hosted checkout (user redirects to Lemon Squeezy, then returns)

### 3.2 Checkout Flow

**Step 1: Create Checkout Session**

```typescript
// lib/payments/lemon-squeezy-adapter.ts

interface CreateCheckoutRequest {
  orderId: string;
  productName: string;
  amount: number;
  currency: string;
  customerEmail: string;
  recipientEmail?: string;
  giftMessage?: string;
}

interface LemonSqueezyCheckoutResponse {
  data: {
    id: string;
    type: 'checkouts';
    attributes: {
      url: string;  // Redirect user here
      expires_at: string;
    };
  };
}

async function createCheckoutSession(
  request: CreateCheckoutRequest
): Promise<string> {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: {
            email: request.customerEmail,
            custom: {
              order_id: request.orderId,
              recipient_email: request.recipientEmail,
              gift_message: request.giftMessage,
            },
          },
          product_options: {
            name: request.productName,
            description: `Gift card for ${request.productName}`,
          },
          checkout_options: {
            embed: false,
            button_color: '#0051D5',
          },
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: process.env.LEMONSQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: 'variants',
              id: process.env.LEMONSQUEEZY_VARIANT_ID,  // Your gift card product variant
            },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const data: LemonSqueezyCheckoutResponse = await response.json();
  return data.data.attributes.url;  // Return checkout URL for redirect
}
```

**Step 2: Redirect User**

```typescript
// In your checkout page component
const handleCheckout = async () => {
  const checkoutUrl = await createCheckoutSession({
    orderId: order.id,
    productName: order.item.brandName,
    amount: order.item.total,
    currency: order.item.currency,
    customerEmail: order.customerEmail,
    recipientEmail: order.recipient?.email,
    giftMessage: order.recipient?.message,
  });
  
  // Redirect to Lemon Squeezy checkout
  window.location.href = checkoutUrl;
};
```

### 3.3 Webhook Verification (Critical!)

**Why:** Prevents malicious actors from sending fake payment confirmations.

**Implementation (Next.js Route Handler):**

```typescript
// app/api/webhooks/lemon-squeezy/route.ts
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set!');
    return NextResponse.json('Server misconfigured', { status: 500 });
  }

  // Step 1: Get raw body and signature
  const rawBody = await request.text();
  const signature = Buffer.from(
    request.headers.get('X-Signature') ?? '',
    'hex'
  );

  if (signature.length === 0 || rawBody.length === 0) {
    return NextResponse.json('Invalid request', { status: 400 });
  }

  // Step 2: Verify signature using HMAC SHA256
  const hmac = Buffer.from(
    crypto.createHmac('sha256', secret).update(rawBody).digest('hex'),
    'hex'
  );

  if (!crypto.timingSafeEqual(hmac, signature)) {
    console.error('Invalid webhook signature!');
    return NextResponse.json('Unauthorized', { status: 401 });
  }

  // Step 3: Parse and process webhook data
  const data = JSON.parse(rawBody);
  const eventName = data['meta']['event_name'];
  const attributes = data['data']['attributes'];
  const customData = attributes['first_order_item']?.['order']?.['custom'];

  console.log(`Received webhook: ${eventName}`);

  // Step 4: Handle different event types
  switch (eventName) {
    case 'order_created':
      await handleOrderCreated(customData.order_id, attributes);
      break;
    
    case 'order_refunded':
      await handleOrderRefunded(customData.order_id);
      break;
    
    default:
      console.log(`Unhandled event: ${eventName}`);
  }

  return NextResponse.json('OK', { status: 200 });
}

async function handleOrderCreated(orderId: string, attributes: any) {
  // TODO: Update order status in database
  // TODO: Trigger gift card delivery (Reloadly order placement)
  console.log(`Order ${orderId} paid successfully`);
}

async function handleOrderRefunded(orderId: string) {
  // TODO: Mark order as refunded
  // TODO: Void gift card if possible
  console.log(`Order ${orderId} refunded`);
}
```

### 3.4 Event Types to Handle

**Essential Events:**
- `order_created` - Payment completed, trigger fulfillment
- `order_refunded` - Refund processed, handle accordingly

**Subscription Events (if implementing recurring gifts):**
- `subscription_created`
- `subscription_updated`
- `subscription_cancelled`
- `subscription_payment_success`

### 3.5 Testing Webhooks

**Test Mode:** Lemon Squeezy provides a Test Mode for safe testing.

**Webhook Simulation:**
1. Create test purchases in Test Mode
2. Use Lemon Squeezy dashboard to manually trigger webhook events
3. Monitor your webhook endpoint logs

**Local Development with ngrok:**
```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Expose localhost to internet
ngrok http 3000

# Use ngrok URL in Lemon Squeezy webhook settings
# Example: https://abc123.ngrok.io/api/webhooks/lemon-squeezy
```

### 3.6 Environment Variables

```bash
# .env.local
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_VARIANT_ID=your_product_variant_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
```

**Where to find these:**
- API Key: Settings → API → Create new token
- Store ID: Settings → Stores → Copy ID
- Variant ID: Products → Select product → Copy variant ID
- Webhook Secret: Settings → Webhooks → Create webhook → Copy secret

### 3.7 Mocked Implementation

**For CODER:** Implement a simple mock that simulates the checkout flow without real payment.

```typescript
// lib/payments/mock-checkout.ts

export async function mockCreateCheckout(request: CreateCheckoutRequest): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Store checkout session in memory/localStorage
  const sessionId = `mock_session_${Date.now()}`;
  
  // TODO: SWAP POINT - Replace with real Lemon Squeezy checkout creation
  // 1. Remove this mock implementation
  // 2. Use createCheckoutSession from lemon-squeezy-adapter.ts
  // 3. Ensure LEMONSQUEEZY_API_KEY and LEMONSQUEEZY_STORE_ID are set
  
  // Return mock checkout URL (goes to local success page immediately)
  return `/checkout/mock-success?session=${sessionId}&order=${request.orderId}`;
}

// Mock success handler (simulates webhook callback)
export async function mockHandlePaymentSuccess(orderId: string): Promise<void> {
  // TODO: SWAP POINT - This will be replaced by real webhook handler
  // In production, Lemon Squeezy webhooks will call /api/webhooks/lemon-squeezy
  
  console.log(`[MOCK] Payment successful for order ${orderId}`);
  
  // Update order status
  // Trigger gift card delivery
}
```

---

## 4. Playwright Visual Regression Testing

### 4.1 Overview

**Official Docs:** [https://playwright.dev/docs/test-snapshots](https://playwright.dev/docs/test-snapshots)  
**Purpose:** Ensure implementation matches design references pixel-perfectly

### 4.2 Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,  // Run visual tests sequentially for consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Desktop Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'Tablet iPad Pro',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4.3 Visual Regression Test Pattern

**Best Practice:** Compare against design reference screenshots, not auto-generated baselines.

```typescript
// tests/e2e/visual/desktop.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Desktop Visual Regression', () => {
  test('Browse/Home page matches design reference', async ({ page }) => {
    // Navigate to page
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for images to load
    await page.waitForSelector('img[src*="brand-logos"]', { state: 'visible' });
    
    // Mask dynamic content (dates, timestamps, etc.)
    await page.addStyleTag({
      content: `
        [data-testid="current-date"] { visibility: hidden !important; }
        [data-testid="user-greeting"] { visibility: hidden !important; }
      `
    });
    
    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: true });
    
    // Compare against design reference
    // Note: First run will create baseline, subsequent runs compare against it
    expect(screenshot).toMatchSnapshot('desktop-home.png', {
      maxDiffPixels: 100,  // Allow small differences (anti-aliasing, etc.)
      threshold: 0.2,      // 20% pixel difference threshold
    });
  });

  test('Product detail page matches design reference', async ({ page }) => {
    await page.goto('/gift-card/amazon-us');
    await page.waitForLoadState('networkidle');
    
    // Select a specific amount to ensure consistent state
    await page.click('[data-testid="amount-50"]');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot('desktop-product-detail.png', {
      maxDiffPixels: 100,
    });
  });

  test('Checkout page matches design reference', async ({ page }) => {
    // Setup: Add item to cart first
    await page.goto('/gift-card/amazon-us');
    await page.click('[data-testid="amount-100"]');
    await page.click('[data-testid="delivery-for-me"]');
    await page.click('[data-testid="continue-to-checkout"]');
    
    await page.waitForLoadState('networkidle');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot('desktop-checkout.png', {
      maxDiffPixels: 100,
    });
  });

  test('Success page matches design reference', async ({ page }) => {
    // Use mock success page with consistent order data
    await page.goto('/success?order=mock_order_123');
    await page.waitForLoadState('networkidle');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot('desktop-success.png', {
      maxDiffPixels: 100,
    });
  });
});
```

### 4.4 Mobile Visual Regression

```typescript
// tests/e2e/visual/mobile.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Mobile Visual Regression', () => {
  test('Mobile home page matches design reference', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure mobile bottom nav is visible
    await page.waitForSelector('[data-testid="mobile-bottom-nav"]');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot('mobile-home.png', {
      maxDiffPixels: 100,
    });
  });

  test('Mobile product detail matches design reference', async ({ page }) => {
    await page.goto('/gift-card/amazon-us');
    await page.waitForLoadState('networkidle');
    
    // Select amount
    await page.click('[data-testid="amount-50"]');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchSnapshot('mobile-product-detail.png', {
      maxDiffPixels: 100,
    });
  });
});
```

### 4.5 Handling Dynamic Content

**Problem:** Dates, timestamps, random IDs cause false positives.

**Solution:** Mask or replace dynamic content.

```typescript
// Option 1: CSS masking
await page.addStyleTag({
  content: `
    [data-dynamic="true"] { visibility: hidden !important; }
  `
});

// Option 2: Replace content before screenshot
await page.evaluate(() => {
  document.querySelectorAll('[data-testid="timestamp"]').forEach(el => {
    el.textContent = 'March 26, 2026';
  });
});

// Option 3: Mask specific regions
const screenshot = await page.screenshot({
  fullPage: true,
  mask: [page.locator('[data-testid="dynamic-ad"]')],
});
```

### 4.6 Baseline Management

**Initial Baseline Creation:**
```bash
# Generate baseline screenshots from design references
npm run test:visual -- --update-snapshots
```

**Updating Baselines (after intentional design changes):**
```bash
npm run test:visual -- --update-snapshots
```

**Reviewing Failures:**
```bash
# Opens HTML report with diff images
npx playwright show-report
```

**Diff Output Locations:**
- Baseline: `tests/e2e/visual/__screenshots__/desktop-home.png`
- Actual: `test-results/visual-desktop-chrome/desktop-home-actual.png`
- Diff: `test-results/visual-desktop-chrome/desktop-home-diff.png`

### 4.7 Comparison Against Design References

**Strategy:** Store design reference screenshots in the repo and compare programmatically.

```typescript
// tests/e2e/visual/design-reference.spec.ts
import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

test('Home page matches design reference screenshot', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const actual = await page.screenshot({ fullPage: true });
  const reference = readFileSync(
    join(__dirname, '../../design-refs/desktop_flow/stitch/1._browse_home_gifted/screen.png')
  );
  
  // Use pixelmatch or built-in comparison
  expect(actual).toMatchSnapshot(reference, {
    maxDiffPixelRatio: 0.02,  // 2% of pixels can differ
  });
});
```

### 4.8 CI/CD Integration

**GitHub Actions Example:**

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run visual regression tests
        run: npm run test:visual
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 5. Next.js 14 App Router Best Practices

### 5.1 Server Components vs Client Components

**Official Docs:** [https://nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

**Rule of Thumb:** Use Server Components by default, Client Components only when needed.

**When to Use Server Components:**
- Fetching data
- Accessing backend resources directly
- Keeping sensitive information on the server (API keys, tokens)
- Reducing client-side JavaScript

**When to Use Client Components (`'use client'`):**
- Event listeners (`onClick`, `onChange`, etc.)
- State (`useState`, `useReducer`)
- Effects (`useEffect`, `useLayoutEffect`)
- Browser-only APIs (`localStorage`, `window`, `navigator`)
- Custom hooks that use the above

### 5.2 Component Composition Pattern

**✅ Recommended Pattern:**

```typescript
// app/page.tsx (Server Component - no 'use client')
import { ProductGrid } from '@/components/products/ProductGrid';
import { SearchBar } from '@/components/search/SearchBar';  // Client Component

export default async function HomePage() {
  // Fetch data on the server
  const products = await getGiftCards('US');
  
  return (
    <div>
      <h1>Browse Gift Cards</h1>
      
      {/* Client Component (has interactivity) */}
      <SearchBar />
      
      {/* Server Component (just renders data) */}
      <ProductGrid products={products} />
    </div>
  );
}
```

```typescript
// components/search/SearchBar.tsx (Client Component)
'use client';

import { useState } from 'react';

export function SearchBar() {
  const [query, setQuery] = useState('');
  
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search gift cards..."
    />
  );
}
```

```typescript
// components/products/ProductGrid.tsx (Server Component)
// NO 'use client' directive - stays on server

import { ProductCard } from './ProductCard';

interface Props {
  products: GiftCardProduct[];
}

export function ProductGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 5.3 Data Fetching Strategies

**Server-Side Fetching (Recommended for GIFTED):**

```typescript
// app/page.tsx
import { getGiftCardsByCountry } from '@/lib/giftcards/service';

export default async function HomePage() {
  // This runs on the server, never on client
  const products = await getGiftCardsByCountry('US');
  
  return <ProductGrid products={products} />;
}

// Optional: Configure revalidation
export const revalidate = 3600; // Revalidate every hour
```

**Client-Side Fetching (when needed):**

```typescript
'use client';

import { useEffect, useState } from 'react';

export function DynamicProductList() {
  const [products, setProducts] = useState<GiftCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <Skeleton />;
  return <ProductGrid products={products} />;
}
```

### 5.4 Loading States

**Use `loading.tsx` for automatic loading UI:**

```typescript
// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
    </div>
  );
}
```

**Or use Suspense for granular control:**

```typescript
// app/page.tsx
import { Suspense } from 'react';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductGridSkeleton } from '@/components/products/ProductGridSkeleton';

export default function HomePage() {
  return (
    <div>
      <h1>Browse Gift Cards</h1>
      
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
```

### 5.5 Error Handling

**Use `error.tsx` for automatic error boundaries:**

```typescript
// app/error.tsx
'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="headline-lg mb-4">Something went wrong!</h2>
      <p className="body-lg mb-6 text-on-primary-container">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={reset}
        className="bg-secondary text-on-secondary px-6 py-3 rounded-md"
      >
        Try again
      </button>
    </div>
  );
}
```

### 5.6 Metadata & SEO

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GIFTED - Premium Digital Gift Cards',
  description: 'Buy digital gift cards from top brands worldwide. Instant delivery, secure checkout.',
  openGraph: {
    title: 'GIFTED - Premium Digital Gift Cards',
    description: 'Buy digital gift cards from top brands worldwide.',
    images: ['/og-image.png'],
  },
};

export default function HomePage() {
  // ...
}
```

**Dynamic Metadata:**

```typescript
// app/gift-card/[slug]/page.tsx
import { Metadata } from 'next';
import { getProductBySlug } from '@/lib/giftcards/service';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  
  return {
    title: `${product.brandName} Gift Card | GIFTED`,
    description: product.description,
    openGraph: {
      images: [product.logoUrl],
    },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  return <ProductDetail product={product} />;
}
```

### 5.7 Route Handlers (API Routes)

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGiftCardsByCountry } from '@/lib/giftcards/service';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country') || 'US';
  
  try {
    const products = await getGiftCardsByCountry(country);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

### 5.8 Performance Optimizations

**Image Optimization:**

```typescript
import Image from 'next/image';

<Image
  src={product.logoUrl}
  alt={product.brandName}
  width={200}
  height={200}
  className="object-contain"
  priority={index < 6}  // Prioritize above-the-fold images
/>
```

**Font Optimization:**

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',  // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

**Code Splitting:**

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const CountryModal = dynamic(() => import('@/components/country/CountryModal'), {
  loading: () => <div>Loading...</div>,
  ssr: false,  // Don't render on server if not needed
});
```

---

## 6. Framer Motion Animation Guidelines

### 6.1 Animation Philosophy for GIFTED

**Source:** [Motion.dev Easing Functions](https://motion.dev/docs/easing-functions)

**Core Principles:**
- **Restrained** - No bouncy, flashy animations
- **Fast** - 200-400ms max duration
- **Purposeful** - Only animate to improve UX, not for decoration
- **Premium feel** - Use easeOut for responsiveness, avoid spring physics

### 6.2 Recommended Easing Curves

**For Enter/Exit Transitions:**
- **easeOut** - `[0.0, 0.0, 0.2, 1.0]`
- **Duration:** 0.2-0.3 seconds
- **Why:** Gives feeling of responsiveness (fast start, slow end)

**For Hover States:**
- **easeInOut** - `[0.4, 0.0, 0.2, 1.0]`
- **Duration:** 0.15-0.2 seconds
- **Why:** Smooth, controlled motion

**For Success/Confirmation:**
- **easeOut** - `[0.0, 0.0, 0.2, 1.0]`
- **Duration:** 0.4 seconds
- **Why:** Allows user to appreciate the success state

### 6.3 Implementation Patterns

**Button Press Feedback:**

```typescript
import { motion } from 'framer-motion';

<motion.button
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.1 }}
  className="bg-secondary text-on-secondary px-8 py-4 rounded-md"
>
  Continue as Guest
</motion.button>
```

**Card Hover Elevation:**

```typescript
<motion.div
  whileHover={{ 
    y: -4,
    transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1.0] }
  }}
  className="bg-surface-container-lowest rounded-lg p-6 cursor-pointer"
>
  {/* Product card content */}
</motion.div>
```

**Page Entrance:**

```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }}
>
  {/* Page content */}
</motion.div>
```

**Modal/Dialog Appearance:**

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
  className="fixed inset-0 z-50 flex items-center justify-center"
>
  <div className="bg-surface-container-lowest rounded-lg p-8 max-w-lg">
    {/* Modal content */}
  </div>
</motion.div>
```

**List Stagger (Category Chips):**

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,  // 50ms delay between each chip
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

<motion.div
  variants={container}
  initial="hidden"
  animate="show"
  className="flex gap-2 overflow-x-auto"
>
  {categories.map(cat => (
    <motion.button
      key={cat.id}
      variants={item}
      transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
      className="category-chip"
    >
      {cat.label}
    </motion.button>
  ))}
</motion.div>
```

**Success Checkmark Animation:**

```typescript
import { motion } from 'framer-motion';

const checkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      pathLength: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] },
      opacity: { duration: 0.2 }
    }
  }
};

<motion.svg
  width="64"
  height="64"
  viewBox="0 0 64 64"
  initial="hidden"
  animate="visible"
>
  <motion.path
    d="M16 32 L28 44 L48 20"
    fill="none"
    stroke="var(--color-tertiary-fixed-dim)"
    strokeWidth="4"
    variants={checkVariants}
  />
</motion.svg>
```

### 6.4 Scroll-Triggered Animations (Use Sparingly)

```typescript
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: [0.0, 0.0, 0.2, 1.0] }}
    >
      {children}
    </motion.div>
  );
}
```

### 6.5 Layout Animations (AnimatePresence)

**For conditional rendering (modals, dropdowns):**

```typescript
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2, ease: [0.0, 0.0, 0.2, 1.0] }}
    >
      {/* Dropdown content */}
    </motion.div>
  )}
</AnimatePresence>
```

### 6.6 Don'ts for Premium Feel

**❌ Avoid:**
- Spring physics (`type: "spring"`) - Too bouncy for this aesthetic
- Long durations (>0.5s) - Feels sluggish
- Excessive rotation/scaling - Feels gimmicky
- Continuous animations (infinite spinners outside of loading states)
- Over-animating - Not every element needs motion

**✅ Prefer:**
- Opacity fades
- Subtle Y-axis translations (-4px to 20px max)
- Scale (0.95-1.02 range only)
- Fast, decisive motion
- Animations that provide feedback or improve usability

---

## 7. Accessibility Best Practices

### 7.1 WCAG Compliance Overview

**Target:** WCAG 2.1 Level AA compliance  
**Official Guide:** [WebAIM Keyboard Accessibility](https://webaim.org/techniques/keyboard/)

**Core Requirements:**
1. **Keyboard Navigation** - All interactive elements accessible via keyboard
2. **Visible Focus States** - Clear indication of keyboard focus
3. **Semantic HTML** - Proper heading hierarchy, landmarks, roles
4. **Sufficient Contrast** - Text readable against backgrounds
5. **Screen Reader Support** - Meaningful labels and ARIA attributes

### 7.2 Keyboard Navigation Implementation

**Rule:** All functionality available via keyboard (Tab, Enter, Space, Arrow keys).

**Testing:** Navigate entire app using only keyboard.

**Focus Management:**

```typescript
// Ensure logical tab order
<form>
  <input tabIndex={1} />  {/* First */}
  <select tabIndex={2} />  {/* Second */}
  <button tabIndex={3}>Submit</button>  {/* Third */}
</form>

// Or rely on DOM order (recommended)
<form>
  <input />
  <select />
  <button>Submit</button>
</form>
```

**Visible Focus States:**

```css
/* globals.css */
@layer base {
  *:focus-visible {
    outline: 2px solid var(--color-secondary);
    outline-offset: 2px;
  }
  
  button:focus-visible {
    outline: 2px solid var(--color-secondary);
    outline-offset: 4px;
  }
}
```

**Custom Focus Styles:**

```typescript
<button className="focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
  Add to Cart
</button>
```

### 7.3 Semantic HTML

**Use proper heading hierarchy:**

```tsx
// ✅ Correct
<h1>Browse Gift Cards</h1>
<section>
  <h2>Popular Brands</h2>
  <h3>Amazon</h3>
</section>

// ❌ Wrong (skips levels)
<h1>Browse Gift Cards</h1>
<h3>Popular Brands</h3>
```

**Use landmark elements:**

```tsx
<header>
  <nav aria-label="Main navigation">
    {/* Navigation links */}
  </nav>
</header>

<main>
  {/* Primary content */}
</main>

<aside aria-label="Order summary">
  {/* Sidebar content */}
</aside>

<footer>
  {/* Footer content */}
</footer>
```

### 7.4 ARIA Attributes

**Button vs Link:**

```tsx
// ✅ Button for actions
<button onClick={handleSubmit}>Place Order</button>

// ✅ Link for navigation
<Link href="/gift-card/amazon">View Details</Link>

// ❌ Don't do this
<div onClick={handleSubmit}>Place Order</div>
```

**ARIA Labels:**

```tsx
// Icon-only buttons
<button aria-label="Close modal" onClick={onClose}>
  <XIcon />
</button>

// Search input
<input
  type="search"
  aria-label="Search gift cards"
  placeholder="Search..."
/>

// Country selector
<button
  aria-label="Select country: United States"
  aria-expanded={isOpen}
  aria-haspopup="dialog"
>
  🇺🇸 United States
</button>
```

**Live Regions (for dynamic updates):**

```tsx
// Announce search results count
<div aria-live="polite" aria-atomic="true">
  {resultCount} gift cards found
</div>

// Announce errors
<div role="alert" aria-live="assertive">
  {error}
</div>
```

### 7.5 Form Accessibility

**Label association:**

```tsx
// ✅ Explicit association
<label htmlFor="email">Email</label>
<input id="email" type="email" name="email" />

// ✅ Implicit association
<label>
  Email
  <input type="email" name="email" />
</label>
```

**Required fields:**

```tsx
<label htmlFor="email">
  Email <span aria-label="required">*</span>
</label>
<input
  id="email"
  type="email"
  name="email"
  required
  aria-required="true"
/>
```

**Error messages:**

```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  name="email"
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && (
  <div id="email-error" role="alert">
    Please enter a valid email address
  </div>
)}
```

### 7.6 Color Contrast Requirements

**WCAG AA Standards:**
- Normal text (14-18px): 4.5:1 contrast ratio
- Large text (18.5px+ or 14px+ bold): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**Check contrast:** Use browser DevTools or [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

**GIFTED Color Compliance:**
```css
/* ✅ Passes WCAG AA */
--color-primary (#0F172A) on --color-surface (#F7F9FB) = 14.8:1
--color-secondary (#0051D5) on --color-surface (#F7F9FB) = 6.2:1
--color-on-secondary (#FFFFFF) on --color-secondary (#0051D5) = 6.2:1

/* ⚠️ Fails - needs darker shade */
--color-on-primary-container (#7C839B) on --color-surface (#F7F9FB) = 2.9:1
```

### 7.7 Skip Links

**Allow keyboard users to skip navigation:**

```tsx
// components/layout/SkipLink.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 bg-secondary text-on-secondary px-4 py-2 rounded-md z-50"
    >
      Skip to main content
    </a>
  );
}

// app/layout.tsx
<body>
  <SkipLink />
  <Header />
  <main id="main-content">
    {children}
  </main>
</body>
```

### 7.8 Screen Reader Testing

**Recommended tools:**
- **macOS:** VoiceOver (Cmd+F5)
- **Windows:** NVDA (free) or JAWS
- **Mobile:** iOS VoiceOver, Android TalkBack

**Test checklist:**
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text (not just "Click here")
- [ ] Error messages are announced
- [ ] Loading states are announced
- [ ] Modal focus is trapped
- [ ] Page title changes on navigation

### 7.9 Modal/Dialog Accessibility

```tsx
import { useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';

export function CountryModal({ isOpen, onClose }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Focus close button when modal opens
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <FocusTrap>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-primary/50"
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg p-6 max-w-lg w-full">
            <h2 id="modal-title" className="headline-sm mb-4">
              Select Country
            </h2>
            
            {/* Modal content */}
            
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
```

---

## 8. Form Validation with React Hook Form + Zod

### 8.1 Overview

**Resources:**
- [React Hook Form + Zod Guide](https://www.freecodecamp.org/news/react-form-validation-zod-react-hook-form/)
- [Contentful RHF + Zod Tutorial](https://www.contentful.com/blog/react-hook-form-validation-zod/)

**Why this stack:**
- **Type-safe** - Zod schemas generate TypeScript types automatically
- **Performant** - Minimal re-renders
- **Flexible** - Sync + async validation
- **DX** - Clean API, great error handling

### 8.2 Installation

```bash
npm install react-hook-form @hookform/resolvers zod
```

### 8.3 Basic Pattern

```typescript
// lib/utils/validation.ts
import { z } from 'zod';

export const recipientFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  
  message: z
    .string()
    .max(200, 'Message must be 200 characters or less')
    .optional(),
});

// Infer TypeScript type from schema
export type RecipientFormData = z.infer<typeof recipientFormSchema>;
```

```typescript
// components/product-detail/RecipientForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recipientFormSchema, RecipientFormData } from '@/lib/utils/validation';

export function RecipientForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecipientFormData>({
    resolver: zodResolver(recipientFormSchema),
    mode: 'onBlur',  // Validate on blur
  });
  
  const handleFormSubmit = async (data: RecipientFormData) => {
    await onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Email Input */}
      <div>
        <label htmlFor="email" className="label-lg block mb-2">
          Recipient Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={cn(
            'w-full px-4 py-3 rounded-md border',
            'bg-surface-container-low border-outline/30',
            'focus:border-secondary focus:border-opacity-100',
            errors.email && 'border-error'
          )}
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-error text-sm mt-1">
            {errors.email.message}
          </p>
        )}
      </div>
      
      {/* Message Textarea */}
      <div>
        <label htmlFor="message" className="label-lg block mb-2">
          Gift Message (optional)
        </label>
        <textarea
          id="message"
          {...register('message')}
          rows={3}
          className={cn(
            'w-full px-4 py-3 rounded-md border resize-none',
            'bg-surface-container-low border-outline/30',
            'focus:border-secondary focus:border-opacity-100',
            errors.message && 'border-error'
          )}
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="text-error text-sm mt-1">
            {errors.message.message}
          </p>
        )}
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-secondary text-on-secondary px-8 py-4 rounded-md
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : 'Continue to Checkout'}
      </button>
    </form>
  );
}
```

### 8.4 Advanced Validation Schemas

**Checkout Form:**

```typescript
// lib/utils/validation.ts
import { z } from 'zod';

export const checkoutFormSchema = z.object({
  customerEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  deliveryMethod: z.enum(['FOR_ME', 'SEND_AS_GIFT']),
  
  recipientEmail: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  
  giftMessage: z
    .string()
    .max(200, 'Message cannot exceed 200 characters')
    .optional(),
  
  agreeToTerms: z
    .boolean()
    .refine(val => val === true, {
      message: 'You must agree to the terms and conditions',
    }),
}).refine(
  (data) => {
    // Conditional validation: if SEND_AS_GIFT, recipientEmail is required
    if (data.deliveryMethod === 'SEND_AS_GIFT') {
      return !!data.recipientEmail && data.recipientEmail.length > 0;
    }
    return true;
  },
  {
    message: 'Recipient email is required for gift delivery',
    path: ['recipientEmail'],
  }
);

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
```

**Custom Amount Validation:**

```typescript
export const amountSchema = z.object({
  customAmount: z
    .number({
      required_error: 'Amount is required',
      invalid_type_error: 'Amount must be a number',
    })
    .min(10, 'Minimum amount is $10')
    .max(500, 'Maximum amount is $500')
    .multipleOf(0.01, 'Amount must be a valid currency value'),
});
```

**Email Confirmation:**

```typescript
export const emailVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  confirmEmail: z.string().email('Invalid email address'),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Email addresses don't match",
  path: ['confirmEmail'],
});
```

### 8.5 Async Validation (Email Availability Check)

```typescript
const schema = z.object({
  email: z
    .string()
    .email('Invalid email address')
    .refine(
      async (email) => {
        // Check if email is available
        const response = await fetch(`/api/check-email?email=${email}`);
        const data = await response.json();
        return data.available;
      },
      {
        message: 'This email is already registered',
      }
    ),
});
```

### 8.6 Error Handling Patterns

**Display all errors at top of form:**

```typescript
export function CheckoutForm() {
  const { formState: { errors } } = useForm();
  
  const hasErrors = Object.keys(errors).length > 0;
  
  return (
    <form>
      {hasErrors && (
        <div role="alert" className="bg-error/10 border border-error rounded-md p-4 mb-6">
          <h3 className="font-semibold text-error mb-2">
            Please fix the following errors:
          </h3>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="text-error text-sm">
                {error?.message?.toString()}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Form fields */}
    </form>
  );
}
```

**Toast notifications for server errors:**

```typescript
const handleFormSubmit = async (data: CheckoutFormData) => {
  try {
    await submitCheckout(data);
  } catch (error) {
    // Show toast notification
    toast.error('Failed to process checkout. Please try again.');
  }
};
```

### 8.7 Form State Management

**Watch field values:**

```typescript
const { watch, register } = useForm();
const deliveryMethod = watch('deliveryMethod');

// Conditionally render recipient fields
{deliveryMethod === 'SEND_AS_GIFT' && (
  <RecipientEmailInput {...register('recipientEmail')} />
)}
```

**Reset form:**

```typescript
const { reset } = useForm();

const handleSuccess = () => {
  reset();  // Clear all fields
};
```

**Set field values programmatically:**

```typescript
const { setValue } = useForm();

const handleCountryChange = (country: Country) => {
  setValue('country', country.code);
  setValue('currency', country.currency.code);
};
```

---

## 9. Common Pitfalls & Solutions

### 9.1 Hydration Errors

**Problem:** Server-rendered HTML doesn't match client-rendered HTML.

**Common Causes:**
- Using browser-only APIs in Server Components
- Date/time formatting differences
- Random IDs without consistent seed

**Solution:**

```typescript
// ❌ Wrong - causes hydration error
export function Timestamp() {
  return <div>{new Date().toISOString()}</div>;
}

// ✅ Right - use client component
'use client';
export function Timestamp() {
  const [time, setTime] = useState<string | null>(null);
  
  useEffect(() => {
    setTime(new Date().toISOString());
  }, []);
  
  if (!time) return <div>Loading...</div>;
  return <div>{time}</div>;
}
```

### 9.2 CSS-in-JS Performance Issues

**Problem:** Framer Motion inline styles can cause layout shift.

**Solution:** Use Tailwind classes instead of inline styles when possible.

```typescript
// ❌ Slower (inline styles)
<motion.div
  animate={{ backgroundColor: '#0051D5' }}
/>

// ✅ Faster (CSS classes)
<motion.div
  animate={{ backgroundColor: 'var(--color-secondary)' }}
/>
```

### 9.3 Image Loading Flicker

**Problem:** Images load slowly, causing layout shift.

**Solution:**

```typescript
<Image
  src={product.logoUrl}
  alt={product.brandName}
  width={200}
  height={200}
  placeholder="blur"  // Show blur while loading
  blurDataURL="data:image/..."  // Base64 tiny image
/>
```

### 9.4 Mobile Viewport Issues

**Problem:** Fixed positioning breaks on iOS Safari.

**Solution:**

```typescript
// Use dvh (dynamic viewport height) instead of vh
<div className="h-dvh">  {/* Not h-screen */}
  {/* Content */}
</div>
```

### 9.5 Z-Index Conflicts

**Problem:** Modals, dropdowns, tooltips overlap incorrectly.

**Solution:** Establish z-index scale in design tokens.

```css
/* globals.css */
@layer utilities {
  .z-base { z-index: 0; }
  .z-dropdown { z-index: 10; }
  .z-sticky { z-index: 20; }
  .z-modal-backdrop { z-index: 40; }
  .z-modal { z-index: 50; }
  .z-tooltip { z-index: 60; }
}
```

### 9.6 Form Submission Race Conditions

**Problem:** User clicks submit multiple times, creating duplicate orders.

**Solution:**

```typescript
const { handleSubmit, formState: { isSubmitting } } = useForm();

<button
  type="submit"
  disabled={isSubmitting}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? 'Processing...' : 'Place Order'}
</button>
```

### 9.7 Memory Leaks in useEffect

**Problem:** Fetching data in useEffect without cleanup.

**Solution:**

```typescript
useEffect(() => {
  let cancelled = false;
  
  async function fetchData() {
    const data = await fetch('/api/products');
    if (!cancelled) {
      setProducts(data);
    }
  }
  
  fetchData();
  
  return () => {
    cancelled = true;  // Cleanup
  };
}, []);
```

### 9.8 Accessibility - Missing Alt Text

**Problem:** Screen readers can't describe images.

**Solution:**

```typescript
// ❌ Wrong
<img src={product.logoUrl} />

// ✅ Right
<Image
  src={product.logoUrl}
  alt={`${product.brandName} logo`}
  width={200}
  height={200}
/>

// For decorative images
<Image
  src="/decorative-icon.svg"
  alt=""  // Empty alt for decorative images
  aria-hidden="true"
  width={24}
  height={24}
/>
```

---

## 10. Performance Optimization Checklist

### 10.1 Initial Load Performance

**Target Metrics:**
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.8s

**Optimizations:**

**1. Minimize JavaScript Bundle**
```bash
# Check bundle size
npm run build
# Look for large chunks in .next/static/chunks/
```

**2. Code Splitting**
```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
});
```

**3. Optimize Images**
```typescript
<Image
  src={product.logoUrl}
  alt={product.brandName}
  width={200}
  height={200}
  quality={85}  // Default is 75, 85 is good balance
  priority={index < 6}  // Prioritize above-fold images
/>
```

**4. Preload Critical Fonts**
```typescript
// app/layout.tsx
<link
  rel="preload"
  href="/fonts/ArchivoBlack-Regular.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

**5. Lazy Load Non-Critical CSS**
```typescript
// Only load Framer Motion CSS when needed
import('framer-motion/dist/framer-motion.css');
```

### 10.2 Runtime Performance

**1. Memoize Expensive Calculations**
```typescript
import { useMemo } from 'react';

const filteredProducts = useMemo(() => {
  return products.filter(p => p.categories.includes(selectedCategory));
}, [products, selectedCategory]);
```

**2. Prevent Unnecessary Re-Renders**
```typescript
import { memo } from 'react';

const ProductCard = memo(function ProductCard({ product }: Props) {
  return <div>{product.brandName}</div>;
});
```

**3. Virtualize Long Lists**
```bash
npm install @tanstack/react-virtual
```

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualProductGrid({ products }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,  // Estimated height of each product card
  });
  
  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProductCard product={products[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 10.3 Network Performance

**1. Enable Compression**
```javascript
// next.config.js
module.exports = {
  compress: true,  // Enable gzip compression
};
```

**2. Implement Caching Headers**
```typescript
// app/api/products/route.ts
export async function GET() {
  const products = await getProducts();
  
  return new Response(JSON.stringify(products), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
```

**3. Use CDN for Static Assets**
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['cdn.gifted.com'],
  },
};
```

### 10.4 Lighthouse Score Goals

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**Test Command:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view
```

### 10.5 Monitoring

**Implement Web Vitals Tracking:**

```typescript
// app/layout.tsx
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric);
  
  // Send to analytics
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  }
}
```

---

## Summary & Key Takeaways

### For CODER Agent

**Priority 1: Design System Fidelity**
1. Implement all design tokens exactly as specified in globals.css
2. Use tonal layering instead of borders (the "No-Line Rule")
3. Typography: Archivo Black for headlines, Inter for UI
4. Animation: Fast (200-400ms), easeOut curves, no bouncy effects

**Priority 2: Integration Boundaries**
1. All Reloadly calls go through `lib/giftcards/reloadly-adapter.ts`
2. All Lemon Squeezy calls go through `lib/payments/lemon-squeezy-adapter.ts`
3. Leave explicit TODO comments at every swap point
4. Mock data should mirror real API structure exactly

**Priority 3: Accessibility**
1. Every interactive element must be keyboard accessible
2. Visible focus states on all focusable elements
3. Proper ARIA labels on icon buttons and dynamic content
4. Form validation errors must be announced to screen readers

**Priority 4: Performance**
1. Server Components by default, Client Components only when needed
2. Lazy load heavy components (modals, country list)
3. Optimize images with Next.js Image component
4. Target LCP < 2.5s, FCP < 1.8s

### For TESTER Agent

**Visual Regression Testing:**
1. Configure Playwright for 3 viewports (Desktop 1280x720, Mobile 390x844, Tablet 1024x1366)
2. Compare against design references in `design-refs/` folder
3. Mask dynamic content (dates, timestamps, order IDs)
4. Set `maxDiffPixels: 100` and `threshold: 0.2` for comparison tolerance
5. Test all 5 key screens: Home, Product Detail, Checkout, Success, Email Verification

**Interaction Testing:**
1. Keyboard navigation (Tab, Enter, Esc) through entire flow
2. Mobile touch interactions (swipe category chips, tap CTAs)
3. Form validation (empty fields, invalid emails, custom amounts)
4. Country selection (modal open/close, selection persistence)
5. Checkout flow (For Me vs Send as Gift paths)

**Accessibility Audits:**
1. Run Lighthouse accessibility audit (target 95+)
2. Test with screen reader (VoiceOver on macOS)
3. Verify color contrast meets WCAG AA (4.5:1 for body text)
4. Check heading hierarchy (no skipped levels)
5. Verify all images have alt text

**Performance Benchmarks:**
1. Lighthouse Performance score 90+
2. LCP < 2.5s
3. FCP < 1.8s
4. No layout shift (CLS < 0.1)

---

## Additional Resources

**Official Documentation:**
- Next.js 14 App Router: https://nextjs.org/docs/app
- Tailwind CSS: https://tailwindcss.com/docs
- Framer Motion: https://www.framer.com/motion/
- Playwright: https://playwright.dev/docs/intro
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/

**API Integration:**
- Reloadly Docs: https://developers.reloadly.com/
- Lemon Squeezy Docs: https://docs.lemonsqueezy.com/

**Accessibility:**
- WebAIM: https://webaim.org/
- WCAG Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/

**Design System Inspiration:**
- Material Design 3: https://m3.material.io/
- Apple Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

---

**Document Status:** Complete  
**Last Updated:** 2026-03-26  
**Next Review:** After CODER implementation phase 1

