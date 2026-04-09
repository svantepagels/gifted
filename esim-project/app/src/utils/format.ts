/** Format price in cents to display string like "$4.50" */
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/** Format data size for display */
export function formatData(data: string): string {
  return data;
}

/** Format validity period */
export function formatValidity(days: number): string {
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days === 7) return '7 days';
  if (days === 14 || days === 15) return `${days} days`;
  if (days === 30) return '30 days';
  return `${days} days`;
}

/** Calculate price per GB in cents. Returns null for unlimited. */
export function pricePerGB(price: number, data: string): number | null {
  if (data === 'Unlimited') return null;
  const gb = parseInt(data, 10);
  if (!gb) return null;
  return Math.round(price / gb);
}

/** Parse data string to bytes for sorting */
export function dataToBytes(data: string): number {
  if (data === 'Unlimited') return Number.MAX_SAFE_INTEGER;
  const num = parseInt(data, 10);
  return num * 1_000_000_000;
}

/** Generate a slug from country name */
export function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Generate a mock order ID */
export function generateOrderId(): string {
  return `RM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
