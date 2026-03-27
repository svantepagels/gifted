import { chromium } from '@playwright/test';

async function testCheckoutFlow() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('1. Going to homepage...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  console.log('2. Clicking on first product (Amazon)...');
  const productLink = page.locator('a[href="/gift-card/amazon"]').first();
  await productLink.click();
  await page.waitForLoadState('networkidle');
  
  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'test-results/manual-product-page.png' });
  
  console.log('3. Looking for amount buttons...');
  const amountButtons = await page.locator('button').all();
  console.log(`Found ${amountButtons.length} buttons`);
  
  // Click $25 button if it exists
  const amount25 = page.locator('button:has-text("$25")').first();
  const hasAmount25 = await amount25.count() > 0;
  console.log('Has $25 button:', hasAmount25);
  
  if (hasAmount25) {
    console.log('4. Selecting $25 amount...');
    await amount25.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/manual-amount-selected.png' });
    
    console.log('5. Looking for "Continue as Guest" button...');
    const continueButtons = await page.locator('button').all();
    for (let i = 0; i < continueButtons.length; i++) {
      const text = await continueButtons[i].textContent();
      console.log(`Button ${i}: "${text}"`);
    }
    
    const continueButton = page.locator('button:has-text("Continue as Guest")').first();
    const hasContinue = await continueButton.count() > 0;
    console.log('Has Continue button:', hasContinue);
    
    if (hasContinue) {
      console.log('6. Clicking Continue as Guest...');
      await continueButton.click();
      await page.waitForTimeout(2000);
      console.log('Current URL:', page.url());
      await page.screenshot({ path: 'test-results/manual-checkout-page.png' });
    }
  }
  
  await browser.close();
  console.log('Done!');
}

testCheckoutFlow().catch(console.error);
