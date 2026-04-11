import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';

export const dynamic = 'force-dynamic'; // Disable static optimization

/**
 * GET /api/reloadly/products?country=US
 * Fetch products for a specific country
 */
export async function GET(request: NextRequest) {
  try {
    const countryCode = request.nextUrl.searchParams.get('country');

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    const products = await reloadlyClient.getProducts(countryCode.toUpperCase());

    return NextResponse.json(products);
  } catch (error) {
    console.error('Reloadly API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch products',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
