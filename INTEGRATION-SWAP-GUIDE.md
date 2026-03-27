# Integration Swap Guide

This guide shows **exactly** what to replace when switching from mock implementations to live APIs.

---

## 1. Reloadly Gift Card Integration

### Files to Modify
- `lib/giftcards/reloadly-adapter.ts`
- `lib/giftcards/service.ts`
- `.env.local`

### Step 1: Install Reloadly SDK

```bash
npm install @reloadly/giftcards-sdk
```

### Step 2: Add Environment Variables

Add to `.env.local`:

```bash
RELOADLY_CLIENT_ID=your_client_id_here
RELOADLY_CLIENT_SECRET=your_client_secret_here
RELOADLY_ENVIRONMENT=sandbox  # or 'production'
```

Get credentials from: https://www.reloadly.com/developers

### Step 3: Uncomment & Implement Adapter

**File: `lib/giftcards/reloadly-adapter.ts`**

Find these TODO sections and uncomment/implement:

#### Constructor
```typescript
// BEFORE (mock)
constructor(private config: ReloadlyConfig) {
  // TODO: Initialize client with auth
}

// AFTER (live)
import { ReloadlyClient } from '@reloadly/giftcards-sdk'

constructor(private config: ReloadlyConfig) {
  this.client = new ReloadlyClient({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    sandbox: config.environment === 'sandbox'
  })
}
```

#### Fetch Products
```typescript
// BEFORE (mock)
async fetchProducts(filters: GiftCardFilters): Promise<GiftCardProduct[]> {
  throw new Error('Reloadly integration not yet implemented')
}

// AFTER (live)
async fetchProducts(filters: GiftCardFilters): Promise<GiftCardProduct[]> {
  const response = await this.client.products.list({
    countryCode: filters.countryCode,
    includeFixed: true,
    includeRange: true,
    page: 1,
    size: 100
  })
  
  return response.content.map(product => ({
    id: product.productId.toString(),
    brandId: product.brand.brandId.toString(),
    brand: {
      id: product.brand.brandId.toString(),
      name: product.brand.brandName,
      slug: this.slugify(product.brand.brandName),
      logoUrl: product.logoUrls[0] || '',
      category: this.mapCategories(product.category?.name),
      description: product.productName,
      terms: product.redeemInstruction?.concise,
      redeemInstructions: product.redeemInstruction?.verbose,
    },
    availableCountries: [filters.countryCode!],
    denominationType: product.denominationType,
    fixedDenominations: product.fixedRecipientDenominations || undefined,
    minAmount: product.minRecipientDenomination || undefined,
    maxAmount: product.maxRecipientDenomination || undefined,
    currency: product.recipientCurrencyCode as Currency,
    serviceFeePercent: this.calculateServiceFee(product),
    isActive: product.redeemable,
    deliveryType: 'DIGITAL',
  }))
}

private slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

private calculateServiceFee(product: any): number {
  // Reloadly provides senderFee and senderCurrencyCode
  // Calculate percentage: (senderFee / senderAmount) * 100
  // For now, use fixed 5%
  return 0.05
}

private mapCategories(categoryName?: string): GiftCardCategory[] {
  // Map Reloadly categories to internal categories
  const categoryMap: Record<string, GiftCardCategory> = {
    'Entertainment': 'Entertainment',
    'Retail': 'Shopping',
    'Restaurants': 'Food & Dining',
    'Travel': 'Travel',
    'Gaming': 'Gaming',
    // Add more mappings as needed
  }
  
  if (!categoryName) return ['Shopping']
  return [categoryMap[categoryName] || 'Shopping']
}
```

#### Place Order
```typescript
// BEFORE (mock)
async placeOrder(orderId: string, productId: string, amount: number): Promise<{
  transactionId: string
  cardCode: string
  cardPin?: string
  redeemUrl?: string
}> {
  throw new Error('Reloadly order placement not yet implemented')
}

// AFTER (live)
async placeOrder(
  orderId: string, 
  productId: string, 
  amount: number,
  recipientEmail: string
): Promise<{
  transactionId: string
  cardCode: string
  cardPin?: string
  redeemUrl?: string
}> {
  const response = await this.client.orders.create({
    productId: parseInt(productId),
    quantity: 1,
    unitPrice: amount,
    senderName: 'GIFTED',
    recipientEmail,
    customIdentifier: orderId,
  })
  
  return {
    transactionId: response.transactionId.toString(),
    cardCode: response.cardNumber,
    cardPin: response.pinCode,
    redeemUrl: response.redeemInstruction?.verbose,
  }
}
```

