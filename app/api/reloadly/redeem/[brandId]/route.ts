import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';
import { rateLimitCheck, getIP } from '@/lib/rate-limit';
import * as Sentry from '@sentry/nextjs';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reloadly/redeem/22
 * Get redeem instructions for a brand
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
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
    const brandId = parseInt(params.brandId, 10);

    if (isNaN(brandId)) {
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      );
    }

    const instructions = await reloadlyClient.getRedeemInstructions(brandId);

    return NextResponse.json(instructions, {
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
        endpoint: '/api/reloadly/redeem',
        brandId: params.brandId,
      },
      extra: {
        ip,
        userAgent: request.headers.get('user-agent'),
      }
    });
    
    console.error('Reloadly redeem instructions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Failed to fetch redeem instructions',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
