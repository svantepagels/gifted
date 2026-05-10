'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: '#ffffff',
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          }}
        >
          <div style={{ maxWidth: '500px', textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/gifted-logo.svg"
              alt="Gifted"
              width={140}
              height={40}
              style={{ height: 40, width: 'auto', marginBottom: '2rem' }}
            />
            <h2
              style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: '#0A1320',
              }}
            >
              Something went wrong
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              We&apos;ve been notified and will fix it as soon as possible.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                backgroundColor: '#0A1320',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
