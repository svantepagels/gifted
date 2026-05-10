import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
export const dynamic = 'force-static'
export const revalidate = false

/**
 * 180×180 Apple Touch Icon. White background, ink wordmark.
 * The full lowercase wordmark fits comfortably at this size.
 */
export default function AppleIcon() {
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
          fontSize: 56,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.05em',
        }}
      >
        gifted
      </div>
    ),
    { ...size }
  )
}
