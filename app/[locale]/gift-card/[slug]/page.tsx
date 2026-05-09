import { notFound } from 'next/navigation'
import { giftCardService } from '@/lib/giftcards/service'
import { ProductDetailClient } from './ProductDetailClient'

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

/**
 * Product Detail Page - Server Component
 * 
 * FIXED: Converted to Server Component to properly access Reloadly API credentials
 * Server components can access process.env variables, client components cannot.
 * 
 * This component:
 * 1. Fetches product data server-side (has access to env vars)
 * 2. Validates the product exists
 * 3. Passes product to ProductDetailClient for interactivity
 */
export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  console.log('[ProductDetailPage] Server-side fetch for slug:', params.slug)
  
  // Fetch product server-side (has access to process.env)
  const product = await giftCardService.getProductBySlug(params.slug)
  
  // If product not found, show 404
  if (!product) {
    console.error('[ProductDetailPage] Product not found:', params.slug)
    notFound()
  }
  
  console.log('[ProductDetailPage] Product loaded:', product.brandName)
  
  // Pass product to client component for interactivity
  return <ProductDetailClient product={product} />
}

/**
 * Generate static params for popular products (optional optimization)
 * This enables static generation for common products at build time
 */
export async function generateStaticParams() {
  // Fetch first 50 products for static generation
  try {
    const products = await giftCardService.getProducts()
    
    // Take first 50 products for static generation
    const topProducts = products.slice(0, 50)
    
    return topProducts.map((product) => ({
      slug: product.slug,
    }))
  } catch (error) {
    console.error('[generateStaticParams] Failed to fetch products:', error)
    return []
  }
}

/**
 * Enable dynamic rendering for products not in static params
 */
export const dynamicParams = true

/**
 * Revalidate every hour (3600 seconds)
 */
export const revalidate = 3600
