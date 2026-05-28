import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

function read(path) {
  return readFileSync(path, "utf8");
}

function compileContractPackModules({ resendHandler } = {}) {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-contract-pack-"));
  const tsconfigPath = join(outDir, "tsconfig.json");
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");
  const sentEmails = [];
  const capturedLeads = [];

  writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: "es2020",
          lib: ["es2020", "dom", "dom.iterable"],
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          skipLibCheck: true,
          strict: true,
          rootDir: process.cwd(),
          outDir,
          baseUrl: process.cwd(),
          paths: {
            "@/*": ["src/*"],
          },
          noEmitOnError: true,
        },
        files: [
          join(process.cwd(), "src/lib/pdfkit-compat.ts"),
          join(process.cwd(), "src/lib/contract-pack-pdf.ts"),
          join(process.cwd(), "src/app/api/contract-pack/send/route.ts"),
        ],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync(tsc, ["--project", tsconfigPath], { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" });

    const pdfPath = join(outDir, "src", "lib", "contract-pack-pdf.js");
    const compatPath = join(outDir, "src", "lib", "pdfkit-compat.js");
    const routePath = join(outDir, "src", "app", "api", "contract-pack", "send", "route.js");
    assert.ok(existsSync(pdfPath), `Compiled contract-pack-pdf.js not found at ${pdfPath}`);
    assert.ok(existsSync(routePath), `Compiled contract pack send route not found at ${routePath}`);

    const originalLoad = Module._load;
    const nextServer = require("next/server");

    Module._load = function loadContractPackDependency(request, parent, isMain) {
      if (request === "next/server") {
        return nextServer;
      }

      if (request === "@/lib/contract-pack-pdf") {
        return require(pdfPath);
      }

      if (request === "@/lib/pdfkit-compat") {
        return require(compatPath);
      }

      if (request === "pdfkit") {
        return originalLoad.call(this, require.resolve("pdfkit"), parent, isMain);
      }

      if (request === "@/lib/db") {
        return {
          upsert_email_capture: async (input) => {
            capturedLeads.push(input);
            return input;
          },
        };
      }

      if (request === "resend") {
        return {
          Resend: class FakeResend {
            constructor(key) {
              this.key = key;
            }

            emails = {
              send: async (payload) => {
                sentEmails.push(payload);
                if (resendHandler) {
                  return resendHandler(payload);
                }
                return { data: { id: "email_test_123" }, error: null };
              },
            };
          },
        };
      }

      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const pdf = require(pdfPath);
      const route = require(routePath);
      return {
        pdf,
        route,
        sentEmails,
        capturedLeads,
        cleanup: () => {
          Module._load = originalLoad;
          rmSync(outDir, { force: true, recursive: true });
        },
      };
    } catch (error) {
      Module._load = originalLoad;
      throw error;
    }
  } catch (error) {
    rmSync(outDir, { force: true, recursive: true });
    throw error;
  }
}

