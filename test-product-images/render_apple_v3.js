const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: 1 });
  const htmlPath = path.join(__dirname, 'apple-card-v3.html');
  await page.goto(`file://${htmlPath}`);
  await page.waitForTimeout(500);
  const out = path.join(__dirname, 'apple-gift-card-v3.png');
  await page.screenshot({ path: out, type: 'png' });
  console.log('Saved:', out);
  await browser.close();
})();
