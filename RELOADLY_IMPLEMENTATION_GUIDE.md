# Reloadly API Implementation Quick Reference

**For CODER Agent** - Copy-paste ready code snippets

---

## 1. Environment Setup

### `.env.local`
```bash
# Reloadly API Credentials
RELOADLY_CLIENT_ID=bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz
RELOADLY_CLIENT_SECRET=ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV

# Environment
RELOADLY_ENVIRONMENT=sandbox

# API URLs
RELOADLY_AUTH_URL=https://auth.reloadly.com
RELOADLY_GIFTCARDS_SANDBOX_URL=https://giftcards-sandbox.reloadly.com
RELOADLY_GIFTCARDS_PRODUCTION_URL=https://giftcards.reloadly.com
```

### `.env.example`
```bash
# Reloadly API Credentials (get from https://www.reloadly.com/developers)
RELOADLY_CLIENT_ID=your_client_id_here
RELOADLY_CLIENT_SECRET=your_client_secret_here

# Environment (sandbox or production)
RELOADLY_ENVIRONMENT=sandbox

# API URLs (do not change)
RELOADLY_AUTH_URL=https://auth.reloadly.com
RELOADLY_GIFTCARDS_SANDBOX_URL=https://giftcards-sandbox.reloadly.com
RELOADLY_GIFTCARDS_PRODUCTION_URL=https://giftcards.reloadly.com
```

---

## 2. TypeScript Types

### `lib/reloadly/types.ts`
```typescript
export interface AuthResponse {
  access_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export interface Brand {
  brandId: number;
  brandName: string;
}

export interface Country {
  isoName: string;
  name: string;
  flagUrl: string;
}

export interface RedeemInstruction {
  concise: string;
  verbose: string;
}

export interface Product {
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
  minSenderDenomination: number | null;
  maxSenderDenomination: number | null;
  fixedRecipientDenominations: number[];
  fixedSenderDenominations: number[];
  fixedRecipientToSenderDenominationsMap: Record<string, number>;
  logoUrls: string[];
  brand: Brand;
  country: Country;
  redeemInstruction: RedeemInstruction;
}

export interface OrderRequest {
  productId: number;
  countryCode: string;
  quantity: number;
  unitPrice: number;
  customIdentifier: string;
  senderName: string;
  recipientEmail: string;
  recipientPhoneDetails?: {
    countryCode: string;
    phoneNumber: string;
  };
}

export interface OrderProduct {
  productId: number;
  productName: string;
  countryCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currencyCode: string;
  brand: Brand;
}

export interface OrderResponse {
  transactionId: number;
  amount: number;
  discount: number;
  currencyCode: string;
  fee: number;
  smsFee: number;
  recipientEmail: string;
  recipientPhone: string;
  customIdentifier: string;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED';
  transactionCreatedTime: string;
  product: OrderProduct;
}

export interface RedeemInstructionsResponse {
  brandId: number;
  brandName: string;
  concise: string;
  verbose: string;
}
```

---

## 3. Reloadly Client

