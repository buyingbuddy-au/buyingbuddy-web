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
