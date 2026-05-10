import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
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
  // Automatically tree-shake Sentry logger statements
  widenClientFileUpload: true,
  
  // Transpile SDK to be compatible with IE11
  transpileClientSDK: true,
  
  // Hide source maps from generated client bundles
  hideSourceMaps: true,
  
  // Automatically instrument Next.js data fetching methods
  automaticVercelMonitors: true,
});
