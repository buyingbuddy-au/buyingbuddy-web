import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";

const require = createRequire(import.meta.url);
let compiledNormaliseModule;

function compileNormaliseModule() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-qld-normalise-"));
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
        "src/lib/qld-rego/normalise.ts",
      ],
      { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" },
    );

    const candidates = [
      join(outDir, "normalise.js"),
      join(outDir, "src", "lib", "qld-rego", "normalise.js"),
    ];
    const compiledPath = candidates.find((path) => existsSync(path));
    assert.ok(compiledPath, `Compiled normalise.js not found under ${outDir}`);

    return {
      module: require(compiledPath),
      cleanup: () => rmSync(outDir, { force: true, recursive: true }),
    };
  } catch (error) {
    rmSync(outDir, { force: true, recursive: true });
    throw error;
  }
}

before(() => {
  compiledNormaliseModule = compileNormaliseModule();
});

after(() => {
  compiledNormaliseModule?.cleanup();
});

function getNormaliseModule() {
  assert.ok(compiledNormaliseModule, "normalise module should be compiled before tests run");
  return compiledNormaliseModule.module;
}

test("normaliseQldRego strips punctuation, spaces, and limits plate length", () => {
  const { normaliseQldRego } = getNormaliseModule();

  assert.equal(normaliseQldRego("BAD!!"), "BAD", "punctuation is stripped, not rejected during normalisation");
  assert.equal(normaliseQldRego(" 123 abc "), "123ABC", "spaces are stripped and letters are uppercased");
  assert.equal(normaliseQldRego("abc-def9"), "ABCDEF9", "hyphens are stripped before validation");
  assert.equal(normaliseQldRego("123456789"), "12345678", "raw inputs longer than 8 chars are truncated before validation");
});

test("validateQldRego accepts normalised 3-to-7 character plates", () => {
  const { validateQldRego } = getNormaliseModule();

  assert.deepEqual(validateQldRego("BAD!!"), { ok: true, rego: "BAD" });
  assert.deepEqual(validateQldRego(" 123 abc "), { ok: true, rego: "123ABC" });
  assert.deepEqual(validateQldRego("ABC1234"), { ok: true, rego: "ABC1234" });
});

test("validateQldRego rejects empty, too-short, 8-char, and longer raw plates", () => {
  const { validateQldRego } = getNormaliseModule();

  assert.deepEqual(validateQldRego(""), { ok: false, error: "Pop the QLD rego in first." });
  assert.deepEqual(validateQldRego("12"), {
    ok: false,
    error: "That looks too short for a QLD rego. Check the plate and try again.",
  });
  assert.deepEqual(validateQldRego("12345678"), {
    ok: false,
    error: "That looks too long for a QLD rego. Use the plate only, no state or spaces.",
  });
  assert.deepEqual(validateQldRego("123456789"), {
    ok: false,
    error: "That looks too long for a QLD rego. Use the plate only, no state or spaces.",
  });
});