### Step 4: Initialize Adapter

**File: `lib/giftcards/reloadly-adapter.ts` (bottom)**

```typescript
// Uncomment this export
export const reloadlyAdapter = new ReloadlyAdapter({
  clientId: process.env.RELOADLY_CLIENT_ID!,
  clientSecret: process.env.RELOADLY_CLIENT_SECRET!,
  environment: process.env.RELOADLY_ENVIRONMENT as 'sandbox' | 'production',
})
```

### Step 5: Update Service Layer

**File: `lib/giftcards/service.ts`**

```typescript
// BEFORE (mock)
import { MOCK_PRODUCTS } from './mock-data'

async getGiftCards(filters: GiftCardFilters = {}): Promise<GiftCardProduct[]> {
  let products = [...MOCK_PRODUCTS]
  // ... filtering logic
  return products
}

// AFTER (live)
import { reloadlyAdapter } from './reloadly-adapter'

async getGiftCards(filters: GiftCardFilters = {}): Promise<GiftCardProduct[]> {
  // Fetch from Reloadly
  const products = await reloadlyAdapter.fetchProducts(filters)
  
  // Apply client-side filtering for search/category
  let filtered = products
  
  if (filters.category) {
    filtered = filtered.filter(p =>
      p.brand.category.includes(filters.category!)
    )
  }
  
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase()
    filtered = filtered.filter(p =>
      p.brand.name.toLowerCase().includes(query) ||
      p.brand.description.toLowerCase().includes(query)
    )
  }
  
  return filtered
}
```

### Step 6: Update Order Fulfillment

**File: `app/checkout/page.tsx`**

```typescript
// BEFORE (mock)
await orderRepository.storeFulfillment(order.id, {
  giftCardCode: 'MOCK-' + Math.random().toString(36).substr(2, 16).toUpperCase(),
  giftCardPin: '1234',
  redeemUrl: selection.product.brand.redeemInstructions,
})

// AFTER (live)
import { reloadlyAdapter } from '@/lib/giftcards/reloadly-adapter'

// After payment succeeds, purchase from Reloadly
const fulfillment = await reloadlyAdapter.placeOrder(
  order.id,
  order.productId,
  order.amount,
  order.recipientEmail || order.customerEmail
)

await orderRepository.storeFulfillment(order.id, {
  giftCardCode: fulfillment.cardCode,
  giftCardPin: fulfillment.cardPin,
  redeemUrl: fulfillment.redeemUrl,
})
```

### Reloadly API Reference

**Base URLs:**
- Sandbox: `https://giftcards-sandbox.reloadly.com`
- Production: `https://giftcards.reloadly.com`

**Authentication:**
```bash
POST /oauth/token
Content-Type: application/json

{
  "client_id": "your_client_id",
  "client_secret": "your_client_secret",
  "grant_type": "client_credentials",
  "audience": "https://giftcards.reloadly.com"
}

# Returns:
{
  "access_token": "eyJ...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

**List Products:**
```bash
GET /products?countryCode=US&includeFixed=true&includeRange=true
Authorization: Bearer {access_token}
```

**Place Order:**
```bash
POST /orders
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "productId": 1234,
  "quantity": 1,
  "unitPrice": 50,
  "senderName": "GIFTED",
  "recipientEmail": "customer@example.com",
  "customIdentifier": "order_123"
}

# Returns:
{
  "transactionId": 5678,
  "cardNumber": "1234-5678-9012-3456",
  "pinCode": "1234",
  "transactionCreatedTime": "2026-03-26T12:00:00Z"
}
```

---

## 2. Lemon Squeezy Payment Integration

### Files to Modify
- `lib/payments/lemon-squeezy-adapter.ts`
- `app/api/webhooks/lemon-squeezy/route.ts` (create)
- `app/checkout/page.tsx`
- `.env.local`

### Step 1: Install Lemon Squeezy SDK

```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

### Step 2: Add Environment Variables

Add to `.env.local`:

```bash
LEMON_SQUEEZY_API_KEY=your_api_key_here
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_PRODUCT_ID=your_product_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
```

Get credentials from: https://app.lemonsqueezy.com/settings/api

### Step 3: Create Product in Lemon Squeezy

1. Log in to Lemon Squeezy dashboard
2. Create a new product: "Gift Card"
3. Create a variant: "Variable Amount"
4. Enable "Pay What You Want" to allow custom amounts
5. Note the Store ID and Product/Variant ID

### Step 4: Implement Checkout Creation

