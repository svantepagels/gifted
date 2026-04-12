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
  const ip = getIP(request);
  
  try {
    // Rate limit check with error handling
    let rateLimitResult;
    try {
      rateLimitResult = await rateLimitCheck(ip, true);
    } catch (error) {
      console.error('Rate limit check failed, allowing request:', error);
      Sentry.captureException(error, {
        tags: { component: 'rate-limit', endpoint: '/api/reloadly/order' }
      });
      // Allow request to proceed if rate limiting fails
      rateLimitResult = {
        success: true,
        limit: 999,
        remaining: 999,
        reset: Math.floor(Date.now() / 1000) + 60,
      };
    }
    
    if (!rateLimitResult.success) {
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
          limit: rateLimitResult.limit,
          remaining: 0,
          reset: rateLimitResult.reset,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    // Parse and validate request body
    let orderData: OrderRequest;
    try {
      orderData = await request.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return NextResponse.json(
        { error: 'Invalid request body', details: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!orderData.productId || !orderData.countryCode || !orderData.recipientEmail) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'productId, countryCode, and recipientEmail are required'
        },
        { status: 400 }
      );
    }

    // Log order attempt to Sentry for monitoring
    Sentry.captureMessage('Gift card order placed', {
      level: 'info',
      tags: {
        productId: orderData.productId.toString(),
        country: orderData.countryCode,
      },
      extra: {
        ip,
        recipientEmail: orderData.recipientEmail,
      }
    });

    const order = await reloadlyClient.placeOrder(orderData);

    // Validate response has required fields
    if (!order || typeof order !== 'object') {
      console.error('[API] Invalid order response:', order);
      throw new Error('Invalid response from payment provider');
    }

    if (!order.transactionId || !order.status) {
      console.error('[API] Order missing required fields:', order);
      throw new Error('Incomplete response from payment provider');
    }

    console.log('[API] Order placed successfully:', {
      transactionId: order.transactionId,
      status: order.status,
      customIdentifier: orderData.customIdentifier,
    });

    return NextResponse.json(order, {
      headers: {
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.reset.toString(),
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
    
    // ALWAYS return a valid JSON response
    return NextResponse.json(
      { 
        error: 'Failed to place order',
        details: errorMessage,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}
