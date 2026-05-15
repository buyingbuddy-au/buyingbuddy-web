import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadPpsrCustomerGuideModule() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-ppsr-customer-guide-"));
  const sourcePath = join(process.cwd(), "src/lib/ppsr-customer-guide.ts");
  const outputPath = join(outDir, "ppsr-customer-guide.js");
  const source = readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    fileName: sourcePath,
  });
  writeFileSync(outputPath, transpiled.outputText);

  const originalLoad = Module._load;
  Module._load = function loadPpsrCustomerGuideDependency(request, parent, isMain) {
    if (request === "@/lib/types") {
      return {};
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return {
      module: require(outputPath),
      cleanup: () => {
        Module._load = originalLoad;
        rmSync(outDir, { force: true, recursive: true });
      },
    };
  } catch (error) {
    Module._load = originalLoad;
    rmSync(outDir, { force: true, recursive: true });
    throw error;
  }
}

const FINANCE_PPSR_DATA = {
  vin: "SALTA2AW4MA123456",
  rego: "756LZ9",
  make: "LDV",
  model: "T60",
  year: 2021,
  finance_owing: true,
  finance_details: "PPSR Registration number: 202206240165660 | Registration end time: 24/06/2029 23:59:59",
  stolen: false,
  stolen_details: null,
  writeoff: false,
  writeoff_details: null,
  registration_status: "REGISTERED (QLD)",
  registration_expiry: "15 Dec 2025",
  verdict: "ALERT",
  summary: "Finance is registered against this vehicle.",
  what_this_means: "The PPSR certificate shows a security interest registered against this vehicle.",
  what_to_do_next: "Do not buy until finance is discharged and documented.",
  extracted_at: "2026-05-14T13:25:00.000Z",
  source: "fallback",
};

test("PPSR customer guide turns a finance-hit certificate into short interactive sections and lender-safe actions", () => {
  const compiled = loadPpsrCustomerGuideModule();

  try {
    const guide = compiled.module.build_ppsr_customer_guide(FINANCE_PPSR_DATA);

    assert.equal(guide.verdict, "ALERT");
    assert.match(guide.headline, /Do not pay/i);
    assert.match(guide.vehicle_label, /LDV T60 2021/);
    assert.equal(guide.sections.length, 4, "guide should be chunked into the four buyer decisions, not a wall of text");
    assert.ok(guide.sections.every((section) => section.summary.length <= 170), "each section summary should stay short enough for card UI");

    const finance = guide.sections.find((section) => section.id === "finance");
    assert.ok(finance, "finance section should exist");
    assert.equal(finance.status_tone, "alert");
    assert.equal(finance.status_label, "Action required");
    assert.match(finance.summary, /security interest/i);
    assert.ok(finance.actions.some((action) => /pay the lender directly/i.test(action)));
    assert.ok(finance.actions.some((action) => /discharge/i.test(action)));

    const stolen = guide.sections.find((section) => section.id === "stolen");
    assert.equal(stolen.status_tone, "clear");
    assert.match(stolen.status_label, /Not recorded/i);

    assert.ok(guide.next_steps.some((step) => /Do not hand money to the seller/i.test(step)));
    assert.match(guide.certificate_note, /official PPSR certificate/i);
  } finally {
    compiled.cleanup();
  }
});
