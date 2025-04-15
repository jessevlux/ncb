import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase the maximum file size for API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default nextConfig;
