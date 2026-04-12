export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
    
    // Validate critical environment variables
    const required = [
      'RELOADLY_CLIENT_ID',
      'RELOADLY_CLIENT_SECRET',
      'RELOADLY_ENVIRONMENT',
    ];
    
    const missing = required.filter(v => !process.env[v]);
    
    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:', missing);
      throw new Error(`Missing environment variables: ${missing.join(', ')}`);
    }
    
    console.log('✅ Required environment variables validated');
    
    // Warn about optional but recommended vars
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.warn('⚠️ Redis not configured - rate limiting will use in-memory fallback');
      console.warn('   For production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }
    
    if (!process.env.SENTRY_DSN) {
      console.warn('⚠️ Sentry not configured - error tracking disabled');
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
