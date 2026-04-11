#!/usr/bin/env tsx
/**
 * Verify live site is showing Reloadly products
 */

const PRODUCTION_URL = 'https://gifted-project-blue.vercel.app';

async function verifyLiveSite() {
  console.log('🔍 Verifying live site...\n');
  
  try {
    console.log(`📡 Fetching ${PRODUCTION_URL}...`);
    const response = await fetch(PRODUCTION_URL);
    
    if (!response.ok) {
      console.log(`❌ Site request failed: ${response.status}`);
      process.exit(1);
    }
    
    const html = await response.text();
    
    // Check for Reloadly product IDs
    const reloadlyIds = html.match(/reloadly-\d+/g) || [];
    const uniqueIds = [...new Set(reloadlyIds)];
    
    console.log('\n✅ Reloadly Integration Status:');
    console.log(`   Reloadly Product IDs found: ${uniqueIds.length}`);
    
    if (uniqueIds.length > 0) {
      console.log(`   Sample IDs: ${uniqueIds.slice(0, 10).join(', ')}`);
    }
    
    // Check for old mock data
    const hasMockData = html.includes('netflix-us-digital') || 
                        html.includes('steam-us-digital') ||
                        html.includes('amazon-us-digital');
    
    console.log(`   Has Old Mock Data: ${hasMockData ? '❌ Yes' : '✅ No'}`);
    
    // Look for brand names in the HTML
    const brandMatches = html.match(/"brandName":"([^"]+)"/g) || [];
    const brands = brandMatches
      .map(m => m.match(/"brandName":"([^"]+)"/)?.[1])
      .filter(Boolean)
      .slice(0, 20);
    
    if (brands.length > 0) {
      console.log('\n📦 Brands Showing on Homepage:');
      const uniqueBrands = [...new Set(brands)];
      uniqueBrands.slice(0, 15).forEach((brand, i) => {
        console.log(`   ${i + 1}. ${brand}`);
      });
      console.log(`   ... and ${Math.max(0, uniqueBrands.length - 15)} more`);
    }
    
    // Look for categories
    const categoryMatches = html.match(/"category":"([^"]+)"/g) || [];
    const categories = [...new Set(
      categoryMatches
        .map(m => m.match(/"category":"([^"]+)"/)?.[1])
        .filter(Boolean)
    )];
    
    if (categories.length > 0) {
      console.log('\n🏷️  Categories Found:');
      categories.forEach(cat => {
        console.log(`   - ${cat}`);
      });
    }
    
    // Final verdict
    console.log('\n' + '='.repeat(60));
    
    if (uniqueIds.length >= 5 && !hasMockData) {
      console.log('🎉 SUCCESS! Production site is using Reloadly catalog.');
      console.log(`   ${uniqueIds.length} Reloadly products detected`);
      console.log(`   ${brands.length} unique brands showing`);
      console.log(`   ${categories.length} categories available`);
      console.log('\n✅ Catalog integration is LIVE and working!');
      process.exit(0);
    } else if (uniqueIds.length > 0) {
      console.log('⚠️  PARTIAL: Some Reloadly products detected.');
      console.log(`   ${uniqueIds.length} Reloadly IDs found`);
      if (hasMockData) {
        console.log('   ⚠️  But mock data is still present');
      }
      process.exit(0);
    } else {
      console.log('❌ FAILED: No Reloadly products detected.');
      console.log('   Site may still be using mock data.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyLiveSite();
