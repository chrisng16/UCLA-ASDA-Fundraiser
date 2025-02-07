import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Fix "node:" scheme errors
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:process': 'process/browser.js',
    };
    return config;
  },
};

export default nextConfig;
