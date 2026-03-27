import { test, expect } from '@playwright/test'

test.describe('Browse/Home Page', () => {
  test('should display hero section and product grid', async ({ page }) => {
    await page.goto('/')
    
    // Check hero section
    await expect(page.getByRole('heading', { name: /Digital Gifts That Arrive Instantly/i })).toBeVisible()
    
    // Check search bar
    await expect(page.getByPlaceholder(/Search gift cards/i)).toBeVisible()
    
    // Check category chips
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Shopping' })).toBeVisible()
    
    // Check products are displayed
    await expect(page.getByText('Amazon')).toBeVisible()
    await expect(page.getByText('Spotify')).toBeVisible()
  })
  
  test('should filter products by search', async ({ page }) => {
    await page.goto('/')
    
    // Type in search box
    await page.getByPlaceholder(/Search gift cards/i).fill('Amazon')
    
    // Wait for URL to update
    await page.waitForURL(/q=Amazon/)
    
    // Check that Amazon is visible
    await expect(page.getByText('Amazon')).toBeVisible()
  })
  
  test('should filter products by category', async ({ page }) => {
    await page.goto('/')
    
    // Click on Entertainment category
    await page.getByRole('button', { name: 'Entertainment' }).click()
    
    // Wait for URL to update
    await page.waitForURL(/category=Entertainment/)
    
    // Check that Entertainment products are visible
    await expect(page.getByText('Spotify')).toBeVisible()
    await expect(page.getByText('Netflix')).toBeVisible()
  })
  
  test('should navigate to product detail', async ({ page }) => {
    await page.goto('/')
    
    // Click on a product card
    await page.getByText('Amazon').first().click()
    
    // Check URL changed
    await expect(page).toHaveURL(/\/gift-card\//)
    
    // Check product detail elements
    await expect(page.getByRole('heading', { name: 'Amazon' })).toBeVisible()
    await expect(page.getByText(/Select Amount/i)).toBeVisible()
  })
})
