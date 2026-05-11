import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

function compileOfficialModule() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-qld-parser-"));
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

const registrationDetailsWithoutExpiryHtml = `
  <html>
    <body>
      <main>
        <h1>Registration details</h1>
        <dl>
          <dt>Registration number</dt>
          <dd>123ABC</dd>
          <dt>Vehicle Identification Number (VIN)</dt>
          <dd>JTMHU09J604123456</dd>
          <dt>Description</dt>
          <dd>2020 TOYOTA HILUX</dd>
          <dt>Purpose of use</dt>
          <dd>PRIVATE</dd>
          <dt>Status</dt>
          <dd>CURRENT</dd>
        </dl>
      </main>
    </body>
  </html>
`;

const registrationDetailsWithoutVinHtml = `
  <html>
    <body>
      <main>
        <h1>Registration details</h1>
        <dl>
          <dt>Registration number</dt>
          <dd>123ABC</dd>
          <dt>Description</dt>
          <dd>2020 TOYOTA HILUX</dd>
          <dt>Purpose of use</dt>
          <dd>PRIVATE</dd>
          <dt>Status</dt>
          <dd>CURRENT</dd>
          <dt>Expiry</dt>
          <dd>14/01/2027</dd>
        </dl>
      </main>
    </body>
  </html>
`;

const registrationDetailsWithoutStatusHtml = `
  <html>
    <body>
      <main>
        <h1>Registration details</h1>
        <dl>
          <dt>Registration number</dt>
          <dd>123ABC</dd>
          <dt>Vehicle Identification Number (VIN)</dt>
          <dd>JTMHU09J604123456</dd>
          <dt>Description</dt>
          <dd>2020 TOYOTA HILUX</dd>
          <dt>Purpose of use</dt>
          <dd>PRIVATE</dd>
          <dt>Expiry</dt>
          <dd>14/01/2027</dd>
        </dl>
      </main>
    </body>
  </html>
`;

test("qld official parser requires registration expiry", async () => {
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
    const html = requests.length === 1 ? searchFormHtml : registrationDetailsWithoutExpiryHtml;
    return new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  };

  const compiled = compileOfficialModule();
  try {
    const response = await compiled.module.runQldOfficialRegoCheck("123ABC");

    assert.equal(response.ok, false);
    assert.equal(response.status, "parse_error");
    assert.equal(response.error, "result_parse_failed");
    assert.equal(response.retryable, true);
    assert.equal(requests.length, 2, "missing-expiry result should fetch form and result pages once");
  } finally {
    compiled.cleanup();
    globalThis.fetch = originalFetch;
    restoreEnv(envSnapshot);
  }
});

test("qld official parser requires VIN", async () => {
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
    const html = requests.length === 1 ? searchFormHtml : registrationDetailsWithoutVinHtml;
    return new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  };

  const compiled = compileOfficialModule();
  try {
    const response = await compiled.module.runQldOfficialRegoCheck("123ABC");

    assert.equal(response.ok, false);
    assert.equal(response.status, "parse_error");
    assert.equal(response.error, "result_parse_failed");
    assert.equal(response.retryable, true);
    assert.equal(requests.length, 2, "missing-VIN result should fetch form and result pages once");
  } finally {
    compiled.cleanup();
    globalThis.fetch = originalFetch;
    restoreEnv(envSnapshot);
  }
});

test("qld official parser requires registration status", async () => {
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
    const html = requests.length === 1 ? searchFormHtml : registrationDetailsWithoutStatusHtml;
    return new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  };

  const compiled = compileOfficialModule();
  try {
    const response = await compiled.module.runQldOfficialRegoCheck("123ABC");

    assert.equal(response.ok, false);
    assert.equal(response.status, "parse_error");
    assert.equal(response.error, "result_parse_failed");
    assert.equal(response.retryable, true);
    assert.equal(requests.length, 2, "missing-status result should fetch form and result pages once");
  } finally {
    compiled.cleanup();
    globalThis.fetch = originalFetch;
    restoreEnv(envSnapshot);
  }
});
