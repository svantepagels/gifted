import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.reloadly.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Logos render up to ~96px in cards, ~200px on PDP. Constrain the
    // responsive sizes Next.js generates so the optimizer doesn't make
    // huge variants we'll never serve.
    imageSizes: [64, 96, 128, 192, 256],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
  // Tree-shake lucide-react down to per-icon imports.
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
  // Enable instrumentation for Sentry
  experimental: {
    instrumentationHook: true,
  },
  // Static page generation invokes the [locale]/layout for every
  // prerendered route, which in turn fetches the full Reloadly catalog
  // (paginated). On a cold worker the first call can exceed the
  // default 60s. Module-level caching makes subsequent pages free, but
  // the first one needs more headroom — especially under parallel
  // worker contention.
  staticPageGenerationTimeout: 240,
}

export default withSentryConfig(nextConfig, {
  // Suppresses source map uploading logs during build
  silent: true,
  org: "gifted-marketplace",
  project: "gifted",
}, {
  // Hide source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically instrument Next.js data fetching methods
  automaticVercelMonitors: true,
});