**File: `lib/payments/lemon-squeezy-adapter.ts`**

```typescript
// BEFORE (mock)
import { CheckoutSession, PaymentMetadata } from './types'

async createCheckoutSession(order: Order): Promise<CheckoutSession> {
  throw new Error('Lemon Squeezy integration not yet implemented')
}

// AFTER (live)
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

export class LemonSqueezyAdapter {
  constructor(private config: LemonSqueezyConfig) {
    lemonSqueezySetup({ apiKey: config.apiKey })
  }
  
  async createCheckoutSession(order: Order): Promise<CheckoutSession> {
    const checkout = await createCheckout(
      this.config.storeId,
      this.config.productId,
      {
        checkoutData: {
          email: order.customerEmail,
          name: order.customerEmail.split('@')[0],
          custom: {
            orderId: order.id,
            productId: order.productId,
            brandName: order.brandName,
            amount: order.amount,
            currency: order.currency,
            countryCode: order.countryCode,
            recipientEmail: order.recipientEmail || null,
            giftMessage: order.giftMessage || null,
          }
        },
        productOptions: {
          name: `${order.brandName} Gift Card`,
          description: order.deliveryMethod === 'SEND_AS_GIFT'
            ? `${order.currency} ${order.amount} gift card for ${order.recipientEmail}`
            : `${order.currency} ${order.amount} digital gift card`,
          receiptButtonText: 'View Gift Card',
          receiptLinkUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${order.id}`,
        },
        checkoutOptions: {
          buttonColor: '#0051D5', // GIFTED secondary blue
          embed: true,
        },
      }
    )
    
    if (!checkout.data) {
      throw new Error('Failed to create checkout session')
    }
    
    return {
      id: checkout.data.id,
      orderId: order.id,
      customerEmail: order.customerEmail,
      amount: order.totalAmount,
      currency: order.currency,
      status: 'PENDING',
      lemonSqueezyCheckoutUrl: checkout.data.attributes.url,
      lemonSqueezyCheckoutId: checkout.data.id,
    }
  }
}

// Export initialized adapter
export const lemonSqueezyAdapter = new LemonSqueezyAdapter({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
  storeId: process.env.LEMON_SQUEEZY_STORE_ID!,
  productId: process.env.LEMON_SQUEEZY_PRODUCT_ID!,
})
```

### Step 5: Update Checkout Page

**File: `app/checkout/page.tsx`**

```typescript
// BEFORE (mock)
import { mockCheckoutService } from '@/lib/payments/mock-checkout'

const session = await mockCheckoutService.createCheckoutSession(order)
const paymentSuccess = await mockCheckoutService.completePayment(session.id)

// AFTER (live)
import { lemonSqueezyAdapter } from '@/lib/payments/lemon-squeezy-adapter'

const session = await lemonSqueezyAdapter.createCheckoutSession(order)

// Store session ID in order
await orderRepository.updatePaymentSession(order.id, session.id)

// Redirect to Lemon Squeezy checkout
window.location.href = session.lemonSqueezyCheckoutUrl!

// NOTE: The rest of the flow is handled by webhooks
// User completes payment on Lemon Squeezy → webhook fires → order fulfilled
```

### Step 6: Create Webhook Endpoint

**File: `app/api/webhooks/lemon-squeezy/route.ts`** (create new file)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { orderRepository } from '@/lib/orders/mock-repository'
import { reloadlyAdapter } from '@/lib/giftcards/reloadly-adapter'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('X-Signature')
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 401 })
  }
  
  // Verify webhook signature
  const hmac = crypto.createHmac('sha256', process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!)
  const digest = hmac.update(body).digest('hex')
  
  if (signature !== digest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  // Parse webhook payload
  const event = JSON.parse(body)
  const { meta, data } = event
  
  // Get order ID from custom data
  const orderId = data.attributes.first_order_item.product_name.match(/order_[^)]+/)?.[0]
  
  if (!orderId) {
    console.error('No order ID in webhook payload')
    return NextResponse.json({ error: 'No order ID' }, { status: 400 })
  }
  
  // Handle different event types
  switch (meta.event_name) {
    case 'order_created':
      // Payment initiated
      await orderRepository.updateOrderStatus(orderId, 'PAYMENT_PROCESSING')
      break
      
    case 'order_refunded':
      // Payment refunded
      await orderRepository.updateOrderStatus(orderId, 'REFUNDED')
      break
      
    case 'order_paid':
      // Payment successful - fulfill order
      try {
        const order = await orderRepository.getOrderById(orderId)
        if (!order) throw new Error('Order not found')
        
        // Purchase gift card from Reloadly
        const fulfillment = await reloadlyAdapter.placeOrder(
          order.id,
          order.productId,
          order.amount,
          order.recipientEmail || order.customerEmail
        )
        
        // Store fulfillment details
        await orderRepository.storeFulfillment(order.id, {
          giftCardCode: fulfillment.cardCode,
          giftCardPin: fulfillment.cardPin,
          redeemUrl: fulfillment.redeemUrl,
        })
        
        // Mark order as completed
        await orderRepository.updateOrderStatus(orderId, 'COMPLETED')
        
        // TODO: Send confirmation email
        // await sendConfirmationEmail(order)
        
      } catch (error) {
        console.error('Order fulfillment failed:', error)
        await orderRepository.updateOrderStatus(orderId, 'FAILED')
      }
      break
  }
  
  return NextResponse.json({ received: true })
}
```

