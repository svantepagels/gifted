import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.RELOADLY_CLIENT_ID,
    hasClientSecret: !!process.env.RELOADLY_CLIENT_SECRET,
    environment: process.env.RELOADLY_ENVIRONMENT,
    hasAuthUrl: !!process.env.RELOADLY_AUTH_URL,
    hasSandboxUrl: !!process.env.RELOADLY_GIFTCARDS_SANDBOX_URL,
    hasProductionUrl: !!process.env.RELOADLY_GIFTCARDS_PRODUCTION_URL,
    clientIdLength: process.env.RELOADLY_CLIENT_ID?.length || 0,
    clientSecretLength: process.env.RELOADLY_CLIENT_SECRET?.length || 0,
  });
}
