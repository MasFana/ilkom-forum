import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    // If PocketBase serves arbitrary user images, consider disabling optimization to avoid domain issues
    unoptimized: true,
  },
  async headers() {
    return [{
      source: "/login",
      headers: [
        {
          key: "Cross-Origin-Embedder-Policy",
          value: "unsafe-none",
        },
      ],
    }]
  }
};

export default nextConfig;
