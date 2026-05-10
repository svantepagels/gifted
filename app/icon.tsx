import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export const dynamic = 'force-static'
export const revalidate = false

/**
 * 32×32 favicon. Single lowercase `g` glyph — the full `gifted`
 * wordmark is illegible at this size, so the lead glyph stands in.
 * Standard favicon compromise (Stripe, Linear, Vercel do the same).
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0A1320',
          fontSize: 22,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.05em',
        }}
      >
        g
      </div>
    ),
    { ...size }
  )
}
