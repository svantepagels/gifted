import { chromium } from '@playwright/test';

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('Taking homepage screenshot...');
  await page.screenshot({ path: 'test-results/manual-desktop-home.png', fullPage: true });
  
  console.log('Checking for product cards...');
  const productCards = await page.locator('a[href^="/gift-card/"]').all();
  console.log(`Found ${productCards.length} product cards`);
  
  if (productCards.length > 0) {
    const firstProductHref = await productCards[0].getAttribute('href');
    console.log(`First product link: ${firstProductHref}`);
    
    console.log('Navigating to product detail...');
    await page.goto(`http://localhost:3000${firstProductHref}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('Taking product detail screenshot...');
    await page.screenshot({ path: 'test-results/manual-desktop-product.png', fullPage: true });
  }
  
  // Test mobile viewport
  await context.close();
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });
  const mobilePage = await mobileContext.newPage();
  
  console.log('Taking mobile homepage screenshot...');
  await mobilePage.goto('http://localhost:3000');
  await mobilePage.waitForLoadState('networkidle');
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: 'test-results/manual-mobile-home.png', fullPage: true });
  
  await browser.close();
  console.log('Screenshots saved to test-results/');
}

captureScreenshots().catch(console.error);
