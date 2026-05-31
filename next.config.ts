import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/free-checklist", destination: "/free-kit", permanent: true },
      { source: "/pdf", destination: "/deal", permanent: true },
      { source: "/pdf/:path*", destination: "/deal/:path*", permanent: true },
      { source: "/second-opinion", destination: "/check", permanent: true },
      { source: "/about", destination: "/", permanent: false },
      { source: "/how-it-works", destination: "/", permanent: false },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), payment=(self), fullscreen=(self)" },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live",
          "connect-src 'self' https://api.stripe.com https://checkout.stripe.com https://api.openai.com https://openrouter.ai https://generativelanguage.googleapis.com https://vitals.vercel-insights.com",
          "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
          "form-action 'self' https://checkout.stripe.com",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  outputFileTracingRoot: __dirname,
  serverExternalPackages: ["better-sqlite3"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: false,
  },
};

export default nextConfig;
