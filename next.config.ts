import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tells Next.js to skip bundling this package and run it natively in Node.js
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;