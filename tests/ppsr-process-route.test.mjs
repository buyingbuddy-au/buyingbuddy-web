import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const EMAIL_PROVIDER_ENV = ["RESEND", "API", "KEY"].join("_");
const MESSENGER_PROVIDER_ENV = ["TELEGRAM", "BOT", "TOKEN"].join("_");
const FULFILMENT_EMAIL_ENV = ["PPSR", "FULFILMENT", "EMAIL"].join("_");
const TEST_RESEND_VALUE = ["unit", "test", "resend", "value"].join("-");
const TEST_TELEGRAM_VALUE = ["unit", "test", "telegram", "value"].join("-");

const SAMPLE_PPSR_DATA = {
  vin: "6FPAAAJGSW6A12345",
  rego: "123ABC",
  make: "Toyota",
  model: "Hilux",
  year: 2021,
  finance_owing: false,
  finance_details: null,
  stolen: false,
  stolen_details: null,
  writeoff: false,
  writeoff_details: null,
  registration_status: "Current",
  registration_expiry: "01/02/2027",
  verdict: "CLEAR",
  summary: "No finance, stolen, or write-off flags found in the sample report.",
  what_this_means: "The sample PPSR data is clear for this regression test.",
  what_to_do_next: "Keep checking paperwork before money changes hands.",
  extracted_at: "2026-05-11T07:40:00.000Z",
  source: "fallback",
};

