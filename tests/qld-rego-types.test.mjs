import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import test from "node:test";

function runTypecheckFixture(path) {
  const tsc = join(process.cwd(), "node_modules", ".bin", "tsc");

  try {
    execFileSync(
      tsc,
      [
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--moduleResolution",
        "bundler",
        "--module",
        "esnext",
        "--target",
        "es2020",
        "--lib",
        "es2020,dom",
        path,
      ],
      { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" },
    );
  } catch (error) {
    assert.fail(
      `Type fixture failed for ${path}:\n${error.stdout ?? ""}\n${error.stderr ?? ""}`.trim(),
    );
  }
}

test("runQldOfficialRegoCheck returns typed cached no-result response", () => {
  runTypecheckFixture("tests/type-fixtures/qld-rego-cached-failure.ts");
});

test("cached success response is assignable", () => {
  runTypecheckFixture("tests/type-fixtures/qld-rego-cached-success.ts");
});
