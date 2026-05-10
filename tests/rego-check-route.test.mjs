import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

function compileRegoCheckRoute({ lookupHandler } = {}) {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-rego-route-"));
  const tsconfigPath = join(outDir, "tsconfig.json");
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");
  let lookupCalls = 0;

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
          join(process.cwd(), "src/app/api/rego/check/route.ts"),
          join(process.cwd(), "src/lib/qld-rego/normalise.ts"),
        ],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync(tsc, ["--project", tsconfigPath], { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" });

    const routePath = join(outDir, "src", "app", "api", "rego", "check", "route.js");
    const normalisePath = join(outDir, "src", "lib", "qld-rego", "normalise.js");
    assert.ok(existsSync(routePath), `Compiled route.js not found at ${routePath}`);
    assert.ok(existsSync(normalisePath), `Compiled normalise.js not found at ${normalisePath}`);

    const originalLoad = Module._load;
    const nextServer = require("next/server");
    Module._load = function loadRegoCheckDependency(request, parent, isMain) {
      if (request === "next/server") {
        return nextServer;
      }

      if (request === "@/lib/qld-rego/official") {
        return {
          runQldOfficialRegoCheck: async (...args) => {
            lookupCalls += 1;
            if (lookupHandler) {
              return lookupHandler(...args);
            }
            return {
              ok: true,
              status: "found",
              checkedAt: new Date().toISOString(),
              source: "test",
              vehicle: {},
              recommendations: [],
              limitations: [],
            };
          },
        };
      }

      if (request === "@/lib/qld-rego/normalise") {
        return require(normalisePath);
      }

      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const route = require(routePath);
      return {
        route,
        getLookupCalls: () => lookupCalls,
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
  return new Request("http://localhost/api/rego/check", {
    method: "POST",
    body,
    headers: { "content-type": "application/json" },
  });
}

test("rego check rejects malformed JSON", async () => {
  const compiled = compileRegoCheckRoute();
  try {
    const response = await compiled.route.POST(makeRequest("{"));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_json");
    assert.equal(payload.retryable, false);
    assert.equal(compiled.getLookupCalls(), 0, "malformed JSON must not call the QLD lookup");
  } finally {
    compiled.cleanup();
  }
});

test("rego check rejects non-string rego", async () => {
  const compiled = compileRegoCheckRoute();
  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify({ rego: 123, state: "QLD" })));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_rego");
    assert.equal(payload.userMessage, "Pop the QLD rego in first.");
    assert.equal(payload.retryable, false);
    assert.equal(compiled.getLookupCalls(), 0, "non-string rego must not call the QLD lookup");
  } finally {
    compiled.cleanup();
  }
});

test("rego check rejects non-object JSON", async () => {
  const compiled = compileRegoCheckRoute();
  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify("123ABC")));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_body");
    assert.equal(payload.userMessage, "Send the rego as a JSON object.");
    assert.equal(payload.retryable, false);
    assert.equal(compiled.getLookupCalls(), 0, "non-object JSON must not call the QLD lookup");
  } finally {
    compiled.cleanup();
  }
});

test("rego check rejects non-string state", async () => {
  const compiled = compileRegoCheckRoute();
  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify({ rego: "123ABC", state: 123 })));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "input_error");
    assert.equal(payload.error, "invalid_state");
    assert.equal(payload.userMessage, "This beta checks QLD regos only. Choose QLD or leave the state blank.");
    assert.equal(payload.retryable, false);
    assert.equal(compiled.getLookupCalls(), 0, "non-string state must not call the QLD lookup");
  } finally {
    compiled.cleanup();
  }
});

test("rego check defaults missing state to QLD", async () => {
  const compiled = compileRegoCheckRoute();
  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify({ rego: "123ABC" })));
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.status, "found");
    assert.equal(compiled.getLookupCalls(), 1, "missing state should default to QLD and call the QLD lookup once");
  } finally {
    compiled.cleanup();
  }
});

test("rego check rejects unsupported state before lookup", async () => {
  const compiled = compileRegoCheckRoute();
  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify({ rego: "123ABC", state: "NSW" })));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "not_qld");
    assert.equal(payload.error, "qld_only");
    assert.equal(payload.retryable, false);
    assert.equal(compiled.getLookupCalls(), 0, "unsupported states must not call the QLD lookup");
  } finally {
    compiled.cleanup();
  }
});

test("rego check busy response sets rate-limit scope header", async () => {
  const compiled = compileRegoCheckRoute({
    lookupHandler: async () => ({
      ok: false,
      status: "busy",
      error: "hourly_limit",
      userMessage: "The QLD rego checker is busy. Try again shortly.",
      checkedAt: new Date().toISOString(),
      retryable: false,
      rateLimitScope: "instance",
    }),
  });

  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify({ rego: "123ABC", state: "QLD" })));
    const payload = await response.json();

    assert.equal(response.status, 429);
    assert.equal(response.headers.get("x-rego-rate-limit-scope"), "instance");
    assert.equal(payload.ok, false);
    assert.equal(payload.status, "busy");
    assert.equal(payload.rateLimitScope, "instance");
    assert.equal(compiled.getLookupCalls(), 1, "valid busy response should call the QLD lookup once");
  } finally {
    compiled.cleanup();
  }
});

test("rego check route catch returns stable error code", async () => {
  const compiled = compileRegoCheckRoute({
    lookupHandler: async () => {
      throw new Error("boom secret/path");
    },
  });
  const originalConsoleError = console.error;
  const consoleErrors = [];
  console.error = (...args) => {
    consoleErrors.push(args);
  };

  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify({ rego: "123ABC", state: "QLD" })));
    const payload = await response.json();

    assert.equal(payload.ok, false);
    assert.equal(payload.status, "error");
    assert.equal(payload.error, "route_unhandled");
    assert.equal(payload.error.includes("boom"), false);
    assert.equal(payload.retryable, false);
    assert.equal(compiled.getLookupCalls(), 1, "valid input should reach the mocked QLD lookup once before the catch branch");
    assert.equal(consoleErrors.length, 1, "catch branch should log the raw server-side error once");
    assert.equal(consoleErrors[0][0], "[rego-check] unhandled");
    assert.ok(consoleErrors[0][1] instanceof Error);
    assert.equal(consoleErrors[0][1].message, "boom secret/path");
  } finally {
    console.error = originalConsoleError;
    compiled.cleanup();
  }
});

test("rego check route catch returns 502 not 500", async () => {
  const compiled = compileRegoCheckRoute({
    lookupHandler: async () => {
      throw new Error("boom secret/path");
    },
  });
  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const response = await compiled.route.POST(makeRequest(JSON.stringify({ rego: "123ABC", state: "QLD" })));

    assert.equal(response.status, 502);
  } finally {
    console.error = originalConsoleError;
    compiled.cleanup();
  }
});
