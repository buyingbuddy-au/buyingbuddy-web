import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("main Stripe webhook fails closed when the signing secret is missing in production", () => {
  const source = readFileSync("src/app/api/stripe/webhook/route.ts", "utf8");

  assert.match(source, /process\.env\.NODE_ENV === "production"/);
  assert.match(source, /Stripe webhook secret is not configured/);
  assert.doesNotMatch(source, /else\s*\{\s*event = JSON\.parse\(raw_body\) as Stripe\.Event;\s*\}/);
});

test("PPSR admin webhook rejects requests before bearer comparison when shared secret is missing", () => {
  const source = readFileSync("src/app/api/admin/ppsr/webhook/route.ts", "utf8");

  assert.match(source, /const webhookSecret = process\.env\.STRIPE_WEBHOOK_SECRET\?\.trim\(\)/);
  assert.match(source, /Webhook secret is not configured/);
  assert.doesNotMatch(source, /`Bearer \$\{process\.env\.STRIPE_WEBHOOK_SECRET\}`/);
});

test("main Stripe webhook uses the non-production test email sink for internal notification emails", () => {
  const source = readFileSync("src/app/api/stripe/webhook/route.ts", "utf8");

  assert.match(source, /is_test_email_sink_enabled/);
  assert.match(source, /async function send_internal_email/);
  assert.match(source, /Test email sink captured internal email/);
  assert.doesNotMatch(source, /new Resend\(process\.env\.RESEND_API_KEY\)/);
});
