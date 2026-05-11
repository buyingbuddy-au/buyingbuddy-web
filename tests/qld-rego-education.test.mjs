import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";

const require = createRequire(import.meta.url);
let compiledEducationModule;

function compileEducationModule() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-qld-education-"));
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
        "src/lib/qld-rego/education.ts",
      ],
      { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" },
    );

    const candidates = [
      join(outDir, "education.js"),
      join(outDir, "src", "lib", "qld-rego", "education.js"),
    ];
    const compiledPath = candidates.find((path) => existsSync(path));
    assert.ok(compiledPath, `Compiled education.js not found under ${outDir}`);

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
  compiledEducationModule = compileEducationModule();
});

after(() => {
  compiledEducationModule?.cleanup();
});

function getEducationModule() {
  assert.ok(compiledEducationModule, "education module should be compiled before tests run");
  return compiledEducationModule.module;
}

test("classifyQldRego stops expired current registrations", () => {
  const { classifyQldRego } = getEducationModule();
  const originalDateNow = Date.now;
  Date.now = () => new Date(2026, 0, 15).getTime();

  try {
    assert.equal(
      classifyQldRego({
        rego: "123ABC",
        purpose: "PRIVATE",
        registrationStatus: "CURRENT",
        expiry: "14/01/2026",
      }),
      "stop",
    );
  } finally {
    Date.now = originalDateNow;
  }
});

test("classifyQldRego treats unparseable expiry as stop", () => {
  const { classifyQldRego } = getEducationModule();

  assert.equal(
    classifyQldRego({
      rego: "123ABC",
      purpose: "PRIVATE",
      registrationStatus: "CURRENT",
      expiry: "2026-01-14",
    }),
    "stop",
  );
});

test("classifyQldRego parses zero-padded expiry dates", () => {
  const { classifyQldRego } = getEducationModule();
  const originalDateNow = Date.now;
  Date.now = () => new Date(2027, 0, 15).getTime();

  try {
    assert.equal(
      classifyQldRego({
        rego: "123ABC",
        purpose: "PRIVATE",
        registrationStatus: "CURRENT",
        expiry: "01/02/2027",
      }),
      "watch",
    );
  } finally {
    Date.now = originalDateNow;
  }
});

test("classifyQldRego parses text-month expiry dates", () => {
  const { classifyQldRego } = getEducationModule();
  const originalDateNow = Date.now;
  Date.now = () => new Date(2027, 0, 15).getTime();

  try {
    assert.equal(
      classifyQldRego({
        rego: "123ABC",
        purpose: "PRIVATE",
        registrationStatus: "CURRENT",
        expiry: "1 Feb 2027",
      }),
      "watch",
    );
  } finally {
    Date.now = originalDateNow;
  }
});
