# Integration Swap Guide - GIFTED

This guide explains exactly what to replace when switching from mocked data to live Reloadly and Lemon Squeezy integrations.

---

## Overview

The GIFTED app is built with clear integration boundaries. All external API calls are isolated in adapter modules with TODO comments marking what needs to be replaced.

**Mocked Components:**
1. Gift card catalog (Reloadly)
2. Payment processing (Lemon Squeezy)
3. Order fulfillment

**Integration Files:**
- `lib/giftcards/reloadly-adapter.ts` - Gift card API
- `lib/payments/lemon-squeezy-adapter.ts` - Payment API
- `lib/orders/service.ts` - Order fulfillment

---

## Part 1: Reloadly Gift Card Integration

### Prerequisites
1. Create Reloadly account: https://www.reloadly.com/
2. Get OAuth2 credentials (client ID + secret)
3. Review API docs: https://developers.reloadly.com/

### Environment Variables

Add to `.env.local`:
```bash
RELOADLY_CLIENT_ID=your_client_id
RELOADLY_CLIENT_SECRET=your_client_secret
RELOADLY_API_URL=https://giftcards.reloadly.com
```

### Step 1: Replace Authentication

**File:** `lib/giftcards/reloadly-adapter.ts`

**Current (mocked):**
```typescript
private async ensureAuthenticated(): Promise<void> {
  // MOCK: In production, fetch and cache OAuth token
  return Promise.resolve();
}
```

**Replace with:**
```typescript
private async ensureAuthenticated(): Promise<void> {
  // Check if token exists and is not expired
  if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
    return;
  }

  // Fetch new access token
  const response = await fetch(`${process.env.RELOADLY_API_URL}/oauth/token`, {
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

  const data = await response.json();
  this.accessToken = data.access_token;
  
  // Set expiry (subtract 5 minutes for safety margin)
  const expiresInMs = (data.expires_in - 300) * 1000;
  this.tokenExpiry = new Date(Date.now() + expiresInMs);
}
```

### Step 2: Replace Product Fetching

**Current (mocked):**
```typescript
async getGiftCardsByCountry(countryCode: string): Promise<GiftCardProduct[]> {
  await this.ensureAuthenticated();
  
  // MOCK: Filter mock data by country
  return MOCK_PRODUCTS.filter(product =>
    product.availableCountries.includes(countryCode)
  );
}
```

**Replace with:**
```typescript
async getGiftCardsByCountry(countryCode: string): Promise<GiftCardProduct[]> {
  await this.ensureAuthenticated();
  
  const response = await fetch(
    `${process.env.RELOADLY_API_URL}/products?countryCode=${countryCode}`,
    {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch gift cards from Reloadly');
  }

  const data = await response.json();
  
  // Map Reloadly schema to local GiftCardProduct interface
  return data.content.map((reloadlyProduct: any) => ({
    id: reloadlyProduct.productId.toString(),
    slug: this.generateSlug(reloadlyProduct.productName),
    brandName: reloadlyProduct.productName,
    description: reloadlyProduct.shortDescription || '',
    logoUrl: reloadlyProduct.logoUrls?.[0] || '',
    categories: this.mapCategories(reloadlyProduct.category),
    availableCountries: [reloadlyProduct.country.isoName],
    denominationType: reloadlyProduct.denominationType,
    fixedDenominations: reloadlyProduct.fixedRecipientDenominations || undefined,
    denominationRange: reloadlyProduct.minRecipientDenomination ? {
      min: reloadlyProduct.minRecipientDenomination,
      max: reloadlyProduct.maxRecipientDenomination
    } : undefined,
    currency: reloadlyProduct.recipientCurrencyCode,
    serviceFeePercent: 5.5, // Calculate based on discount info if available
    deliveryType: 'DIGITAL',
    redemptionInstructions: reloadlyProduct.redeemInstruction?.concise || undefined,
    termsUrl: reloadlyProduct.termsAndConditions || undefined
  }));
}

private generateSlug(productName: string): string {
  return productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

private mapCategories(reloadlyCategory: any): string[] {
  // Map Reloadly categories to local category IDs
  const categoryMap: Record<string, string> = {
    'Retail': 'retail',
    'Entertainment': 'entertainment',
    'Food & Dining': 'food',
    'Gaming': 'gaming',
    'Travel': 'travel'
    // Add more mappings as needed
  };
  
  return [categoryMap[reloadlyCategory?.name] || 'other'];
}
```

### Step 3: Replace Gift Card Purchase

