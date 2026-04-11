import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production for cost optimization
  tracesSampleRate: 0.1, // 10% of transactions in production
  
  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive headers and env vars
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    // Remove sensitive env vars from runtime context
    if (event.contexts?.runtime?.env && typeof event.contexts.runtime.env === 'object') {
      const env = event.contexts.runtime.env as Record<string, any>;
      delete env.RELOADLY_CLIENT_ID;
      delete env.RELOADLY_CLIENT_SECRET;
    }
    
    return event;
  },
  
  environment: process.env.NODE_ENV,
});
