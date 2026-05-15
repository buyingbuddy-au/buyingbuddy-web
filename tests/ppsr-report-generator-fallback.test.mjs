import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function loadPpsrReportGeneratorModule() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-ppsr-report-generator-"));
  const sourcePath = join(process.cwd(), "src/lib/ppsr-report-generator.ts");
  const outputPath = join(outDir, "ppsr-report-generator.js");
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

  try {
    return {
      module: require(outputPath),
      cleanup: () => rmSync(outDir, { force: true, recursive: true }),
    };
  } catch (error) {
    rmSync(outDir, { force: true, recursive: true });
    throw error;
  }
}

const REDACTED_FINANCE_HIT_CERTIFICATE_TEXT = `
Page 1 of 3
Serial Number Search Certificate
Search certificate number:
9999999999999999
Search Criteria Details
Serial number search type:
VIN
Motor vehicle:
6FPAAAJGSW6A12345
PPSR registration state searched:
Current
PPSR Registration Details
PPSR Registration number:
202206240165660
Registration kind:
Security interest
Registration start time:
24/06/2022 15:46:42 (Canberra Time)
Registration end time:
24/06/2029 23:59:59 (Canberra Time)
PPSR registration state:
Current
Collateral Details
Serial number:
6FPAAAJGSW6A12345
Serial number type:
VIN
Collateral type:
Consumer property
Collateral class:
Motor vehicle
Vehicle registration number:
123ABC
Additional Motor Vehicle Details – NEVDIS
Identifier number:
6FPAAAJGSW6A12345
Identifier type:
VIN
Vehicle type:
RIGID TRUCK
Registration plate number: 123ABC
State vehicle registered:
QLD
Registration expiry:
15 Dec 2025
Year of manufacture:
2021
Important NEVDIS notifications about the Vehicle
Written-off:
• Not recorded as written-off.
Stolen:
• Not recorded as stolen.
`;

test("PPSR fallback extraction maps the uploaded certificate structure without turning clear NEVDIS notes into alerts", async () => {
  const compiled = loadPpsrReportGeneratorModule();
  const hadOpenAi = Object.prototype.hasOwnProperty.call(process.env, "OPENAI_API_KEY");
  const originalOpenAi = process.env.OPENAI_API_KEY;
  const hadGoogle = Object.prototype.hasOwnProperty.call(process.env, "GOOGLE_AI_API_KEY");
  const originalGoogle = process.env.GOOGLE_AI_API_KEY;
  const originalWarn = console.warn;
  const warnings = [];

  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_AI_API_KEY;
  console.warn = (...args) => warnings.push(args);

  try {
    const data = await compiled.module.extract_ppsr_data(REDACTED_FINANCE_HIT_CERTIFICATE_TEXT);

    assert.equal(data.vin, "6FPAAAJGSW6A12345");
    assert.equal(data.rego, "123ABC");
    assert.equal(data.year, 2021);
    assert.equal(data.finance_owing, true);
    assert.match(data.finance_details, /PPSR Registration number|202206240165660/i);
    assert.match(data.finance_details, /24\/06\/2029/);
    assert.equal(data.stolen, false);
    assert.equal(data.stolen_details, null);
    assert.equal(data.writeoff, false);
    assert.equal(data.writeoff_details, null);
    assert.equal(data.registration_status, "REGISTERED (QLD)");
    assert.equal(data.registration_expiry, "15 Dec 2025");
    assert.equal(data.verdict, "ALERT");
    assert.match(data.summary, /Finance (?:owing|is registered)/i);
    assert.equal(data.source, "fallback");
    assert.equal(warnings.length, 1, "fallback mode should warn once when no provider keys are configured");
  } finally {
    if (hadOpenAi) {
      process.env.OPENAI_API_KEY = originalOpenAi;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
    if (hadGoogle) {
      process.env.GOOGLE_AI_API_KEY = originalGoogle;
    } else {
      delete process.env.GOOGLE_AI_API_KEY;
    }
    console.warn = originalWarn;
    compiled.cleanup();
  }
});
