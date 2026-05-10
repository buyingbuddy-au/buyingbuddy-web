import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

function compileRegoCaptureRoute() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-rego-capture-route-"));
  const tsconfigPath = join(outDir, "tsconfig.json");
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");
  const emailSends = [];

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
        return require(normalisePath);
      }

      if (request === "resend") {
        return {
          Resend: class MockResend {
            constructor(apiKey) {
              this.apiKey = apiKey;
              this.emails = {
                send: async (message) => {
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
