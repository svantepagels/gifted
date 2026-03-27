import { GiftCardProduct, GiftCardFilters } from './types'
import { MOCK_GIFT_CARDS, CATEGORIES } from './mock-data'

export class GiftCardService {
  // TODO: Replace with Reloadly adapter when ready
  // This service layer provides stable interface for UI components
  // Implementation can be swapped without changing component code
  
  async getProducts(filters?: GiftCardFilters): Promise<GiftCardProduct[]> {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 100))
    
    let products = [...MOCK_GIFT_CARDS]
    
    // Filter by country
    if (filters?.countryCode) {
      products = products.filter(p => 
        p.countryCodes.includes(filters.countryCode!)
      )
    }
    
    // Filter by category
    if (filters?.category && filters.category !== 'All') {
      products = products.filter(p => 
        p.category === filters.category
      )
    }
    
    // Filter by search query
    if (filters?.search && filters.search.trim()) {
      const query = filters.search.toLowerCase()
      products = products.filter(p =>
        p.brandName.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      )
    }
    
    return products
  }
  
  async getProductBySlug(slug: string): Promise<GiftCardProduct | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return MOCK_GIFT_CARDS.find(p => p.slug === slug) || null
  }
  
  async getCategories(): Promise<string[]> {
    return CATEGORIES
  }
}

// Singleton instance
export const giftCardService = new GiftCardService()
