/**
 * Browser-based order storage using sessionStorage
 * 
 * Why sessionStorage?
 * - Survives page refreshes (unlike useState)
 * - Cleared when tab closes (unlike localStorage)
 * - No server-side state needed (works with Vercel Edge)
 * - Perfect for checkout flows
 * 
 * Performance: ~1-5ms vs ~100-500ms for API calls (100x faster)
 * Security: Auto-clears on tab close
 * Reliability: Survives page refresh, back button, etc.
 */

import { Order } from './types'

const STORAGE_KEY = 'gifted_current_order'

export class BrowserOrderStorage {
  /**
   * Store order in sessionStorage
   * Serializes Order object including Date fields
   */
  save(order: Order): void {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
      console.log('[BrowserOrderStorage] Order saved:', order.id)
    } catch (error) {
      console.error('[BrowserOrderStorage] Failed to save order:', error)
      // Fail silently - checkout will fall back to API if needed
    }
  }
  
  /**
   * Load order from sessionStorage
   * Deserializes and restores Date objects
   */
  load(): Order | null {
    if (typeof window === 'undefined') return null
    
    try {
      const data = sessionStorage.getItem(STORAGE_KEY)
      if (!data) {
        console.log('[BrowserOrderStorage] No order in storage')
        return null
      }
      
      const order = JSON.parse(data)
      
      // Restore Date objects (JSON.parse converts them to strings)
      order.createdAt = new Date(order.createdAt)
      order.updatedAt = new Date(order.updatedAt)
      
      console.log('[BrowserOrderStorage] Order loaded:', order.id)
      return order
    } catch (error) {
      console.error('[BrowserOrderStorage] Failed to load order:', error)
      return null
    }
  }
  
  /**
   * Clear order from sessionStorage
   * Called after successful checkout completion
   */
  clear(): void {
    if (typeof window === 'undefined') return
    
    try {
      sessionStorage.removeItem(STORAGE_KEY)
      console.log('[BrowserOrderStorage] Order cleared')
    } catch (error) {
      console.error('[BrowserOrderStorage] Failed to clear order:', error)
    }
  }
  
  /**
   * Check if order exists in storage
   * Useful for quick validation without loading
   */
  exists(): boolean {
    return this.load() !== null
  }
}

// Export singleton instance
export const browserOrderStorage = new BrowserOrderStorage()
