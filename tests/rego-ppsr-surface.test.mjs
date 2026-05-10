import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("sitemap includes the live QLD rego checker landing page", () => {
  const source = read("src/app/sitemap.ts");

  assert.match(source, /`\$\{BASE\}\/rego-check`/);
});

test("PPSR route exposes Next metadata from a server page", () => {
  const pageSource = read("src/app/ppsr/page.tsx");

  assert.doesNotMatch(pageSource, /^"use client";/, "PPSR page must be a server component so metadata can export");
  assert.match(pageSource, /export const metadata/);
  assert.match(pageSource, /title:\s*[^\n]*(PPSR|Revs|Finance)/i);
  assert.match(pageSource, /description:\s*[^\n]*(PPSR|finance owing|written[- ]off|stolen)/i);
});
