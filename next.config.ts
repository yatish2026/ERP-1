import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    "10.194.210.10",
    "10.194.210.10:3000",
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "0.0.0.0",
    "0.0.0.0:3000"
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "10.194.210.10:3000",
        "10.194.210.10",
        "localhost:3000",
        "127.0.0.1:3000",
        "0.0.0.0:3000"
      ],
    },
  },
};

export default nextConfig;