**File:** `lib/orders/service.ts`

**Current (mocked):**
```typescript
async fulfillOrder(orderId: string): Promise<void> {
  const order = this.getOrderById(orderId);
  if (!order || order.status !== 'PAID') {
    throw new Error('Order not ready for fulfillment');
  }
  
  // TODO: Call Reloadly purchase API
  
  this.updateOrderStatus(orderId, 'DELIVERED');
}
```

**Replace with:**
```typescript
async fulfillOrder(orderId: string): Promise<void> {
  const order = this.getOrderById(orderId);
  if (!order || order.status !== 'PAID') {
    throw new Error('Order not ready for fulfillment');
  }
  
  try {
    // Purchase gift card from Reloadly
    const response = await fetch(`${process.env.RELOADLY_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${reloadlyAdapter.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: parseInt(order.item.productId),
        countryCode: order.country.code,
        quantity: 1,
        unitPrice: order.item.amount,
        customIdentifier: orderId,
        recipientEmail: order.recipient?.email || order.customerEmail
      })
    });

    if (!response.ok) {
      throw new Error('Failed to purchase gift card from Reloadly');
    }

    const purchaseData = await response.json();
    
    // TODO: Store gift card code in database
    // order.giftCardCode = purchaseData.cardNumber;
    // order.giftCardPin = purchaseData.pinCode;
    
    // TODO: Send delivery email with gift card details
    // await emailService.sendGiftCardDelivery(order, purchaseData);
    
    this.updateOrderStatus(orderId, 'DELIVERED');
  } catch (error) {
    console.error('Fulfillment failed:', error);
    this.updateOrderStatus(orderId, 'FAILED');
    throw error;
  }
}
```

### Step 4: Add Caching Layer

Reloadly API responses should be cached to avoid rate limits and improve performance.

**Recommended approach:**
- Use Next.js Data Cache for product catalog
- Revalidate every 1 hour (products don't change frequently)
- Use Redis for production caching

**Example with Next.js 14:**
```typescript
// In a Server Component or API Route
export const revalidate = 3600; // Revalidate every hour

export async function getGiftCards(countryCode: string) {
  const products = await reloadlyAdapter.getGiftCardsByCountry(countryCode);
  return products;
}
```

---

## Part 2: Lemon Squeezy Payment Integration

### Prerequisites
1. Create Lemon Squeezy account: https://www.lemonsqueezy.com/
2. Get API key from settings
3. Set up store and product variants
4. Configure webhook endpoint

### Environment Variables

Add to `.env.local`:
```bash
LEMON_SQUEEZY_API_KEY=your_api_key
LEMON_SQUEEZY_STORE_ID=your_store_id
LEMON_SQUEEZY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 1: Replace Checkout Session Creation

**File:** `lib/payments/lemon-squeezy-adapter.ts`

