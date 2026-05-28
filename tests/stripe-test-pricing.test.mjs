import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const require = createRequire(import.meta.url);

function compileStripeModule() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-stripe-pricing-"));
  const tsconfigPath = join(outDir, "tsconfig.json");
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");
  const checkoutSessions = [];

  writeFileSync(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          target: "es2020",
          lib: ["es2020", "dom"],
          module: "commonjs",
          moduleResolution: "node",
          esModuleInterop: true,
          skipLibCheck: true,
          strict: true,
          rootDir: process.cwd(),
          outDir,
          baseUrl: process.cwd(),
          paths: { "@/*": ["src/*"] },
          noEmitOnError: true,
        },
        files: [join(process.cwd(), "src/lib/stripe.ts")],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync(tsc, ["--project", tsconfigPath], { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" });
    const stripePath = join(outDir, "src", "lib", "stripe.js");
    assert.ok(existsSync(stripePath), `Compiled stripe module not found at ${stripePath}`);

    const originalLoad = Module._load;
    Module._load = function loadStripeDependency(request, parent, isMain) {
      if (request === "stripe") {
        return class FakeStripe {
          checkout = {
            sessions: {
              create: async (input) => {
                checkoutSessions.push(input);
                return { id: "cs_test_price_override", url: input.success_url };
              },
            },
          };
        };
      }
      return originalLoad.call(this, request, parent, isMain);
    };

    try {
      const stripeModule = require(stripePath);
      return {
        stripeModule,
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

async function withEnv(updates, fn) {
  const originals = new Map();
  for (const [key, value] of Object.entries(updates)) {
    originals.set(key, Object.prototype.hasOwnProperty.call(process.env, key) ? process.env[key] : undefined);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }

  try {
    return await fn();
  } finally {
    for (const [key, value] of originals.entries()) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("Deal Room is the canonical paid handover product and pdf is a legacy alias", () => {
  const compiled = compileStripeModule();
  try {
    const { get_product_definition, normalise_public_product } = compiled.stripeModule;

    assert.equal(normalise_public_product("pdf"), "deal_room");
    assert.equal(normalise_public_product("deal_room"), "deal_room");
    assert.equal(get_product_definition("deal_room").name, "Deal Room");
    assert.equal(get_product_definition("pdf").name, "Legacy PDF alias");
  } finally {
    compiled.cleanup();
  }
});

test("checkout test price override drops paid line items to the configured cents in Stripe test mode", async () => {
  await withEnv(
    {
      STRIPE_SECRET_KEY: ["sk", "test", "mock"].join("_"),
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ["pk", "test", "mock"].join("_"),
      CHECKOUT_TEST_PRICE_CENTS: "50",
    },
    async () => {
      const compiled = compileStripeModule();
      try {
        await compiled.stripeModule.create_checkout_session({
          base_url: "https://buyingbuddy.test",
          customer_email: "buyer@example.com",
          deal_id: "deal_test_123",
          product: "deal_room",
          vehicle_identifier: "123ABC",
        });

        assert.equal(compiled.getCheckoutSessions().length, 1);
        const session = compiled.getCheckoutSessions()[0];
        assert.equal(session.line_items[0].price_data.unit_amount, 50);
        assert.equal(session.success_url, "https://buyingbuddy.test/deal/deal_test_123");
        assert.equal(session.cancel_url, "https://buyingbuddy.test/deal?checkout=cancelled");
        assert.equal(session.metadata.product, "deal_room");
      } finally {
        compiled.cleanup();
      }
    },
  );
});

test("checkout test price override is ignored unless Stripe is configured for test mode", async () => {
  await withEnv(
    {
      STRIPE_SECRET_KEY: ["sk", "live", "mock"].join("_"),
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ["pk", "live", "mock"].join("_"),
      CHECKOUT_TEST_PRICE_CENTS: "50",
    },
    async () => {
      const compiled = compileStripeModule();
      try {
        await compiled.stripeModule.create_checkout_session({
          base_url: "https://buyingbuddy.test",
          customer_email: "buyer@example.com",
          product: "ppsr",
          vehicle_identifier: "123ABC",
        });

        const session = compiled.getCheckoutSessions()[0];
        assert.equal(session.line_items[0].price_data.unit_amount, 495);
        assert.equal(session.metadata.product, "ppsr");
      } finally {
        compiled.cleanup();
      }
    },
  );
});
