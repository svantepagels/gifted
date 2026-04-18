import * as Sentry from "@sentry/nextjs";

/**
 * Keys we consider PII and strip from Sentry events as defense-in-depth.
 */
const PII_KEYS = new Set([
  'email',
  'recipientEmail',
  'customerEmail',
  'senderEmail',
  'phone',
  'phoneNumber',
  'ip',
  'ipAddress',
]);

function scrubPII<T extends Record<string, any>>(obj: T | undefined): T | undefined {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    if (PII_KEYS.has(key)) {
      delete obj[key];
    }
  }
  return obj;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  beforeSend(event) {
    scrubPII(event.extra);
    if (event.contexts) {
      scrubPII(event.contexts as Record<string, any>);
    }
    if (event.breadcrumbs) {
      for (const crumb of event.breadcrumbs) {
        const data = crumb.data as Record<string, any> | undefined;
        if (data) {
          delete data.RELOADLY_CLIENT_ID;
          delete data.RELOADLY_CLIENT_SECRET;
          scrubPII(data);
        }
      }
    }

    return event;
  },

  environment: process.env.NODE_ENV,
});
