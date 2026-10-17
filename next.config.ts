import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product photos are uploaded through a server action (max 5 MB each).
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
