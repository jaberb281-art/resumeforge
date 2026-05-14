import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.10.3"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;