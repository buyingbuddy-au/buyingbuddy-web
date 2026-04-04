import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/free-checklist", destination: "/free-kit", permanent: true },
      { source: "/second-opinion", destination: "/check", permanent: true },
      { source: "/about", destination: "/", permanent: false },
      { source: "/how-it-works", destination: "/", permanent: false },
      { source: "/contact", destination: "/buddy", permanent: false },
    ];
  },
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["better-sqlite3"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