function makeJsonRequest(body) {
  return new Request("http://localhost/api/contract-pack/send", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

const sampleContract = {
  email: "buyer@example.com",
  buyerName: "Alex Buyer",
  buyerPhone: "0400 000 000",
  sellerName: "Sam Seller",
  sellerPhone: "0400 111 111",
  vehicleMakeModel: "Toyota RAV4 Cruiser",
  vehicleYear: "2024",
  vehicleRego: "123ABC",
  vehicleVin: "TESTVIN1234567890",
  odometer: "12000",
  salePrice: "53000",
  depositAmount: "500",
  balanceDue: "52500",
  paymentMethod: "Bank transfer",
  financePayoutRequired: "yes",
  financePayoutAmount: "51655.07",
  financePayoutRecipient: "Example Finance",
  sellerBalanceAmount: "1344.93",
  handoverDate: "2026-05-15",
  handoverLocation: "Brisbane QLD",
  includedAccessories: "Two keys, service books, charging cable",
  roadworthyStatus: "Seller to provide current safety certificate",
  ppsrStatus: "Checked by buyer before settlement",
  specialConditions: "Subject to finance payout being completed before keys are handed over.",
  knownFaults: "Small stone chip noted on bonnet.",
};

test("contract pack surface is digital-email-first and does not expose ZIP language", () => {
  const page = read("src/app/contract-pack/page.tsx");
  const form = read("src/components/contract-builder-form.tsx");
  const legacyButtonExists = existsSync("src/components/handover-pack-button.tsx");
  const legacyButton = legacyButtonExists ? read("src/components/handover-pack-button.tsx") : "";
  const sendRoute = read("src/app/api/contract-pack/send/route.ts");

  const publicSurface = `${page}\n${form}\n${legacyButton}\n${sendRoute}`;

  assert.match(page, /digital contract builder/i);
  assert.match(page, /You.?re in control/i);
  assert.match(page, /easier to live with walking away than dealing with problems/i);
  assert.match(publicSurface, /Email my contract PDF/i);
  assert.match(publicSurface, /PDF workspace/i);
  assert.doesNotMatch(publicSurface, /Deal Pack|Deal Room/i);
  assert.doesNotMatch(publicSurface, /\.zip|application\/zip|BuyingBuddy_QLD_Handover_Pack|Download Pack|4 PDFs|ZIP/i);
});

test("contract PDF generator creates a single professional PDF from digital fields", async () => {
  const compiled = compileContractPackModules();
  try {
    assert.equal(typeof compiled.pdf.generatePrivateSaleContractPdf, "function");
    const buffer = await compiled.pdf.generatePrivateSaleContractPdf(sampleContract);

    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 10_000, `Expected a real PDF, got ${buffer.length} bytes`);
    assert.equal(buffer.subarray(0, 4).toString("utf8"), "%PDF");

    const latin = buffer.toString("latin1");
    const pageMatches = latin.match(/\/Type \/Page(?!s)/g) ?? [];
    assert.equal(pageMatches.length, 2, "Customer contract should stay close to the 2-page editable reference template");
    assert.match(latin, /Buying Buddy/);
    assert.match(latin, /PRIVATE VEHICLE SALE CONTRACT|Private Vehicle Sale Contract/);
    assert.match(latin, /\/AcroForm/);
    assert.match(latin, /\/T \(seller_full_name\)/);
    assert.match(latin, /\/T \(buyer_full_name\)/);
    assert.match(latin, /\/T \(vehicle_vin\)/);
    assert.match(latin, /\/T \(special_conditions\)/);
    assert.doesNotMatch(latin, /BuyingBuddy_QLD_Handover_Pack|\.zip|application\/zip/i);
  } finally {
    compiled.cleanup();
  }
});

test("contract send route rejects malformed JSON and invalid email before sending", async () => {
  const compiled = compileContractPackModules();
  const previousKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "test_resend_key";
  try {
    const malformed = await compiled.route.POST(makeJsonRequest("{"));
    const malformedPayload = await malformed.json();
    assert.equal(malformed.status, 400);
    assert.equal(malformedPayload.ok, false);
    assert.equal(malformedPayload.error, "invalid_json");

    const invalid = await compiled.route.POST(makeJsonRequest(JSON.stringify({ ...sampleContract, email: "not-email" })));
    const invalidPayload = await invalid.json();
    assert.equal(invalid.status, 400);
    assert.equal(invalidPayload.ok, false);
    assert.equal(invalidPayload.error, "invalid_email");
    assert.equal(compiled.sentEmails.length, 0);
  } finally {
    if (previousKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = previousKey;
    }
    compiled.cleanup();
  }
});

test("contract send route emails one PDF attachment and captures the lead", async () => {
  const compiled = compileContractPackModules();
  const previousKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "test_resend_key";
  try {
    const response = await compiled.route.POST(makeJsonRequest(JSON.stringify(sampleContract)));
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.delivery, "email");
    assert.equal(payload.filename, "buying-buddy-private-sale-contract.pdf");
    assert.equal(payload.email, "buyer@example.com");

    assert.equal(compiled.sentEmails.length, 2, "buyer email plus internal notification should be sent");
    const buyerEmail = compiled.sentEmails[0];
    assert.equal(buyerEmail.to, "buyer@example.com");
    assert.match(buyerEmail.subject, /private sale contract/i);
    assert.match(buyerEmail.html, /You.?re in control/i);
    assert.match(buyerEmail.html, /PDF workspace/i);
    assert.doesNotMatch(buyerEmail.html, /Deal Pack|Deal Room/i);
    assert.equal(buyerEmail.attachments.length, 1);
    assert.equal(buyerEmail.attachments[0].filename, "buying-buddy-private-sale-contract.pdf");
    assert.ok(Buffer.isBuffer(buyerEmail.attachments[0].content));
    assert.equal(buyerEmail.attachments[0].content.subarray(0, 4).toString("utf8"), "%PDF");

    assert.equal(compiled.capturedLeads.length, 1);
    assert.equal(compiled.capturedLeads[0].email, "buyer@example.com");
    assert.match(compiled.capturedLeads[0].vehicle_summary, /Contract PDF/);
  } finally {
    if (previousKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = previousKey;
    }
    compiled.cleanup();
  }
});

test("contract send route fails truthfully when email provider is not configured", async () => {
  const compiled = compileContractPackModules();
  const previousKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;
  try {
    const response = await compiled.route.POST(makeJsonRequest(JSON.stringify(sampleContract)));
    const payload = await response.json();

    assert.equal(response.status, 503);
    assert.equal(payload.ok, false);
    assert.equal(payload.error, "email_not_configured");
    assert.equal(compiled.sentEmails.length, 0);
  } finally {
    if (previousKey !== undefined) {
      process.env.RESEND_API_KEY = previousKey;
    }
    compiled.cleanup();
  }
});
