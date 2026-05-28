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

const CUSTOMER_DEAL_ROOM_SURFACES = [
  "src/app/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/ppsr/page.tsx",
  "src/app/deal/page.tsx",
  "src/app/deal/[id]/page.tsx",
  "src/app/deal/demo/page.tsx",
  "src/app/api/deal/[id]/route.ts",
  "src/app/api/deal/[id]/seller/route.ts",
  "src/app/order/success/page.tsx",
  "src/components/app-header.tsx",
  "src/components/bottom-nav.tsx",
  "src/components/contract-builder-form.tsx",
  "src/components/deal/deal-landing-page-client.tsx",
  "src/components/free-check-form.tsx",
  "src/components/rego-check/qld-rego-checker.tsx",
  "src/components/site-footer.tsx",
  "src/components/structured-data.tsx",
  "src/lib/contract-pack-pdf.ts",
  "src/lib/email.ts",
  "src/lib/free-check.ts",
  "src/lib/ppsr-customer-guide.ts",
];

test("public surface consistently names the new digital contract PDF instead of old download/pack wording", () => {
  const combined = PUBLIC_SURFACE_FILES.map(read).join("\n");

  assert.match(combined, /Private-sale contract PDF|contract PDF builder|Email-ready contract PDF/i);
  assert.doesNotMatch(combined, /handover pack|contract pack download|QLD contract pack download|Download Free Kit/i);
});

test("homepage support tools funnel contract users into Deal Room after the free paperwork", () => {
  const home = read("src/app/page.tsx");

  assert.match(home, /Email-ready contract PDF/i);
  assert.match(home, /Deal Room keeps the sale together|Open Deal Room/i);
  assert.doesNotMatch(home, /five equal offers/i);
});

test("pricing keeps product names aligned with public navigation", () => {
  const pricing = read("src/app/pricing/page.tsx");

  assert.match(pricing, /Free Rego & Listing Tools/i);
  assert.match(pricing, /Private-sale contract PDF/i);
  assert.match(pricing, /Open Deal Room/);
  assert.match(pricing, /href: "\/deal"/);
  assert.match(pricing, /Deal Room record/i);
  assert.doesNotMatch(pricing, /Generate PDF|Deal Pack|contract pack/i);
});

test("customer handoff surfaces consistently call the paid handover product Deal Room", () => {
  const offenders = CUSTOMER_DEAL_ROOM_SURFACES.flatMap((path) => {
    const lines = read(path).split("\n");
    return lines
      .map((line, index) => ({ path, line: index + 1, text: line }))
      .filter(({ text }) => /Deal Pack|deal pack|paid handover product PDF|Open PDF|Create (?:your |a )?PDF|Start another PDF|Your PDFs|PDF not found|PDF home|BuyingBuddy (?:Test )?PDF|PDF · Test Mode/i.test(text));
  });

  assert.deepEqual(offenders, []);
});

test("Deal Room is the public paid handover route and legacy PDF URLs redirect", () => {
  const nextConfig = read("next.config.ts");
  const sitemap = read("src/app/sitemap.ts");
  const header = read("src/components/app-header.tsx");
  const bottomNav = read("src/components/bottom-nav.tsx");

  assert.match(nextConfig, /source: "\/pdf"/);
  assert.match(nextConfig, /destination: "\/deal"/);
  assert.match(nextConfig, /source: "\/pdf\/:path\*"/);
  assert.match(nextConfig, /destination: "\/deal\/:path\*"/);
  assert.match(sitemap, /`\$\{BASE\}\/deal`/);
  assert.doesNotMatch(sitemap, /`\$\{BASE\}\/pdf`/);
  assert.match(header, /href: "\/deal", label: "Deal Room"/);
  assert.match(bottomNav, /href: "\/deal", label: "Deal Room"/);
});

test("PPSR page previews the finance-hit customer guide as a buyer action room", () => {
  const ppsr = read("src/components/ppsr/ppsr-page-client.tsx");

  assert.match(ppsr, /Caution before payment/i);
  assert.match(ppsr, /You can still buy it/i);
  assert.match(ppsr, /Pay the lender directly at settlement/i);
  assert.match(ppsr, /No stolen record/i);
  assert.match(ppsr, /No write-off record/i);
  assert.match(ppsr, /VIN is best if you have it/i);
  assert.match(ppsr, /QLD rego still works to start/i);
  assert.doesNotMatch(ppsr, /wall of PPSR text/i);
});
