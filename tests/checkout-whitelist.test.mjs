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
  const stripeMode = options.stripeMode ?? "test";

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
          get_configured_stripe_mode: () => stripeMode,
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

async function withEnv(updates, fn) {
  const originals = new Map();
  for (const [key, value] of Object.entries(updates)) {
    originals.set(key, Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : undefined);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  try {
    return await fn();
  } finally {
    for (const [key, value] of originals.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
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

test("checkout API rejects hidden legacy products from the public checkout route", async () => {
  const compiled = compileCheckoutRoute();

  try {
    for (const product of ["dealer_review", "full_pack"]) {
      const response = await compiled.route.POST(
        makeCheckoutRequest({
          product,
          email: "buyer@example.com",
          customer_name: "Buyer Example",
          listing_url: "https://example.com/listing/123",
        }),
      );
      const payload = await response.json();

      assert.equal(response.status, 400, `${product} should not be publicly check-outable`);
      assert.deepEqual(payload, { ok: false, error: "Unsupported product type." });
    }

    assert.equal(
      compiled.getCheckoutSessions().length,
      0,
      "hidden legacy products must not create public checkout sessions",
    );
  } finally {
    compiled.cleanup();
  }
});

test("checkout API allows launch paid product slugs", async () => {
  const compiled = compileCheckoutRoute();

  try {
    for (const product of ["ppsr", "deal_room"]) {
      const response = await compiled.route.POST(
        makeCheckoutRequest({
          product,
          email: `${product}@example.com`,
          customer_name: "Buyer Example",
          vehicle_identifier: "123ABC",
        }),
      );
      const payload = await response.json();

      assert.equal(response.status, 200, `${product} should create a checkout session`);
      assert.equal(payload.ok, true);
      assert.equal(payload.session_id, "cs_test_checkout_whitelist");
      assert.equal(payload.checkout_url, "https://checkout.stripe.test/session");
      assert.equal(payload.mode, "test");
    }

    assert.deepEqual(
      compiled.getCheckoutSessions().map((session) => session.product),
      ["ppsr", "deal_room"],
      "launch paid products should reach checkout session creation in order",
    );
  } finally {
    compiled.cleanup();
  }
});

test("checkout API blocks explicit test checkout mode when Stripe is configured live", async () => {
  await withEnv({ STRIPE_TEST_BYPASS: "true", CHECKOUT_SMOKE_TEST: undefined }, async () => {
    const compiled = compileCheckoutRoute({ stripeMode: "live" });

    try {
      const response = await compiled.route.POST(
        makeCheckoutRequest({
          product: "ppsr",
          email: "buyer@example.com",
          customer_name: "Buyer Example",
          vehicle_identifier: "123ABC",
        }),
      );
      const payload = await response.json();

      assert.equal(response.status, 500);
      assert.equal(payload.ok, false);
      assert.equal(payload.mode, "live");
      assert.match(payload.error, /configured Stripe keys are not in test mode/);
      assert.equal(
        compiled.getCheckoutSessions().length,
        0,
        "explicit test checkout must fail before creating a live Stripe session",
      );
    } finally {
      compiled.cleanup();
    }
  });
});
