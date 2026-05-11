import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

const KNOWN_PAID_PRODUCTS = new Set(["ppsr", "dealer_review", "full_pack", "deal_room"]);

function compileCheckoutRoute(options = {}) {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-checkout-whitelist-"));
  const tsconfigPath = join(outDir, "tsconfig.json");
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");
  const checkoutSessions = [];
  const isPaidProduct = options.isPaidProduct ?? ((product) => KNOWN_PAID_PRODUCTS.has(product));

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
        files: [join(process.cwd(), "src/app/api/stripe/checkout/route.ts")],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync(tsc, ["--project", tsconfigPath], { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" });

    const routePath = join(outDir, "src", "app", "api", "stripe", "checkout", "route.js");
    assert.ok(existsSync(routePath), `Compiled checkout route not found at ${routePath}`);

    const originalLoad = Module._load;
    const nextServer = require("next/server");

    Module._load = function loadCheckoutDependency(request, parent, isMain) {
      if (request === "next/server") {
        return nextServer;
      }

      if (request === "@/lib/stripe") {
        return {
          is_paid_product: isPaidProduct,
          create_checkout_session: async (input) => {
            checkoutSessions.push(input);
            return { id: "cs_test_checkout_whitelist", url: "https://checkout.stripe.test/session" };
          },
        };
      }

      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const route = require(routePath);
      return {
        route,
        getCheckoutSessions: () => checkoutSessions,
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

function makeCheckoutRequest(body) {
  return new Request("http://localhost/api/stripe/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      origin: "https://buyingbuddy.com.au",
    },
  });
}

test("checkout API rejects unknown product slugs before creating a Stripe session", async () => {
  const compiled = compileCheckoutRoute();

  try {
    const response = await compiled.route.POST(
      makeCheckoutRequest({
        product: "mystery_pack",
        email: "buyer@example.com",
        customer_name: "Buyer Example",
        listing_url: "https://example.com/listing/123",
        vehicle_identifier: "123ABC",
      }),
    );
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.deepEqual(payload, { ok: false, error: "Unsupported product type." });
    assert.equal(
      compiled.getCheckoutSessions().length,
      0,
      "unknown products must be rejected before a checkout session or success URL is created",
    );
  } finally {
    compiled.cleanup();
  }
});