### `lib/reloadly/client.ts`
```typescript
import type {
  AuthResponse,
  Product,
  OrderRequest,
  OrderResponse,
  RedeemInstructionsResponse,
} from './types';

export class ReloadlyClient {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly environment: 'sandbox' | 'production';
  private readonly authUrl: string;
  private readonly baseUrl: string;

  constructor() {
    this.clientId = process.env.RELOADLY_CLIENT_ID || '';
    this.clientSecret = process.env.RELOADLY_CLIENT_SECRET || '';
    this.environment = (process.env.RELOADLY_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    this.authUrl = process.env.RELOADLY_AUTH_URL || 'https://auth.reloadly.com';
    
    this.baseUrl =
      this.environment === 'production'
        ? process.env.RELOADLY_GIFTCARDS_PRODUCTION_URL || 'https://giftcards.reloadly.com'
        : process.env.RELOADLY_GIFTCARDS_SANDBOX_URL || 'https://giftcards-sandbox.reloadly.com';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Reloadly credentials not configured. Check .env.local');
    }
  }

  /**
   * Authenticate with Reloadly and get access token
   */
  private async authenticate(): Promise<string> {
    const response = await fetch(`${this.authUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
        audience: this.baseUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Reloadly authentication failed: ${error}`);
    }

    const data: AuthResponse = await response.json();
    this.accessToken = data.access_token;
    // Set expiry time (current time + expires_in - 60 second buffer)
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return data.access_token;
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    return await this.authenticate();
  }

  /**
   * Get all products available in a specific country
   */
  async getProducts(countryCode: string): Promise<Product[]> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/countries/${countryCode}/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch products: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get all products globally (across all countries)
   */
  async getAllProducts(): Promise<Product[]> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch all products: ${error}`);
    }

    return await response.json();
  }

  /**
   * Place a gift card order
   */
  async placeOrder(orderData: OrderRequest): Promise<OrderResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/com.reloadly.giftcards-v1+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to place order: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get redeem instructions for a specific brand
   */
  async getRedeemInstructions(brandId: number): Promise<RedeemInstructionsResponse> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/redeem-instructions/${brandId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch redeem instructions: ${error}`);
    }

    return await response.json();
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: number): Promise<Product> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.baseUrl}/products/${productId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch product: ${error}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const reloadlyClient = new ReloadlyClient();
```

---

## 4. Next.js API Routes

### `app/api/reloadly/products/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';

export const dynamic = 'force-dynamic'; // Disable static optimization

/**
 * GET /api/reloadly/products?country=US
 * Fetch products for a specific country
 */
export async function GET(request: NextRequest) {
  try {
    const countryCode = request.nextUrl.searchParams.get('country');

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    const products = await reloadlyClient.getProducts(countryCode.toUpperCase());

    return NextResponse.json(products);
  } catch (error) {
    console.error('Reloadly API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

### `app/api/reloadly/order/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';
import type { OrderRequest } from '@/lib/reloadly/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reloadly/order
 * Place a gift card order
 */
export async function POST(request: NextRequest) {
  try {
    const orderData: OrderRequest = await request.json();

    // Validate required fields
    if (!orderData.productId || !orderData.countryCode || !orderData.recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await reloadlyClient.placeOrder(orderData);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Reloadly order error:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
```

### `app/api/reloadly/redeem/[brandId]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reloadly/redeem/22
 * Get redeem instructions for a brand
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const brandId = parseInt(params.brandId, 10);

    if (isNaN(brandId)) {
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      );
    }

    const instructions = await reloadlyClient.getRedeemInstructions(brandId);

    return NextResponse.json(instructions);
  } catch (error) {
    console.error('Reloadly redeem instructions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redeem instructions' },
      { status: 500 }
    );
  }
}
```

---

## 5. Usage Example (Client Component)

### `app/products/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/reloadly/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('US');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const response = await fetch(`/api/reloadly/products?country=${country}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [country]);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Gift Cards</h1>

      {/* Country Selector */}
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className="mb-8 px-4 py-2 border rounded"
      >
        <option value="US">United States</option>
        <option value="GB">United Kingdom</option>
        <option value="CA">Canada</option>
        <option value="AU">Australia</option>
      </select>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.productId} className="border rounded-lg p-4">
            <img
              src={product.logoUrls[0]}
              alt={product.productName}
              className="w-full h-40 object-cover rounded mb-4"
            />
            <h3 className="font-bold text-lg mb-2">{product.productName}</h3>
            <p className="text-gray-600">{product.brand.brandName}</p>
            <p className="text-sm text-gray-500 mt-2">
              {product.fixedRecipientDenominations.join(', ')} {product.recipientCurrencyCode}
            </p>
            <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 6. Testing Checklist

### ✅ Authentication
- [ ] Token is successfully retrieved
- [ ] Token auto-refreshes before expiry
- [ ] Error handling for invalid credentials

### ✅ Product Fetching
- [ ] Products load for country `US`
- [ ] Products load for country `GB`
- [ ] Empty state handled gracefully
- [ ] Network errors handled

### ✅ Order Placement
- [ ] Valid order succeeds
- [ ] Response includes `transactionId`
- [ ] Invalid data returns 400 error
- [ ] API errors handled gracefully

### ✅ Security
- [ ] `.env.local` in `.gitignore`
- [ ] No credentials in client-side code
- [ ] API routes validate input

---

## 7. Common Issues & Solutions

### Issue: "Full authentication is required"

**Solution:** Token expired or invalid. Check:
```typescript
// Verify credentials in .env.local
console.log('Client ID:', process.env.RELOADLY_CLIENT_ID?.substring(0, 10) + '...');
console.log('Environment:', process.env.RELOADLY_ENVIRONMENT);
```

### Issue: Products return empty array

**Solution:** Country code may not have products. Try:
- `US` (United States) - usually has most products
- `GB` (United Kingdom)
- `CA` (Canada)

### Issue: CORS errors in browser

**Solution:** Use API routes (not direct client calls):
```typescript
// ✅ GOOD - via API route
fetch('/api/reloadly/products?country=US')

// ❌ BAD - direct call from client
fetch('https://giftcards-sandbox.reloadly.com/products')
```

---

## 8. Next Steps

1. **Create the files above** in your project
2. **Test authentication** with a simple API route
3. **Verify products load** for at least one country
4. **Build UI components** to display products
5. **Implement order flow** (checkout form → API call → success page)

---

**Ready to code!** 🚀
