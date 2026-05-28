import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import Module from "node:module";
import test from "node:test";
import ts from "typescript";

function loadFunnelContextModule() {
  const sourcePath = "src/lib/funnel-context.ts";
  const source = readFileSync(sourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: sourcePath,
    reportDiagnostics: true,
  });

  const diagnostics = output.diagnostics ?? [];
  assert.deepEqual(
    diagnostics.map((diagnostic) => diagnostic.messageText),
    [],
  );

  const compiled = new Module(sourcePath);
  compiled.filename = sourcePath;
  compiled.paths = Module._nodeModulePaths(process.cwd());
  compiled._compile(output.outputText, sourcePath);
  return compiled.exports;
}

test("rego result PPSR handoff carries VIN first plus rego, email, and source", () => {
  const { buildPpsrHandoffHref } = loadFunnelContextModule();

  const href = buildPpsrHandoffHref({
    vin: " jm0dk2w7601234567 ",
    rego: " 091 fc5 ",
    email: " Buyer@Example.COM ",
    source: "rego_result",
  });
  const url = new URL(href, "https://buyingbuddy.com.au");

  assert.equal(url.pathname, "/ppsr");
  assert.equal(url.searchParams.get("vin"), "JM0DK2W7601234567");
  assert.equal(url.searchParams.get("rego"), "091FC5");
  assert.equal(url.searchParams.get("email"), "buyer@example.com");
  assert.equal(url.searchParams.get("source"), "rego_result");
});

test("PPSR prefill uses VIN before rego and exposes only safe coarse source", () => {
  const { readFunnelHandoffParams } = loadFunnelContextModule();

  const context = readFunnelHandoffParams(
    new URLSearchParams("rego=091FC5&vin=JM0DK2W7601234567&email=buyer%40example.com&source=rego_result"),
  );

  assert.deepEqual(context, {
    email: "buyer@example.com",
    identifier: "JM0DK2W7601234567",
    identifierType: "vin",
    rego: "091FC5",
    source: "rego_result",
    vin: "JM0DK2W7601234567",
  });
});

test("PPSR page can strip raw vehicle and email handoff params after prefill", () => {
  const { buildUrlWithoutSensitiveHandoffParams } = loadFunnelContextModule();

  const cleaned = buildUrlWithoutSensitiveHandoffParams(
    "https://buyingbuddy.com.au/ppsr?rego=091FC5&vin=JM0DK2W7601234567&email=buyer%40example.com&source=rego_result&utm_campaign=smoke",
  );
  const url = new URL(cleaned);

  assert.equal(url.pathname, "/ppsr");
  assert.equal(url.searchParams.get("source"), "rego_result");
  assert.equal(url.searchParams.get("utm_campaign"), "smoke");
  assert.equal(url.searchParams.has("rego"), false);
  assert.equal(url.searchParams.has("vin"), false);
  assert.equal(url.searchParams.has("email"), false);
});