function compilePpsrProcessRoute(options = {}) {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-ppsr-process-route-"));
  const routeSourcePath = join(process.cwd(), "src/app/api/ppsr/process/route.ts");
  const routePath = join(outDir, "route.js");
  const calls = {
    extractPpsrData: [],
    generatePpsrPdf: [],
    getOrderById: [],
    updateOrder: [],
    resendConstructors: [],
    resendEmails: [],
    events: [],
  };

  const transpiledRoute = ts.transpileModule(readFileSync(routeSourcePath, "utf8"), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    fileName: routeSourcePath,
  });

  writeFileSync(routePath, transpiledRoute.outputText);

  try {
    const originalLoad = Module._load;
    const nextServer = require("next/server");

    class FakeResend {
      constructor(apiKey) {
        calls.resendConstructors.push(apiKey);
        this.emails = {
          send: async (input) => {
            calls.resendEmails.push(input);
            calls.events.push({ type: "resendEmail", input });
            return { data: { id: "email_test_ppsr_process" }, error: null };
          },
        };
      }
    }

    Module._load = function loadPpsrProcessDependency(request, parent, isMain) {
      if (request === "next/server") {
        return nextServer;
      }

      if (request === "resend") {
        return { Resend: FakeResend };
      }

      if (request === "@/lib/admin-auth") {
        return {
          is_admin_request: options.isAdminRequest ?? (() => true),
        };
      }

      if (request === "@/lib/db") {
        return {
          get_order_by_id: async (orderId) => {
            calls.getOrderById.push(orderId);
            return options.order ?? null;
          },
          to_sqlite_datetime: () => "2026-05-11 07:40:00",
          update_order: async (orderId, patch) => {
            calls.updateOrder.push({ orderId, patch });
            calls.events.push({ type: "updateOrder", orderId, patch });
            return { ...options.order, id: orderId, ...patch };
          },
        };
      }

      if (request === "@/lib/ppsr-report-generator") {
        return {
          extract_ppsr_data: async (rawPpsrText) => {
            calls.extractPpsrData.push(rawPpsrText);
            if (options.extractPpsrData) {
              return options.extractPpsrData(rawPpsrText);
            }
            return options.ppsrData ?? SAMPLE_PPSR_DATA;
          },
        };
      }

      if (request === "@/lib/ppsr-pdf") {
        return {
          generate_ppsr_pdf: async (data, filename) => {
            calls.generatePpsrPdf.push({ data, filename });
            return {
              buffer: Buffer.from("%PDF-1.4\n% PPSR process route test\n"),
              filename,
            };
          },
        };
      }

      if (request === "@/lib/ppsr-customer-guide") {
        return {
          build_ppsr_customer_guide: options.buildPpsrCustomerGuide ?? ((data) => ({
            verdict: data.verdict,
            headline: data.verdict === "CLEAR" ? "Looks clear — verify the basics" : "Do not pay until this is resolved",
            subheadline: data.summary,
            vehicle_label: [data.make, data.model, data.year ? String(data.year) : null].filter(Boolean).join(" ") || "Unknown vehicle",
            certificate_note: "Keep the official PPSR certificate attached to the fulfilment email on file.",
            sections: [
              {
                id: "finance",
                title: "Finance owing",
                kicker: "Security interest",
                status_label: data.finance_owing ? "Action required" : "No security interest found",
                status_tone: data.finance_owing ? "alert" : "clear",
                summary: data.finance_owing ? "A security interest is registered against this vehicle." : "No security interest was found in the parsed PPSR text.",
                why_it_matters: "Finance can affect settlement risk.",
                actions: data.finance_owing ? ["Do not hand money to the seller", "Arrange payout and pay the lender directly", "Get written discharge confirmation"] : ["Keep the PPSR certificate with your purchase records"],
                proof_label: "Parsed PPSR finance section",
              },
              {
                id: "stolen",
                title: "Stolen status",
                kicker: "NEVDIS / police data",
                status_label: data.stolen ? "Stolen flag" : "Not recorded",
                status_tone: data.stolen ? "alert" : "clear",
                summary: data.stolen ? "A stolen notification appears in the PPSR/NEVDIS data." : "No stolen vehicle notification was found.",
                why_it_matters: "A stolen flag is a hard-stop buyer risk.",
                actions: data.stolen ? ["Walk away and verify with police"] : ["Match the VIN on the certificate to the car"],
                proof_label: "Parsed PPSR stolen section",
              },
            ],
            next_steps: data.finance_owing ? ["Do not hand money to the seller", "Pay the lender directly at settlement"] : ["Inspect the car and match the VIN"],
          })),
        };
      }

      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const route = require(routePath);
      return {
        route,
        calls,
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

function makePpsrProcessRequest(body) {
  return new Request("http://localhost/api/ppsr/process", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      "x-admin-password": "test-admin-password",
    },
  });
}

test("PPSR process route rejects non-string customerEmail before report side effects", async () => {
  const compiled = compilePpsrProcessRoute();
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
        customerEmail: 123,
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "customerEmail must be a string when provided." });
    assert.equal(processErrors.length, 1, "expected the route to log the rejected request once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, [], "invalid customerEmail must fail before order lookup");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "invalid customerEmail must fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "invalid customerEmail must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "invalid customerEmail must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "invalid customerEmail must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route rejects blank orderId before report side effects", async () => {
  const compiled = compilePpsrProcessRoute();
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
        customerEmail: "buyer@example.com",
        orderId: "   ",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "orderId must be a non-empty string when provided." });
    assert.equal(processErrors.length, 1, "expected the route to log the rejected request once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, [], "blank orderId must fail before order lookup");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "blank orderId must fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "blank orderId must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "blank orderId must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "blank orderId must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route rejects missing customerEmail when orderId is absent before report side effects", async () => {
  const compiled = compilePpsrProcessRoute();
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "customerEmail is required when orderId is not provided." });
    assert.equal(processErrors.length, 1, "expected the route to log the rejected request once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, [], "missing customerEmail without orderId must fail before order lookup");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "missing customerEmail without orderId must fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "missing customerEmail without orderId must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "missing customerEmail without orderId must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "missing customerEmail without orderId must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route rejects invalid customerEmail format before report side effects", async () => {
  const compiled = compilePpsrProcessRoute();
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
        customerEmail: "not-an-email",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "customerEmail must be a valid email address." });
    assert.equal(processErrors.length, 1, "expected the route to log the rejected request once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, [], "invalid customerEmail format must fail before order lookup");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "invalid customerEmail format must fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "invalid customerEmail format must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "invalid customerEmail format must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "invalid customerEmail format must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route rejects missing rawPPSRText before report side effects", async () => {
  const compiled = compilePpsrProcessRoute();
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        customerEmail: "buyer@example.com",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "rawPPSRText is required." });
    assert.equal(processErrors.length, 1, "expected the route to log the rejected request once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, [], "missing rawPPSRText must fail before order lookup");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "missing rawPPSRText must fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "missing rawPPSRText must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "missing rawPPSRText must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "missing rawPPSRText must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route rejects non-PDF certificate attachments before report side effects", async () => {
  const compiled = compilePpsrProcessRoute();
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
        customerEmail: "buyer@example.com",
        certificatePdfBase64: Buffer.from("not a pdf").toString("base64"),
        certificateFilename: "not-a-pdf.txt",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "certificatePdfBase64 must decode to a PDF file." });
    assert.equal(processErrors.length, 1, "expected the route to log the rejected certificate once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, [], "invalid certificate should fail before order lookup");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "invalid certificate should fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "invalid certificate should fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "invalid certificate should fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "invalid certificate should fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route returns 404 when orderId is provided but order is missing", async () => {
  const compiled = compilePpsrProcessRoute();
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
        orderId: "order_missing",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(payload, { ok: false, error: "Order not found." });
    assert.equal(processErrors.length, 1, "expected the route to log the missing order once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, ["order_missing"], "provided orderId should be looked up once");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "missing order must fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "missing order must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "missing order must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "missing order must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route rejects mismatched order and customerEmail before report side effects", async () => {
  const compiled = compilePpsrProcessRoute({
    order: {
      id: "order_x",
      customer_email: "buyer@example.com",
      product: "ppsr",
      status: "pending",
    },
  });
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;
  const processErrors = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
        customerEmail: "different@example.com",
        orderId: "order_x",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "customerEmail does not match the selected order." });
    assert.equal(processErrors.length, 1, "expected the route to log the mismatched customer email once");
    assert.match(String(processErrors[0][0]), /\[PPSR\] Process error:/);
    assert.deepEqual(compiled.calls.getOrderById, ["order_x"], "provided orderId should be looked up once");
    assert.deepEqual(compiled.calls.extractPpsrData, [], "email mismatch must fail before PPSR extraction");
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "email mismatch must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "email mismatch must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "email mismatch must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route does not mutate order when extraction fails", async () => {
  const compiled = compilePpsrProcessRoute({
    order: {
      id: "order_ok",
      customer_email: "buyer@example.com",
      product: "ppsr",
      status: "pending",
    },
    extractPpsrData: async () => {
      throw new Error("upstream parse failure");
    },
  });
  const originalConsoleError = console.error;
  const originalFetch = globalThis.fetch;

  console.error = () => {};
  globalThis.fetch = async () => new Response("network disabled in PPSR process route test", { status: 503 });

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345",
        customerEmail: "buyer@example.com",
        orderId: "order_ok",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.equal(payload.ok, false);
    assert.match(payload.error, /upstream parse failure/);
    assert.deepEqual(compiled.calls.getOrderById, ["order_ok"], "valid orderId should be looked up before extraction");
    assert.deepEqual(compiled.calls.extractPpsrData, ["Sample PPSR text with VIN 6FPAAAJGSW6A12345"]);
    assert.deepEqual(compiled.calls.generatePpsrPdf, [], "extraction failure must fail before PDF generation");
    assert.deepEqual(compiled.calls.updateOrder, [], "extraction failure must fail before order mutation");
    assert.deepEqual(compiled.calls.resendEmails, [], "extraction failure must fail before report email send");
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route sends results to Buying Buddy fulfilment inbox before customer presentation", async () => {
  const rawPpsrText = "Sample PPSR text with VIN 6FPAAAJGSW6A12345";
  const compiled = compilePpsrProcessRoute({
    order: {
      id: "order_ok",
      customer_email: "buyer@example.com",
      product: "ppsr",
      status: "pending",
    },
    ppsrData: {
      ...SAMPLE_PPSR_DATA,
      verdict: "ALERT",
      finance_owing: true,
      finance_details: "PPSR Registration number: 202206240165660 | Registration end time: 24/06/2029 23:59:59",
      summary: "Finance is registered against this vehicle.",
    },
  });
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalFetch = globalThis.fetch;
  const hadEmailProviderEnv = Object.prototype.hasOwnProperty.call(process.env, EMAIL_PROVIDER_ENV);
  const originalEmailProviderEnv = process.env[EMAIL_PROVIDER_ENV];
  const hadMessengerProviderEnv = Object.prototype.hasOwnProperty.call(process.env, MESSENGER_PROVIDER_ENV);
  const originalMessengerProviderEnv = process.env[MESSENGER_PROVIDER_ENV];
  const hadFulfilmentEmailEnv = Object.prototype.hasOwnProperty.call(process.env, FULFILMENT_EMAIL_ENV);
  const originalFulfilmentEmailEnv = process.env[FULFILMENT_EMAIL_ENV];
  const processErrors = [];
  const processWarnings = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  console.warn = (...args) => {
    processWarnings.push(args);
  };
  globalThis.fetch = async () => {
    throw new Error("Telegram fetch should not run when TELEGRAM_BOT_TOKEN is absent");
  };
  process.env[EMAIL_PROVIDER_ENV] = TEST_RESEND_VALUE;
  delete process.env[MESSENGER_PROVIDER_ENV];
  delete process.env[FULFILMENT_EMAIL_ENV];

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: rawPpsrText,
        customerEmail: "buyer@example.com",
        orderId: "order_ok",
        certificatePdfBase64: Buffer.from("%PDF-1.4\n% official PPSR certificate\n").toString("base64"),
        certificateFilename: "official PPSR certificate.pdf",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.sentTo, "info@buyingbuddy.com.au");
    assert.equal(payload.customerEmail, "buyer@example.com");
    assert.equal(payload.customerGuide.verdict, "ALERT");
    assert.ok(payload.customerGuide.sections.some((section) => section.id === "finance"));
    assert.deepEqual(
      compiled.calls.events.map((event) => event.type),
      ["updateOrder", "resendEmail", "updateOrder"],
      "order should be checked, sent to fulfilment, then moved to customer-presentation review",
    );
    assert.equal(compiled.calls.resendEmails.length, 1);
    assert.equal(compiled.calls.resendEmails[0].to, "info@buyingbuddy.com.au");
    assert.notEqual(compiled.calls.resendEmails[0].to, "buyer@example.com");
    assert.match(compiled.calls.resendEmails[0].subject, /PPSR ready for customer guide/i);
    assert.match(compiled.calls.resendEmails[0].html, /buyer@example\.com/);
    assert.match(compiled.calls.resendEmails[0].html, /Do not forward this internal fulfilment email/i);
    assert.match(compiled.calls.resendEmails[0].html, /pay the lender directly/i);
    assert.deepEqual(compiled.calls.updateOrder[1], {
      orderId: "order_ok",
      patch: {
        status: "awaiting_review",
      },
    });
    assert.equal(
      Object.prototype.hasOwnProperty.call(compiled.calls.updateOrder[1].patch, "report_sent_at"),
      false,
      "internal fulfilment handoff must not mark the customer report as sent",
    );
    assert.equal(compiled.calls.resendEmails[0].attachments.length, 2);
    assert.deepEqual(compiled.calls.resendEmails[0].attachments[1], {
      content: Buffer.from("%PDF-1.4\n% official PPSR certificate\n"),
      filename: "official PPSR certificate.pdf",
      contentType: "application/pdf",
    });
    assert.deepEqual(processErrors, [], "success path should not log process errors");
    assert.equal(processWarnings.length, 1, "telegram skip should be the only success-path warning");
  } finally {
    if (hadEmailProviderEnv) {
      process.env[EMAIL_PROVIDER_ENV] = originalEmailProviderEnv;
    } else {
      delete process.env[EMAIL_PROVIDER_ENV];
    }
    if (hadMessengerProviderEnv) {
      process.env[MESSENGER_PROVIDER_ENV] = originalMessengerProviderEnv;
    } else {
      delete process.env[MESSENGER_PROVIDER_ENV];
    }
    if (hadFulfilmentEmailEnv) {
      process.env[FULFILMENT_EMAIL_ENV] = originalFulfilmentEmailEnv;
    } else {
      delete process.env[FULFILMENT_EMAIL_ENV];
    }
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route success updates order and sends fulfilment email in order", async () => {
  const rawPpsrText = "Sample PPSR text with VIN 6FPAAAJGSW6A12345";
  const compiled = compilePpsrProcessRoute({
    order: {
      id: "order_ok",
      customer_email: "buyer@example.com",
      product: "ppsr",
      status: "pending",
    },
  });
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalFetch = globalThis.fetch;
  const hadEmailProviderEnv = Object.prototype.hasOwnProperty.call(process.env, EMAIL_PROVIDER_ENV);
  const originalEmailProviderEnv = process.env[EMAIL_PROVIDER_ENV];
  const hadMessengerProviderEnv = Object.prototype.hasOwnProperty.call(process.env, MESSENGER_PROVIDER_ENV);
  const originalMessengerProviderEnv = process.env[MESSENGER_PROVIDER_ENV];
  const processErrors = [];
  const processWarnings = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  console.warn = (...args) => {
    processWarnings.push(args);
  };
  globalThis.fetch = async () => {
    throw new Error("Telegram fetch should not run when TELEGRAM_BOT_TOKEN is absent");
  };
  process.env[EMAIL_PROVIDER_ENV] = TEST_RESEND_VALUE;
  delete process.env[MESSENGER_PROVIDER_ENV];

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: rawPpsrText,
        customerEmail: "buyer@example.com",
        orderId: "order_ok",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.deepEqual(payload.data, SAMPLE_PPSR_DATA);
    assert.equal(payload.sentTo, "info@buyingbuddy.com.au");
    assert.equal(payload.customerEmail, "buyer@example.com");
    assert.equal(payload.customerGuide.verdict, "CLEAR");
    assert.equal(payload.telegramSent, false);
    assert.match(payload.reportPath, /^ppsr_order_ok_\d+\.pdf$/);
    assert.deepEqual(compiled.calls.getOrderById, ["order_ok"], "valid orderId should be looked up once");
    assert.deepEqual(compiled.calls.extractPpsrData, [rawPpsrText]);
    assert.equal(compiled.calls.generatePpsrPdf.length, 1);
    assert.deepEqual(compiled.calls.generatePpsrPdf[0].data, SAMPLE_PPSR_DATA);
    assert.equal(compiled.calls.generatePpsrPdf[0].filename, payload.reportPath);
    assert.deepEqual(
      compiled.calls.events.map((event) => event.type),
      ["updateOrder", "resendEmail", "updateOrder"],
      "order should be checked, sent to fulfilment, then moved to customer-presentation review",
    );

    assert.equal(compiled.calls.updateOrder.length, 2);
    assert.deepEqual(compiled.calls.updateOrder[0], {
      orderId: "order_ok",
      patch: {
        ppsr_result: {
          ...SAMPLE_PPSR_DATA,
          customer_guide: payload.customerGuide,
        },
        ppsr_checked_at: "2026-05-11 07:40:00",
        report_pdf_path: payload.reportPath,
      },
    });
    assert.deepEqual(compiled.calls.updateOrder[1], {
      orderId: "order_ok",
      patch: {
        status: "awaiting_review",
      },
    });

    assert.deepEqual(compiled.calls.resendConstructors, [TEST_RESEND_VALUE]);
    assert.equal(compiled.calls.resendEmails.length, 1);
    assert.equal(compiled.calls.resendEmails[0].to, "info@buyingbuddy.com.au");
    assert.match(compiled.calls.resendEmails[0].subject, /PPSR ready for customer guide - CLEAR/);
    assert.match(compiled.calls.resendEmails[0].html, /Do not forward this internal fulfilment email/);
    assert.match(compiled.calls.resendEmails[0].html, /buyer@example\.com/);
    assert.deepEqual(compiled.calls.resendEmails[0].attachments, [
      {
        content: Buffer.from("%PDF-1.4\n% PPSR process route test\n"),
        filename: payload.reportPath,
        contentType: "application/pdf",
      },
    ]);
    assert.deepEqual(processErrors, [], "success path should not log process errors");
    assert.equal(processWarnings.length, 1, "telegram skip should be the only success-path warning");
    assert.match(String(processWarnings[0][0]), /\[PPSR\] TELEGRAM_BOT_TOKEN missing/);
  } finally {
    if (hadEmailProviderEnv) {
      process.env[EMAIL_PROVIDER_ENV] = originalEmailProviderEnv;
    } else {
      delete process.env[EMAIL_PROVIDER_ENV];
    }
    if (hadMessengerProviderEnv) {
      process.env[MESSENGER_PROVIDER_ENV] = originalMessengerProviderEnv;
    } else {
      delete process.env[MESSENGER_PROVIDER_ENV];
    }
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});

test("PPSR process route treats Telegram notification failure as non-fatal after fulfilment email", async () => {
  const rawPpsrText = "Sample PPSR text with VIN 6FPAAAJGSW6A12345";
  const compiled = compilePpsrProcessRoute({
    order: {
      id: "order_ok",
      customer_email: "buyer@example.com",
      product: "ppsr",
      status: "pending",
    },
  });
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalFetch = globalThis.fetch;
  const hadEmailProviderEnv = Object.prototype.hasOwnProperty.call(process.env, EMAIL_PROVIDER_ENV);
  const originalEmailProviderEnv = process.env[EMAIL_PROVIDER_ENV];
  const hadMessengerProviderEnv = Object.prototype.hasOwnProperty.call(process.env, MESSENGER_PROVIDER_ENV);
  const originalMessengerProviderEnv = process.env[MESSENGER_PROVIDER_ENV];
  const processErrors = [];
  const processWarnings = [];
  const telegramFetches = [];

  console.error = (...args) => {
    processErrors.push(args);
  };
  console.warn = (...args) => {
    processWarnings.push(args);
  };
  globalThis.fetch = async (url, init) => {
    telegramFetches.push({ url: String(url), init });
    return new Response("telegram upstream down", { status: 500 });
  };
  process.env[EMAIL_PROVIDER_ENV] = TEST_RESEND_VALUE;
  process.env[MESSENGER_PROVIDER_ENV] = TEST_TELEGRAM_VALUE;

  try {
    const response = await compiled.route.POST(
      makePpsrProcessRequest({
        rawPPSRText: rawPpsrText,
        customerEmail: "buyer@example.com",
        orderId: "order_ok",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.deepEqual(payload.data, SAMPLE_PPSR_DATA);
    assert.equal(payload.sentTo, "info@buyingbuddy.com.au");
    assert.equal(payload.customerEmail, "buyer@example.com");
    assert.equal(payload.customerGuide.verdict, "CLEAR");
    assert.equal(payload.telegramSent, false);
    assert.match(payload.reportPath, /^ppsr_order_ok_\d+\.pdf$/);
    assert.deepEqual(compiled.calls.getOrderById, ["order_ok"], "valid orderId should be looked up once");
    assert.deepEqual(compiled.calls.extractPpsrData, [rawPpsrText]);
    assert.equal(compiled.calls.generatePpsrPdf.length, 1);
    assert.deepEqual(compiled.calls.generatePpsrPdf[0].data, SAMPLE_PPSR_DATA);
    assert.equal(compiled.calls.generatePpsrPdf[0].filename, payload.reportPath);
    assert.deepEqual(
      compiled.calls.events.map((event) => event.type),
      ["updateOrder", "resendEmail", "updateOrder"],
      "telegram failure should happen only after order is checked, fulfilment email is sent, and order is ready for review",
    );

    assert.equal(compiled.calls.updateOrder.length, 2);
    assert.deepEqual(compiled.calls.updateOrder[0], {
      orderId: "order_ok",
      patch: {
        ppsr_result: {
          ...SAMPLE_PPSR_DATA,
          customer_guide: payload.customerGuide,
        },
        ppsr_checked_at: "2026-05-11 07:40:00",
        report_pdf_path: payload.reportPath,
      },
    });
    assert.deepEqual(compiled.calls.updateOrder[1], {
      orderId: "order_ok",
      patch: {
        status: "awaiting_review",
      },
    });

    assert.deepEqual(compiled.calls.resendConstructors, [TEST_RESEND_VALUE]);
    assert.equal(compiled.calls.resendEmails.length, 1);
    assert.equal(compiled.calls.resendEmails[0].to, "info@buyingbuddy.com.au");
    assert.match(compiled.calls.resendEmails[0].subject, /PPSR ready for customer guide - CLEAR/);
    assert.equal(telegramFetches.length, 1, "telegram notification should be attempted once when a token is configured");
    assert.match(telegramFetches[0].url, new RegExp(`^https:\\/\\/api\\.telegram\\.org\\/bot${TEST_TELEGRAM_VALUE}\\/sendMessage$`));
    assert.equal(telegramFetches[0].init.method, "POST");
    assert.deepEqual(JSON.parse(telegramFetches[0].init.body), {
      chat_id: "1296786949",
      text: [
        "PPSR REPORT GENERATED",
        "Verdict: CLEAR",
        "Vehicle: Toyota Hilux 2021 (6FPAAAJGSW6A12345)",
        "Customer: buyer@example.com",
        "Order ID: order_ok",
      ].join("\n"),
    });
    assert.deepEqual(processErrors, [], "telegram failure should not log a process error");
    assert.equal(processWarnings.length, 1, "telegram HTTP failure should warn once without failing the route");
    assert.match(String(processWarnings[0][0]), /\[PPSR\] Telegram notification failed:/);
    assert.match(String(processWarnings[0][1]), /Telegram notification failed: 500 telegram upstream down/);
  } finally {
    if (hadEmailProviderEnv) {
      process.env[EMAIL_PROVIDER_ENV] = originalEmailProviderEnv;
    } else {
      delete process.env[EMAIL_PROVIDER_ENV];
    }
    if (hadMessengerProviderEnv) {
      process.env[MESSENGER_PROVIDER_ENV] = originalMessengerProviderEnv;
    } else {
      delete process.env[MESSENGER_PROVIDER_ENV];
    }
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    globalThis.fetch = originalFetch;
    compiled.cleanup();
  }
});
