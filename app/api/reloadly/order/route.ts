import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';
import type { OrderRequest } from '@/lib/reloadly/types';
import { rateLimitCheck, getIP } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reloadly/order
 * Place a gift card order
 * STRICT RATE LIMIT: 3 requests per minute
 */
export async function POST(request: NextRequest) {
  // Strict rate limiting for order endpoint
  const ip = getIP(request);
  const { success, limit, remaining, reset } = await rateLimitCheck(ip, true);
  
  if (!success) {
    Sentry.captureMessage('Rate limit exceeded on order endpoint', {
      level: 'warning',
      tags: {
        endpoint: '/api/reloadly/order',
        ip,
      }
    });
    
    return NextResponse.json(
      { 
        error: 'Too many order requests. Please wait before trying again.',
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
    const orderData: OrderRequest = await request.json();

    // Validate required fields
    if (!orderData.productId || !orderData.countryCode || !orderData.recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log order attempt to Sentry for monitoring
    Sentry.captureMessage('Gift card order placed', {
      level: 'info',
      tags: {
        productId: orderData.productId,
        country: orderData.countryCode,
      },
      extra: {
        ip,
        recipientEmail: orderData.recipientEmail,
      }
    });

    const order = await reloadlyClient.placeOrder(orderData);

    return NextResponse.json(order, {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    });
  } catch (error) {
    // Log critical error to Sentry
    Sentry.captureException(error, {
      tags: {
        endpoint: '/api/reloadly/order',
        severity: 'critical',
      },
      extra: {
        ip,
        userAgent: request.headers.get('user-agent'),
      }
    });
    
    console.error('Reloadly order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to place order',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
