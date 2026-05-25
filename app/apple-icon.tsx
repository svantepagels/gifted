import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'
export const dynamic = 'force-static'
export const revalidate = false

/**
 * 180×180 Apple Touch Icon. White lowercase `g` on solid black.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: 140,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.05em',
          paddingBottom: 10,
        }}
      >
        g
      </div>
    ),
    { ...size }
  )
}
