import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import Module, { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";

const require = createRequire(import.meta.url);
const projectRequire = createRequire(join(process.cwd(), "package.json"));
const nextNavigation = projectRequire("next/navigation");

const LEGACY_ROUTES = [
  {
    route: "/buddy",
    source: "src/app/buddy/page.tsx",
    compiled: join("buddy", "page.js"),
    expectedLocation: "/check",
  },
  {
    route: "/ppi",
    source: "src/app/ppi/page.tsx",
    compiled: join("ppi", "page.js"),
    expectedLocation: "/inspect",
  },
  {
    route: "/car-buyers-agent-pullenvale",
    source: "src/app/car-buyers-agent-pullenvale/page.tsx",
    compiled: join("car-buyers-agent-pullenvale", "page.js"),
    expectedLocation: "/",
  },
];

let compiledPages;

function compileLegacyPages() {
  const outDir = mkdtempSync(join(tmpdir(), "buyingbuddy-legacy-redirects-"));
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
        "--jsx",
        "react-jsx",
        "--esModuleInterop",
        "--skipLibCheck",
        "--strict",
        "--outDir",
        outDir,
        ...LEGACY_ROUTES.map(({ source }) => source),
      ],
      { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" },
    );

    return {
      outDir,
      resolveCompiledPath(route) {
        const compiledPath = join(outDir, route.compiled);
        assert.ok(existsSync(compiledPath), `Compiled page for ${route.route} not found at ${compiledPath}`);
        return compiledPath;
      },
      cleanup() {
        rmSync(outDir, { force: true, recursive: true });
      },
    };
  } catch (error) {
    rmSync(outDir, { force: true, recursive: true });
    throw error;
  }
}

function loadPageModule(compiledPath) {
  const originalLoad = Module._load;

  Module._load = function patchedModuleLoad(request, parent, isMain) {
    if (request === "next/navigation") {
      return nextNavigation;
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return require(compiledPath);
  } finally {
    Module._load = originalLoad;
  }
}

function readRedirectFromPage(pageModule) {
  assert.equal(typeof pageModule.default, "function", "legacy page should export a default route component");

  let thrown;
  try {
    pageModule.default();
  } catch (error) {
    thrown = error;
  }

  assert.ok(thrown, "legacy page should call next/navigation redirect()");
  assert.equal(thrown.message, "NEXT_REDIRECT");
  assert.equal(typeof thrown.digest, "string");

  const match = thrown.digest.match(/^NEXT_REDIRECT;(replace|push);([^;]+);(\d+);$/);
  assert.ok(match, `Unexpected redirect digest: ${thrown.digest}`);

  return {
    type: match[1],
    location: match[2],
    status: Number(match[3]),
  };
}

before(() => {
  compiledPages = compileLegacyPages();
});

after(() => {
  compiledPages?.cleanup();
});

test("legacy routes redirect to approved replacements", () => {
  assert.ok(compiledPages, "legacy pages should be compiled before tests run");

  for (const route of LEGACY_ROUTES) {
    const pageModule = loadPageModule(compiledPages.resolveCompiledPath(route));
    const redirect = readRedirectFromPage(pageModule);

    assert.deepEqual(
      redirect,
      {
        type: "replace",
        location: route.expectedLocation,
        status: 307,
      },
      `${route.route} should redirect to ${route.expectedLocation} with Next's temporary redirect status`,
    );
  }
});
