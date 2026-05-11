import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

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