**Current (mocked):**
```typescript
async createCheckoutSession(order: Order): Promise<CheckoutSession> {
  const sessionId = `ls_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: sessionId,
    orderId: order.id,
    status: 'PENDING',
    checkoutUrl: `/checkout/mock?session=${sessionId}`,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  };
}
```

**Replace with:**
```typescript
async createCheckoutSession(order: Order): Promise<CheckoutSession> {
  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json'
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          store_id: this.storeId,
          product_options: {
            name: `${order.item.brandName} - ${order.item.currency}${order.item.amount}`,
            description: 'Digital gift card delivery',
            enabled_variants: [] // Dynamic pricing - will be added below
          },
          checkout_data: {
            email: order.customerEmail,
            custom: {
              order_id: order.id,
              product_id: order.item.productId,
              amount: order.item.amount,
              delivery_method: order.deliveryMethod,
              recipient_email: order.recipient?.email,
              recipient_message: order.recipient?.message,
              country_code: order.country.code
            }
          },
          checkout_options: {
            button_color: '#0051D5' // Match app branding
          },
          expires_at: null, // No expiration
          preview: false
        },
        relationships: {
          store: {
            data: {
              type: 'stores',
              id: this.storeId
            }
          },
          variant: {
            data: {
              type: 'variants',
              id: this.getOrCreateVariant(order.item.amount, order.item.currency)
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to create Lemon Squeezy checkout: ${errorData.errors?.[0]?.detail}`);
  }

  const data = await response.json();
  const checkoutData = data.data;

  return {
    id: checkoutData.id,
    orderId: order.id,
    status: 'PENDING',
    checkoutUrl: checkoutData.attributes.url,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000)
  };
}

/**
 * Get or create product variant for the gift card amount
 * 
 * NOTE: For dynamic pricing, you may want to create variants on-the-fly
 * or use Lemon Squeezy's custom pricing feature if available.
 */
private async getOrCreateVariant(amount: number, currency: string): Promise<string> {
  // TODO: Implement variant creation/lookup logic
  // This could query your database for existing variants or create new ones
  throw new Error('Variant management not yet implemented');
}
```

### Step 2: Create Webhook Endpoint

**File:** `app/api/webhooks/lemon-squeezy/route.ts` (create this file)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { orderService } from '@/lib/orders/service';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature
    const body = await request.text();
    const signature = request.headers.get('x-signature');
    
    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 2. Parse event data
    const event = JSON.parse(body);
    const eventType = event.meta.event_name;
    const eventData = event.data;

    console.log('Lemon Squeezy webhook received:', eventType);

    // 3. Handle different event types
    switch (eventType) {
      case 'order_created':
        await handleOrderCreated(eventData);
        break;
      
      case 'order_refunded':
        await handleOrderRefunded(eventData);
        break;
      
      default:
        console.log('Unhandled event type:', eventType);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

async function handleOrderCreated(eventData: any) {
  const customData = eventData.attributes.first_order_item.product_custom_data;
  const orderId = customData.order_id;
  
  // Update order status to PAID
  orderService.updateOrderStatus(orderId, 'PAID');
  
  // Trigger fulfillment (Reloadly purchase + email delivery)
  await orderService.fulfillOrder(orderId);
}

async function handleOrderRefunded(eventData: any) {
  const customData = eventData.attributes.first_order_item.product_custom_data;
  const orderId = customData.order_id;
  
  // Update order status to REFUNDED
  orderService.updateOrderStatus(orderId, 'REFUNDED');
  
  // TODO: Implement refund logic (may need to contact Reloadly support)
}
```

### Step 3: Configure Webhook in Lemon Squeezy

1. Go to Lemon Squeezy Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/lemon-squeezy`
3. Select events to listen for:
   - `order_created`
   - `order_refunded`
4. Copy webhook secret to `.env.local`

### Step 4: Update Checkout Flow

**File:** `app/checkout/page.tsx`

**Current (mocked):**
```typescript
const handlePayment = async () => {
  // Mock payment processing
  router.push(`/success?order_id=${order.id}`);
};
```

**Replace with:**
```typescript
const handlePayment = async () => {
  try {
    setIsProcessing(true);
    
    // Create Lemon Squeezy checkout session
    const session = await mockCheckoutService.createCheckout(order);
    
    // Redirect to Lemon Squeezy checkout page
    window.location.href = session.checkoutUrl;
  } catch (error) {
    console.error('Payment initiation failed:', error);
    setError('Failed to start payment. Please try again.');
    setIsProcessing(false);
  }
};
```

### Step 5: Handle Success Redirect

**File:** `app/success/page.tsx`

**Update to handle both session_id and order_id:**
```typescript
export default function SuccessPage({
  searchParams
}: {
  searchParams: { order_id?: string; session_id?: string }
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        let orderId = searchParams.order_id;
        
        // If coming from Lemon Squeezy redirect, lookup order by session ID
        if (searchParams.session_id && !orderId) {
          // TODO: Query database to find order with this session ID
          // orderId = await getOrderIdBySessionId(searchParams.session_id);
        }
        
        if (orderId) {
          const orderData = orderService.getOrderById(orderId);
          setOrder(orderData);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadOrder();
  }, [searchParams]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!order) {
    return <ErrorState message="Order not found" />;
  }

  return <SuccessSummary order={order} />;
}
```

---

## Part 3: Database Integration

Currently, orders are stored in memory. For production, you need a database.

### Recommended Stack
- **PostgreSQL** via Vercel Postgres or Supabase
- **Prisma** as ORM

### Schema Example

```prisma
// prisma/schema.prisma

model Country {
  code      String   @id
  name      String
  flagEmoji String
  currency  Json     // { code, symbol, decimals }
  locale    String
}

model GiftCard {
  id                  String   @id
  slug                String   @unique
  brandName           String
  description         String
  logoUrl             String
  categories          String[]
  availableCountries  String[]
  denominationType    String
  fixedDenominations  Float[]?
  denominationRange   Json?    // { min, max }
  currency            String
  serviceFeePercent   Float
  deliveryType        String
  redemptionInstructions String?
  termsUrl            String?
  
  @@index([slug])
}

model Order {
  id                String   @id
  customerId        String?
  customerEmail     String
  deliveryMethod    String
  status            String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  // Order item
  productId         String
  productSlug       String
  brandName         String
  amount            Float
  currency          String
  serviceFee        Float
  total             Float
  
  // Delivery
  recipientEmail    String?
  recipientMessage  String?
  
  // Country
  countryCode       String
  
  // Payment
  paymentSessionId  String?  @unique
  
  // Fulfillment
  giftCardCode      String?
  giftCardPin       String?
  deliveredAt       DateTime?
  
  @@index([customerEmail])
  @@index([status])
  @@index([paymentSessionId])
}
```

### Migration Steps

1. Install Prisma:
```bash
npm install prisma @prisma/client
npx prisma init
```

2. Define schema (see above)

3. Generate Prisma Client:
```bash
npx prisma generate
```

4. Run migrations:
```bash
npx prisma migrate dev --name init
```

5. Update `lib/orders/service.ts` to use Prisma:
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class OrderService {
  async createDraftOrder(...): Promise<Order> {
    const order = await prisma.order.create({
      data: {
        id: this.generateOrderId(),
        customerEmail,
        deliveryMethod,
        status: 'DRAFT',
        productId: product.id,
        productSlug: product.slug,
        brandName: product.brandName,
        amount,
        currency: country.currency.code,
        serviceFee,
        total,
        countryCode: country.code,
        recipientEmail: recipient?.email,
        recipientMessage: recipient?.message
      }
    });
    
    return this.mapPrismaOrderToOrder(order);
  }
  
  async getOrderById(orderId: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });
    
    return order ? this.mapPrismaOrderToOrder(order) : null;
  }
  
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() }
    });
    
    return this.mapPrismaOrderToOrder(order);
  }
  
  private mapPrismaOrderToOrder(prismaOrder: any): Order {
    // Map Prisma model to app Order type
    // ...
  }
}
```

---

## Part 4: Email Delivery

After fulfillment, send gift card details to recipient.

### Recommended Service
- **Resend** (https://resend.com/) - Modern email API

### Installation
```bash
npm install resend
```

### Environment Variable
```bash
RESEND_API_KEY=your_resend_api_key
```

### Email Template

**File:** `lib/email/templates/gift-card-delivery.tsx`

```typescript
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text
} from '@react-email/components';

