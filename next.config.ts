import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'flagsapi.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wiftstorage.blob.core.windows.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
