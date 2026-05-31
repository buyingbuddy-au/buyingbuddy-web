import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const EXPECTED_CHECK_LABELS = [
  "Panels line up and paint looks consistent",
  "No visible rust, dents, or scratches",
  "Lights and indicators all work",
  "Tyres look decent and wear evenly",
  "Windscreen and mirrors aren't damaged",
  "Windows, locks and mirrors work",
  "Air con blows cold",
  "No warning lights stay on",
  "Seats, seatbelts and controls work",
  "No water damage, mould or bad smells",
  "Engine starts cleanly, no odd noises",
  "Transmission shifts smoothly",
  "Brakes feel firm, no pulling",
  "No fluid leaks visible under the car",
  "Steering is straight, no vibration",
  "No unusual noises while driving",
  "Acceleration and braking feel normal",
  "Rego matches the car and seller",
  "Service history available",
  "Safety certificate current or discussed",
  "PPSR check completed",
];

test("inspection data preserves the current 21 checklist labels unchanged", () => {
  const source = read("src/lib/inspection-data.ts");
  const labels = [...source.matchAll(/\{ id: "[^"]+", label: "([^"]+)" \}/g)].map((match) => match[1]);

  assert.equal(labels.length, 21);
  assert.deepEqual(labels, EXPECTED_CHECK_LABELS);
  assert.match(source, /TOTAL_INSPECTION_CHECKS = INSPECTION_ITEMS\.length/);
});

test("inspection landing no longer offers or names a separate quick checklist", () => {
  const source = read("src/app/inspect/page.tsx");

  assert.doesNotMatch(source, /quick/i);
  assert.doesNotMatch(source, /href="\/inspect\/print"/);
  assert.match(source, /href="\/inspect\/full"/);
});

test("legacy print route permanently redirects to the full 21-check checklist", () => {
  const source = read("src/app/inspect/print/page.tsx");

  assert.match(source, /permanentRedirect\("\/inspect\/full"\)/);
  assert.doesNotMatch(source, /CHECKLIST_SECTIONS|Quick Inspection|14 checks|quick/i);
});

test("full inspection metadata reflects the 21-check consolidated checklist", () => {
  const source = read("src/app/inspect/full/page.tsx");

  assert.match(source, /21-check/);
  assert.doesNotMatch(source, /14-point|14 checks|quick/i);
});

test("inspection app exposes real print mode and preserves entered notes for print", () => {
  const source = read("src/components/inspection-app.tsx");

  assert.match(source, /window\.print\(\)/);
  assert.match(source, /@page \{ size: A4; margin: 10mm; \}/);
  assert.match(source, /print-section-grid/);
  assert.match(source, /print-note-text/);
  assert.match(source, /aria-pressed=\{itemState\.rating === "pass"\}/);
  assert.match(source, /Keep Checking/);
  assert.doesNotMatch(source, /coming soon|quick/i);
});

test("inspection app section links use whitespace-safe anchors", () => {
  const source = read("src/components/inspection-app.tsx");

  assert.match(source, /function getSectionAnchorId\(section: ChecklistSection\)/);
  assert.match(source, /href=\{`#\$\{getSectionAnchorId\(section\)\}`\}/);
  assert.match(source, /id=\{getSectionAnchorId\(section\)\}/);
  assert.doesNotMatch(source, /section-\$\{section\.title\}/);
});

test("inspection app note inputs expose an accessible label", () => {
  const source = read("src/components/inspection-app.tsx");

  assert.match(source, /aria-label=\{`Note for \$\{item\.label\}`\}/);
});

test("inspection app reserves verdict space so the sticky strip does not jump after first rating", () => {
  const source = read("src/components/inspection-app.tsx");

  assert.match(source, /className="pointer-events-none sticky top-0 z-20/);
  assert.match(source, /className="pointer-events-none mt-2 min-h-\[2\.75rem\] sm:mt-3 sm:min-h-\[4\.75rem\] print:min-h-0"/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /pointer-events-none screen-only/);
  assert.match(source, /Complete a check to start the decision record/);
});

test("inspection app prints per-section completion tallies", () => {
  const source = read("src/components/inspection-app.tsx");

  assert.match(source, /print-section-tally/);
  assert.match(source, /hidden[^"`]*print:inline-flex/);
  assert.match(source, /Section tally:/);
});

test("inspection checklist copy avoids internal migration language", () => {
  const combinedSource = [
    read("src/app/inspect/page.tsx"),
    read("src/components/inspection-app.tsx"),
  ].join("\n");

  assert.doesNotMatch(combinedSource, /21 checks unchanged/i);
  assert.doesNotMatch(combinedSource, /no changed checks/i);
  assert.doesNotMatch(combinedSource, /now one consolidated/i);
});
