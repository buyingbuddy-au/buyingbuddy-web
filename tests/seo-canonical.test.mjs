import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const canonicalPages = [
  ["src/app/check/page.tsx", "https://buyingbuddy.com.au/check"],
  ["src/app/inspect/page.tsx", "https://buyingbuddy.com.au/inspect"],
  ["src/app/inspect/full/page.tsx", "https://buyingbuddy.com.au/inspect/full"],
  ["src/app/contract-pack/page.tsx", "https://buyingbuddy.com.au/contract-pack"],
  ["src/app/blog/page.tsx", "https://buyingbuddy.com.au/blog"],
  ["src/app/pdf/page.tsx", "https://buyingbuddy.com.au/pdf"],
  ["src/app/pricing/page.tsx", "https://buyingbuddy.com.au/pricing"],
  ["src/app/contact/page.tsx", "https://buyingbuddy.com.au/contact"],
  ["src/app/privacy/page.tsx", "https://buyingbuddy.com.au/privacy"],
  ["src/app/terms/page.tsx", "https://buyingbuddy.com.au/terms"],
];

test("core public pages declare explicit self-canonical metadata", () => {
  for (const [path, canonical] of canonicalPages) {
    const source = read(path);

    assert.match(source, /export const metadata|export async function generateMetadata/, `${path} should expose Next metadata`);
    assert.match(source, /alternates\s*:/, `${path} should define alternates metadata`);
    assert.match(source, new RegExp(canonical.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${path} should canonicalise to ${canonical}`);
  }
});

test("client-heavy PDF and contact pages use server wrappers so metadata can render", () => {
  for (const path of ["src/app/pdf/page.tsx", "src/app/contact/page.tsx"]) {
    const source = read(path);

    assert.doesNotMatch(source, /^"use client";/, `${path} must stay a server component for metadata`);
    assert.match(source, /export const metadata/, `${path} should export metadata`);
  }
});

test("blog article metadata emits per-post canonicals", () => {
  const source = read("src/app/blog/[slug]/page.tsx");

  assert.match(source, /alternates\s*:/);
  assert.match(source, /`https:\/\/buyingbuddy\.com\.au\/blog\/\$\{post\.slug\}`/);
});

test("client-heavy product pages still expose a crawlable server-rendered H1", () => {
  const pdfPage = read("src/app/pdf/page.tsx");
  const pdfClient = read("src/components/deal/deal-landing-page-client.tsx");
  const inspectionPage = read("src/app/inspect/full/page.tsx");
  const inspectionClient = read("src/components/inspection-app.tsx");

  assert.match(pdfPage, /<h1[^>]*>PDF for private used-car handovers<\/h1>/);
  assert.doesNotMatch(pdfClient, /<h1\b/);
  assert.match(inspectionPage, /<h1[^>]*>Full 21-check used-car inspection checklist<\/h1>/);
  assert.doesNotMatch(inspectionClient, /<h1\b/);
});
