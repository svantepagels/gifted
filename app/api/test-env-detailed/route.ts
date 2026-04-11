import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    clientId: `"${process.env.RELOADLY_CLIENT_ID}"`,
    clientSecret: `"${process.env.RELOADLY_CLIENT_SECRET}"`,
    environment: `"${process.env.RELOADLY_ENVIRONMENT}"`,
    authUrl: `"${process.env.RELOADLY_AUTH_URL}"`,
    sandboxUrl: `"${process.env.RELOADLY_GIFTCARDS_SANDBOX_URL}"`,
    productionUrl: `"${process.env.RELOADLY_GIFTCARDS_PRODUCTION_URL}"`,
  });
}
