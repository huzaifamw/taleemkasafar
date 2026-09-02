import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled cacheComponents to allow dynamic auth checks without Suspense warnings
  // cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
