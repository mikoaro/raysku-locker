import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Server Actions (Default in Next.js 15+, explicit for safety)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase limit for high-res SKU uploads
    },
  },
  // Allow loading images from external AI CDNs
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media',
      },
      {
        protocol: 'https',
        hostname: 'v3.fal.media',
      },
    ],
  },
  // Suppress hydration warnings if using browser extensions (optional polish)
  reactStrictMode: true,
};

export default nextConfig;