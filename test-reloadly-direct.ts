#!/usr/bin/env tsx
/**
 * Direct Reloadly API Test
 */

// Inline credentials from .env.local
const RELOADLY_CLIENT_ID = 'bDWZFvXElOXUuyFW3cjaS4UlHSk3peUz';
const RELOADLY_CLIENT_SECRET = 'ZhvbN3zJJo-HMylY6ymUG0AicxLHao-EGeBZFkwlSOpGbsPtHp1dFjiJrZf5SGV';
const AUTH_URL = 'https://auth.reloadly.com';
const BASE_URL = 'https://giftcards-sandbox.reloadly.com';

interface AuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface Product {
  productId: number;
  productName: string;
  brand: { brandId: number; brandName: string };
  country: { isoName: string; name: string };
  denominationType: 'FIXED' | 'RANGE';
  recipientCurrencyCode: string;
  fixedRecipientDenominations?: number[];
  minRecipientDenomination?: number;
  maxRecipientDenomination?: number;
}

async function authenticate(): Promise<string> {
  console.log('🔐 Authenticating with Reloadly...');
  
  const response = await fetch(`${AUTH_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: RELOADLY_CLIENT_ID,
      client_secret: RELOADLY_CLIENT_SECRET,
      grant_type: 'client_credentials',
      audience: BASE_URL,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Auth failed: ${response.status} ${error}`);
  }

  const data: AuthResponse = await response.json();
  console.log(`✅ Authenticated (expires in ${data.expires_in}s)\n`);
  return data.access_token;
}

async function getAllProducts(token: string): Promise<Product[]> {
  console.log('📡 Fetching all products (handling pagination)...');
  
  let allProducts: Product[] = [];
  let page = 0;
  let totalPages = 1;
  
  while (page < totalPages) {
    const response = await fetch(`${BASE_URL}/products?page=${page}&size=200`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed: ${response.status} ${error}`);
    }

    const data = await response.json();
    
    // Handle paginated response
    const products: Product[] = data.content || [];
    allProducts = allProducts.concat(products);
    
    totalPages = data.totalPages || 1;
    
    console.log(`   Page ${page + 1}/${totalPages}: ${products.length} products`);
    page++;
    
    // Safety limit
    if (page >= 50) {
      console.log('   ⚠️  Stopped at page 50 (safety limit)');
      break;
    }
  }
  
  console.log(`✅ Total fetched: ${allProducts.length} products\n`);
  return allProducts;
}

async function getCountryProducts(token: string, countryCode: string): Promise<Product[]> {
  console.log(`📡 Fetching products for ${countryCode}...`);
  
  const response = await fetch(`${BASE_URL}/countries/${countryCode}/products`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed: ${response.status} ${error}`);
  }

  const products: Product[] = await response.json();
  console.log(`✅ Found ${products.length} products for ${countryCode}\n`);
  return products;
}

async function audit() {
  try {
    const token = await authenticate();
    const allProducts = await getAllProducts(token);

    // Group by country
    const byCountry = new Map<string, number>();
    const byBrand = new Map<string, number>();
    const brandsByCountry = new Map<string, Set<string>>();

    allProducts.forEach(p => {
      const country = p.country.isoName;
      byCountry.set(country, (byCountry.get(country) || 0) + 1);
      byBrand.set(p.brand.brandName, (byBrand.get(p.brand.brandName) || 0) + 1);
      
      if (!brandsByCountry.has(country)) {
        brandsByCountry.set(country, new Set());
      }
      brandsByCountry.get(country)!.add(p.brand.brandName);
    });

    console.log('🌍 TOP 20 COUNTRIES:');
    Array.from(byCountry.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .forEach(([country, count], i) => {
        const brands = brandsByCountry.get(country)?.size || 0;
        console.log(`${(i+1).toString().padStart(2)}. ${country.padEnd(5)} - ${count.toString().padStart(4)} products, ${brands.toString().padStart(3)} brands`);
      });

    console.log('\n🏷️  TOP 30 BRANDS:');
    Array.from(byBrand.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .forEach(([brand, count], i) => {
        console.log(`${(i+1).toString().padStart(2)}. ${brand.padEnd(35)} - ${count.toString().padStart(3)} products`);
      });

    // US products detail
    console.log('\n🇺🇸 US PRODUCTS (first 30):');
    const usProducts = allProducts.filter(p => p.country.isoName === 'US').slice(0, 30);
    usProducts.forEach((p, i) => {
      const denoms = p.denominationType === 'FIXED'
        ? `[${p.fixedRecipientDenominations?.slice(0, 4).join(', ')}]`
        : `${p.minRecipientDenomination}-${p.maxRecipientDenomination}`;
      console.log(`${(i+1).toString().padStart(2)}. ${p.brand.brandName.padEnd(30)} | ${p.recipientCurrencyCode} ${denoms}`);
    });

    // Check our mock brands (case-insensitive)
    console.log('\n📊 MOCK BRAND COVERAGE:');
    const mockBrands = ['Amazon', 'Spotify', 'Starbucks', 'Netflix', 'Target', 'Uber', 'Steam', 'Walmart'];
    const brandNameMap = new Map<string, string>();
    allProducts.forEach(p => {
      brandNameMap.set(p.brand.brandName.toLowerCase(), p.brand.brandName);
    });
    
    mockBrands.forEach(brand => {
      const lowerBrand = brand.toLowerCase();
      const actualName = brandNameMap.get(lowerBrand);
      const count = actualName ? byBrand.get(actualName) : 0;
      console.log(`${actualName ? '✅' : '❌'} ${brand.padEnd(15)} ${actualName ? `(${count} products as "${actualName}")` : '(NOT FOUND)'}`);
    });

    console.log('\n💡 SUMMARY:');
    console.log(`   Total products: ${allProducts.length}`);
    console.log(`   Total countries: ${byCountry.size}`);
    console.log(`   Total brands: ${byBrand.size}`);
    console.log(`   US products: ${byCountry.get('US') || 0}`);
    console.log(`   Current mock: 8 brands`);
    console.log(`   Gap: ${byBrand.size - 8} brands missing`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

audit();
