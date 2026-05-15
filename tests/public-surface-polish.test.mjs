import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const PUBLIC_SURFACE_FILES = [
  "src/app/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/free-kit/page.tsx",
  "src/app/inspect/page.tsx",
  "src/app/contact/page.tsx",
  "src/components/app-header.tsx",
  "src/components/bottom-nav.tsx",
];

test("public surface consistently names the new digital contract PDF instead of old download/pack wording", () => {
  const combined = PUBLIC_SURFACE_FILES.map(read).join("\n");

  assert.match(combined, /Private-sale contract PDF|contract PDF builder|Email-ready contract PDF/i);
  assert.doesNotMatch(combined, /handover pack|contract pack download|QLD contract pack download|Download Free Kit/i);
});

test("homepage support tools funnel contract users into the Deal Pack after the PDF", () => {
  const home = read("src/app/page.tsx");

  assert.match(home, /Email-ready contract PDF/i);
  assert.match(home, /Deal Pack keeps the sale together/i);
  assert.doesNotMatch(home, /five equal offers/i);
});

test("pricing keeps product names aligned with public navigation", () => {
  const pricing = read("src/app/pricing/page.tsx");

  assert.match(pricing, /Free Rego & Listing Tools/i);
  assert.match(pricing, /Private-sale contract PDF/i);
  assert.match(pricing, /Open Deal Pack/);
  assert.doesNotMatch(pricing, /Open Deal Room|Deal Room record|contract pack/i);
});

test("PPSR page previews the finance-hit customer guide as a buyer action room", () => {
  const ppsr = read("src/components/ppsr/ppsr-page-client.tsx");

  assert.match(ppsr, /Caution before payment/i);
  assert.match(ppsr, /You can still buy it/i);
  assert.match(ppsr, /Pay the lender directly at settlement/i);
  assert.match(ppsr, /No stolen record/i);
  assert.match(ppsr, /No write-off record/i);
  assert.doesNotMatch(ppsr, /wall of PPSR text/i);
});
