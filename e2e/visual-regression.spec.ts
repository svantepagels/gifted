import { test, expect } from '@playwright/test'

// Visual regression tests use the projects defined in playwright.config.ts
// (chromium-desktop and chromium-mobile with specific viewports)

test.describe('Visual Regression Tests', () => {
  test('home page matches design', async ({ page, viewport }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Scroll to show full page including trust section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    
    // Take screenshot - name will include viewport from project
    const screenshotName = viewport && viewport.width && viewport.width > 768 
      ? 'desktop-home.png' 
      : 'mobile-home.png'
    
    await expect(page).toHaveScreenshot(screenshotName, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05, // 5% tolerance
    })
  })
  
  test('product detail page matches design', async ({ page, viewport }) => {
    const product = viewport && viewport.width && viewport.width > 768 ? 'amazon' : 'starbucks'
    await page.goto(`/gift-card/${product}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    const screenshotName = viewport && viewport.width && viewport.width > 768
      ? 'desktop-product-detail.png'
      : 'mobile-product-detail.png'
    
    await expect(page).toHaveScreenshot(screenshotName, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
  
  test('product detail with amount selected', async ({ page, viewport }) => {
    // Only test on desktop to avoid duplication
    if (!viewport || !viewport.width || viewport.width <= 768) {
      test.skip()
    }
    
    await page.goto('/gift-card/amazon')
    await page.waitForLoadState('networkidle')
    
    // Select amount
    await page.getByRole('button', { name: /\$25/i }).click()
    await page.waitForTimeout(300)
    
    await expect(page).toHaveScreenshot('desktop-product-detail-selected.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
  
  test('checkout page matches design', async ({ page, viewport }) => {
    // Set up mock order data in context
    await page.goto('/gift-card/amazon')
    await page.waitForLoadState('networkidle')
    
    // Select amount and proceed
    await page.getByRole('button', { name: /\$50/i }).click()
    await page.getByRole('button', { name: /for me/i }).click()
    
    // Fill email and continue
    await page.getByLabel(/email/i).first().fill('test@example.com')
    await page.getByRole('button', { name: /continue/i }).click()
    
    await page.waitForURL('**/checkout')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)
    
    const screenshotName = viewport && viewport.width && viewport.width > 768
      ? 'desktop-checkout.png'
      : 'mobile-checkout.png'
    
    await expect(page).toHaveScreenshot(screenshotName, {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixelRatio: 0.05,
    })
  })
})