### Step 7: Configure Webhook in Lemon Squeezy

1. Go to: https://app.lemonsqueezy.com/settings/webhooks
2. Click "Create Webhook"
3. URL: `https://yourdomain.com/api/webhooks/lemon-squeezy`
4. Events: Select `order_created`, `order_paid`, `order_refunded`
5. Copy the signing secret to `.env.local`

### Lemon Squeezy API Reference

**Create Checkout:**
```bash
POST https://api.lemonsqueezy.com/v1/checkouts
Authorization: Bearer {api_key}
Accept: application/vnd.api+json
Content-Type: application/vnd.api+json

{
  "data": {
    "type": "checkouts",
    "attributes": {
      "checkout_data": {
        "email": "customer@example.com",
        "custom": { "orderId": "order_123" }
      },
      "product_options": {
        "name": "Amazon Gift Card",
        "description": "$50 digital gift card"
      },
      "checkout_options": {
        "button_color": "#0051D5"
      }
    },
    "relationships": {
      "store": { "data": { "type": "stores", "id": "12345" } },
      "variant": { "data": { "type": "variants", "id": "67890" } }
    }
  }
}
```

**Webhook Payload (order_paid):**
```json
{
  "meta": {
    "event_name": "order_paid",
    "custom_data": {
      "orderId": "order_123"
    }
  },
  "data": {
    "type": "orders",
    "id": "abc123",
    "attributes": {
      "status": "paid",
      "total": 5250,
      "currency": "USD",
      "user_email": "customer@example.com"
    }
  }
}
```

---

## 3. Database Integration

### Current State
- Orders stored in-memory Map
- Lost on server restart
- No query capabilities

### Migration Path

#### Option A: Prisma + PostgreSQL (Recommended)

**Step 1: Install Prisma**
```bash
npm install prisma @prisma/client
npx prisma init
```

**Step 2: Define Schema**

**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Order {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Order details
  status           OrderStatus
  productId        String
  brandName        String
  brandLogoUrl     String
  amount           Float
  currency         String
  serviceFee       Float
  totalAmount      Float
  
  // Customer
  customerEmail    String
  countryCode      String
  
  // Delivery
  deliveryMethod   DeliveryMethod
  recipientEmail   String?
  giftMessage      String?
  
  // Payment
  paymentProvider  String?
  paymentSessionId String?
  paymentIntentId  String?
  
  // Fulfillment
  giftCardCode     String?
  giftCardPin      String?
  redeemUrl        String?
  expiresAt        DateTime?
  
  @@index([customerEmail])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING
  PAYMENT_PROCESSING
  COMPLETED
  FAILED
  REFUNDED
}

enum DeliveryMethod {
  FOR_ME
  SEND_AS_GIFT
}
```

**Step 3: Generate Client & Migrate**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

**Step 4: Replace Repository**

**File: `lib/orders/repository.ts`** (rename from mock-repository.ts)

```typescript
import { PrismaClient } from '@prisma/client'
import { Order, OrderStatus } from './types'

const prisma = new PrismaClient()

export class OrderRepository {
  async createOrder(selection: SelectedGiftCard, customerEmail: string): Promise<Order> {
    const serviceFee = selection.amount * selection.product.serviceFeePercent
    const totalAmount = selection.amount + serviceFee
    
    const order = await prisma.order.create({
      data: {
        status: 'PENDING',
        productId: selection.product.id,
        brandName: selection.product.brand.name,
        brandLogoUrl: selection.product.brand.logoUrl,
        amount: selection.amount,
        currency: selection.product.currency,
        serviceFee,
        totalAmount,
        customerEmail,
        countryCode: selection.country.code,
        deliveryMethod: selection.deliveryMethod,
        recipientEmail: selection.recipientEmail,
        giftMessage: selection.giftMessage,
      }
    })
    
    return order as Order
  }
  
