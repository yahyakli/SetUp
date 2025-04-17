import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Change back to standalone instead of export
  output: 'standalone',
  experimental: {
    isrFlushToDisk: false,
    serverActions: {
      // Options here if needed
    },
  },
  // Moved from experimental.serverComponentsExternalPackages
  serverExternalPackages: [],
  typescript: {
    ignoreBuildErrors: true,
  },
  modularizeImports: {
    '@/components': {
      transform: '@/components/{{member}}',
    },
  },
  // Set a reasonable timeout
  staticPageGenerationTimeout: 60,
  trailingSlash: true,
  // Use out directory for consistent naming
  distDir: 'out',
  // Remove other options that aren't needed for static export
  productionBrowserSourceMaps: true,
  // Add this to disable prerendering for specific paths
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true,
};

export default nextConfig;
