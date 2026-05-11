# Iteration 55 — Phase 3 — PPSR missing rawPPSRText QA guard

- Iteration: 55
- Phase: Phase 3 — Stage 7 QA harness
- Timestamp: 2026-05-11T19:08:41+10:00
- Objective picked:
  > [NEXT] `tests/ppsr-process-route.test.mjs` — Add test named `PPSR process route rejects missing rawPPSRText before report side effects`; post `customerEmail: "buyer@example.com"` without `rawPPSRText`, assert HTTP 400, `error: "rawPPSRText is required."`, and zero `getOrderById`, `extractPpsrData`, `generatePpsrPdf`, `updateOrder`, and `resendEmails` calls.

## Files changed

- tests/ppsr-process-route.test.mjs
- .hermes/evidence/iter-55-missing-raw-ppsr-text.md
- .hermes/LEARNED.md

## Why this matters

The PPSR process route should reject an empty manual-processing payload before it looks up orders, extracts report data, builds PDFs, mutates order records, or sends customer-visible email. Missing PPSR source text is a cheap input-validation failure, not a downstream-processing case. This Stage 7 guard locks that branch through the real `POST()` route export while keeping all external dependencies mocked or disabled.

## Test notes

- Focused GREEN on current behaviour: `node --test --test-name-pattern "PPSR process route rejects missing rawPPSRText before report side effects" tests/ppsr-process-route.test.mjs` — PASS (1 test). Current route already rejects missing `rawPPSRText` before side effects.
- Mutation RED guard: temporarily added `rawPPSRText: "Sample PPSR text with VIN 6FPAAAJGSW6A12345"` to the test request; reran the same focused command — FAIL as expected with `500 !== 400`, proving the assertion is tied to the missing-raw-text validation branch and would fail if the request reached downstream report/email processing. Reverted the mutation immediately.
- Focused GREEN after revert plus affected-file GREEN: `node --test --test-name-pattern "PPSR process route rejects missing rawPPSRText before report side effects" tests/ppsr-process-route.test.mjs && node --test tests/ppsr-process-route.test.mjs` — PASS (focused 1 test; file 5 tests).

## Gates run + results

- `npm run typecheck` — PASS.
- `npm test` — PASS (63 tests).
- `npm run build` — PASS; Next production build compiled successfully and generated 70 static pages.
- `node scripts/rego-api-smoke.mjs` — Not run; this iteration changed only a Stage 7 PPSR QA test and did not touch rego production code, rego tests, or `scripts/rego-api-smoke.mjs`.
- Post-gate cleanup: `git checkout -- tsconfig.tsbuildinfo` restored the typecheck/build artifact before staging.

## Time taken

Approx. 9 minutes (19:00–19:09 Australia/Brisbane local).

## Token usage estimate

Not exposed by this Hermes OpenAI Codex OAuth run.
