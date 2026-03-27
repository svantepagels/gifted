import { test, expect } from '@playwright/test'

test.describe('Product Detail Page', () => {
  test('should display product details and selection options', async ({ page }) => {
    await page.goto('/gift-card/amazon')
    
    // Check product hero
    await expect(page.getByRole('heading', { name: 'Amazon' })).toBeVisible()
    await expect(page.getByText(/Digital Delivery/i)).toBeVisible()
    
    // Check amount selector
    await expect(page.getByText(/Select Amount/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /\$10/i })).toBeVisible()
    
    // Check delivery method toggle
    await expect(page.getByText(/Who is this for/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /For me/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Send as gift/i })).toBeVisible()
    
    // Check order summary
    await expect(page.getByText(/Order Summary/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue as Guest/i })).toBeVisible()
  })
  
  test('should allow selecting amount', async ({ page }) => {
    await page.goto('/gift-card/amazon')
    
    // Click on $25 amount
    await page.getByRole('button', { name: /\$25/i }).click()
    
    // Check that order summary shows the amount
    await expect(page.getByText('$25').nth(1)).toBeVisible() // In order summary
  })
  
  test('should show gift form when "Send as gift" is selected', async ({ page }) => {
    await page.goto('/gift-card/amazon')
    
    // Initially gift form should not be visible
    await expect(page.getByLabel(/Recipient's Email/i)).not.toBeVisible()
    
    // Click "Send as gift"
    await page.getByRole('button', { name: /Send as gift/i }).click()
    
    // Gift form should now be visible
    await expect(page.getByLabel(/Recipient's Email/i)).toBeVisible()
    await expect(page.getByPlaceholder(/Add a personal message/i)).toBeVisible()
  })
  
  test('should enable continue button after amount selection', async ({ page }) => {
    await page.goto('/gift-card/amazon')
    
    // Continue button should be disabled initially
    const continueButton = page.getByRole('button', { name: /Continue as Guest/i }).first()
    await expect(continueButton).toBeDisabled()
    
    // Select an amount
    await page.getByRole('button', { name: /\$50/i }).click()
    
    // Continue button should now be enabled
    await expect(continueButton).toBeEnabled()
  })
})
