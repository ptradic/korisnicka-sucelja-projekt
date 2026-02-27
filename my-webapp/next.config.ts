import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