interface GiftCardDeliveryEmailProps {
  brandName: string;
  amount: number;
  currency: string;
  giftCardCode: string;
  giftCardPin?: string;
  recipientMessage?: string;
  senderEmail?: string;
  redemptionInstructions?: string;
}

export default function GiftCardDeliveryEmail({
  brandName,
  amount,
  currency,
  giftCardCode,
  giftCardPin,
  recipientMessage,
  senderEmail,
  redemptionInstructions
}: GiftCardDeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Your {brandName} gift card has arrived!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            🎁 You've received a gift card!
          </Heading>
          
          {senderEmail && (
            <Text style={text}>
              {senderEmail} sent you a {brandName} gift card.
            </Text>
          )}
          
          {recipientMessage && (
            <Container style={messageBox}>
              <Text style={message}>{recipientMessage}</Text>
            </Container>
          )}
          
          <Container style={giftCardBox}>
            <Heading style={h2}>{brandName}</Heading>
            <Text style={amountText}>
              {currency}{amount}
            </Text>
            
            <Text style={label}>Gift Card Code</Text>
            <Text style={code}>{giftCardCode}</Text>
            
            {giftCardPin && (
              <>
                <Text style={label}>PIN</Text>
                <Text style={code}>{giftCardPin}</Text>
              </>
            )}
          </Container>
          
          {redemptionInstructions && (
            <Container style={instructions}>
              <Heading style={h3}>How to redeem</Heading>
              <Text style={text}>{redemptionInstructions}</Text>
            </Container>
          )}
          
          <Text style={footer}>
            Delivered by GIFTED
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles omitted for brevity - add inline CSS for email clients
```

### Email Service

**File:** `lib/email/service.ts`

```typescript
import { Resend } from 'resend';
import GiftCardDeliveryEmail from './templates/gift-card-delivery';
import { Order } from '../orders/types';

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  async sendGiftCardDelivery(
    order: Order,
    giftCardData: { code: string; pin?: string }
  ): Promise<void> {
    const recipientEmail = order.recipient?.email || order.customerEmail;
    
    const { data, error } = await resend.emails.send({
      from: 'GIFTED <giftcards@yourdomain.com>',
      to: recipientEmail,
      subject: `Your ${order.item.brandName} gift card has arrived!`,
      react: GiftCardDeliveryEmail({
        brandName: order.item.brandName,
        amount: order.item.amount,
        currency: order.item.currency,
        giftCardCode: giftCardData.code,
        giftCardPin: giftCardData.pin,
        recipientMessage: order.recipient?.message,
        senderEmail: order.deliveryMethod === 'SEND_AS_GIFT' ? order.customerEmail : undefined,
        redemptionInstructions: 'Visit the brand website and enter your gift card code at checkout.'
      })
    });

    if (error) {
      throw new Error(`Failed to send delivery email: ${error.message}`);
    }
    
    console.log('Gift card delivery email sent:', data);
  }
}

