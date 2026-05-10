import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

function compileOfficialModule() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-qld-rego-"));
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");

  try {
    execFileSync(
      tsc,
      [
        "--target",
        "es2020",
        "--lib",
        "es2020,dom",
        "--module",
        "commonjs",
        "--moduleResolution",
        "node",
        "--esModuleInterop",
        "--skipLibCheck",
        "--strict",
        "--outDir",
        outDir,
        "src/lib/qld-rego/official.ts",
      ],
      { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" },
    );

    const candidates = [
      join(outDir, "official.js"),
      join(outDir, "src", "lib", "qld-rego", "official.js"),
    ];
    const compiledPath = candidates.find((path) => existsSync(path));
    assert.ok(compiledPath, `Compiled official.js not found under ${outDir}`);

    return {
      module: require(compiledPath),
      cleanup: () => rmSync(outDir, { force: true, recursive: true }),
    };
  } catch (error) {
    rmSync(outDir, { force: true, recursive: true });
    throw error;
  }
}

function restoreEnv(snapshot) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

const searchFormHtml = `
  <html>
    <body>
      <form id="vehicleSearchForm" name="vehicleSearchForm">
        <input name="vehicleSearchForm:plateNumber" value="" />
        <input name="javax.faces.ViewState" value="state-1" />
        <input name="javax.faces.ClientWindow" value="window-1" />
      </form>
    </body>
  </html>
`;

const changedResultHtml = `
  <html>
    <body>
      <main>
        <h1>Vehicle search result</h1>
        <p>The external page changed and the expected vehicle detail labels are absent.</p>
      </main>
    </body>
  </html>
`;

const noResultHtml = `
  <html>
    <body>
      <main>
        <h1>Vehicle search result</h1>
        <p>We could not find any registration details for that plate.</p>
      </main>
    </body>
  </html>
`;

test("no-result response is cached for the no-result TTL", async () => {
  const envSnapshot = {
    REGO_CHECK_ENABLED: process.env.REGO_CHECK_ENABLED,
    REGO_CHECK_MAX_PER_HOUR: process.env.REGO_CHECK_MAX_PER_HOUR,
    REGO_CHECK_TIMEOUT_MS: process.env.REGO_CHECK_TIMEOUT_MS,
  };
  process.env.REGO_CHECK_ENABLED = "true";
  process.env.REGO_CHECK_MAX_PER_HOUR = "99";
  process.env.REGO_CHECK_TIMEOUT_MS = "5000";

  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), method: init.method ?? "GET" });
    const html = requests.length === 1 ? searchFormHtml : noResultHtml;
    return new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  };

  const compiled = compileOfficialModule();
  try {
    const first = await compiled.module.runQldOfficialRegoCheck("123ABC");
    const second = await compiled.module.runQldOfficialRegoCheck("123ABC");

    assert.equal(first.ok, false);
    assert.equal(first.status, "no_result");
    assert.equal(first.error, "no_official_result");
    assert.equal(first.retryable, false);
    assert.equal(first.cached, undefined, "fresh no-result responses should not be marked cached");

    assert.equal(second.ok, false);
    assert.equal(second.status, "no_result");
    assert.equal(second.error, "no_official_result");
    assert.equal(second.retryable, false);
    assert.equal(second.cached, true, "second same-plate no-result response should come from cache");
    assert.equal(requests.length, 2, "cached no-result lookup should not fetch QLD again");
  } finally {
    compiled.cleanup();
    globalThis.fetch = originalFetch;
    restoreEnv(envSnapshot);
  }
});

