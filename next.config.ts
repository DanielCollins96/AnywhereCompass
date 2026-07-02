import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow phones/other devices on the LAN to load dev assets; without this
  // Next.js 16 returns 403 for cross-origin dev requests and the page is
  // served without working JS.
  allowedDevOrigins: ["192.168.1.76", "192.168.1.*"],
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
