import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/roam-lobby",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
