/**
 * Client-side helpers to interact with the orders API.
 * Always use these from client components — do NOT import the server-side
 * repository from a client bundle.
 */

import type { CreateOrderInput, Order } from './types'

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    if (data && typeof data.error === 'string') return data.error
  } catch {
    // fall through
  }
  return `Request failed with status ${response.status}`
}

/**
 * Create a pending order server-side.
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = await response.json()
  // Revive Date fields
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Order
}

/**
 * Fetch a single order by ID.
 */
export async function fetchOrder(orderId: string): Promise<Order | null> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    cache: 'no-store',
  })

  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  const data = await response.json()
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  } as Order
}

/**
 * Process (fulfill) an existing pending order.
 * Until payment capture is wired up, this endpoint will happily charge
 * $0 to the customer and hand out a real gift card — do not expose publicly.
 */
export async function processOrder(
  orderId: string,
  customerEmail: string
): Promise<{ transactionId: number; status: string; orderId: string }> {
  const response = await fetch('/api/reloadly/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, customerEmail }),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json()
}
