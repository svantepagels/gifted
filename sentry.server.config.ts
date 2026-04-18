import * as Sentry from "@sentry/nextjs";

/**
 * Keys we consider PII and strip from Sentry events as defense-in-depth.
 * Any `extra` or breadcrumb payload containing these keys will have them
 * removed before the event leaves the server.
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

  beforeSend(event) {
    // Strip sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    // Scrub secrets from runtime env
    if (event.contexts?.runtime?.env && typeof event.contexts.runtime.env === 'object') {
      const env = event.contexts.runtime.env as Record<string, any>;
      delete env.RELOADLY_CLIENT_ID;
      delete env.RELOADLY_CLIENT_SECRET;
      delete env.UPSTASH_REDIS_REST_TOKEN;
    }

    // Defense-in-depth: scrub PII from extra/contexts/breadcrumbs even if a
    // caller forgot to do so. We prefer losing triage detail over leaking PII.
    scrubPII(event.extra);
    if (event.contexts) {
      scrubPII(event.contexts as Record<string, any>);
    }
    if (event.breadcrumbs) {
      for (const crumb of event.breadcrumbs) {
        scrubPII(crumb.data as Record<string, any> | undefined);
      }
    }

    return event;
  },

  environment: process.env.NODE_ENV,
});
