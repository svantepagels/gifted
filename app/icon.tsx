import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export const dynamic = 'force-static'
export const revalidate = false

/**
 * 32×32 favicon. White lowercase `g` on solid black.
 * Matches the Gifted wordmark glyph.
 */
export default function Icon() {
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
          fontSize: 24,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-0.05em',
          paddingBottom: 2,
        }}
      >
        g
      </div>
    ),
    { ...size }
  )
}
