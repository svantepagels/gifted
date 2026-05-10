import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Gifted — Digital gift cards, instantly delivered'
export const dynamic = 'force-static'
export const revalidate = false

/**
 * Twitter Card image (`summary_large_image`). Same composition as
 * the default Open Graph image — Twitter and Facebook both crop to
 * 1200×630, so a single visual covers both.
 */
export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          padding: 64,
        }}
      >
        <div
          style={{
            color: '#0A1320',
            fontSize: 180,
            fontWeight: 800,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.06em',
            lineHeight: 1,
          }}
        >
          gifted
        </div>
        <div
          style={{
            color: '#0A1320',
            opacity: 0.7,
            fontSize: 36,
            fontWeight: 500,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          Digital gift cards, instantly delivered
        </div>
      </div>
    ),
    { ...size }
  )
}
