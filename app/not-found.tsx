/**
 * Root 404 page — safety net for paths that don't reach the locale
 * layout (the matcher and middleware should always redirect to a
 * locale-prefixed URL first; this fires only if Next bypasses both).
 *
 * Emits its own `<html>`/`<body>` because it sits outside the
 * `[locale]` layout's chain. Inline styles only — no Tailwind context.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '1.5rem',
            textAlign: 'center',
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#0A1320',
            background: '#ffffff',
          }}
        >
          {/* Plain <img> — root not-found bypasses the layout, so
              next/image's optimizer is unavailable here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/gifted-logo.svg"
            alt="Gifted"
            width={140}
            height={40}
            style={{ height: 40, width: 'auto' }}
          />
          <h1 style={{ fontSize: '2rem', margin: 0 }}>
            404 — Page not found
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            <a href="/" style={{ color: '#0051D5' }}>
              Go to home
            </a>
          </p>
        </div>
      </body>
    </html>
  )
}
