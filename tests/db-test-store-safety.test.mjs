import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/lib/db.ts", "utf8");

test("DB memory test store is non-production only and refuses live Stripe keys", () => {
  assert.match(source, /function is_memory_test_store_enabled\(\)/);
  assert.match(source, /BUYINGBUDDY_TEST_DATA_STORE/);
  assert.match(source, /process\.env\.NODE_ENV === "production"/);
  assert.match(source, /"sk" \+ "_live_"/);
  assert.match(source, /"pk" \+ "_live_"/);
});

test("DB memory test store covers checkout order and Deal Room persistence paths before Supabase", () => {
  assert.match(source, /testStore\(\)\.orders/);
  assert.match(source, /testStore\(\)\.deals/);
  assert.match(source, /testStore\(\)\.emailCaptures/);
  assert.match(source, /if \(is_memory_test_store_enabled\(\)\) \{\n\s+const row = build_test_order/);
  assert.match(source, /if \(is_memory_test_store_enabled\(\)\) \{\n\s+const row = build_test_deal/);
});
