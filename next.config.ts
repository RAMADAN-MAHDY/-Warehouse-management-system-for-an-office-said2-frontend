import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['lucide-react'],
  turbopack: {}, // Added to silence Turbopack configuration warning
  webpack: (config, { isServer, dev }) => {
    // Disable persistent caching in development to avoid "Array buffer allocation failed"
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  // Reduce memory footprint by limiting parallel processing
  experimental: {
    webpackBuildWorker: true,
    parallelServerCompiles: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://warehouse-management-system-for-an.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;
