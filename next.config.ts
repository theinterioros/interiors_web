import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Avoid "No link element found for chunk" with Turbopack CSS chunks
    cssChunking: "strict",
    // Tree-shake lucide-react so only used icons are bundled
    optimizePackageImports: ["lucide-react"],
  },
  // Allow firm/designer registration with portfolio file (max 10 MB per validation)
  serverActions: {
    bodySizeLimit: "12mb",
  },
};

export default nextConfig;
