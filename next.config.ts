import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  experimental:{
    scrollRestoration:true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
