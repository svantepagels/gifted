#!/usr/bin/env tsx
/**
 * Audit Reloadly Catalog Coverage
 * 
 * This script:
 * 1. Fetches ALL products from Reloadly API
 * 2. Analyzes product categories, brands, and countries
 * 3. Compares with current mock data
 * 4. Identifies gaps and opportunities
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });
import { reloadlyClient } from './lib/reloadly/client';

async function auditCatalog() {
  console.log('🔍 Auditing Reloadly Catalog Coverage...\n');

  try {
    // Fetch all products globally
    console.log('📡 Fetching all products from Reloadly API...');
    const allProducts = await reloadlyClient.getAllProducts();
    
    console.log(`✅ Total products available: ${allProducts.length}\n`);

    // Analyze by country
    const byCountry = new Map<string, number>();
    const byBrand = new Map<string, number>();
    const byDenominationType = new Map<string, number>();
    const brandsByCountry = new Map<string, Set<string>>();

    allProducts.forEach(product => {
      const country = product.country.isoName;
      byCountry.set(country, (byCountry.get(country) || 0) + 1);
      byBrand.set(product.brand.brandName, (byBrand.get(product.brand.brandName) || 0) + 1);
      byDenominationType.set(product.denominationType, (byDenominationType.get(product.denominationType) || 0) + 1);
      
      if (!brandsByCountry.has(country)) {
        brandsByCountry.set(country, new Set());
      }
      brandsByCountry.get(country)!.add(product.brand.brandName);
    });

    // Top countries
    console.log('🌍 TOP 20 COUNTRIES BY PRODUCT COUNT:');
    const topCountries = Array.from(byCountry.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    topCountries.forEach(([country, count], idx) => {
      const brands = brandsByCountry.get(country)?.size || 0;
      console.log(`${idx + 1}. ${country.padEnd(5)} - ${count.toString().padStart(4)} products (${brands} unique brands)`);
    });

    // Top brands
    console.log('\n🏷️  TOP 30 BRANDS:');
    const topBrands = Array.from(byBrand.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
    
    topBrands.forEach(([brand, count], idx) => {
      console.log(`${(idx + 1).toString().padStart(2)}. ${brand.padEnd(30)} - ${count.toString().padStart(3)} products`);
    });

    // Denomination types
    console.log('\n💰 DENOMINATION TYPES:');
    byDenominationType.forEach((count, type) => {
      console.log(`  ${type}: ${count} products`);
    });

    // Sample US products for verification
    console.log('\n🇺🇸 SAMPLE US PRODUCTS (first 20):');
    const usProducts = allProducts.filter(p => p.country.isoName === 'US').slice(0, 20);
    usProducts.forEach((product, idx) => {
      const denoms = product.denominationType === 'FIXED' 
        ? `Fixed: ${product.fixedRecipientDenominations.slice(0, 3).join(', ')}...`
        : `Range: ${product.minRecipientDenomination}-${product.maxRecipientDenomination}`;
      console.log(`${(idx + 1).toString().padStart(2)}. ${product.brand.brandName.padEnd(30)} | ${product.recipientCurrencyCode} | ${denoms}`);
    });

    // Compare with mock data
    console.log('\n📊 COVERAGE ANALYSIS:');
    const mockBrands = ['Amazon', 'Spotify', 'Starbucks', 'Netflix', 'Target', 'Uber', 'Steam', 'Walmart'];
    const reloadlyBrands = new Set(allProducts.map(p => p.brand.brandName));
    
    console.log('Current mock brands coverage in Reloadly:');
    mockBrands.forEach(brand => {
      const available = reloadlyBrands.has(brand);
      console.log(`  ${available ? '✅' : '❌'} ${brand}`);
    });

    // Identify popular brands we're missing
    console.log('\n🎯 POPULAR BRANDS WE COULD ADD:');
    const popularBrands = topBrands.slice(0, 50).map(([brand]) => brand);
    const missingBrands = popularBrands.filter(brand => !mockBrands.includes(brand));
    missingBrands.slice(0, 20).forEach((brand, idx) => {
      const count = byBrand.get(brand) || 0;
      console.log(`${(idx + 1).toString().padStart(2)}. ${brand.padEnd(30)} (${count} products)`);
    });

    // Category potential (inferred from brand names)
    console.log('\n📂 RECOMMENDED CATEGORIES TO ADD:');
    const categories = inferCategories(allProducts);
    categories.forEach(([category, count]) => {
      console.log(`  ${category.padEnd(20)} - ${count} products`);
    });

    console.log('\n✅ Audit complete!\n');
    console.log('💡 RECOMMENDATIONS:');
    console.log('1. Replace mock data with Reloadly API integration');
    console.log('2. Current mock shows 8 brands, Reloadly has thousands');
    console.log(`3. Focus on US market first (${byCountry.get('US') || 0} products available)`);
    console.log('4. Implement category detection from brand names');
    console.log('5. Add caching layer for product catalog');

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Details:', error.message);
    }
    process.exit(1);
  }
}

function inferCategories(products: any[]): [string, number][] {
  const categories = new Map<string, number>();
  
  products.forEach(product => {
    const name = product.brand.brandName.toLowerCase();
    let category = 'Other';
    
    // Entertainment
    if (/spotify|netflix|hulu|disney|hbo|apple music|youtube|paramount/i.test(name)) {
      category = 'Entertainment';
    }
    // Gaming
    else if (/steam|xbox|playstation|nintendo|roblox|fortnite|league of legends|epic games/i.test(name)) {
      category = 'Gaming';
    }
    // Shopping
    else if (/amazon|walmart|target|ebay|etsy|best buy|home depot|lowe/i.test(name)) {
      category = 'Shopping';
    }
    // Food & Drink
    else if (/starbucks|mcdonald|burger king|subway|domino|pizza|dunkin|chipotle|panera/i.test(name)) {
      category = 'Food & Drink';
    }
    // Travel
    else if (/uber|lyft|airbnb|booking|expedia|hotels|southwest|delta|united/i.test(name)) {
      category = 'Travel';
    }
    // Beauty & Fashion
    else if (/sephora|ulta|nike|adidas|foot locker|gap|old navy/i.test(name)) {
      category = 'Beauty & Fashion';
    }
    
    categories.set(category, (categories.get(category) || 0) + 1);
  });
  
  return Array.from(categories.entries()).sort((a, b) => b[1] - a[1]);
}

// Run audit
auditCatalog();
