import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production for cost optimization
  tracesSampleRate: 0.1, // 10% of transactions in production
  
  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Filter out sensitive data
  beforeSend(event) {
    // Remove sensitive env vars from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data) {
          delete breadcrumb.data.RELOADLY_CLIENT_ID;
          delete breadcrumb.data.RELOADLY_CLIENT_SECRET;
        }
        return breadcrumb;
      });
    }
    return event;
  },
  
  environment: process.env.NODE_ENV,
});
