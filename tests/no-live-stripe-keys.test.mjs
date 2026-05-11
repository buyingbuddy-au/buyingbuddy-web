import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";

const SCAN_ROOTS = ["src", "tests", "scripts"];
const TEXT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
]);

const FORBIDDEN_PATH_PART = /(^|[\\/\.])env($|[\\/])|secret|credentials|\.key$|\.pem$/i;
const LIVE_KEY_PATTERN = new RegExp(`\\b(?:${["pk", "sk"].join("|")})_${"live"}_[A-Za-z0-9_]+`, "g");

function walk(root) {
  const pending = [root];
  const files = [];

  while (pending.length) {
    const current = pending.pop();
    const relativePath = relative(process.cwd(), current).split(sep).join("/");

    if (FORBIDDEN_PATH_PART.test(relativePath)) {
      assert.fail(`Refusing to scan forbidden credential-like path in committed code: ${relativePath}`);
    }

    const stats = statSync(current);
    if (stats.isDirectory()) {
      for (const entry of readdirSync(current)) {
        pending.push(join(current, entry));
      }
      continue;
    }

    if (stats.isFile() && TEXT_EXTENSIONS.has(current.slice(current.lastIndexOf(".")))) {
      files.push(current);
    }
  }

  return files;
}

test("committed code does not contain live Stripe publishable or secret keys", () => {
  const scannedFiles = SCAN_ROOTS.flatMap((root) => walk(join(process.cwd(), root)));
  assert.ok(scannedFiles.length > 0, "expected to scan committed source/test/script files");

  const matches = [];
  for (const file of scannedFiles) {
    const source = readFileSync(file, "utf8");
    const fileMatches = source.match(LIVE_KEY_PATTERN) ?? [];
    for (const match of fileMatches) {
      matches.push(`${relative(process.cwd(), file).split(sep).join("/")}: ${match.slice(0, 12)}…`);
    }
  }

  assert.deepEqual(matches, [], "live Stripe key material must not be committed under src/, tests/, or scripts/");
});
