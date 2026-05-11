import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

function compileRegoCaptureRoute(options = {}) {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-rego-capture-route-"));
  const tsconfigPath = join(outDir, "tsconfig.json");
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");
  const emailSends = [];
  const throwOnEmailSend = options.throwOnEmailSend ?? null;
  const throwWhenEmailTo = options.throwWhenEmailTo ?? null;
  const throwMessage = options.throwMessage ?? "email provider failed";
  const throwOnValidateRego = options.throwOnValidateRego ?? false;
  const validateThrowMessage = options.validateThrowMessage ?? "rego validation failed";

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
          join(process.cwd(), "src/app/api/rego/capture/route.ts"),
          join(process.cwd(), "src/lib/qld-rego/normalise.ts"),
        ],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync(tsc, ["--project", tsconfigPath], { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" });

    const routePath = join(outDir, "src", "app", "api", "rego", "capture", "route.js");
    const normalisePath = join(outDir, "src", "lib", "qld-rego", "normalise.js");
    assert.ok(existsSync(routePath), `Compiled route.js not found at ${routePath}`);
    assert.ok(existsSync(normalisePath), `Compiled normalise.js not found at ${normalisePath}`);

    const originalLoad = Module._load;
    const nextServer = require("next/server");
    Module._load = function loadRegoCaptureDependency(request, parent, isMain) {
      if (request === "next/server") {
        return nextServer;
      }

      if (request === "@/lib/qld-rego/normalise") {
        const normalise = require(normalisePath);
        if (throwOnValidateRego) {
          return {
            ...normalise,
            validateQldRego: () => {
              throw new Error(validateThrowMessage);
            },
          };
        }
        return normalise;
      }

      if (request === "resend") {
        return {
          Resend: class MockResend {
            constructor(apiKey) {
              this.apiKey = apiKey;
              this.emails = {
                send: async (message) => {
                  const sendNumber = emailSends.length + 1;
                  if (throwOnEmailSend === sendNumber || message.to === throwWhenEmailTo) {
                    throw new Error(throwMessage);
                  }
                  emailSends.push({ apiKey, ...message });
                  return { data: { id: `test-email-${emailSends.length}` }, error: null };
                },
              };
            }
          },
        };
      }

      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const route = require(routePath);
      return {
        route,
        getEmailSends: () => emailSends,
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

function makeRequest(body) {
  return new Request("http://localhost/api/rego/capture", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function makeRawJsonRequest(body) {
  return new Request("http://localhost/api/rego/capture", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
}

test("rego capture rejects malformed JSON", async () => {
  const compiled = compileRegoCaptureRoute();

  try {
    const response = await compiled.route.POST(makeRawJsonRequest('{"rego":"123ABC",'));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_json");
    assert.equal(payload.userMessage, "We couldn't read that rego capture request. Try again.");
    assert.equal(payload.retryable, false);
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 0, "malformed JSON must not send capture emails");
  } finally {
    compiled.cleanup();
  }
});

test("rego capture rejects non-object JSON", async () => {
  const compiled = compileRegoCaptureRoute();

  try {
    const response = await compiled.route.POST(makeRequest(null));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_body");
    assert.equal(payload.userMessage, "Send rego capture details as a JSON object.");
    assert.equal(payload.retryable, false);
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 0, "non-object JSON must not send capture emails");
  } finally {
    compiled.cleanup();
  }
});

test("rego capture rejects non-string email", async () => {
  const compiled = compileRegoCaptureRoute();

  try {
    const response = await compiled.route.POST(makeRequest({ rego: "123ABC", email: 123 }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_email");
    assert.equal(payload.userMessage, "Enter a valid email address.");
    assert.equal(payload.retryable, false);
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 0, "non-string email must not send capture emails");
  } finally {
    compiled.cleanup();
  }
});

test("rego capture rejects non-string rego", async () => {
  const compiled = compileRegoCaptureRoute();

  try {
    const response = await compiled.route.POST(makeRequest({ rego: 123, email: "buyer@example.com" }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_rego");
    assert.equal(payload.userMessage, "Enter a valid QLD rego.");
    assert.equal(payload.retryable, false);
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 0, "non-string rego must not send capture emails");
  } finally {
    compiled.cleanup();
  }
});

test("rego capture invalid string rego returns stable input envelope", async () => {
  const compiled = compileRegoCaptureRoute();

  try {
    const response = await compiled.route.POST(makeRequest({ rego: "!!", email: "buyer@example.com" }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_rego");
    assert.equal(payload.retryable, false);
    assert.ok(typeof payload.userMessage === "string" && payload.userMessage.length > 0, "expected userMessage text");
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 0, "invalid string rego must not send capture emails");
  } finally {
    compiled.cleanup();
  }
});

test("rego capture invalid email returns stable input envelope", async () => {
  const compiled = compileRegoCaptureRoute();

  try {
    const response = await compiled.route.POST(makeRequest({ rego: "123ABC", email: "not-an-email" }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_email");
    assert.equal(payload.retryable, false);
    assert.equal(payload.userMessage, "Enter a valid email address.");
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 0, "invalid email must not send capture emails");
  } finally {
    compiled.cleanup();
  }
});

test("rego capture rejects non-string reason", async () => {
  const compiled = compileRegoCaptureRoute();
  const originalApiKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "unit-test-api-key";

  try {
    const response = await compiled.route.POST(
      makeRequest({ rego: "123ABC", email: "buyer@example.com", reason: 42 }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_reason");
    assert.equal(payload.retryable, false);
    assert.ok(typeof payload.userMessage === "string" && payload.userMessage.length > 0, "expected userMessage text");
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 0, "non-string reason must not send capture emails");
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    compiled.cleanup();
  }
});

test("rego capture enforces hourly cap", async () => {
  const compiled = compileRegoCaptureRoute();
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalMaxPerHour = process.env.REGO_CAPTURE_MAX_PER_HOUR;
  process.env.RESEND_API_KEY = "unit-test-api-key";
  process.env.REGO_CAPTURE_MAX_PER_HOUR = "6";

  try {
    const validCapture = { rego: "123ABC", email: "buyer@example.com", reason: "manual follow-up" };

    for (let i = 0; i < 6; i += 1) {
      const response = await compiled.route.POST(makeRequest(validCapture));
      const payload = await response.json();
      assert.equal(response.status, 200, `expected allowed capture ${i + 1} to succeed`);
      assert.deepEqual(payload, { ok: true });
    }

    assert.equal(compiled.getEmailSends().length, 12, "six successful captures should send buyer and notification emails");

    const overLimitResponse = await compiled.route.POST(makeRequest(validCapture));
    const overLimitPayload = await overLimitResponse.json();

    assert.equal(overLimitResponse.status, 429);
    assert.equal(overLimitResponse.headers.get("x-rego-rate-limit-scope"), "instance");
    assert.equal(overLimitPayload.ok, false);
    assert.equal(overLimitPayload.status, "busy");
    assert.equal(overLimitPayload.error, "hourly_limit");
    assert.equal(overLimitPayload.retryable, true);
    assert.ok(typeof overLimitPayload.userMessage === "string" && overLimitPayload.userMessage.length > 0, "expected userMessage text");
    assert.ok(Date.parse(overLimitPayload.checkedAt), `expected ISO checkedAt, got ${overLimitPayload.checkedAt}`);
    assert.equal(compiled.getEmailSends().length, 12, "over-limit capture must not send additional emails");
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    if (originalMaxPerHour === undefined) {
      delete process.env.REGO_CAPTURE_MAX_PER_HOUR;
    } else {
      process.env.REGO_CAPTURE_MAX_PER_HOUR = originalMaxPerHour;
    }
    compiled.cleanup();
  }
});

test("rego capture limit is per email", async () => {
  const compiled = compileRegoCaptureRoute();
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalMaxPerHour = process.env.REGO_CAPTURE_MAX_PER_HOUR;
  process.env.RESEND_API_KEY = "unit-test-api-key";
  process.env.REGO_CAPTURE_MAX_PER_HOUR = "6";

  try {
    const repeatedCapture = { rego: "123ABC", email: "buyer-a@example.com", reason: "manual follow-up" };

    for (let i = 0; i < 6; i += 1) {
      const response = await compiled.route.POST(makeRequest(repeatedCapture));
      const payload = await response.json();
      assert.equal(response.status, 200, `expected buyer-a capture ${i + 1} to succeed`);
      assert.deepEqual(payload, { ok: true });
    }

    assert.equal(compiled.getEmailSends().length, 12, "six buyer-a captures should send buyer and notification emails");

    const otherBuyerResponse = await compiled.route.POST(
      makeRequest({ rego: "123ABC", email: "buyer-b@example.com", reason: "manual follow-up" }),
    );
    const otherBuyerPayload = await otherBuyerResponse.json();

    assert.equal(otherBuyerResponse.status, 200, "buyer-b should not inherit buyer-a's hourly cap");
    assert.deepEqual(otherBuyerPayload, { ok: true });
    assert.equal(compiled.getEmailSends().length, 14, "buyer-b capture should still send both emails");
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    if (originalMaxPerHour === undefined) {
      delete process.env.REGO_CAPTURE_MAX_PER_HOUR;
    } else {
      process.env.REGO_CAPTURE_MAX_PER_HOUR = originalMaxPerHour;
    }
    compiled.cleanup();
  }
});

test("rego capture aborts buyer email when notification send fails", async () => {
  const compiled = compileRegoCaptureRoute({ throwWhenEmailTo: "info@buyingbuddy.com.au", throwMessage: "boom secret/path" });
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalConsoleError = console.error;
  process.env.RESEND_API_KEY = "unit-test-api-key";
  console.error = () => {};

  try {
    const response = await compiled.route.POST(
      makeRequest({ rego: "123ABC", email: "buyer@example.com", reason: "manual follow-up" }),
    );
    const payload = await response.json();
    const publicPayload = JSON.stringify(payload);

    assert.equal(response.status, 502);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "provider_error");
    assert.equal(payload.error, "email_provider_failed");
    assert.equal(payload.retryable, false);
    assert.ok(typeof payload.userMessage === "string" && payload.userMessage.length > 0, "expected userMessage text");
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.ok(!publicPayload.includes("boom"), `public payload leaked provider message: ${publicPayload}`);
    assert.ok(!publicPayload.includes("secret/path"), `public payload leaked provider path: ${publicPayload}`);
    assert.equal(compiled.getEmailSends().length, 0, "notification failure must not send buyer email first");
  } finally {
    console.error = originalConsoleError;
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    compiled.cleanup();
  }
});

test("rego capture logs partial success when buyer send fails", async () => {
  const compiled = compileRegoCaptureRoute({ throwOnEmailSend: 2, throwMessage: "boom secret/path" });
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const warnCalls = [];
  process.env.RESEND_API_KEY = "unit-test-api-key";
  console.error = () => {};
  console.warn = (...args) => warnCalls.push(args);

  try {
    const response = await compiled.route.POST(
      makeRequest({ rego: "123ABC", email: "buyer@example.com", reason: "manual follow-up" }),
    );
    const payload = await response.json();

    assert.equal(response.status, 502);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "provider_error");
    assert.equal(payload.error, "email_provider_failed");
    assert.equal(payload.retryable, false);
    assert.equal(compiled.getEmailSends().length, 1, "notification send should be the only successful email");
    assert.equal(warnCalls.length, 1, "buyer-send failure after notification success should emit one warning");
    assert.equal(warnCalls[0][0], "rego capture buyer send failed after notification succeeded");
  } finally {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    compiled.cleanup();
  }
});

test("rego capture route catch returns stable error envelope", async () => {
  const compiled = compileRegoCaptureRoute({ throwOnValidateRego: true, validateThrowMessage: "boom secret/path" });
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await compiled.route.POST(makeRequest({ rego: "123ABC", email: "buyer@example.com" }));
    const payload = await response.json();
    const publicPayload = JSON.stringify(payload);

    assert.equal(response.status, 500);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "error");
    assert.equal(payload.error, "route_unhandled");
    assert.equal(payload.retryable, false);
    assert.ok(typeof payload.userMessage === "string" && payload.userMessage.length > 0, "expected userMessage text");
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.ok(!publicPayload.includes("boom"), `public payload leaked route message: ${publicPayload}`);
    assert.ok(!publicPayload.includes("secret/path"), `public payload leaked route path: ${publicPayload}`);
    assert.equal(compiled.getEmailSends().length, 0, "route catch must not send capture emails");
  } finally {
    console.error = originalConsoleError;
    compiled.cleanup();
  }
});

test("rego capture provider failure returns stable error envelope", async () => {
  const compiled = compileRegoCaptureRoute({ throwOnEmailSend: 2, throwMessage: "boom secret/path" });
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  process.env.RESEND_API_KEY = "unit-test-api-key";
  console.error = () => {};
  console.warn = () => {};

  try {
    const response = await compiled.route.POST(
      makeRequest({ rego: "123ABC", email: "buyer@example.com", reason: "manual follow-up" }),
    );
    const payload = await response.json();
    const publicPayload = JSON.stringify(payload);

    assert.equal(response.status, 502);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "provider_error");
    assert.equal(payload.error, "email_provider_failed");
    assert.equal(payload.retryable, false);
    assert.ok(typeof payload.userMessage === "string" && payload.userMessage.length > 0, "expected userMessage text");
    assert.ok(Date.parse(payload.checkedAt), `expected ISO checkedAt, got ${payload.checkedAt}`);
    assert.ok(!publicPayload.includes("boom"), `public payload leaked provider message: ${publicPayload}`);
    assert.ok(!publicPayload.includes("secret/path"), `public payload leaked provider path: ${publicPayload}`);
    assert.equal(compiled.getEmailSends().length, 1, "provider failure should stop after the first successful send");
  } finally {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    compiled.cleanup();
  }
});

test("rego capture escapes reason in notification HTML", async () => {
  const compiled = compileRegoCaptureRoute();
  const originalApiKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = "unit-test-api-key";

  try {
    const response = await compiled.route.POST(
      makeRequest({
        rego: "123 ABC",
        email: "buyer@example.com",
        reason: "</p><script>alert(1)</script>",
      }),
    );
    const payload = await response.json();
    const notificationEmail = compiled
      .getEmailSends()
      .find((message) => message.subject === "QLD rego fallback lead: 123ABC");

    assert.equal(response.status, 200);
    assert.deepEqual(payload, { ok: true });
    assert.equal(compiled.getEmailSends().length, 2, "successful capture should send buyer and notification emails");
    assert.ok(notificationEmail, "expected the internal notification email to be captured");
    assert.match(notificationEmail.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(notificationEmail.html, /<script>alert\(1\)<\/script>/);
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.RESEND_API_KEY;
    } else {
      process.env.RESEND_API_KEY = originalApiKey;
    }
    compiled.cleanup();
  }
});
