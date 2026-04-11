#!/usr/bin/env tsx
/**
 * Catalog Integration Verification Script
 * 
 * Run this AFTER implementing the changes to verify everything works.
 * 
 * Usage: npx tsx verify-catalog-integration.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment
config({ path: resolve(process.cwd(), '.env.local') });

async function verify() {
  console.log('🔍 Verifying Catalog Integration...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Check environment variables
  console.log('1️⃣  Checking environment variables...');
  const requiredEnvVars = [
    'RELOADLY_CLIENT_ID',
    'RELOADLY_CLIENT_SECRET',
    'RELOADLY_ENVIRONMENT',
  ];
  
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  if (missingVars.length > 0) {
    console.log(`   ❌ Missing: ${missingVars.join(', ')}`);
    failed++;
  } else {
    console.log('   ✅ All environment variables configured');
    passed++;
  }
  
  // Test 2: Import and verify transform module
  console.log('\n2️⃣  Checking transform module...');
  try {
    const { transformReloadlyProduct, inferCategory } = await import('./lib/giftcards/transform.js');
    
    // Test category inference
    const testCategories = {
      'Steam': 'Gaming',
      'Netflix': 'Entertainment',
      'Amazon': 'Shopping',
      'Starbucks': 'Food & Drink',
      'Uber': 'Travel',
    };
    
    let categoryTestsPassed = true;
    for (const [brand, expectedCategory] of Object.entries(testCategories)) {
      const result = inferCategory(brand);
      if (result !== expectedCategory) {
        console.log(`   ❌ ${brand} → ${result} (expected ${expectedCategory})`);
        categoryTestsPassed = false;
      }
    }
    
    if (categoryTestsPassed) {
      console.log('   ✅ Transform module working (category inference correct)');
      passed++;
    } else {
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Transform module error:`, error);
    failed++;
  }
  
  // Test 3: Import and verify cache module
  console.log('\n3️⃣  Checking cache module...');
  try {
    const { productCache, CacheTTL, CacheKeys } = await import('./lib/giftcards/cache.js');
    
    // Test cache operations
    const testKey = 'test-key';
    const testData = { foo: 'bar' };
    
    productCache.set(testKey, testData);
    const cached = productCache.get<typeof testData>(testKey, 1000);
    
    if (cached && cached.foo === 'bar') {
      console.log('   ✅ Cache module working');
      passed++;
    } else {
      console.log('   ❌ Cache not working correctly');
      failed++;
    }
    
    productCache.clear();
  } catch (error) {
    console.log(`   ❌ Cache module error:`, error);
    failed++;
  }
  
  // Test 4: Verify Reloadly client has pagination methods
  console.log('\n4️⃣  Checking Reloadly client...');
  try {
    const { reloadlyClient } = await import('./lib/reloadly/client.js');
    
    const hasPagination = typeof (reloadlyClient as any).getAllProductsPaginated === 'function';
    
    if (hasPagination) {
      console.log('   ✅ Reloadly client has pagination support');
      passed++;
    } else {
      console.log('   ❌ Reloadly client missing getAllProductsPaginated()');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Reloadly client error:`, error);
    failed++;
  }
  
  // Test 5: Try to import new service
  console.log('\n5️⃣  Checking service integration...');
  try {
    const serviceModule = await import('./lib/giftcards/service.js') as any;
    const service = serviceModule.giftCardService || serviceModule.default;
    
    if (!service) {
      console.log('   ❌ Could not find giftCardService export');
      failed++;
    } else if (typeof service.getProducts !== 'function') {
      console.log('   ❌ Service missing getProducts() method');
      failed++;
    } else if (typeof service.getCacheStats === 'function') {
      console.log('   ✅ Service has Reloadly integration (getCacheStats exists)');
      passed++;
    } else {
      console.log('   ⚠️  Service exists but might still be using mock data');
      console.log('      (Check if service.ts was replaced with service-reloadly.ts)');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ Service import error:`, error);
    failed++;
  }
  
  // Test 6: Live API test (optional, can be slow)
  console.log('\n6️⃣  Testing live Reloadly API connection...');
  try {
    const { reloadlyClient } = await import('./lib/reloadly/client.js');
    
    console.log('   📡 Fetching first page of products...');
    const products = await (reloadlyClient as any).getAllProductsPaginated(0, 10);
    
    if (products && products.length > 0) {
      console.log(`   ✅ API working (fetched ${products.length} products)`);
      console.log(`      Sample: ${products[0].brand.brandName} (${products[0].country.isoName})`);
      passed++;
    } else {
      console.log('   ❌ API returned no products');
      failed++;
    }
  } catch (error) {
    console.log(`   ❌ API test failed:`, error);
    if (error instanceof Error && error.message.includes('credentials')) {
      console.log('      → Check your RELOADLY_CLIENT_ID and RELOADLY_CLIENT_SECRET');
    }
    failed++;
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Ready to deploy.');
    console.log('\nNext steps:');
    console.log('1. npm run dev              → Test locally');
    console.log('2. git commit & push        → Commit changes');
    console.log('3. vercel --prod            → Deploy to production');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Fix issues before deploying.');
    console.log('\nCommon fixes:');
    console.log('- Make sure you copied all new files to lib/giftcards/');
    console.log('- Verify lib/reloadly/client.ts has pagination methods');
    console.log('- Check that service.ts was replaced with service-reloadly.ts');
    console.log('- Ensure .env.local has correct Reloadly credentials');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

verify();
