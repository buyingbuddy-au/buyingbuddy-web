import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("Next config ships launch-grade security headers and refuses TypeScript build errors", () => {
  const config = read("next.config.ts");

  for (const header of [
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Content-Security-Policy",
  ]) {
    assert.match(config, new RegExp(header), `${header} should be configured`);
  }

  assert.match(config, /frame-ancestors 'none'/, "CSP must block clickjacking frame ancestors");
  assert.match(config, /object-src 'none'/, "CSP must block plugin/object execution");
  assert.match(config, /ignoreBuildErrors:\s*false/, "production builds must not ignore TypeScript errors");
});

test("public write/API surfaces use launch-week abuse throttling", () => {
  const required = [
    "src/app/api/check/route.ts",
    "src/app/api/rego/check/route.ts",
    "src/app/api/buddy/route.ts",
    "src/app/api/stripe/checkout/route.ts",
    "src/app/api/free-kit/route.ts",
    "src/app/api/ppi/route.ts",
    "src/app/api/shared/create/route.ts",
    "src/app/api/check/issues/route.ts",
  ];

  for (const path of required) {
    const source = read(path);
    assert.match(source, /rate_limit_response/, `${path} must call the shared rate limiter`);
  }
});

test("free listing scraper blocks SSRF-style private or internal fetches", () => {
  const security = read("src/lib/security.ts");
  const scraper = read("src/lib/scraper.ts");

  assert.match(security, /assert_public_fetch_url/, "shared public fetch validator should exist");
  assert.match(security, /is_ipv4_private_or_reserved|is_ipv6_private_or_reserved|is_private_or_reserved_ip/, "private IP ranges should be blocked");
  assert.match(security, /localhost|loopback|link-local|multicast|reserved/i, "internal/reserved targets should be blocked");
  assert.match(scraper, /assert_public_fetch_url\(raw_listing_url/, "listing scraper must validate URLs before fetch");
});

test("legal and PPSR surfaces avoid government-affiliation drift", () => {
  const terms = read("src/app/terms/page.tsx");
  const privacy = read("src/app/privacy/page.tsx");
  const ppsr = read("src/components/ppsr/ppsr-page-client.tsx");

  assert.match(terms, /not affiliated with, endorsed by, or acting for the PPSR/i);
  assert.match(terms, /not legal, financial, mechanical or safety advice/i);
  assert.match(terms, /Australian Consumer Law/i);
  assert.match(privacy, /Stripe/i);
  assert.match(privacy, /does not store full card numbers/i);
  assert.match(ppsr, /not affiliated with, endorsed by, or acting for the PPSR/i);
});

test("retired hype copy and stale product pricing do not remain in public source", () => {
  const files = [
    "src/lib/site-content.ts",
    "src/app/pricing/page.tsx",
    "src/app/page.tsx",
    "src/components/ppsr/ppsr-page-client.tsx",
  ];
  const combined = files.map((path) => read(path)).join("\n---\n");

  const banned = [
    /Official PPSR data source/i,
    /same government databases/i,
    /dealers charge \$30.?\$50 for the same data/i,
    /prepared by a licensed\s+dealer/i,
    /100% satisfaction guarantee/i,
    /full refund, no questions asked/i,
    /\$9\.95/i,
    /\$39/i,
    /dodgy bastards/i,
  ];

  for (const pattern of banned) {
    assert.doesNotMatch(combined, pattern, `public source should not include ${pattern}`);
  }

  assert.match(combined, /\$4\.95/);
  assert.match(combined, /\$9\.99/);
  assert.match(combined, /Deal Room/);
});