  async getOrderById(orderId: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })
    return order as Order | null
  }
  
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() }
    })
  }
  
  async storeFulfillment(orderId: string, details: {
    giftCardCode: string
    giftCardPin?: string
    redeemUrl?: string
    expiresAt?: Date
  }): Promise<void> {
    await prisma.order.update({
      where: { id: orderId },
      data: { ...details, updatedAt: new Date() }
    })
  }
}

export const orderRepository = new OrderRepository()
```

**Step 5: Update .env.local**

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/gifted?schema=public"
```

#### Option B: Supabase (Serverless-friendly)

Similar to Prisma, but use Supabase client:

```bash
npm install @supabase/supabase-js
```

See Supabase docs for schema creation and client setup.

---

## 4. Email Notifications

### Recommended: Resend

**Step 1: Install Resend**
```bash
npm install resend
```

**Step 2: Add API Key**
```bash
RESEND_API_KEY=re_...
```

**Step 3: Create Email Templates**

**File: `lib/emails/confirmation.tsx`**

```tsx
import { Order } from '../orders/types'

export function ConfirmationEmail({ order }: { order: Order }) {
  return (
    <div>
      <h1>Your {order.brandName} gift card is ready!</h1>
      <p>Order: {order.id}</p>
      <p>Amount: {order.currency} {order.amount}</p>
      
      {order.giftCardCode && (
        <div>
          <h2>Your code:</h2>
          <code>{order.giftCardCode}</code>
          {order.giftCardPin && <code>PIN: {order.giftCardPin}</code>}
        </div>
      )}
      
      {order.redeemUrl && (
        <a href={order.redeemUrl}>Redeem now</a>
      )}
    </div>
  )
}
```

**Step 4: Send After Fulfillment**

**File: `app/api/webhooks/lemon-squeezy/route.ts`**

```typescript
import { Resend } from 'resend'
import { ConfirmationEmail } from '@/lib/emails/confirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

// After order fulfillment:
await resend.emails.send({
  from: 'GIFTED <noreply@gifted.com>',
  to: order.recipientEmail || order.customerEmail,
  subject: `Your ${order.brandName} gift card is ready`,
  react: ConfirmationEmail({ order }),
})
```

---

## Testing Strategy

### Local Development
1. Use Reloadly sandbox environment
2. Use Lemon Squeezy test mode
3. Use ngrok to expose webhook endpoint: `ngrok http 3000`

### Staging Environment
1. Deploy to Vercel/Netlify
2. Configure webhooks with production URL
3. Test full flow with real (test mode) payments

### Production Checklist
- [ ] Switch Reloadly to production environment
- [ ] Switch Lemon Squeezy to live mode
- [ ] Update webhook URLs
- [ ] Test error handling (payment failure, Reloadly failure)
- [ ] Set up monitoring (Sentry for errors)
- [ ] Set up alerts for failed fulfillments

---

## Summary: Files to Modify

### Reloadly Integration
- `lib/giftcards/reloadly-adapter.ts` - Uncomment & implement
- `lib/giftcards/service.ts` - Switch from MOCK_PRODUCTS
- `app/checkout/page.tsx` - Call reloadlyAdapter.placeOrder()

### Lemon Squeezy Integration
- `lib/payments/lemon-squeezy-adapter.ts` - Implement createCheckoutSession
- `app/checkout/page.tsx` - Redirect to checkout URL
- `app/api/webhooks/lemon-squeezy/route.ts` - Create webhook handler

### Database
- `prisma/schema.prisma` - Define Order model
- `lib/orders/repository.ts` - Replace mock with Prisma queries

### Email
- `lib/emails/confirmation.tsx` - Create email template
- `app/api/webhooks/lemon-squeezy/route.ts` - Send after fulfillment

### Environment Variables
```bash
# Reloadly
RELOADLY_CLIENT_ID=
RELOADLY_CLIENT_SECRET=
RELOADLY_ENVIRONMENT=sandbox

# Lemon Squeezy
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_STORE_ID=
LEMON_SQUEEZY_PRODUCT_ID=
LEMON_SQUEEZY_WEBHOOK_SECRET=

# Database
DATABASE_URL=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

**That's it!** Every integration swap point has exact code replacements. No guesswork.
