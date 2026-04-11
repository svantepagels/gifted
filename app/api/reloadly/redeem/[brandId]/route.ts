import { NextRequest, NextResponse } from 'next/server';
import { reloadlyClient } from '@/lib/reloadly/client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reloadly/redeem/22
 * Get redeem instructions for a brand
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    const brandId = parseInt(params.brandId, 10);

    if (isNaN(brandId)) {
      return NextResponse.json(
        { error: 'Invalid brand ID' },
        { status: 400 }
      );
    }

    const instructions = await reloadlyClient.getRedeemInstructions(brandId);

    return NextResponse.json(instructions);
  } catch (error) {
    console.error('Reloadly redeem instructions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redeem instructions' },
      { status: 500 }
    );
  }
}
