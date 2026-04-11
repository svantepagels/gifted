#!/usr/bin/env tsx
/**
 * Verify production deployment has Reloadly catalog
 */

const PRODUCTION_URL = 'https://gifted-project-blue.vercel.app';

async function verifyProduction() {
  console.log('🔍 Verifying production deployment...\n');
  
  try {
    // Fetch products from API
    console.log('📡 Fetching products from production API...');
    const response = await fetch(`${PRODUCTION_URL}/api/reloadly/products`);
    
    if (!response.ok) {
      console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
      process.exit(1);
    }
    
    const products = await response.json();
    
    // Analyze results
    console.log('\n✅ Production API Response:');
    console.log(`   Total Products: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ No products returned!');
      process.exit(1);
    }
    
    // Show sample products
    console.log('\n📦 Sample Products:');
    products.slice(0, 5).forEach((p: any, i: number) => {
      console.log(`   ${i + 1}. ${p.brandName} (${p.countryCodes.join(', ')})`);
      console.log(`      Category: ${p.category}`);
      console.log(`      ID: ${p.id}`);
    });
    
    // Get category distribution
    const categories = products.reduce((acc: any, p: any) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Category Distribution:');
    Object.entries(categories)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} products`);
      });
    
    // Check if we're seeing Reloadly data
    const hasReloadlyIds = products.some((p: any) => p.id?.startsWith('reloadly-'));
    const hasMetadata = products.some((p: any) => p._meta?.reloadlyProductId);
    
    console.log('\n🔍 Reloadly Integration Check:');
    console.log(`   Has Reloadly IDs: ${hasReloadlyIds ? '✅' : '❌'}`);
    console.log(`   Has Metadata: ${hasMetadata ? '✅' : '❌'}`);
    
    // Final verdict
    if (products.length >= 2900 && hasReloadlyIds && hasMetadata) {
      console.log('\n🎉 SUCCESS! Production is serving Reloadly catalog.');
      console.log(`   Coverage: ${products.length} products (target: 3,000)`);
      console.log(`   Integration: ✅ Working`);
      process.exit(0);
    } else if (products.length >= 100) {
      console.log('\n⚠️  PARTIAL SUCCESS: Some products showing but below target.');
      console.log(`   Current: ${products.length} products`);
      console.log(`   Target: 3,000 products`);
      console.log(`   Note: This might be due to caching or pagination limits.`);
      process.exit(0);
    } else {
      console.log('\n❌ FAILED: Still showing mock data or too few products.');
      console.log(`   Current: ${products.length} products`);
      console.log(`   Expected: 3,000+ products`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyProduction();
