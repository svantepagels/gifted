import { test, expect } from '@playwright/test'

test.describe('Complete Checkout Flow', () => {
  test('should complete full purchase flow', async ({ page }) => {
    // Start on home page
    await page.goto('/')
    
    // Click on product
    await page.getByText('Amazon').first().click()
    await expect(page).toHaveURL(/\/gift-card\/amazon/)
    
    // Select amount
    await page.getByRole('button', { name: /\$25/i }).click()
    
    // Continue to checkout
    const continueButton = page.getByRole('button', { name: /Continue as Guest/i }).first()
    await expect(continueButton).toBeEnabled()
    await continueButton.click()
    
    // Should be on checkout page
    await expect(page).toHaveURL(/\/checkout/)
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible()
    
    // Check order review is shown
    await expect(page.getByText(/Order Review/i)).toBeVisible()
    await expect(page.getByText('Amazon')).toBeVisible()
    
    // Fill in email
    const emailInput = page.getByLabel(/^Email Address$/i)
    await emailInput.fill('test@example.com')
    
    const confirmEmailInput = page.getByLabel(/Confirm Email/i)
    await confirmEmailInput.fill('test@example.com')
    
    // Submit payment
    await page.getByRole('button', { name: /Complete Purchase/i }).click()
    
    // Should redirect to success page (mock payment succeeds)
    await expect(page).toHaveURL(/\/success/, { timeout: 10000 })
    
    // Check success elements
    await expect(page.getByText(/Your Gift Card is Ready/i)).toBeVisible()
    await expect(page.getByText(/Gift Card Code/i)).toBeVisible()
    
    // Check that gift card code is displayed
    const codeElement = page.locator('.font-mono').first()
    await expect(codeElement).toBeVisible()
  })
  
  test('should validate email fields', async ({ page }) => {
    await page.goto('/')
    
    // Navigate to product and select amount
    await page.getByText('Netflix').first().click()
    await page.getByRole('button', { name: /\$25/i }).click()
    
    // Go to checkout
    await page.getByRole('button', { name: /Continue as Guest/i }).first().click()
    await expect(page).toHaveURL(/\/checkout/)
    
    // Try to submit without filling email
    await page.getByRole('button', { name: /Complete Purchase/i }).click()
    
    // Should show validation error
    await expect(page.getByText(/Email address is required/i)).toBeVisible()
    
    // Fill different emails
    await page.getByLabel(/^Email Address$/i).fill('test@example.com')
    await page.getByLabel(/Confirm Email/i).fill('different@example.com')
    await page.getByRole('button', { name: /Complete Purchase/i }).click()
    
    // Should show mismatch error
    await expect(page.getByText(/Email addresses do not match/i)).toBeVisible()
  })
})
