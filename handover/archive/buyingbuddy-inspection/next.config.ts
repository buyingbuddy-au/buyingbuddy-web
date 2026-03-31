import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.cwd(),
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
