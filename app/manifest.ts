import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gifted',
    short_name: 'Gifted',
    description: 'Digital gift cards, instantly delivered.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#0A1320',
    icons: [
      {
        src: '/brand/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