export const emailService = new EmailService();
```

### Update Fulfillment

**File:** `lib/orders/service.ts`

```typescript
import { emailService } from '../email/service';

async fulfillOrder(orderId: string): Promise<void> {
  const order = this.getOrderById(orderId);
  if (!order || order.status !== 'PAID') {
    throw new Error('Order not ready for fulfillment');
  }
  
  try {
    // 1. Purchase from Reloadly
    const giftCardData = await reloadlyAdapter.purchaseGiftCard({
      productId: order.item.productId,
      amount: order.item.amount,
      recipientEmail: order.recipient?.email || order.customerEmail
    });
    
    // 2. Save gift card data to database
    await prisma.order.update({
      where: { id: orderId },
      data: {
        giftCardCode: giftCardData.code,
        giftCardPin: giftCardData.pin,
        deliveredAt: new Date()
      }
    });
    
    // 3. Send delivery email
    await emailService.sendGiftCardDelivery(order, giftCardData);
    
    // 4. Update status to DELIVERED
    this.updateOrderStatus(orderId, 'DELIVERED');
  } catch (error) {
    console.error('Fulfillment failed:', error);
    this.updateOrderStatus(orderId, 'FAILED');
    throw error;
  }
}
```

---

## Checklist: Switching to Production

### Before Going Live

- [ ] Reloadly account created and verified
- [ ] Lemon Squeezy account created and verified
- [ ] Environment variables configured in production
- [ ] Database (PostgreSQL) provisioned
- [ ] Prisma migrations run
- [ ] Webhook endpoint deployed and tested
- [ ] Webhook secret configured in Lemon Squeezy
- [ ] Resend account created for emails
- [ ] Email templates tested
- [ ] Test purchase completed end-to-end on staging
- [ ] Error handling tested (failed payments, failed fulfillment)
- [ ] Monitoring/logging set up (Sentry, Datadog, etc.)

### Testing Production Integrations

1. **Reloadly:**
   - Use test mode if available
   - Verify product catalog loads correctly
   - Verify country filtering works
   - Test actual gift card purchase (small amount)

2. **Lemon Squeezy:**
   - Use test credit cards: https://docs.lemonsqueezy.com/help/getting-started/test-mode
   - Verify checkout session creation
   - Verify redirect flow
   - Verify webhook delivery
   - Test refund flow

3. **Email Delivery:**
   - Send test emails to multiple providers (Gmail, Outlook, Apple Mail)
   - Verify all gift card details appear correctly
   - Verify sender/recipient information is correct
   - Test both "For Me" and "Send as Gift" flows

### Monitoring

Set up alerts for:
- Failed Reloadly purchases
- Failed webhook processing
- Failed email delivery
- Orders stuck in PENDING status >1 hour

---

## Rollback Plan

If issues occur in production:

1. **Immediate:** Set environment variable `MOCK_MODE=true`
2. **Update adapter constructors to check flag:**
```typescript
constructor() {
  this.useMockData = process.env.MOCK_MODE === 'true';
}
```
3. **Add conditional logic in adapter methods:**
```typescript
async getGiftCardsByCountry(countryCode: string) {
  if (this.useMockData) {
    return MOCK_PRODUCTS.filter(...); // Fallback to mocked data
  }
  
  // Real API call
  ...
}
```

This allows instant rollback to mocked mode without redeploying.

---

## Support

- **Reloadly Support:** https://www.reloadly.com/contact
- **Lemon Squeezy Support:** https://lemonsqueezy.com/help
- **Resend Support:** https://resend.com/support

---

**End of Integration Guide**

This document should be kept up-to-date as integrations are implemented. Add notes about any deviations from the plan or lessons learned during implementation.
