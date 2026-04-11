import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';
import type { OrderRequest } from '@/lib/reloadly/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/reloadly/order
 * Place a gift card order
 */
export async function POST(request: NextRequest) {
  try {
    const orderData: OrderRequest = await request.json();

    // Validate required fields
    if (!orderData.productId || !orderData.countryCode || !orderData.recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const order = await reloadlyClient.placeOrder(orderData);

    return NextResponse.json(order);
  } catch (error) {
    console.error('Reloadly order error:', error);
    return NextResponse.json(
      { error: 'Failed to place order' },
      { status: 500 }
    );
  }
}
