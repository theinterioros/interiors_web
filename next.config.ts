import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Avoid "No link element found for chunk" with Turbopack CSS chunks
    cssChunking: "strict",
  },
};

export default nextConfig;
