import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

function walkSource(root = "src") {
  const pending = [root];
  const files = [];

  while (pending.length) {
    const current = pending.pop();
    const stats = statSync(current);
    if (stats.isDirectory()) {
      for (const entry of readdirSync(current)) pending.push(join(current, entry));
      continue;
    }
    if (stats.isFile() && /\.(tsx?|css)$/.test(current)) files.push(current);
  }

  return files;
}

test("root layout and footer leave safe mobile bottom space and clip accidental horizontal overflow", () => {
  const layout = read("src/app/layout.tsx");
  const globals = read("src/app/globals.css");
  const footer = read("src/components/site-footer.tsx");

  assert.match(layout, /min-h-dvh/, "layout should use dynamic viewport height on mobile browsers");
  assert.match(layout, /overflow-x-clip/, "layout should clip accidental horizontal overflow at the app shell");
  assert.match(globals, /overflow-x:\s*clip/, "global css should clip accidental horizontal overflow");
  assert.match(globals, /min-height:\s*100dvh/, "global css should prefer dynamic viewport height");
  assert.match(footer, /env\(safe-area-inset-bottom\)/, "footer needs mobile safe-area clearance below the fixed bottom nav");
});

test("mobile form surfaces avoid narrow-screen two-column overflow and intrinsic input widths", () => {
  const freeCheck = read("src/components/free-check-form.tsx");
  const rego = read("src/components/rego-check/qld-rego-checker.tsx");
  const ppsr = read("src/components/ppsr/ppsr-page-client.tsx");
  const deal = read("src/components/deal/deal-landing-page-client.tsx");

  assert.doesNotMatch(freeCheck, /grid grid-cols-2 gap-3 sm:grid-cols-3/, "free check details grid must not force two columns on 320px phones");
  assert.doesNotMatch(freeCheck, /grid grid-cols-2 gap-3(?!\s+sm:)/, "free check secondary grids must not force two columns on 320px phones");
  assert.match(freeCheck, /className="w-full min-w-0 rounded-xl border/, "free check inputs should fill and shrink inside grid tracks");

  assert.match(rego, /overflow-x-clip/, "rego page should locally guard against horizontal overflow");
  assert.doesNotMatch(rego, /minmax\(320px,1\.05fr\)/, "rego hero grid must not carry a 320px min track");
  assert.match(rego, /className="min-h-\[3\.5rem\] w-full min-w-0 flex-1/, "rego input should shrink within its card on mobile");
  assert.match(rego, /sm:w-auto sm:shrink-0/, "rego submit button should be full-width on mobile and auto-width only from sm up");

  for (const [name, source] of [["ppsr", ppsr], ["deal", deal]]) {
    assert.match(source, /className="(?:mt-4 )?grid min-w-0 gap-(?:1\.5|2)"/, `${name} labels should allow input children to shrink`);
    assert.match(source, /w-full min-w-0 rounded-2xl border/, `${name} inputs should fill and shrink inside cards`);
  }
});

test("source avoids viewport-width utilities that commonly create mobile side-swipe", () => {
  const offenders = [];
  for (const file of walkSource()) {
    const source = read(file);
    if (/\bw-screen\b|100vw/.test(source)) {
      offenders.push(relative(process.cwd(), file).split(sep).join("/"));
    }
  }

  assert.deepEqual(offenders, [], "avoid w-screen/100vw under src; use w-full/max-w-full instead");
});

test("inspection and pricing surfaces avoid clipped mobile cards", () => {
  const inspection = read("src/components/inspection-app.tsx");
  const pricing = read("src/app/pricing/page.tsx");

  assert.match(
    inspection,
    /print-section-grid grid min-w-0 grid-cols-\[minmax\(0,1fr\)\]/,
    "inspection checklist cards should use a shrink-safe single-column mobile grid",
  );
  assert.match(
    inspection,
    /print-card print-section w-full max-w-full min-w-0 overflow-hidden/,
    "inspection section cards should not visually hang outside the mobile viewport",
  );

  assert.doesNotMatch(
    pricing,
    /min-w-\[520px\]/,
    "pricing comparison should not require nested horizontal scrolling on phones",
  );
});

test("inspection checklist keeps the sticky scorebar compact on phones", () => {
  const inspection = read("src/components/inspection-app.tsx");

  assert.match(
    inspection,
    /print-summary-strip grid grid-cols-4 gap-1\.5 sm:gap-2/,
    "mobile scorebar should be four compact columns, not four tall stacked cards",
  );
  assert.match(
    inspection,
    /inspection-score-card[^"`]*px-2 py-2[^"`]*sm:px-4 sm:py-3/,
    "score cards need mobile padding first, then roomier desktop padding",
  );
  assert.match(
    inspection,
    /className="pointer-events-none mt-2 min-h-\[2\.75rem\] sm:mt-3 sm:min-h-\[4\.75rem\] print:min-h-0"/,
    "mobile verdict spacer should be short enough not to cover the checklist rows",
  );
});

test("inspection checklist rating controls sit below the label on phones", () => {
  const inspection = read("src/components/inspection-app.tsx");

  assert.match(
    inspection,
    /grid min-w-0 grid-cols-\[auto_minmax\(0,1fr\)\] gap-3 sm:flex sm:items-center/,
    "mobile checklist rows should give long labels the full line before controls",
  );
  assert.match(
    inspection,
    /col-span-2 grid grid-cols-4 gap-1\.5 sm:col-span-1 sm:flex sm:shrink-0 sm:gap-1/,
    "rating and note buttons should become a full-width tap row on phones",
  );
  assert.match(
    inspection,
    /min-h-\[2\.75rem\] w-full[^"`]*rounded-xl[^"`]*sm:h-9[^"`]*sm:w-9/,
    "mobile checklist controls need larger phone-friendly tap targets without squeezing labels",
  );
});
