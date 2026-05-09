/**
 * Root 404 page — safety net for paths that don't reach the locale
 * layout (the matcher and middleware should always redirect to a
 * locale-prefixed URL first; this fires only if Next bypasses both).
 *
 * Emits its own `<html>`/`<body>` because it sits outside the
 * `[locale]` layout's chain.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            fontFamily:
              "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            color: '#1a1a1a',
          }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              404 — Page not found
            </h1>
            <p style={{ color: '#666' }}>
              <a href="/" style={{ color: '#0051D5' }}>
                Go to home
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
