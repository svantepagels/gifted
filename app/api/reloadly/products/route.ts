import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';
import { rateLimitCheck, getIP } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic'; // Disable static optimization

/**
 * GET /api/reloadly/products?country=US
 * Fetch products for a specific country
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = getIP(request);
  const { success, limit, remaining, reset } = await rateLimitCheck(ip);
  
  if (!success) {
    return NextResponse.json(
      { 
        error: 'Too many requests',
        limit,
        remaining: 0,
        reset,
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
        }
      }
    );
  }

  try {
    const countryCode = request.nextUrl.searchParams.get('country');

    if (!countryCode) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    const products = await reloadlyClient.getProducts(countryCode.toUpperCase());

    return NextResponse.json(products, {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    });
  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/reloadly/products',
        country: request.nextUrl.searchParams.get('country') || 'unknown',
      },
      extra: {
        ip,
        userAgent: request.headers.get('user-agent'),
      }
    });
    
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
