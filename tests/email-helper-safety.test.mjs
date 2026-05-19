import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/lib/email.ts", "utf8");

test("shared Resend helper sends text fallbacks and fails closed on returned provider errors", () => {
  assert.match(source, /text:\s*html_to_text\(html\)/, "customer email helpers should include plain-text fallbacks");
  assert.match(source, /const response = await get_resend\(\)\.emails\.send/, "send helper should inspect the provider response");
  assert.match(source, /if \(response\.error\)/, "returned Resend errors must throw instead of looking like delivery success");
  assert.match(source, /throw new Error\(`Failed to send email: \$\{response\.error\.message\}`\)/);
});

test("shared Resend helper always applies a validated Reply-To header", () => {
  assert.match(source, /const DEFAULT_REPLY_TO = "info@buyingbuddy\.com\.au"/);
  assert.match(source, /const EMAIL_RE =/);
  assert.match(source, /function get_reply_to\(\)/);
  assert.match(source, /replyTo: get_reply_to\(\)/, "helper should apply Reply-To after spreading caller input");
  assert.doesNotMatch(source, /replyTo:\s*REPLY_TO/);
});
