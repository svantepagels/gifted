import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production for cost optimization
  tracesSampleRate: 0.1, // 10% of transactions in production
  
  environment: process.env.NODE_ENV,
});
