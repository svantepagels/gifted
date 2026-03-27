import { chromium } from '@playwright/test';

async function debugPage() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Check for errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text());
    }
  });
  
  // Get page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Check if main content is there
  const mainText = await page.locator('main').textContent();
  console.log('Main content length:', mainText.length);
  console.log('Main content preview:', mainText.slice(0, 500));
  
  // Check for specific elements
  const hasHero = await page.locator('text=Digital Gifts').count() > 0;
  console.log('Has hero text:', hasHero);
  
  const hasSearch = await page.locator('input[placeholder*="Search"]').count() > 0;
  console.log('Has search:', hasSearch);
  
  // Check for ProductGrid
  const productGrids = await page.locator('[class*="grid"]').count();
  console.log('Grid elements found:', productGrids);
  
  // Get all links
  const allLinks = await page.locator('a').all();
  console.log(`Total links: ${allLinks.length}`);
  
  // Get links that might be products
  for (let i = 0; i < Math.min(10, allLinks.length); i++) {
    const href = await allLinks[i].getAttribute('href');
    const text = await allLinks[i].textContent();
    if (href && href !== '/') {
      console.log(`Link ${i}: ${href} - "${text?.trim()}"`);
    }
  }
  
  await browser.close();
}

debugPage().catch(console.error);