test("parse error is not cached as no-result", async () => {
  const envSnapshot = {
    REGO_CHECK_ENABLED: process.env.REGO_CHECK_ENABLED,
    REGO_CHECK_MAX_PER_HOUR: process.env.REGO_CHECK_MAX_PER_HOUR,
    REGO_CHECK_TIMEOUT_MS: process.env.REGO_CHECK_TIMEOUT_MS,
  };
  process.env.REGO_CHECK_ENABLED = "true";
  process.env.REGO_CHECK_MAX_PER_HOUR = "99";
  process.env.REGO_CHECK_TIMEOUT_MS = "5000";

  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), method: init.method ?? "GET" });
    const html = requests.length % 2 === 1 ? searchFormHtml : changedResultHtml;
    return new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  };

  const compiled = compileOfficialModule();
  try {
    const first = await compiled.module.runQldOfficialRegoCheck("123ABC");
    const second = await compiled.module.runQldOfficialRegoCheck("123ABC");

    assert.equal(first.ok, false);
    assert.equal(first.status, "parse_error");
    assert.equal(first.error, "result_parse_failed");
    assert.equal(first.retryable, true);

    assert.equal(second.ok, false);
    assert.equal(second.status, "parse_error");
    assert.equal(second.error, "result_parse_failed");
    assert.equal(second.retryable, true);
    assert.equal(second.cached, undefined, "retryable parse errors should force a fresh QLD request");
    assert.equal(requests.length, 4, "each parse-error lookup should fetch the search form and result page");
  } finally {
    compiled.cleanup();
    globalThis.fetch = originalFetch;
    restoreEnv(envSnapshot);
  }
});

test("official unavailable returns stable error code", async () => {
  const envSnapshot = {
    REGO_CHECK_ENABLED: process.env.REGO_CHECK_ENABLED,
    REGO_CHECK_MAX_PER_HOUR: process.env.REGO_CHECK_MAX_PER_HOUR,
    REGO_CHECK_TIMEOUT_MS: process.env.REGO_CHECK_TIMEOUT_MS,
  };
  process.env.REGO_CHECK_ENABLED = "true";
  process.env.REGO_CHECK_MAX_PER_HOUR = "99";
  process.env.REGO_CHECK_TIMEOUT_MS = "5000";

  const originalFetch = globalThis.fetch;
  const requests = [];
  globalThis.fetch = async (url, init = {}) => {
    requests.push({ url: String(url), method: init.method ?? "GET" });
    throw new Error("boom secret/path");
  };

  const originalConsoleError = console.error;
  const consoleErrors = [];
  console.error = (...args) => {
    consoleErrors.push(args);
  };

  let compiled;
  try {
    compiled = compileOfficialModule();
    const response = await compiled.module.runQldOfficialRegoCheck("123ABC");

    assert.equal(response.ok, false);
    assert.equal(response.status, "official_unavailable");
    assert.equal(response.error, "official_fetch_failed");
    assert.equal(response.error.includes("boom"), false);
    assert.equal(response.userMessage.includes("boom"), false);
    assert.equal(response.userMessage.includes("secret/path"), false);
    assert.equal(response.retryable, false);
    assert.equal(requests.length, 1, "official lookup should stop after the first thrown fetch");
    assert.equal(consoleErrors.length, 1, "raw official lookup error should be logged server-side once");
    assert.equal(consoleErrors[0][0], "[qld-rego] official lookup failed");
    assert.ok(consoleErrors[0][1] instanceof Error);
    assert.equal(consoleErrors[0][1].message, "boom secret/path");
  } finally {
    compiled?.cleanup();
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    restoreEnv(envSnapshot);
  }
});

test("official thrown fetch is non-retryable", async () => {
  const envSnapshot = {
    REGO_CHECK_ENABLED: process.env.REGO_CHECK_ENABLED,
    REGO_CHECK_MAX_PER_HOUR: process.env.REGO_CHECK_MAX_PER_HOUR,
    REGO_CHECK_TIMEOUT_MS: process.env.REGO_CHECK_TIMEOUT_MS,
  };
  process.env.REGO_CHECK_ENABLED = "true";
  process.env.REGO_CHECK_MAX_PER_HOUR = "99";
  process.env.REGO_CHECK_TIMEOUT_MS = "5000";

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("boom secret/path");
  };

  const originalConsoleError = console.error;
  console.error = () => {};

  let compiled;
  try {
    compiled = compileOfficialModule();
    const response = await compiled.module.runQldOfficialRegoCheck("123ABC");

    assert.equal(response.ok, false);
    assert.equal(response.status, "official_unavailable");
    assert.equal(response.error, "official_fetch_failed");
    assert.equal(response.retryable, false);
  } finally {
    compiled?.cleanup();
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    restoreEnv(envSnapshot);
  }
});
