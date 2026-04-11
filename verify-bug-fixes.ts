#!/usr/bin/env ts-node
/**
 * Verify Critical Bug Fixes
 * 
 * Tests all three bug fixes:
 * 1. Pagination - Complete catalog loading
 * 2. Deduplication - No duplicate brands
 * 3. Blank pages - Product detail loading
 */

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

import { giftCardService } from './lib/giftcards/service';
import { reloadlyClient } from './lib/reloadly/client';

async function main() {
  console.log('\n🔍 VERIFYING BUG FIXES\n');
  console.log('=' .repeat(60));
  
  // ============================================================
  // BUG #2: PAGINATION TEST
  // ============================================================
  console.log('\n📊 BUG #2: Testing Pagination (Complete Catalog Loading)');
  console.log('-'.repeat(60));
  
  try {
    console.log('Fetching all products with new pagination logic...');
    const startTime = Date.now();
    const allProducts = await giftCardService['getAllProductsCached']();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`✅ Total products fetched: ${allProducts.length}`);
    console.log(`⏱️  Time elapsed: ${elapsed}s`);
    
    // Check if we got more than just 1-2 pages worth
    if (allProducts.length < 400) {
      console.log('❌ FAIL: Only got ~1-2 pages of products (expected 5000-10000+)');
    } else if (allProducts.length < 1000) {
      console.log('⚠️  WARNING: Got some products but less than expected. Check pagination logs.');
    } else {
      console.log(`✅ PASS: Got ${allProducts.length} products (pagination working!)`);
    }
    
    // Count unique brands before deduplication
    const brandCounts = new Map<string, number>();
    allProducts.forEach(p => {
      const brand = p.brandName.toLowerCase().trim();
      brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
    });
    
    console.log(`📈 Unique brands (before dedup): ${brandCounts.size}`);
    console.log(`📈 Total products (all variants): ${allProducts.length}`);
    
  } catch (error) {
    console.log('❌ FAIL: Pagination test failed');
    console.error(error);
  }
  
  // ============================================================
  // BUG #1: DEDUPLICATION TEST
  // ============================================================
  console.log('\n🎯 BUG #1: Testing Deduplication (No Duplicate Brands)');
  console.log('-'.repeat(60));
  
  try {
    // Get products without country filter (should trigger deduplication)
    const products = await giftCardService.getProducts();
    
    console.log(`📦 Products after deduplication: ${products.length}`);
    
    // Check for duplicates
    const brandsSeen = new Set<string>();
    const duplicates: string[] = [];
    
    products.forEach(p => {
      const brand = p.brandName.toLowerCase().trim();
      if (brandsSeen.has(brand)) {
        duplicates.push(p.brandName);
      }
      brandsSeen.add(brand);
    });
    
    if (duplicates.length > 0) {
      console.log(`❌ FAIL: Found ${duplicates.length} duplicate brands:`);
      duplicates.slice(0, 10).forEach(d => console.log(`   - ${d}`));
    } else {
      console.log(`✅ PASS: No duplicate brands found (${brandsSeen.size} unique brands)`);
    }
    
    // Show top brands for verification
    console.log('\n📋 Sample brands (should appear only once each):');
    const sampleBrands = Array.from(brandsSeen).slice(0, 10);
    sampleBrands.forEach((brand, i) => {
      console.log(`   ${i + 1}. ${brand}`);
    });
    
  } catch (error) {
    console.log('❌ FAIL: Deduplication test failed');
    console.error(error);
  }
  
  // ============================================================
  // BUG #3: PRODUCT DETAIL TEST
  // ============================================================
  console.log('\n🔍 BUG #3: Testing Product Detail Loading (No Blank Pages)');
  console.log('-'.repeat(60));
  
  try {
    // Get a product to test
    const products = await giftCardService.getProducts();
    
    if (products.length === 0) {
      console.log('⚠️  SKIP: No products available to test');
    } else {
      const testProduct = products[0];
      console.log(`Testing product lookup: ${testProduct.brandName} (${testProduct.slug})`);
      
      // Try to fetch by slug (should have logging)
      const foundProduct = await giftCardService.getProductBySlug(testProduct.slug);
      
      if (!foundProduct) {
        console.log(`❌ FAIL: Product not found by slug: ${testProduct.slug}`);
      } else if (foundProduct.slug !== testProduct.slug) {
        console.log(`❌ FAIL: Wrong product returned (expected ${testProduct.slug}, got ${foundProduct.slug})`);
      } else {
        console.log(`✅ PASS: Product found correctly with proper logging`);
        console.log(`   Brand: ${foundProduct.brandName}`);
        console.log(`   Slug: ${foundProduct.slug}`);
        console.log(`   Countries: ${foundProduct.countryCodes.length}`);
      }
      
      // Test invalid slug (should log error and return null)
      console.log('\nTesting invalid slug (should log error):');
      const invalidProduct = await giftCardService.getProductBySlug('invalid-product-slug-12345');
      
      if (invalidProduct === null) {
        console.log('✅ PASS: Invalid slug returns null (check logs above for error message)');
      } else {
        console.log('❌ FAIL: Invalid slug should return null');
      }
    }
    
  } catch (error) {
    console.log('❌ FAIL: Product detail test failed');
    console.error(error);
  }
  
  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n' + '='.repeat(60));
  console.log('✅ ALL TESTS COMPLETE');
  console.log('='.repeat(60));
  console.log('\nExpected Results:');
  console.log('  • Bug #2: 5000-10000+ products fetched (not ~400)');
  console.log('  • Bug #1: Each brand appears once (not 5-15 times)');
  console.log('  • Bug #3: Clear logging and error messages');
  console.log('\nCheck production URL: https://gifted-project-blue.vercel.app');
  console.log('');
}

main().catch(console.error);
