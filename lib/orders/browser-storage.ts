/**
 * Optional client-side cache for the most-recent order.
 *
 * The server-side repository (Redis) is the source of truth for orders.
 * This cache is kept only as an optimistic UX layer: if the /api/orders/:id
 * GET is slow or briefly unavailable, pages that have just issued a POST can
 * render immediately from sessionStorage while refetching in the background.
 *
 * Never trust the cached data for authorization or fulfillment decisions.
 * Always refetch from the server before any mutating action.
 */

import { Order } from './types'

const STORAGE_KEY = 'gifted_current_order'

export class BrowserOrderStorage {
  save(order: Order): void {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order))
    } catch {
      // Non-critical — server remains the source of truth.
    }
  }

  load(): Order | null {
    if (typeof window === 'undefined') return null
    try {
      const data = sessionStorage.getItem(STORAGE_KEY)
      if (!data) return null
      const order = JSON.parse(data)
      order.createdAt = new Date(order.createdAt)
      order.updatedAt = new Date(order.updatedAt)
      return order
    } catch {
      return null
    }
  }

  clear(): void {
    if (typeof window === 'undefined') return
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore
    }
  }
}

export const browserOrderStorage = new BrowserOrderStorage()
